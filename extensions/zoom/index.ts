import { onHook } from '@/lib/hooks'

export function registerZoomExtension() {
  // Zoom extension will be fully implemented in Task 11
  // For now, just register the hooks without implementation

  onHook('event.published', async ({ event, organizer }) => {
    // TODO: Create Zoom meeting if event.isOnline
  })

  onHook('event.updated', async ({ event, organizer, changedFields }) => {
    // TODO: Update Zoom meeting if title/dateTime changed
  })

  onHook('event.cancelled', async ({ event, organizer, activeRegistrations }) => {
    // TODO: Delete Zoom meeting
  })
}
