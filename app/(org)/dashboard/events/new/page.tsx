import { DashboardEventCreatePageUI } from '@/components/DashboardEventCreatePage/DashboardEventCreatePageUI'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

export default function CreateEventPage() {
  return (
    <Suspense fallback={null}>
      <DashboardEventCreatePageUI />
    </Suspense>
  )
}
