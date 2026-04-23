import { onHook } from '@/lib/hooks'
import {
  sendRegistrationConfirmed,
  sendUnderReview,
  sendApproved,
  sendRejected,
  sendRevoked,
  sendEventUpdated,
  sendEventCancelled,
  sendEventReminder,
} from './service'

export function registerEmailExtension() {
  // Registration hooks
  onHook('registration.created', async ({ registration, event }) => {
    if (event.registrationMode === 'open') {
      await sendRegistrationConfirmed(registration, event)
    } else {
      await sendUnderReview(registration, event)
    }
  })

  onHook('registration.confirmed', async ({ registration, event }) => {
    await sendApproved(registration, event)
  })

  onHook('registration.rejected', async ({ registration, event }) => {
    await sendRejected(registration, event)
  })

  onHook('registration.revoked', async ({ registration, event }) => {
    await sendRevoked(registration, event)
  })

  // Event hooks
  onHook('event.updated', async ({ event, changedFields }) => {
    if (event.status === 'published') {
      await sendEventUpdated(event, changedFields)
    }
  })

  onHook('event.cancelled', async ({ event }) => {
    await sendEventCancelled(event)
  })

  // Reminder hook
  onHook('event.reminder', async ({ eventId }) => {
    try {
      const Event = (await import('@/models/Event').then((m) => m.default))
      const Registration = (await import('@/models/Registration').then((m) => m.default))
      
      const event = await Event.findById(eventId)
      if (!event) return

      const attendees = await Registration.find({
        eventId,
        status: 'confirmed'
      })

      await Promise.allSettled(
        attendees.map(reg => sendEventReminder(reg, event))
      )
    } catch (error) {
      console.error('Failed to handle event.reminder hook:', error)
    }
  })
}
