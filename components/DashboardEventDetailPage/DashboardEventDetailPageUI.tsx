'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { StatusBadge, ZoomSyncBadge } from '@/components/StatusBadges'
import { IEvent } from '@/types'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ConfirmModal } from '@/components/ui/ConfirmModal'
import { useEffect, useState } from 'react'
import { FiArrowLeft, FiCalendar, FiClock, FiLink, FiMapPin, FiUsers, FiGlobe, FiRefreshCw } from 'react-icons/fi'

interface IEventExtended extends IEvent {
  registrationsCount?: number
}

export function DashboardEventDetailPageUI({ eventId }: { eventId: string }) {
  const router = useRouter()
  const { isLoaded } = useAuth()
  const [event, setEvent] = useState<IEventExtended | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionConfirm, setActionConfirm] = useState<'publish' | 'cancel' | null>(null)
  const [actionLoading, setActionLoading] = useState(false)
  const [retryLoading, setRetryLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoaded) return

    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${eventId}`)
        const data = await res.json()
        if (data.data) {
          setEvent(data.data)
        } else {
          setError(data.error || 'Event not found')
        }
      } catch (err) {
        setError('Failed to fetch event')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId, isLoaded])

  async function handleAction(action: 'publish' | 'cancel') {
    setActionLoading(true)
    setError('')

    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      })

      if (!res.ok) throw new Error('Action failed')

      const { data } = await res.json()
      setEvent(data)
    } catch (err) {
      setError('Failed to update event status')
    } finally {
      setActionLoading(false)
    }
  }

  async function handleZoomRetry() {
    setRetryLoading(true)
    setError('')
    try {
      const res = await fetch(`/api/events/${eventId}/zoom/retry`, { method: 'POST' })
      if (!res.ok) throw new Error('Retry failed')
      const { data } = await res.json()
      setEvent(data)
    } catch {
      setError('Failed to retry Zoom sync')
    } finally {
      setRetryLoading(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="skeleton h-6 w-32" />
          <div className="skeleton h-16 w-full lg:w-1/2 mt-8 rounded-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
             {[1, 2, 3, 4].map(i => <div key={i} className="skeleton h-24 rounded-2xl" />)}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error || !event) {
    return (
      <DashboardLayout>
        <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-red-600">
          <h3 className="font-bold flex items-center gap-2">
            <FiArrowLeft /> {error || 'Event not found'}
          </h3>
          <Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 font-bold hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const isPublic = event.status === 'published'

  return (
    <DashboardLayout>
      <div className="animate-reveal space-y-10">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm font-bold text-charcoal/40 transition-colors hover:text-charcoal group"
        >
          <FiArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to list
        </Link>

        {/* Header Section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="mb-6 flex flex-wrap items-center gap-2">
              <StatusBadge status={event.status} />
              {event.isOnline && event.zoomSyncStatus && <ZoomSyncBadge syncStatus={event.zoomSyncStatus} />}
            </div>
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-medium text-charcoal leading-tight mb-3 lg:mb-4">
              {event.title}
            </h1>
            <p className="text-xs lg:text-sm text-charcoal/50 leading-relaxed font-medium">{event.description}</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
             {event.status === 'draft' ? (
                <button
                  onClick={() => setActionConfirm('publish')}
                  disabled={actionLoading}
                  className="h-10 lg:h-11 px-5 lg:px-6 rounded-xl bg-orange text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-orange/20 hover:-translate-y-1 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Publish Event
                </button>
             ) : (
                <button
                  onClick={() => setActionConfirm('cancel')}
                  disabled={actionLoading}
                  className="h-10 lg:h-11 px-5 lg:px-6 rounded-xl glass border-red-100 text-red-500 text-xs font-bold flex items-center gap-2 hover:bg-red-50 transition-all disabled:opacity-50 cursor-pointer"
                >
                  Cancel Event
                </button>
             )}
             
             {isPublic && (
                <Link
                  href={`/events/${event._id}`}
                  target="_blank"
                  className="h-10 lg:h-11 px-5 lg:px-6 rounded-xl glass border-black/5 text-charcoal text-xs font-bold flex items-center gap-2 hover:bg-black/5 transition-all shadow-sm"
                >
                  <FiGlobe size={20} />
                  View Public
                </Link>
             )}

             {/* Zoom Retry button — shown when sync has failed */}
             {isPublic && event.isOnline && event.zoomSyncStatus === 'failed' && (
               <button
                 onClick={handleZoomRetry}
                 disabled={retryLoading}
                 className="h-10 lg:h-11 px-5 lg:px-6 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold flex items-center gap-2 hover:bg-blue-500 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
               >
                 <FiRefreshCw size={14} className={retryLoading ? 'animate-spin' : ''} />
                 {retryLoading ? 'Retrying...' : 'Retry Zoom Sync'}
               </button>
             )}
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
           <div className="bento-card">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-charcoal/30 mb-3">
                 <FiCalendar size={14} className="text-orange" /> Date
              </p>
              <p className="text-lg font-bold text-charcoal">
                 {new Date(event.dateTime).toLocaleDateString('en-US', {
                   weekday: 'short',
                   month: 'short',
                   day: 'numeric',
                 })}
              </p>
           </div>
           <div className="bento-card">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-charcoal/30 mb-3">
                 <FiClock size={14} className="text-orange" /> Time
              </p>
              <p className="text-lg font-bold text-charcoal">
                 {new Date(event.dateTime).toLocaleTimeString('en-US', {
                   hour: 'numeric',
                   minute: '2-digit',
                 })}
              </p>
           </div>
           <div className="bento-card">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-charcoal/30 mb-3">
                 <FiUsers size={14} className="text-orange" /> Registered
              </p>
              <p className="text-lg font-bold text-charcoal">
                 <span className="text-orange">{event.registrationsCount || 0}</span>
                 <span className="text-charcoal/20 mx-1">/</span>
                 {event.capacity}
              </p>
           </div>
           <div className="bento-card">
              <p className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-charcoal/30 mb-3">
                 {event.isOnline ? <FiLink size={14} className="text-orange" /> : <FiMapPin size={14} className="text-orange" />} 
                 {event.isOnline ? 'Platform' : 'Location'}
              </p>
              <p className="text-lg font-bold text-charcoal truncate">
                 {event.isOnline ? 'Online' : (event.venue || 'TBA')}
              </p>
           </div>
        </div>

        {/* Quick Actions / Navigation */}
        {isPublic && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <Link 
                href={`/dashboard/events/${event._id?.toString()}/attendees`}
                className="bento-card group flex flex-col justify-between hover:bg-orange/5"
             >
                <div className="mb-10 h-14 w-14 rounded-2xl bg-orange/10 text-orange flex items-center justify-center transition-all group-hover:scale-110">
                   <FiUsers size={28} />
                </div>
                <div>
                   <h3 className="text-2xl font-medium mb-2 group-hover:text-orange transition-colors">Manage Guests</h3>
                   <p className="text-charcoal/40 font-medium">Review registration flows and update guest statuses.</p>
                </div>
             </Link>

             {event.isOnline && event.zoomJoinUrl && (
                <a 
                   href={event.zoomJoinUrl}
                   target="_blank"
                   rel="noreferrer"
                   className="bento-card group flex flex-col justify-between hover:bg-blue-50"
                >
                   <div className="mb-10 h-14 w-14 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center transition-all group-hover:scale-110">
                      <FiLink size={28} />
                   </div>
                   <div>
                      <h3 className="text-2xl font-medium mb-2 group-hover:text-blue-500 transition-colors">Start Meeting</h3>
                      <p className="text-charcoal/40 font-medium">Connect to your synced Zoom session and begin hosting.</p>
                   </div>
                </a>
             )}
          </div>
        )}
      </div>

      <ConfirmModal
        isOpen={!!actionConfirm}
        title={actionConfirm === 'publish' ? 'Publish Event' : 'Cancel Event'}
        message={actionConfirm === 'publish' 
          ? 'Are you sure you want to publish this event? It will be visible to the public.' 
          : 'Are you sure you want to cancel this event? Attendees will be notified.'}
        confirmText={actionConfirm === 'publish' ? 'Publish' : 'Cancel Event'}
        isDanger={actionConfirm === 'cancel'}
        onCancel={() => setActionConfirm(null)}
        onConfirm={() => {
          if (actionConfirm) {
            handleAction(actionConfirm)
            setActionConfirm(null)
          }
        }}
      />
    </DashboardLayout>
  )
}