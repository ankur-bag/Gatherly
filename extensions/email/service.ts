import { render } from '@react-email/render'
import nodemailer, { type Transporter } from 'nodemailer'
import { IRegistration, IEvent } from '@/types'

let _transporter: Transporter | null = null

function parseBoolean(value: string | undefined, defaultValue: boolean) {
  if (value === undefined) return defaultValue
  return value.toLowerCase() === 'true'
}

function getMailConfig() {
  const smtpHost = process.env.SMTP_HOST
  const smtpPort = process.env.SMTP_PORT ? Number(process.env.SMTP_PORT) : undefined
  const smtpSecure = parseBoolean(process.env.SMTP_SECURE, smtpPort === 465)
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS

  if (smtpHost) {
    if (!smtpUser || !smtpPass) {
      throw new Error('[Email] Missing SMTP_USER/SMTP_PASS (or EMAIL_USER/EMAIL_PASS) for custom SMTP transport')
    }

    return {
      transportLabel: `smtp:${smtpHost}`,
      options: {
        host: smtpHost,
        port: smtpPort ?? 587,
        secure: smtpSecure,
        auth: {
          user: smtpUser,
          pass: smtpPass,
        },
      },
    }
  }

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error('[Email] Missing EMAIL_USER or EMAIL_PASS in environment')
  }

  return {
    transportLabel: 'gmail',
    options: {
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    },
  }
}

function getTransporter() {
  if (!_transporter) {
    const config = getMailConfig()
    _transporter = nodemailer.createTransport(config.options)
    console.log(`[Email] Transport initialized using ${config.transportLabel}`)
  }

  return _transporter
}

const FROM_EMAIL =
  process.env.EMAIL_FROM ||
  `Gatherly <${process.env.SMTP_USER || process.env.EMAIL_USER || 'no-reply@yourdomain.com'}>`

async function sendEmail(to: string, subject: string, html: string) {
  try {
    const response = await getTransporter().sendMail({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    })
    console.log(`[Email] Sent "${subject}" to ${to}:`, JSON.stringify(response, null, 2))
  } catch (error) {
    console.error(`[Email] Failed to send "${subject}" to ${to}:`, error)
    // Do not throw; registration flows should still succeed even if delivery fails.
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
        isOnline: event.isOnline,
      })
    )
    await sendEmail(registration.attendeeEmail, `Reminder: ${event.title} is starting in 24 hours!`, html)
  } catch (error) {
    console.error('Failed to send event reminder email:', error)
  }
}
