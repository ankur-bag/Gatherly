import { onHook } from '@/lib/hooks'
import { createMeeting, updateMeeting, deleteMeeting } from './service'
import Event from '@/models/Event'

export function registerZoomExtension() {
  // ───────────────────────────────────────────────────────────────────────────
  // event.published → create Zoom meeting
  // ───────────────────────────────────────────────────────────────────────────
  onHook('event.published', async ({ event }) => {
    if (!event.isOnline) return

    // ✅ Idempotency guard: if meeting already exists, skip
    if (event.zoomMeetingId) {
      console.log(`[Zoom] Meeting already exists for event ${event._id}, skipping create`)
      return
    }

    try {
      const zoom = await createMeeting(event)

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
  onHook('event.updated', async ({ event, changedFields }) => {
    // ✅ Edge case: switched from Online → In-Person, clean up Zoom meeting
    if (!event.isOnline && event.zoomMeetingId) {
      try {
        await deleteMeeting(event.zoomMeetingId)
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

    const relevantFields = ['title', 'dateTime']
    const shouldUpdate = changedFields.some((f) => relevantFields.includes(f))
    if (!shouldUpdate) return

    try {
      await updateMeeting(event.zoomMeetingId, event)
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
  onHook('event.cancelled', async ({ event }) => {
    if (!event.zoomMeetingId) return

    try {
      await deleteMeeting(event.zoomMeetingId)
      await Event.findByIdAndUpdate(event._id, {
        zoomSyncStatus: 'cancelled',
        zoomError: null,
      })
      console.log(`[Zoom] Meeting deleted for event ${event._id}`)
    } catch (err: any) {
      console.error(`[Zoom] Failed to delete meeting for event ${event._id}:`, err)
      await Event.findByIdAndUpdate(event._id, {
        zoomSyncStatus: 'failed',
        zoomError: err?.message || 'Unknown error',
      })
    }
  })
}
