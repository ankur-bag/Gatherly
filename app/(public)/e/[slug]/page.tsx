import { PublicEventPageUI } from '@/components/PublicEventPage/PublicEventPageUI'

interface PublicEventRouteProps {
  params: Promise<{ slug: string }>
}

export default async function PublicEventRoute({ params }: PublicEventRouteProps) {
  const { slug } = await params

  return <PublicEventPageUI slug={slug} />
}
