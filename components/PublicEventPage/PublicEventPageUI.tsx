'use client'

import { IRegistration } from '@/types'
import { useEffect, useState } from 'react'
import { PublicEventDetails } from './PublicEventDetails'
import { PublicEventHero } from './PublicEventHero'
import { PublicRegistrationSection } from './PublicRegistrationSection'
import { PublicEventShell } from './PublicEventShell'
import { FeedbackState, PublicEventPayload, PublicStatus, RegistrationFormState } from './types'

interface PublicEventPageUIProps {
  slug: string
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message
  return 'Something went wrong. Please try again.'
}

function getSuccessMessage(status: IRegistration['status']): string {
  if (status === 'pending') {
    return 'Your registration is under review. We will email you once it is approved.'
  }
  return 'You are confirmed. We have sent the details to your email address.'
}

export function PublicEventPageUI({ slug }: PublicEventPageUIProps) {
  const [eventPayload, setEventPayload] = useState<PublicEventPayload | null>(null)
  const [formData, setFormData] = useState<RegistrationFormState>({ attendeeName: '', attendeeEmail: '' })
  const [feedback, setFeedback] = useState<FeedbackState | null>(null)
  const [registered, setRegistered] = useState(false)
  const [loading, setLoading] = useState(true)
  const [registering, setRegistering] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchEvent() {
      try {
        const response = await fetch(`/api/events/slug/${slug}`)
        if (!response.ok) {
          if (response.status === 404) throw new Error('Event not found')
          throw new Error('Failed to load event')
        }

        const body = (await response.json()) as { data: PublicEventPayload }
        setEventPayload(body.data)
      } catch (fetchError) {
        setError(getErrorMessage(fetchError))
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [slug])

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!eventPayload?.event?._id) {
      setFeedback({ kind: 'error', message: 'Event context is unavailable right now.' })
      return
    }

    try {
      setRegistering(true)
      setFeedback(null)

      const response = await fetch(`/api/events/${eventPayload.event._id}/registrations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const body = (await response.json()) as { data?: IRegistration; error?: string }

      if (!response.ok) {
        throw new Error(body.error || 'Failed to submit registration')
      }

      if (body.data?.status === 'registered' || body.data?.status === 'approved') {
        setEventPayload((previous) => {
          if (!previous) return previous
          return {
            ...previous,
            activeCount: previous.activeCount + 1,
          }
        })
      }

      const registrationStatus = body.data?.status || 'registered'
      setFeedback({ kind: 'success', message: getSuccessMessage(registrationStatus) })
      setRegistered(true)
      setFormData({ attendeeName: '', attendeeEmail: '' })
    } catch (registrationError) {
      setFeedback({ kind: 'error', message: getErrorMessage(registrationError) })
    } finally {
      setRegistering(false)
    }
  }

  if (loading) {
    return (
      <PublicEventShell>
        <section className="mx-auto w-full max-w-3xl space-y-4 px-6 py-12">
          <div className="skeleton h-12 w-1/2" />
          <div className="skeleton mt-6 h-64 w-full" />
        </section>
      </PublicEventShell>
    )
  }

  if (error || !eventPayload) {
    return (
      <PublicEventShell>
        <section className="mx-auto w-full max-w-3xl px-6 py-16">
          <h1 className="text-3xl font-semibold text-[#c53030]">{error || 'Event not found'}</h1>
        </section>
      </PublicEventShell>
    )
  }

  const publicStatus: PublicStatus = eventPayload.publicStatus

  return (
    <PublicEventShell>
      <article className="animate-slideUp mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 py-12 md:py-16">
        <PublicEventHero
          title={eventPayload.event.title}
          description={eventPayload.event.description}
          publicStatus={publicStatus}
        />

        <PublicEventDetails event={eventPayload.event} attendeeCount={eventPayload.activeCount} />

        <PublicRegistrationSection
          publicStatus={publicStatus}
          registered={registered}
          registering={registering}
          formData={formData}
          feedback={feedback}
          onNameChange={(value) => setFormData((current) => ({ ...current, attendeeName: value }))}
          onEmailChange={(value) => setFormData((current) => ({ ...current, attendeeEmail: value }))}
          onSubmit={handleRegister}
        />
      </article>
    </PublicEventShell>
  )
}