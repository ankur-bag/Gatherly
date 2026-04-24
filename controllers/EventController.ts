import { dbConnect } from '@/lib/mongodb'
import { triggerHook } from '@/lib/hooks'
import { generateBaseSlug } from '@/lib/utils'
import Event from '@/models/Event'
import Registration from '@/models/Registration'
import User from '@/models/User'
import { IEvent, CreateEventInput, UpdateEventInput } from '@/types'

export async function list(userId: string): Promise<any[]> {
  await dbConnect()
  const events = await Event.find({ organizerClerkId: userId }).sort({ createdAt: -1 })
  
  const eventsWithCount = await Promise.all(
    events.map(async (event) => {
      const count = await Registration.countDocuments({ 
        eventId: event._id,
        status: 'confirmed'
      })
      return {
        ...event.toObject(),
        registrationsCount: count,
        activeCount: count // Backward compatibility
      }
    })
  )
  
  return eventsWithCount
}

export async function create(userId: string, body: CreateEventInput): Promise<IEvent> {
  await dbConnect()

  // Validate required fields
  if (!body.title || !body.dateTime || body.capacity === undefined || !body.registrationMode) {
    throw new Error('Missing required fields')
  }

  const slugBase = generateBaseSlug(body.title)

  const event = await Event.create({
    ...body,
    organizerClerkId: userId,
    slugBase,
    slug: slugBase, // Backward sync
    status: body.status || 'draft',
    zoomSyncStatus: body.isOnline ? 'pending' : undefined,
  })

  // If online, trigger Zoom sync immediately when created as published
  if (body.isOnline && (body.status === 'published')) {
    const organizer = await User.findOne({ clerkId: userId })
    if (organizer) {
      await triggerHook('event.published', {
        event: event.toObject(),
        organizer: organizer.toObject(),
      })
    }
  }

  return event.toObject()
}

export async function getById(userId: string, eventId: string): Promise<any> {
  await dbConnect()

  const event = await Event.findById(eventId)
  if (!event) {
    throw new Error('Not found')
  }

  // Ownership check
  if (event.organizerClerkId !== userId) {
    throw new Error('Forbidden')
  }

  const count = await Registration.countDocuments({
    eventId,
    status: 'confirmed',
  })

  return {
    ...event.toObject(),
    registrationsCount: count,
  }
}

export async function getByIdPublic(eventId: string): Promise<{ event: IEvent; publicStatus: string | null; activeCount: number }> {
  await dbConnect()

  const event = await Event.findById(eventId)
  if (!event || event.status !== 'published') {
    throw new Error('Not found')
  }

  // Compute active count (only confirmed)
  const activeCount = await Registration.countDocuments({
    eventId: event._id,
    status: 'confirmed',
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

export async function getBySlug(slugInUrl: string): Promise<{ event: IEvent; publicStatus: string | null; activeCount: number; redirectUrl?: string }> {
  await dbConnect()

  // Always extract the trailing 24-char MongoDB ObjectId from slug.
  // This handles ALL formats:
  //   new: title-words-{id}
  //   old: title---subtitle-{id}   (triple-dash legacy with ID at end)
  const match = slugInUrl.match(/([a-f0-9]{24})$/)
  if (!match) {
    throw new Error('Not found')
  }

  const eventId = match[1]

  const event = await Event.findById(eventId)
  if (!event || event.status !== 'published') {
    throw new Error('Not found')
  }

  // SEO canonical-redirect: if the slug base doesn't match current title, redirect cleanly
  const correctBase = generateBaseSlug(event.title)
  const correctSlug = `${correctBase}-${event._id}`
  if (slugInUrl !== correctSlug) {
    return {
      event: event.toObject(),
      publicStatus: null,
      activeCount: 0,
      redirectUrl: `/events/${correctSlug}`,
    }
  }

  // Compute active count (only confirmed)
  const activeCount = await Registration.countDocuments({
    eventId: event._id,
    status: 'confirmed',
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
    updateData.slugBase = generateBaseSlug(body.title)
    updateData.slug = updateData.slugBase // Keep legacy sync for now
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

  const updatedEvent = await Event.findByIdAndUpdate(eventId, updateData, { returnDocument: 'after' })
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

  const publishedEvent = await Event.findByIdAndUpdate(eventId, { status: 'published' }, { returnDocument: 'after' })
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

  const cancelledEvent = await Event.findByIdAndUpdate(eventId, { status: 'cancelled' }, { returnDocument: 'after' })
  if (!cancelledEvent) {
    throw new Error('Not found')
  }

  // Fetch all active registrations for hook
  const activeRegistrations = await Registration.find({
    eventId,
    status: 'confirmed',
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

  // Delete event and registrations (optional: should probably delete registrations too or just the event)
  await Event.deleteOne({ _id: eventId })
}
