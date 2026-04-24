'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { ZoomSyncStatus } from '@/types'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FiAlertCircle, FiCheck, FiSettings, FiVideo, FiArrowLeft } from 'react-icons/fi'

export function DashboardSettingsPageUI() {
  const { isLoaded } = useAuth()
  const [zoomStatus, setZoomStatus] = useState<ZoomSyncStatus>('pending')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const [disconnectConfirm, setDisconnectConfirm] = useState(false)

  useEffect(() => {
    if (!isLoaded) return
    async function checkZoom() {
      try {
        const res = await fetch('/api/settings/zoom')
        const data = await res.json()
        setZoomStatus(data.status || 'pending')
      } catch {
        setError('Failed to fetch settings')
      } finally {
        setLoading(false)
      }
    }
    checkZoom()
  }, [isLoaded])

  async function handleZoomConnect() {
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch('/api/settings/zoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'connect' }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Connect failed')
      setZoomStatus(data.status)
    } catch (connectError) {
      const message = connectError instanceof Error ? connectError.message : 'Failed to configure Zoom'
      setError(message)
    } finally {
      setActionLoading(false)
    }
  }

  async function handleZoomDisconnect() {
    setDisconnectConfirm(false)
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch('/api/settings/zoom', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'disconnect' }),
      })
      if (!res.ok) throw new Error('Disconnect failed')
      const data = await res.json()
      setZoomStatus(data.status)
    } catch {
      setError('Failed to reverse configurations')
    } finally {
      setActionLoading(false)
    }
  }

  if (loading || !isLoaded) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="skeleton h-10 w-48" />
          <div className="skeleton mt-10 h-64 w-full rounded-3xl" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="animate-reveal max-w-4xl space-y-10">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-charcoal/60 hover:text-charcoal transition-colors mb-2 group"
        >
          <FiArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Back to Dashboard
        </Link>

        <div className="flex flex-col gap-2">
          <h1 className="text-charcoal leading-none mb-1">General Settings</h1>
          <p className="text-base text-charcoal/40 font-medium">Manage your platform integrations and organizer profile</p>
        </div>

        {error && (
          <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-500 border border-red-100">
            <FiAlertCircle size={18} />
            {error}
          </div>
        )}

        <div className="bento-card p-0! overflow-hidden border-none shadow-framer">
          {/* Section Header */}
          <div className="bg-charcoal/5 px-8 py-6 border-b border-black/5">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-500 shadow-sm">
                <FiVideo size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-charcoal" style={{ fontFamily: 'var(--font-sans)' }}>Zoom Core Integration</h2>
                <p className="text-sm text-charcoal/40 font-medium">Auto-sync meetings with your events</p>
              </div>
            </div>
          </div>

          {/* Section Body */}
          <div className="p-8 lg:p-10">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
              <div className="max-w-md space-y-4">
                <div className="flex items-center gap-3">
                   <span className="text-xs font-bold uppercase tracking-widest text-charcoal/30">Network Status:</span>
                   {zoomStatus === 'synced' ? (
                     <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-xs font-bold text-green-600 border border-green-100 shadow-xs">
                        <FiCheck size={14} /> Linked
                     </div>
                   ) : (
                     <div className="flex items-center gap-2 rounded-full bg-black/5 px-4 py-1.5 text-xs font-bold text-charcoal/40 border border-black/5">
                        Disconnected
                     </div>
                   )}
                </div>
                <p className="text-base leading-relaxed text-charcoal/50 font-medium">
                  When linked, Avento will automatically provision a unique Zoom
                  meeting for every &quot;Online&quot; event and sync the guest join details in real-time.
                </p>
              </div>

              <div className="flex justify-start lg:justify-end">
                {zoomStatus === 'synced' ? (
                  <>
                    <button
                      onClick={() => setDisconnectConfirm(true)}
                      disabled={actionLoading}
                      className="h-14 px-10 rounded-2xl border border-red-100 bg-red-50 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading ? 'Disconnecting...' : 'Disconnect'}
                    </button>
                    <ConfirmModal
                      isOpen={disconnectConfirm}
                      title="Disconnect Zoom"
                      message="Are you sure you want to disconnect Zoom? This will stop future automatic meeting creation."
                      isDanger={true}
                      confirmText="Disconnect"
                      onCancel={() => setDisconnectConfirm(false)}
                      onConfirm={handleZoomDisconnect}
                    />
                  </>
                ) : (
                  <button
                    onClick={handleZoomConnect}
                    disabled={actionLoading}
                    className="h-14 px-10 rounded-2xl bg-charcoal text-white font-bold shadow-lg hover:bg-blue-500 hover:shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading ? 'Connecting...' : 'Link Zoom Account'}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Global Settings Stub */}
        <div className="bento-card flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-none translate-y-0">
           <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-charcoal/5 text-charcoal/30">
                 <FiSettings size={28} />
              </div>
              <div>
                 <h3 className="text-xl font-bold text-charcoal" style={{ fontFamily: 'var(--font-sans)' }}>Organizer Profile</h3>
                 <p className="text-sm text-charcoal/40 font-medium">Identity and security managed via Clerk</p>
              </div>
           </div>
           <button className="h-12 px-6 rounded-xl glass border-black/5 text-charcoal/60 font-bold text-xs flex items-center gap-2 cursor-not-allowed">
              Managed by Provider
           </button>
        </div>
      </div>
    </DashboardLayout>
  )
}