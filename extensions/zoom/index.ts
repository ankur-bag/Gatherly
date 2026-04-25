import { onHook } from '@/lib/hooks'
import { createMeeting, updateMeeting, deleteMeeting, endMeeting } from './service'
import Event from '@/models/Event'

export function registerZoomExtension() {
  // ───────────────────────────────────────────────────────────────────────────
  // event.published → create Zoom meeting
  // ───────────────────────────────────────────────────────────────────────────
  onHook('event.published', async ({ event, organizer }) => {
    if (!event.isOnline) return
    if (!organizer?.zoomConnected) return

    // ✅ Idempotency guard: if meeting already exists, skip
    if (event.zoomMeetingId) {
      console.log(`[Zoom] Meeting already exists for event ${event._id}, skipping create`)
      return
    }

    try {
      const zoom = await createMeeting(event, organizer)

      await Event.findByIdAndUpdate(event._id, {
        zoomMeetingId: zoom.id,
        zoomJoinUrl: zoom.join_url,
        zoomSyncStatus: 'synced',
        zoomError: null,
      })

      console.log(`[Zoom] Meeting created for event ${event._id}: ${zoom.join_url}`)
    } catch (err: any) {
      console.error(`[Zoom] Failed to create meeting for event ${event._id}:`, err)
      await Event.findByIdAndUpdate(event._id, {
        zoomSyncStatus: 'failed',
        zoomError: err?.message || 'Unknown error',
      })
    }
  })

  // ───────────────────────────────────────────────────────────────────────────
  // event.updated → patch Zoom meeting or delete if switched to in-person
  // ───────────────────────────────────────────────────────────────────────────
  onHook('event.updated', async ({ event, organizer, changedFields }) => {
    // ✅ Edge case: switched from Online → In-Person, clean up Zoom meeting
    if (!event.isOnline && event.zoomMeetingId) {
      try {
        await deleteMeeting(event.zoomMeetingId, organizer)
        console.log(`[Zoom] Meeting deleted after type switch for event ${event._id}`)
      } catch (err: any) {
        console.error(`[Zoom] Failed to delete meeting on type-switch for event ${event._id}:`, err)
      } finally {
        await Event.findByIdAndUpdate(event._id, {
          zoomMeetingId: null,
          zoomJoinUrl: null,
          zoomSyncStatus: 'cancelled',
          zoomError: null,
        })
      }
      return
    }

    // Only update Zoom if event is online and has a linked meeting
    if (!event.isOnline || !event.zoomMeetingId) return
    if (!organizer?.zoomConnected) return

    const relevantFields = ['title', 'dateTime']
    const shouldUpdate = changedFields.some((f) => relevantFields.includes(f))
    if (!shouldUpdate) return

    try {
      await updateMeeting(event.zoomMeetingId, event, organizer)
      await Event.findByIdAndUpdate(event._id, {
        zoomSyncStatus: 'synced',
        zoomError: null,
      })
      console.log(`[Zoom] Meeting updated for event ${event._id}`)
    } catch (err: any) {
      console.error(`[Zoom] Failed to update meeting for event ${event._id}:`, err)
      await Event.findByIdAndUpdate(event._id, {
        zoomSyncStatus: 'failed',
        zoomError: err?.message || 'Unknown error',
      })
    }
  })

  // ───────────────────────────────────────────────────────────────────────────
  // event.cancelled → delete Zoom meeting
  // ───────────────────────────────────────────────────────────────────────────
  onHook('event.cancelled', async ({ event, organizer }) => {
    if (!event.zoomMeetingId) {
      await Event.findByIdAndUpdate(event._id, {
        zoomSyncStatus: 'cancelled',
        zoomError: null,
        $unset: {
          zoomMeetingId: 1,
          zoomJoinUrl: 1,
        },
      })
      return
    }

    const meetingId = event.zoomMeetingId
    try {
      try {
        await endMeeting(meetingId, organizer)
        console.log(`[Zoom] Meeting ended for event ${event._id}`)
      } catch (endError: any) {
        console.error(`[Zoom] Failed to end meeting for event ${event._id}:`, endError)
      }

      await deleteMeeting(meetingId, organizer)
      console.log(`[Zoom] Meeting deleted for event ${event._id}`)
    } catch (err: any) {
      console.error(`[Zoom] Failed to delete meeting for event ${event._id}:`, err)
    } finally {
      // Immediately invalidate stored join link and meeting reference after cancellation.
      await Event.findByIdAndUpdate(event._id, {
        zoomSyncStatus: 'cancelled',
        zoomError: null,
        $unset: {
          zoomMeetingId: 1,
          zoomJoinUrl: 1,
        },
      })
    }
  })
}
