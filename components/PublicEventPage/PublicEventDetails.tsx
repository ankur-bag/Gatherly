import { IEvent } from '@/types'
import { FiClock, FiMapPin, FiUsers, FiVideo } from 'react-icons/fi'

interface PublicEventDetailsProps {
  event: IEvent
  attendeeCount: number
}

export function PublicEventDetails({ event, attendeeCount }: PublicEventDetailsProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <article className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-neutral-600">
          <FiClock className="text-primary" size={18} />
          Date and time
        </div>
        <p className="text-lg font-medium text-foreground">
          {new Date(event.dateTime).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <p className="mt-1 text-neutral-600">
          {new Date(event.dateTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </article>

      <article className="rounded-xl border border-neutral-200 bg-white p-6">
        <div className="mb-2 flex items-center gap-2 text-sm text-neutral-600">
          <FiUsers className="text-primary" size={18} />
          Attendance
        </div>
        <p className="text-lg font-medium text-foreground">
          {attendeeCount} / {event.capacity} registered
        </p>
      </article>

      {event.isOnline ? (
        <article className="rounded-xl border border-neutral-200 bg-white p-6 md:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-sm text-neutral-600">
            <FiVideo className="text-primary" size={18} />
            Online event
          </div>
          {event.zoomJoinUrl ? (
            <a
              href={event.zoomJoinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-primary transition-colors hover:text-primary-dark"
            >
              Open meeting link
            </a>
          ) : (
            <p className="text-neutral-600">Meeting link will be shared after organizer approval.</p>
          )}
        </article>
      ) : (
        <article className="rounded-xl border border-neutral-200 bg-white p-6 md:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-sm text-neutral-600">
            <FiMapPin className="text-primary" size={18} />
            Venue
          </div>
          <p className="text-lg font-medium text-foreground">{event.venue || 'Venue will be announced.'}</p>
        </article>
      )}
    </div>
  )
}