import { DashboardEventEditPageUI } from '@/components/DashboardEventEditPage/DashboardEventEditPageUI'

export default async function EventEditPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <DashboardEventEditPageUI eventId={id} />
}
