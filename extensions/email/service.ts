import { render } from '@react-email/render'
import { Resend } from 'resend'
import { IRegistration, IEvent, IUser } from '@/types'

let _resend: Resend | null = null

function getResend() {
  if (!_resend) {
    if (!process.env.RESEND_API_KEY) {
      console.error('[Resend] Missing RESEND_API_KEY in environment')
    }
    _resend = new Resend(process.env.RESEND_API_KEY)
  }
  return _resend
}

const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Avento.ai <no-reply@yourdomain.com>'

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const response = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })
    console.log(`Email to ${to} sent successfully:`, JSON.stringify(response, null, 2))
  } catch (error) {
    console.error('Failed to send email:', error)
    // Don't throw — extensions should never throw to client
  }
}

export async function sendRegistrationConfirmed(registration: IRegistration, event: IEvent) {
  try {
    const RegistrationConfirmed = (await import('./templates/RegistrationConfirmed').then((m) => m.default))
    const html = await render(
      RegistrationConfirmed({
        attendeeName: registration.attendeeName,
        eventTitle: event.title,
        eventDateTime: new Date(event.dateTime).toLocaleString(),
      })
    )
    await sendEmail(registration.attendeeEmail, `You are registered for ${event.title}`, html)
  } catch (error) {
    console.error('Failed to send registration confirmed email:', error)
  }
}

export async function sendUnderReview(registration: IRegistration, event: IEvent) {
  try {
    const UnderReview = (await import('./templates/UnderReview').then((m) => m.default))
    const html = await render(
      UnderReview({
        attendeeName: registration.attendeeName,
        eventTitle: event.title,
      })
    )
    await sendEmail(registration.attendeeEmail, `Your application for ${event.title} is under review`, html)
  } catch (error) {
    console.error('Failed to send under review email:', error)
  }
}

export async function sendApproved(registration: IRegistration, event: IEvent) {
  try {
    const Approved = (await import('./templates/Approved').then((m) => m.default))
    const html = await render(
      Approved({
        attendeeName: registration.attendeeName,
        eventTitle: event.title,
        eventDateTime: new Date(event.dateTime).toLocaleString(),
        zoomJoinUrl: event.isOnline ? (event.zoomJoinUrl ?? undefined) : undefined,
      })
    )
    await sendEmail(registration.attendeeEmail, `You are approved for ${event.title}`, html)
  } catch (error) {
    console.error('Failed to send approved email:', error)
  }
}

export async function sendRejected(registration: IRegistration, event: IEvent) {
  try {
    const Rejected = (await import('./templates/Rejected').then((m) => m.default))
    const html = await render(
      Rejected({
        attendeeName: registration.attendeeName,
        eventTitle: event.title,
      })
    )
    await sendEmail(registration.attendeeEmail, `Update on your ${event.title} application`, html)
  } catch (error) {
    console.error('Failed to send rejected email:', error)
  }
}

export async function sendRevoked(registration: IRegistration, event: IEvent) {
  try {
    const Revoked = (await import('./templates/Revoked').then((m) => m.default))
    const html = await render(
      Revoked({
        attendeeName: registration.attendeeName,
        eventTitle: event.title,
      })
    )
    await sendEmail(registration.attendeeEmail, `Your spot for ${event.title} has been cancelled`, html)
  } catch (error) {
    console.error('Failed to send revoked email:', error)
  }
}

export async function sendEventUpdated(event: IEvent, changedFields: string[]) {
  try {
    // Get all registered attendees
    const Registration = (await import('@/models/Registration').then((m) => m.default))
    const registrations = await Registration.find({
      eventId: event._id,
      status: 'confirmed',
    })

    const html = await render(
      EventUpdated({
        eventTitle: event.title,
        changedFields,
      })
    )

    // Send to all registered attendees
    await Promise.allSettled(
      registrations.map((reg: any) =>
        sendEmail(reg.attendeeEmail, `${event.title} details have changed`, html)
      )
    )
  } catch (error) {
    console.error('Failed to send event updated email:', error)
  }
}

export async function sendEventCancelled(event: IEvent) {
  try {
    // Get all registered attendees
    const Registration = (await import('@/models/Registration').then((m) => m.default))
    const registrations = await Registration.find({
      eventId: event._id,
      status: 'confirmed',
    })

    const html = await render(
      EventCancelled({
        eventTitle: event.title,
      })
    )

    // Send to all registered attendees
    await Promise.allSettled(
      registrations.map((reg: any) =>
        sendEmail(reg.attendeeEmail, `${event.title} has been cancelled`, html)
      )
    )
  } catch (error) {
    console.error('Failed to send event cancelled email:', error)
  }
}

export async function sendEventReminder(registration: IRegistration, event: IEvent) {
  try {
    const EventReminder = (await import('./templates/EventReminder').then((m) => m.default))
    const html = await render(
      EventReminder({
        attendeeName: registration.attendeeName,
        eventTitle: event.title,
        eventDateTime: new Date(event.dateTime).toLocaleString(),
        venueOrJoinUrl: event.isOnline ? (event.zoomJoinUrl || 'Zoom link pending') : (event.venue || 'TBA'),
        isOnline: event.isOnline
      })
    )
    await sendEmail(registration.attendeeEmail, `Reminder: ${event.title} is starting in 24 hours!`, html)
  } catch (error) {
    console.error('Failed to send event reminder email:', error)
  }
}
