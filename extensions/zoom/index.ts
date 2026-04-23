import { onHook } from '@/lib/hooks'
import { dbConnect } from '@/lib/mongodb'
import Event from '@/models/Event'
import { createMeeting, deleteMeeting, updateMeeting } from './service'

export function registerZoomExtension() {
  onHook('event.published', async ({ event, organizer }) => {
    if (!event.isOnline) {
      return
    }

    try {
      await dbConnect()
      await Event.findByIdAndUpdate(event._id, { zoomSyncStatus: 'pending' })

      const meeting = await createMeeting(event, organizer)

      await Event.findByIdAndUpdate(event._id, {
        zoomMeetingId: meeting.meetingId,
        zoomJoinUrl: meeting.joinUrl,
        zoomSyncStatus: 'synced',
      })
    } catch (error) {
      console.error('Zoom publish sync failed:', error)
      await Event.findByIdAndUpdate(event._id, { zoomSyncStatus: 'failed' })
    }
  })

  onHook('event.updated', async ({ event, organizer, changedFields }) => {
    if (!event.isOnline) {
      return
    }

    const shouldSync = changedFields.includes('title') || changedFields.includes('dateTime')
    if (!shouldSync) {
      return
    }

    try {
      await dbConnect()
      await Event.findByIdAndUpdate(event._id, { zoomSyncStatus: 'pending' })

      if (event.zoomMeetingId) {
        await updateMeeting(event.zoomMeetingId, event, organizer)
        await Event.findByIdAndUpdate(event._id, { zoomSyncStatus: 'synced' })
        return
      }

      const meeting = await createMeeting(event, organizer)
      await Event.findByIdAndUpdate(event._id, {
        zoomMeetingId: meeting.meetingId,
        zoomJoinUrl: meeting.joinUrl,
        zoomSyncStatus: 'synced',
      })
    } catch (error) {
      console.error('Zoom update sync failed:', error)
      await Event.findByIdAndUpdate(event._id, { zoomSyncStatus: 'failed' })
    }
  })

  onHook('event.cancelled', async ({ event, organizer }) => {
    try {
      await dbConnect()

      if (!event.zoomMeetingId) {
        await Event.findByIdAndUpdate(event._id, { zoomSyncStatus: 'cancelled' })
        return
      }

      await Event.findByIdAndUpdate(event._id, { zoomSyncStatus: 'pending' })
      await deleteMeeting(event.zoomMeetingId, organizer)

      await Event.findByIdAndUpdate(event._id, {
        zoomSyncStatus: 'cancelled',
        $unset: {
          zoomMeetingId: 1,
          zoomJoinUrl: 1,
        },
      })
    } catch (error) {
      console.error('Zoom cancel sync failed:', error)
      await Event.findByIdAndUpdate(event._id, { zoomSyncStatus: 'failed' })
    }
  })
}
