import { DashboardSettingsPageUI } from '@/components/DashboardSettingsPage/DashboardSettingsPageUI'
import { Suspense } from 'react'

export default function SettingsPage() {
  return (
    <Suspense fallback={null}>
      <DashboardSettingsPageUI />
    </Suspense>
  )
}
