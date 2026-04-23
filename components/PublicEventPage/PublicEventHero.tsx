import { StatusBadge } from '@/components/StatusBadges'
import { PublicStatus } from './types'

interface PublicEventHeroProps {
  title: string
  description: string
  publicStatus: PublicStatus
}

function normalizeStatus(status: PublicStatus): string {
  if (!status) return 'closed'
  return status.toLowerCase()
}

export function PublicEventHero({ title, description, publicStatus }: PublicEventHeroProps) {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="max-w-3xl text-4xl font-semibold text-foreground md:text-5xl">{title}</h1>
        <StatusBadge status={normalizeStatus(publicStatus)} />
      </div>
      <p className="text-lg text-neutral-600">{description}</p>
    </div>
  )
}