'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { IUser } from '@/types'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FiArrowLeft, FiCheck } from 'react-icons/fi'

export function DashboardSettingsPageUI() {
  const { isLoaded } = useAuth()
  const [user, setUser] = useState<IUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    zoomAccountId: '',
    zoomClientId: '',
    zoomClientSecret: '',
  })

  useEffect(() => {
    if (!isLoaded) return

    async function fetchUser() {
      try {
        const res = await fetch('/api/users/me')
        if (!res.ok) throw new Error('Failed to fetch user')
        const { data } = await res.json()
        setUser(data)
        setFormData({
          zoomAccountId: data.zoomAccountId || '',
          zoomClientId: data.zoomClientId || '',
          zoomClientSecret: data.zoomClientSecret || '',
        })
      } catch (error) {
        console.error('Failed to fetch user:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUser()
  }, [isLoaded])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/users/me/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to save settings')
      }

      const { data } = await res.json()
      setUser(data)
      alert('Settings saved successfully!')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setSaving(false)
    }
  }

  if (!isLoaded || loading) {
    return (
      <DashboardLayout>
        <div className="animate-fadeIn space-y-4">
          <div className="h-12 w-1/2 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-64 animate-pulse rounded-lg bg-neutral-200" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-2xl animate-slideInUp space-y-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary-dark"
        >
          <FiArrowLeft size={20} />
          Back to Dashboard
        </Link>

        <div>
          <h1 className="text-3xl font-semibold text-foreground">Settings</h1>
          <p className="mt-2 text-neutral-600">Manage your account and integrations</p>
        </div>

        <div className="rounded-lg border border-neutral-200 bg-white p-8">
          <h2 className="mb-6 text-xl font-semibold text-foreground">Profile</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-neutral-600">Name</label>
              <p className="text-lg font-medium text-foreground">{user?.name || 'Not set'}</p>
            </div>
            <div>
              <label className="block text-sm text-neutral-600">Email</label>
              <p className="text-lg font-medium text-foreground">{user?.email || 'Not set'}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-neutral-200 bg-white p-8">
          <div>
            <h2 className="mb-2 text-xl font-semibold text-foreground">Zoom Integration</h2>
            <p className="text-sm text-neutral-600">
              Add your Zoom credentials to automatically create meeting links for your online events.
            </p>
          </div>

          {user?.zoomAccountId && user?.zoomClientId && (
            <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              <FiCheck size={20} />
              Zoom credentials configured
            </div>
          )}

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Zoom Account ID</label>
            <input
              type="text"
              value={formData.zoomAccountId}
              onChange={(e) => setFormData({ ...formData, zoomAccountId: e.target.value })}
              placeholder="e.g., abc123..."
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-2 text-xs text-neutral-500">Your Zoom account ID from the Zoom Admin Center</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Zoom Client ID</label>
            <input
              type="text"
              value={formData.zoomClientId}
              onChange={(e) => setFormData({ ...formData, zoomClientId: e.target.value })}
              placeholder="e.g., abc123..."
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-2 text-xs text-neutral-500">OAuth 2.0 Client ID from your Zoom app</p>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Zoom Client Secret</label>
            <input
              type="password"
              value={formData.zoomClientSecret}
              onChange={(e) => setFormData({ ...formData, zoomClientSecret: e.target.value })}
              placeholder="••••••••••••"
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <p className="mt-2 text-xs text-neutral-500">OAuth 2.0 Client Secret (never shared)</p>
          </div>

          <div className="flex gap-4 border-t border-neutral-200 pt-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
            >
              {saving ? 'Saving...' : 'Save Settings'}
            </button>
            <Link href="/dashboard" className="rounded-lg px-6 py-3 text-neutral-600 transition-colors hover:bg-neutral-100">
              Cancel
            </Link>
          </div>
        </form>

        <div className="space-y-4 rounded-lg border border-neutral-200 bg-neutral-50 p-6">
          <h3 className="font-semibold text-foreground">How to get Zoom credentials</h3>
          <ol className="space-y-2 text-sm text-neutral-700">
            <li>
              1. Go to{' '}
              <a href="https://zoom.us/developer" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary-dark">
                Zoom App Marketplace
              </a>
            </li>
            <li>2. Create a new Server-to-Server OAuth application</li>
            <li>3. Copy your Account ID from the basic information page</li>
            <li>4. Generate and copy the Client ID and Client Secret</li>
            <li>5. Paste them here to enable automatic Zoom meeting creation</li>
          </ol>
        </div>
      </div>
    </DashboardLayout>
  )
}