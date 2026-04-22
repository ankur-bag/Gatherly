import { onHook } from '@/lib/hooks'
import {
  sendRegistrationConfirmed,
  sendUnderReview,
  sendApproved,
  sendRejected,
  sendRevoked,
  sendEventUpdated,
  sendEventCancelled,
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

  onHook('registration.approved', async ({ registration, event }) => {
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
}
