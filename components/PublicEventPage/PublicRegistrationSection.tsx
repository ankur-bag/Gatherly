import { FiCheckCircle, FiInfo } from 'react-icons/fi'
import { FeedbackState, PublicStatus, RegistrationFormState } from './types'

interface PublicRegistrationSectionProps {
  publicStatus: PublicStatus
  registered: boolean
  registering: boolean
  formData: RegistrationFormState
  feedback: FeedbackState | null
  onNameChange: (value: string) => void
  onEmailChange: (value: string) => void
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void
}

function statusMessage(status: PublicStatus): string {
  if (status === 'Cancelled') return 'This event has been cancelled by the organizer.'
  if (status === 'Closed') return 'This event has already ended.'
  if (status === 'Full') return 'This event is currently full.'
  return 'Registration is not available at this moment.'
}

export function PublicRegistrationSection({
  publicStatus,
  registered,
  registering,
  formData,
  feedback,
  onNameChange,
  onEmailChange,
  onSubmit,
}: PublicRegistrationSectionProps) {
  if (registered) {
    return (
      <section className="rounded-xl border border-green-200 bg-green-50 p-6">
        <div className="flex items-start gap-3">
          <FiCheckCircle className="mt-0.5 text-green-700" size={20} />
          <div>
            <h2 className="text-xl font-semibold text-green-900">Registration received</h2>
            <p className="mt-1 text-green-800">
              {feedback?.message || 'Please check your email for your event confirmation and updates.'}
            </p>
          </div>
        </div>
      </section>
    )
  }

  if (publicStatus !== 'Open') {
    return (
      <section className="rounded-xl border border-neutral-300 bg-neutral-100 p-6">
        <div className="flex items-start gap-3">
          <FiInfo className="mt-0.5 text-neutral-700" size={20} />
          <p className="font-medium text-neutral-700">{statusMessage(publicStatus)}</p>
        </div>
      </section>
    )
  }

  return (
    <section className="rounded-xl border border-neutral-200 bg-white p-6 md:p-8">
      <h2 className="text-2xl font-semibold text-foreground">Register for this event</h2>

      {feedback?.kind === 'error' && (
        <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{feedback.message}</p>
      )}

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label htmlFor="attendeeName" className="mb-2 block text-sm font-medium text-foreground">
            Full name
          </label>
          <input
            id="attendeeName"
            type="text"
            required
            value={formData.attendeeName}
            onChange={(event) => onNameChange(event.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <div>
          <label htmlFor="attendeeEmail" className="mb-2 block text-sm font-medium text-foreground">
            Email address
          </label>
          <input
            id="attendeeEmail"
            type="email"
            required
            value={formData.attendeeEmail}
            onChange={(event) => onEmailChange(event.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        <button
          type="submit"
          disabled={registering}
          className="w-full rounded-lg bg-primary px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {registering ? 'Submitting...' : 'Register now'}
        </button>
      </form>
    </section>
  )
}