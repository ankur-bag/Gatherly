import { dbConnect } from '@/lib/mongodb'
import { triggerHook } from '@/lib/hooks'
import { generateSlug } from '@/lib/utils'
import Event from '@/models/Event'
import Registration from '@/models/Registration'
import User from '@/models/User'
import { IEvent, CreateEventInput, UpdateEventInput } from '@/types'

export async function list(userId: string): Promise<IEvent[]> {
  await dbConnect()
  const events = await Event.find({ organizerClerkId: userId }).sort({ createdAt: -1 })
  return events.map((doc) => doc.toObject())
}

export async function create(userId: string, body: CreateEventInput): Promise<IEvent> {
  await dbConnect()

  // Validate required fields
  if (!body.title || !body.dateTime || body.capacity === undefined || !body.registrationMode) {
    throw new Error('Missing required fields')
  }

  const slug = generateSlug(body.title)

  const event = await Event.create({
    ...body,
    organizerClerkId: userId,
    slug,
    status: 'draft',
  })

  return event.toObject()
}

export async function getById(userId: string, eventId: string): Promise<IEvent> {
  await dbConnect()

  const event = await Event.findById(eventId)
  if (!event) {
    throw new Error('Not found')
  }

  // Ownership check
  if (event.organizerClerkId !== userId) {
    throw new Error('Forbidden')
  }

  return event.toObject()
}

export async function getBySlug(slug: string): Promise<{ event: IEvent; publicStatus: string | null; activeCount: number }> {
  await dbConnect()

  const event = await Event.findOne({ slug })
  if (!event) {
    throw new Error('Not found')
  }

  // Only published events are visible publicly
  if (event.status !== 'published') {
    throw new Error('Not found')
  }

  // Compute active count (only registered + approved)
  const activeCount = await Registration.countDocuments({
    eventId: event._id,
    status: { $in: ['registered', 'approved'] },
  })

  // Compute public status
  const getPublicStatus = (eventDoc: any, count: number) => {
    if (new Date() > new Date(eventDoc.dateTime)) return 'Closed'
    if (count >= eventDoc.capacity) return 'Full'
    return 'Open'
  }

  const publicStatus = getPublicStatus(event, activeCount)

  return {
    event: event.toObject(),
    publicStatus,
    activeCount,
  }
}

export async function update(userId: string, eventId: string, body: UpdateEventInput): Promise<IEvent> {
  await dbConnect()

  const event = await Event.findById(eventId)
  if (!event) {
    throw new Error('Not found')
  }

  // Ownership check
  if (event.organizerClerkId !== userId) {
    throw new Error('Forbidden')
  }

  // Track changed fields
  const changedFields: string[] = []
  const updateData: any = {}

  if (body.title !== undefined && body.title !== event.title) {
    changedFields.push('title')
    updateData.title = body.title
  }
  if (body.description !== undefined && body.description !== event.description) {
    changedFields.push('description')
    updateData.description = body.description
  }
  if (body.dateTime !== undefined && body.dateTime.toString() !== event.dateTime.toString()) {
    changedFields.push('dateTime')
    updateData.dateTime = body.dateTime
  }
  if (body.venue !== undefined && body.venue !== event.venue) {
    changedFields.push('venue')
    updateData.venue = body.venue
  }
  if (body.isOnline !== undefined && body.isOnline !== event.isOnline) {
    changedFields.push('isOnline')
    updateData.isOnline = body.isOnline
  }
  if (body.capacity !== undefined && body.capacity !== event.capacity) {
    changedFields.push('capacity')
    updateData.capacity = body.capacity
  }
  if (body.registrationMode !== undefined && body.registrationMode !== event.registrationMode) {
    changedFields.push('registrationMode')
    updateData.registrationMode = body.registrationMode
  }

  const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, { new: true })
  if (!updatedEvent) {
    throw new Error('Not found')
  }

  // Get organizer for hook
  const organizer = await User.findOne({ clerkId: userId })

  // Fire hook if there were changes
  if (changedFields.length > 0 && organizer) {
    await triggerHook('event.updated', {
      event: updatedEvent.toObject(),
      organizer: organizer.toObject(),
      changedFields,
    })
  }

  return updatedEvent.toObject()
}

export async function publish(userId: string, eventId: string): Promise<IEvent> {
  await dbConnect()

  const event = await Event.findById(eventId)
  if (!event) {
    throw new Error('Not found')
  }

  // Ownership check
  if (event.organizerClerkId !== userId) {
    throw new Error('Forbidden')
  }

  // Validate all required fields
  if (!event.title || !event.description || !event.dateTime || event.capacity === undefined || !event.registrationMode) {
    throw new Error('Missing required fields')
  }

  if (!event.isOnline && !event.venue) {
    throw new Error('In-person events must have a venue')
  }

  const publishedEvent = await Event.findByIdAndUpdate(eventId, { status: 'published' }, { new: true })
  if (!publishedEvent) {
    throw new Error('Not found')
  }

  // Get organizer for hook
  const organizer = await User.findOne({ clerkId: userId })

  if (organizer) {
    await triggerHook('event.published', {
      event: publishedEvent.toObject(),
      organizer: organizer.toObject(),
    })
  }

  return publishedEvent.toObject()
}

export async function cancel(userId: string, eventId: string): Promise<IEvent> {
  await dbConnect()

  const event = await Event.findById(eventId)
  if (!event) {
    throw new Error('Not found')
  }

  // Ownership check
  if (event.organizerClerkId !== userId) {
    throw new Error('Forbidden')
  }

  const cancelledEvent = await Event.findByIdAndUpdate(eventId, { status: 'cancelled' }, { new: true })
  if (!cancelledEvent) {
    throw new Error('Not found')
  }

  // Fetch all active registrations for hook
  const activeRegistrations = await Registration.find({
    eventId,
    status: { $in: ['registered', 'approved'] },
  })

  // Get organizer for hook
  const organizer = await User.findOne({ clerkId: userId })

  if (organizer) {
    await triggerHook('event.cancelled', {
      event: cancelledEvent.toObject(),
      organizer: organizer.toObject(),
      activeRegistrations: activeRegistrations.map((r) => r.toObject()),
    })
  }

  return cancelledEvent.toObject()
}

export async function deleteEvent(userId: string, eventId: string): Promise<void> {
  await dbConnect()

  const event = await Event.findById(eventId)
  if (!event) {
    throw new Error('Not found')
  }

  // Ownership check
  if (event.organizerClerkId !== userId) {
    throw new Error('Forbidden')
  }

  // Only draft events can be deleted
  if (event.status !== 'draft') {
    throw new Error('Only draft events can be deleted')
  }

  await Event.deleteOne({ _id: eventId })
}
