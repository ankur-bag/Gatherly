import { dbConnect } from '@/lib/mongodb'
import { triggerHook } from '@/lib/hooks'
import { getPublicStatus } from '@/lib/utils'
import Event from '@/models/Event'
import Registration from '@/models/Registration'
import { IRegistration, CreateRegistrationInput, RegistrationStatus } from '@/types'

// RSVP state machine transitions
const VALID_TRANSITIONS: Record<string, string[]> = {
  pending: ['confirmed', 'rejected'],
  confirmed: ['revoked'],
  rejected: ['confirmed'],
  revoked: ['confirmed'],
}

export async function list(
  userId: string,
  eventId: string,
  { search, status }: { search?: string; status?: string } = {}
): Promise<IRegistration[]> {
  await dbConnect()

  // Verify event ownership
  const event = await Event.findById(eventId)
  if (!event) {
    throw new Error('Not found')
  }

  if (event.organizerClerkId !== userId) {
    throw new Error('Forbidden')
  }

  // Build query
  const query: Record<string, any> = { eventId }

  if (status) {
    query.status = status
  }

  if (search) {
    query.$or = [
      { attendeeName: { $regex: search, $options: 'i' } },
      { attendeeEmail: { $regex: search, $options: 'i' } },
    ]
  }

  const registrations = await Registration.find(query).sort({ createdAt: -1 })
  return registrations.map((doc) => doc.toObject())
}

export async function create(eventId: string, body: CreateRegistrationInput): Promise<IRegistration> {
  await dbConnect()

  if (!body.attendeeName || !body.attendeeEmail) {
    throw new Error('Missing required fields')
  }

  // Find event
  const event = await Event.findById(eventId)
  if (!event) {
    throw new Error('Not found')
  }

  // Only published events accept registrations
  if (event.status !== 'published') {
    throw new Error('Not found')
  }

  // Compute active count (only confirmed)
  const activeCount = await Registration.countDocuments({
    eventId,
    status: 'confirmed',
  })

  const publicStatus = getPublicStatus(event, activeCount)

  // Block if not open
  if (publicStatus !== 'Open') {
    throw new Error(`Event is ${publicStatus}`)
  }

  // Check for duplicate email
  const existingRegistration = await Registration.findOne({
    eventId,
    attendeeEmail: body.attendeeEmail,
  })

  if (existingRegistration) {
    throw new Error('Already registered')
  }

  // Determine initial status based on registration mode
  const initialStatus: RegistrationStatus = event.registrationMode === 'open' ? 'confirmed' : 'pending'

  const registration = await Registration.create({
    eventId,
    attendeeName: body.attendeeName,
    attendeeEmail: body.attendeeEmail,
    status: initialStatus,
  })

  // Fire hook
  await triggerHook('registration.created', {
    registration: registration.toObject(),
    event: event.toObject(),
  })

  return registration.toObject()
}

export async function updateStatus(userId: string, registrationId: string, newStatus: RegistrationStatus): Promise<IRegistration> {
  await dbConnect()

  const registration = await Registration.findById(registrationId)
  if (!registration) {
    throw new Error('Not found')
  }

  const event = await Event.findById(registration.eventId)
  if (!event) {
    throw new Error('Not found')
  }

  // Ownership check
  if (event.organizerClerkId !== userId) {
    throw new Error('Forbidden')
  }

  // Validate state transition
  const allowed = VALID_TRANSITIONS[registration.status] ?? []
  if (!allowed.includes(newStatus)) {
    throw new Error(`Cannot transition from ${registration.status} to ${newStatus}`)
  }

  // If approving, re-check capacity
  if (newStatus === 'confirmed') {
    const activeCount = await Registration.countDocuments({
      eventId: event._id,
      status: 'confirmed',
    })

    if (activeCount >= event.capacity) {
      throw new Error('Event is full')
    }
  }

  // Update status
  const updatedRegistration = await Registration.findByIdAndUpdate(
    registrationId,
    { status: newStatus },
    { new: true }
  )

  if (!updatedRegistration) {
    throw new Error('Not found')
  }

  // Fire appropriate hook based on new status
  const hookMap: Record<RegistrationStatus, string> = {
    pending: '', 
    confirmed: 'registration.confirmed',
    rejected: 'registration.rejected',
    revoked: 'registration.revoked',
  }

  const hookEvent = hookMap[newStatus]
  if (hookEvent) {
    await triggerHook(hookEvent as any, {
      registration: updatedRegistration.toObject(),
      event: event.toObject(),
    })
  }

  return updatedRegistration.toObject()
}

export async function bulkUpdateStatus(userId: string, registrationIds: string[], newStatus: RegistrationStatus): Promise<{ successful: number, failed: number }> {
  let successful = 0
  let failed = 0

  for (const id of registrationIds) {
    try {
      await updateStatus(userId, id, newStatus)
      successful++
    } catch (error) {
      console.error(`Failed to update registration ${id}:`, error)
      failed++
    }
  }

  return { successful, failed }
}
