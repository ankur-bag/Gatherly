'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { ZoomConnectionStatus } from '@/types'
import { useAuth } from '@clerk/nextjs'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FiAlertCircle, FiCheck, FiRefreshCw, FiVideo, FiArrowLeft } from 'react-icons/fi'

export function DashboardSettingsPageUI() {
  const { isLoaded } = useAuth()
  const searchParams = useSearchParams()
  const [zoomConnected, setZoomConnected] = useState(false)
  const [zoomStatus, setZoomStatus] = useState<ZoomConnectionStatus>('disconnected')
  const [zoomEmail, setZoomEmail] = useState('')
  const [zoomDisplayName, setZoomDisplayName] = useState('')
  const [zoomTokenExpiry, setZoomTokenExpiry] = useState('')
  const [zoomError, setZoomError] = useState('')
  const [zoomLastError, setZoomLastError] = useState('')
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [error, setError] = useState('')
  const zoomSearchMessage = (() => {
    const zoomParam = searchParams.get('zoom')
    if (zoomParam === 'error' || zoomParam === 'failed') {
      return searchParams.get('message') || 'Zoom connection failed'
    }
    return ''
  })()

  useEffect(() => {
    if (!isLoaded) return

    let isActive = true

    void (async () => {
      try {
        const res = await fetch('/api/settings/zoom')
        const data = await res.json()
        if (!isActive) return
        setZoomConnected(Boolean(data.connected))
        setZoomStatus(data.status || 'disconnected')
        setZoomEmail(data.zoomEmail || '')
        setZoomDisplayName(data.zoomDisplayName || '')
        setZoomTokenExpiry(data.zoomTokenExpiry || '')
        setZoomError(data.zoomError || '')
        setZoomLastError(data.zoomLastError || '')
      } catch {
        if (!isActive) return
        setError('Failed to fetch settings')
      } finally {
        if (isActive) {
          setLoading(false)
        }
      }
    })()

    return () => {
      isActive = false
    }
  }, [isLoaded])

  function handleZoomConnect() {
    window.location.href = '/api/zoom/connect'
  }

  async function handleZoomDisconnect() {
    setActionLoading(true)
    setError('')
    try {
      const res = await fetch('/api/zoom/disconnect', { method: 'POST' })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Disconnect failed')
      setZoomConnected(Boolean(data.connected))
      setZoomStatus(data.status || 'disconnected')
      setZoomEmail(data.zoomEmail || '')
      setZoomDisplayName(data.zoomDisplayName || '')
      setZoomTokenExpiry(data.zoomTokenExpiry || '')
      setZoomError(data.zoomError || '')
      setZoomLastError(data.zoomLastError || '')
    } catch (disconnectError) {
      const message = disconnectError instanceof Error ? disconnectError.message : 'Failed to disconnect Zoom'
      setError(message)
    } finally {
      setActionLoading(false)
    }
  }

  const showReconnect = zoomConnected || zoomStatus === 'expired' || zoomStatus === 'revoked'
  const statusLabel = zoomStatus === 'refreshing'
      ? 'Refreshing'
      : zoomConnected
        ? 'Linked'
        : zoomStatus === 'expired' || zoomStatus === 'revoked'
        ? 'Reconnect needed'
        : 'Disconnected'

  const statusTone = zoomStatus === 'refreshing'
      ? 'yellow'
      : zoomConnected
        ? 'green'
        : zoomStatus === 'expired' || zoomStatus === 'revoked'
        ? 'red'
        : 'gray'

  const connectedAccountName = zoomDisplayName || 'Zoom Account'
  const tokenExpiryLabel = zoomTokenExpiry ? new Date(zoomTokenExpiry).toLocaleString() : ''

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
          <p className="text-base text-charcoal/40 font-medium">Manage your Zoom integration and event sync settings</p>
        </div>

        {(error || zoomSearchMessage) && (
          <div className="flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-500 border border-red-100">
            <FiAlertCircle size={18} />
            {error || zoomSearchMessage}
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
                   {statusTone === 'green' ? (
                     <div className="flex items-center gap-2 rounded-full bg-green-50 px-4 py-1.5 text-xs font-bold text-green-600 border border-green-100 shadow-xs">
                        <FiCheck size={14} /> {statusLabel}
                     </div>
                   ) : statusTone === 'yellow' ? (
                     <div className="flex items-center gap-2 rounded-full bg-yellow-50 px-4 py-1.5 text-xs font-bold text-yellow-700 border border-yellow-100 shadow-xs">
                        <FiRefreshCw size={14} className="animate-spin" /> {statusLabel}
                     </div>
                   ) : statusTone === 'red' ? (
                     <div className="flex items-center gap-2 rounded-full bg-red-50 px-4 py-1.5 text-xs font-bold text-red-600 border border-red-100 shadow-xs">
                        <FiAlertCircle size={14} /> {statusLabel}
                     </div>
                   ) : (
                     <div className="flex items-center gap-2 rounded-full bg-black/5 px-4 py-1.5 text-xs font-bold text-charcoal/40 border border-black/5">
                        {statusLabel}
                     </div>
                   )}
                </div>
                <p className="text-base leading-relaxed text-charcoal/50 font-medium">
                  Connect your Zoom account once and Avento will automatically provision meetings for online events,
                  refresh tokens when needed, and keep the meeting link in sync.
                </p>
                {!zoomConnected && (zoomStatus === 'expired' || zoomStatus === 'revoked') && (
                  <p className="text-sm font-medium text-red-600">
                    Zoom connection expired or was revoked. Please reconnect.
                  </p>
                )}
                {zoomLastError && !zoomConnected && (
                  <p className="text-sm font-medium text-charcoal/50">
                    Zoom failed: {zoomError || zoomLastError}
                  </p>
                )}
                {!zoomConnected && zoomStatus === 'disconnected' && (
                  <p className="text-sm font-medium text-charcoal/50">
                    Zoom is not connected yet. Use the button to connect your account.
                  </p>
                )}
              </div>

              <div className="flex flex-col items-start lg:items-end gap-4">
                {zoomDisplayName || zoomEmail ? (
                  <div className="rounded-2xl border border-black/5 bg-black/5 p-4 text-left lg:text-right">
                    <p className="text-xs font-bold uppercase tracking-widest text-charcoal/30">Connected Zoom Account</p>
                    <p className="mt-1 text-lg font-bold text-charcoal">{connectedAccountName}</p>
                    {zoomEmail && <p className="text-sm text-charcoal/50">{zoomEmail}</p>}
                    {tokenExpiryLabel && zoomConnected && (
                      <p className="mt-2 text-xs font-medium text-charcoal/40">Token refreshes automatically. Expires around {tokenExpiryLabel}</p>
                    )}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-3 justify-start lg:justify-end">
                  {showReconnect ? (
                    <button
                      onClick={handleZoomConnect}
                      disabled={actionLoading}
                      className="h-14 px-10 rounded-2xl bg-amber-500 text-white font-bold shadow-lg hover:bg-amber-600 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Reconnect Zoom
                    </button>
                  ) : (
                    <button
                      onClick={handleZoomConnect}
                      disabled={actionLoading}
                      className="h-14 px-10 rounded-2xl bg-charcoal text-white font-bold shadow-lg hover:bg-blue-500 hover:shadow-blue-500/20 transition-all disabled:opacity-50 cursor-pointer"
                    >
                      Connect Zoom
                    </button>
                  )}

                  {zoomConnected && (
                    <button
                      onClick={handleZoomDisconnect}
                      disabled={actionLoading}
                      className="h-14 px-10 rounded-2xl border border-red-100 bg-red-50 text-red-500 font-bold hover:bg-red-500 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {actionLoading ? 'Disconnecting...' : 'Disconnect Zoom'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  )
}