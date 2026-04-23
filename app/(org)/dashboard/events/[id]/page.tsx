import { DashboardEventDetailPageUI } from '@/components/DashboardEventDetailPage/DashboardEventDetailPageUI'

export default async function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <DashboardEventDetailPageUI eventId={id} />
}
