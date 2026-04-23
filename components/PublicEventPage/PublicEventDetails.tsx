import { IEvent } from '@/types'
import { FiClock, FiMapPin, FiUsers, FiVideo } from 'react-icons/fi'

interface PublicEventDetailsProps {
  event: IEvent
  attendeeCount: number
}

export function PublicEventDetails({ event, attendeeCount }: PublicEventDetailsProps) {
  return (
    <div className="grid gap-5 md:grid-cols-2">
      <article className="rounded-xl border border-[#e5e5df] bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#a3a39c]">
          <FiClock className="text-[#FF7F11]" size={16} />
          Date and time
        </div>
        <p className="text-lg font-medium text-[#262626]">
          {new Date(event.dateTime).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          })}
        </p>
        <p className="mt-1 text-[#737370]">
          {new Date(event.dateTime).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </p>
      </article>

      <article className="rounded-xl border border-[#e5e5df] bg-white p-6 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#a3a39c]">
          <FiUsers className="text-[#FF7F11]" size={16} />
          Attendance
        </div>
        <p className="text-lg font-medium text-[#262626]">
          <span className="text-[#FF7F11] font-semibold">{attendeeCount}</span> / {event.capacity} registered
        </p>
      </article>

      {event.isOnline ? (
        <article className="rounded-xl border border-[#e5e5df] bg-white p-6 shadow-sm md:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#a3a39c]">
            <FiVideo className="text-[#FF7F11]" size={16} />
            Online event
          </div>
          {event.zoomJoinUrl ? (
            <a
              href={event.zoomJoinUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-1 font-semibold text-[#3b7fd9] transition-colors hover:text-[#2563a8]"
            >
              Open meeting link
            </a>
          ) : (
            <p className="mt-1 text-[#737370]">Meeting link will be shared after organizer approval.</p>
          )}
        </article>
      ) : (
        <article className="rounded-xl border border-[#e5e5df] bg-white p-6 shadow-sm md:col-span-2">
          <div className="mb-2 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-[#a3a39c]">
            <FiMapPin className="text-[#FF7F11]" size={16} />
            Venue
          </div>
          <p className="mt-1 text-lg font-medium text-[#262626]">{event.venue || 'Venue will be announced.'}</p>
        </article>
      )}
    </div>
  )
}