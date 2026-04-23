import { render } from '@react-email/render'
import { Resend } from 'resend'
import { IRegistration, IEvent, IUser } from '@/types'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'Avento.ai <no-reply@yourdomain.com>'

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })
  } catch (error) {
    console.error('Failed to send email:', error)
    // Don't throw — extensions should never throw to client
  }
}

export async function sendRegistrationConfirmed(registration: IRegistration, event: IEvent) {
  try {
    const RegistrationConfirmed = (await import('./templates/RegistrationConfirmed').then((m) => m.default))
    const html = render(
      RegistrationConfirmed({
        attendeeName: registration.attendeeName,
        eventTitle: event.title,
        eventDateTime: new Date(event.dateTime).toLocaleString(),
        eventLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/e/${event.slug}`,
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
    const html = render(
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
    const html = render(
      Approved({
        attendeeName: registration.attendeeName,
        eventTitle: event.title,
        eventDateTime: new Date(event.dateTime).toLocaleString(),
        eventLink: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/e/${event.slug}`,
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
    const html = render(
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
    const html = render(
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
      status: { $in: ['registered', 'approved'] },
    })

    const EventUpdated = (await import('./templates/EventUpdated').then((m) => m.default))
    const html = render(
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
      status: { $in: ['registered', 'approved'] },
    })

    const EventCancelled = (await import('./templates/EventCancelled').then((m) => m.default))
    const html = render(
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
