import { render } from '@react-email/render'
import nodemailer from 'nodemailer'
import { IRegistration, IEvent } from '@/types'

let _transporter: nodemailer.Transporter | null = null

function getTransporter() {
  if (!_transporter) {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      throw new Error('[Nodemailer] Missing EMAIL_USER or EMAIL_PASS in environment')
    }

    _transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    })
  }

  return _transporter
}

const FROM_EMAIL = process.env.EMAIL_FROM || `Gatherly <${process.env.EMAIL_USER || 'no-reply@yourdomain.com'}>`

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const response = await getTransporter().sendMail({
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
        zoomJoinUrl: event.isOnline ? (event.zoomJoinUrl ?? undefined) : undefined,
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
    const EventUpdated = (await import('./templates/EventUpdated').then((m) => m.default))
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
      registrations.map((reg: IRegistration) =>
        sendEmail(reg.attendeeEmail, `${event.title} details have changed`, html)
      )
    )
  } catch (error) {
    console.error('Failed to send event updated email:', error)
  }
}

export async function sendEventCancelled(event: IEvent) {
  try {
    // Get all registrations for the event, regardless of status
    const Registration = (await import('@/models/Registration').then((m) => m.default))
    const EventCancelled = (await import('./templates/EventCancelled').then((m) => m.default))
    const registrations = await Registration.find({
      eventId: event._id,
    })

    const html = await render(
      EventCancelled({
        eventTitle: event.title,
      })
    )

    // Send to all registered attendees
    await Promise.allSettled(
      registrations.map((reg: IRegistration) =>
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
