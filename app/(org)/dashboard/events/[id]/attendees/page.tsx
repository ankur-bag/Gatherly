import { DashboardEventAttendeesPageUI } from '@/components/DashboardEventAttendeesPage/DashboardEventAttendeesPageUI'

export default async function AttendeesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  return <DashboardEventAttendeesPageUI eventId={id} />
}
