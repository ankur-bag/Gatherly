import { StatusBadge } from '@/components/StatusBadges'
import { PublicStatus } from './types'

interface PublicEventHeroProps {
  title: string
  description: string
  publicStatus: PublicStatus
}

export function PublicEventHero({ title, description, publicStatus }: PublicEventHeroProps) {
  // Map public status strings to badge compatible ones
  const displayStatus = publicStatus || 'Closed'

  return (
    <div className="animate-reveal space-y-6">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <h1 
          className="max-w-3xl text-4xl sm:text-5xl lg:text-6xl font-medium tracking-tight text-charcoal leading-[1.05]" 
          style={{ fontFamily: 'var(--font-display)' }}
        >
          {title}
        </h1>
        <div className="shrink-0">
          {/* Ensure the status explicitly matches the badge expectations */}
          <StatusBadge status={displayStatus as any} />
        </div>
      </div>
      <p className="max-w-2xl text-lg lg:text-xl text-charcoal/50 leading-relaxed font-medium">
        {description}
      </p>
    </div>
  )
}