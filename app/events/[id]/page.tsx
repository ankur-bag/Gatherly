import { PublicEventPageUI } from '@/components/PublicEventPage/PublicEventPageUI'

interface PublicEventRouteProps {
  params: Promise<{ id: string }>
}

export default async function PublicEventRoute({ params }: PublicEventRouteProps) {
  const { id } = await params

  return <PublicEventPageUI id={id} />
}