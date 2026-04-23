import {
  FiBell,
  FiCheckCircle,
  FiClock,
  FiFilter,
  FiSearch,
  FiVideo,
} from 'react-icons/fi'

const featureCards = [
  {
    title: 'Structured Approval Queue',
    description: 'Handle pending, approved, rejected, and revoked statuses through a clear RSVP state model.',
    Icon: FiCheckCircle,
  },
  {
    title: 'Capacity Visibility',
    description: 'Keep active attendee counts aligned with seat limits so registrations stay predictable.',
    Icon: FiClock,
  },
  {
    title: 'Smart Search + Filters',
    description: 'Find attendees instantly by name, email, and status across high-volume event lists.',
    Icon: FiSearch,
  },
  {
    title: 'Actionable Segmentation',
    description: 'Focus operations with status filters that adapt naturally to organizer workflows.',
    Icon: FiFilter,
  },
  {
    title: 'Automated Notifications',
    description: 'Trigger status-based communication hooks without coupling business logic and side effects.',
    Icon: FiBell,
  },
  {
    title: 'Zoom Sync Ready',
    description: 'Coordinate online sessions and monitor sync health without breaking organizer flow.',
    Icon: FiVideo,
  },
]

export function Features() {
  return (
    <section id="features" className="mx-auto w-full max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <div className="mb-9 max-w-3xl space-y-3 md:mb-12">
        <p className="text-xs font-bold uppercase tracking-[0.12em] text-[#00ED64]">Built for organizer teams</p>
        <h2 className="font-display text-[clamp(1.85rem,3.7vw,3.2rem)] font-bold leading-[1.08] tracking-[-0.01em] text-white">
          Everything required to run events without operational drift.
        </h2>
        <p className="text-base leading-relaxed text-[#B8C4CE] md:text-lg">
          A focused platform for teams who need speed, accountability, and polished attendee experiences across every
          event format.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:gap-5 xl:grid-cols-3">
        {featureCards.map(({ title, description, Icon }) => (
          <article
            key={title}
            className="group rounded-2xl border border-[#1F3B4D] bg-[#112733] p-5 transition-transform duration-200 ease-out hover:-translate-y-0.5 sm:p-6"
          >
            <div className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[#00ED64]/14 text-[#00ED64]">
              <Icon size={19} />
            </div>
            <h3 className="text-lg font-semibold leading-tight text-white">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#B8C4CE] sm:text-[0.96rem]">{description}</p>
          </article>
        ))}
      </div>
    </section>
  )
}