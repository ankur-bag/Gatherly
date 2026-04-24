import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import { dbConnect } from '@/lib/mongodb'
import { triggerHook } from '@/lib/hooks'
import Event from '@/models/Event'
import User from '@/models/User'

bootstrap()

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const { id } = await params

    const event = await Event.findById(id)
    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 })
    }
    if (event.organizerClerkId !== userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (!event.isOnline) {
      return NextResponse.json({ error: 'Event is not online' }, { status: 400 })
    }
    if (event.status !== 'published') {
      return NextResponse.json({ error: 'Event is not published' }, { status: 400 })
    }

    // Reset to pending and clear prior meeting so idempotency guard doesn't block
    await Event.findByIdAndUpdate(id, {
      zoomSyncStatus: 'pending',
      zoomMeetingId: null,
      zoomJoinUrl: null,
      zoomError: null,
    })

    const organizer = await User.findOne({ clerkId: userId })
    if (!organizer) {
      return NextResponse.json({ error: 'Organizer not found' }, { status: 404 })
    }

    // Re-fire the hook – idempotency guard will be bypassed since we cleared the meetingId
    await triggerHook('event.published', {
      event: { ...event.toObject(), zoomMeetingId: null },
      organizer: organizer.toObject(),
    })

    // Return fresh event state and surface hook failure explicitly
    const updated = await Event.findById(id)
    const updatedEvent = updated?.toObject()

    if (updatedEvent?.zoomSyncStatus === 'failed') {
      const zoomError = updatedEvent.zoomError || 'Zoom sync failed'
      return NextResponse.json({ data: updatedEvent, error: zoomError }, { status: 400 })
    }

    return NextResponse.json({ data: updatedEvent })
  } catch (error: any) {
    console.error('POST /api/events/[id]/zoom/retry error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
