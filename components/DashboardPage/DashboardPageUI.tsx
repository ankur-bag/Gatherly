'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { StatusBadge, ZoomSyncBadge } from '@/components/StatusBadges'
import { IEvent } from '@/types'
import { useAuth, useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { redirect, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiCalendar, FiEdit2, FiEye, FiPlus, FiUsers, FiArrowLeft } from 'react-icons/fi'
import { useToast } from '../ui/Toast'
import { IRegistration } from '@/types'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

interface IEventWithCount extends IEvent {
  registrationsCount?: number
  activeCount?: number
}

export function DashboardPageUI() {
  const router = useRouter()
  const { user } = useUser()
  const { isLoaded } = useAuth()
  const { showToast } = useToast()
  const [events, setEvents] = useState<IEventWithCount[]>([])
  const [loading, setLoading] = useState(true)
  const [processingId, setProcessingId] = useState<string | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    fetchEvents()
  }, [isLoaded])

  async function fetchEvents() {
    try {
      const res = await fetch('/api/events')
      const data = await res.json()
      setEvents(data.data || [])
    } catch (error) {
      console.error('Failed to fetch events:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLaunch = async (eventId: string) => {
    setProcessingId(eventId)
    try {
      const res = await fetch(`/api/events/${eventId}/publish`, { method: 'POST' })
      if (!res.ok) throw new Error('Failed to launch')
      await fetchEvents()
      showToast('Event launched successfully', 'success')
    } catch (err) {
      showToast('Failed to launch event', 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const handleDelete = async (eventId: string) => {
    setProcessingId(eventId)
    try {
      const res = await fetch(`/api/events/${eventId}`, { method: 'DELETE' })
      if (!res.ok) {
         const error = await res.json()
         throw new Error(error.error || 'Failed to delete')
      }
      await fetchEvents()
      showToast('Event deleted successfully', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setProcessingId(null)
    }
  }

  const copyPublicLink = (event: IEvent) => {
    const url = `${window.location.origin}/events/${event._id}`
    navigator.clipboard.writeText(url)
    showToast('Link copied to clipboard')
  }

  if (!isLoaded || loading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex flex-col gap-2">
            <div className="skeleton h-10 w-48" />
            <div className="skeleton h-4 w-64 opacity-50" />
          </div>
          <div className="grid gap-4">
             {[1, 2, 3].map((i) => (
                <div key={i} className="skeleton h-40 w-full rounded-[32px]" />
             ))}
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const launchedEvents = events.filter(e => e.status === 'published')
  const draftEvents = events.filter(e => e.status !== 'published')

  return (
    <DashboardLayout>
      <div className="animate-reveal space-y-10">
        {/* Back Button */}
        <button
          onClick={() => redirect('/')}
          className="inline-flex items-center gap-2 text-sm font-bold text-charcoal/60 hover:text-charcoal transition-colors mb-2 group cursor-pointer"
        >
          <FiArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Go Back
        </button>

        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-6 border-b border-charcoal/5">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl text-charcoal leading-tight mb-2 font-display tracking-tight">
              Welcome, {user?.firstName || 'Organizer'}
            </h1>
            <p className="text-xs sm:text-sm lg:text-base text-charcoal/40 font-medium max-w-sm">Here go your events</p>
          </div>
          <Link
            href="/dashboard/events/template-selector"
            className="h-11 px-6 rounded-xl bg-charcoal text-white text-xs font-bold inline-flex items-center gap-2 shadow-lg hover:bg-orange transition-all duration-500 hover:-translate-y-1 active:scale-95 translate-gpu group"
          >
            <FiPlus size={18} className="transition-transform group-hover:rotate-90" />
            Create New Event
          </Link>
        </div>

        {/* Content */}
        {events.length === 0 ? (
          <div className="bento-card flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-8 flex h-20 w-20 items-center justify-center rounded-[28px] bg-charcoal/5">
              <FiCalendar size={32} className="text-charcoal/20" />
            </div>
            <h2 className="text-3xl text-charcoal font-display mb-4">No events yet</h2>
            <p className="text-charcoal/40 font-medium max-w-[30ch] leading-relaxed">Start by creating your first RSVP flow to see data here.</p>
            <Link
              href="/dashboard/events/template-selector"
              className="mt-10 h-14 px-10 rounded-2xl bg-charcoal text-white font-bold flex items-center gap-2 hover:bg-orange transition-all duration-300"
            >
              Create First Event
            </Link>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Launched Section */}
            {launchedEvents.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-[1px] flex-1 bg-charcoal/5" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-charcoal/30 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    Launched Events
                  </h2>
                  <div className="h-[1px] flex-1 bg-charcoal/5" />
                </div>
                <div className="grid gap-8">
                  {launchedEvents.map((event, idx) => (
                    <EventCard 
                      key={event._id?.toString() || idx} 
                      event={event} 
                      onLaunch={handleLaunch} 
                      onDelete={(id) => setDeleteConfirmId(id)} 
                      onCopyStatus={() => copyPublicLink(event)}
                      processingId={processingId}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Drafts Section */}
            {draftEvents.length > 0 && (
              <section>
                <div className="flex items-center gap-4 mb-8">
                  <div className="h-[1px] flex-1 bg-charcoal/5" />
                  <h2 className="text-xs font-bold uppercase tracking-[0.4em] text-charcoal/30 flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-orange/40" />
                    Drafts & Archive
                  </h2>
                  <div className="h-[1px] flex-1 bg-charcoal/5" />
                </div>
                <div className="grid gap-8">
                  {draftEvents.map((event, idx) => (
                    <EventCard 
                      key={event._id?.toString() || idx} 
                      event={event} 
                      onLaunch={handleLaunch} 
                      onDelete={(id) => setDeleteConfirmId(id)} 
                      onCopyStatus={() => copyPublicLink(event)}
                      processingId={processingId}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
      
      <ConfirmModal
        isOpen={!!deleteConfirmId}
        title="Delete Event"
        message="Are you sure you want to delete this event? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isDanger={true}
        onConfirm={() => {
          if (deleteConfirmId) {
            handleDelete(deleteConfirmId)
            setDeleteConfirmId(null)
          }
        }}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </DashboardLayout>
  )
}

function EventCard({ 
  event, 
  onLaunch, 
  onDelete, 
  onCopyStatus, 
  processingId 
}: { 
  event: IEventWithCount, 
  onLaunch: (id: string) => void, 
  onDelete: (id: string) => void,
  onCopyStatus: () => void,
  processingId: string | null
}) {
  return (
    <div 
      className="bento-card !p-0 overflow-hidden group border-none cursor-pointer transition-transform hover:scale-[1.01] active:scale-[0.99]"
      onClick={(e) => {
        // Prevent navigation if clicking buttons
        if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('a')) {
          return
        }
        window.location.href = `/dashboard/events/${event._id}`
      }}
    >
      <div className="flex flex-col md:flex-row md:items-stretch">
         {/* Date Column */}
         <div className="w-full md:w-28 lg:w-32 bg-white/40 flex flex-col items-center justify-center p-4 lg:p-6 border-b md:border-b-0 md:border-r border-charcoal/5 group-hover:bg-beige/30 transition-colors duration-500">
            <span className="text-[10px] uppercase font-bold tracking-[0.2em] text-charcoal/30 mb-1">
               {new Date(event.dateTime).toLocaleDateString('en-US', { weekday: 'short' })}
            </span>
            <span className="text-3xl lg:text-4xl font-display text-charcoal leading-none tracking-tighter">
               {new Date(event.dateTime).getDate()}
            </span>
            <span className="text-[10px] font-bold text-orange mt-1 tracking-[0.1em] uppercase">
               {new Date(event.dateTime).toLocaleDateString('en-US', { month: 'short' })}
            </span>
         </div>

         {/* Main Content */}
         <div className="flex-1 p-4 lg:p-6 flex flex-col justify-between">
            <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
               <div className="min-w-0">
                  <h3 className="text-xl lg:text-2xl font-display text-charcoal group-hover:text-orange transition-colors truncate mb-1">
                     {event.title}
                  </h3>
                  <p className="text-xs lg:text-sm text-charcoal/40 leading-relaxed font-medium line-clamp-2 max-w-xl">{event.description}</p>
               </div>
               <div className="flex gap-2">
                   <StatusBadge status={event.status} />
                   {event.zoomSyncStatus && event.isOnline && <ZoomSyncBadge syncStatus={event.zoomSyncStatus} />}
               </div>
            </div>

            <div className="mt-10 flex flex-wrap items-center justify-between gap-8 border-t border-black/5 pt-8">
               <div className="flex items-center gap-8">
                  <div className="flex items-center gap-3 text-xs font-bold text-charcoal/60 uppercase tracking-widest">
                     <FiUsers size={16} className="text-orange" />
                     {event.registrationsCount || 0} / {event.capacity} Registered
                  </div>
                  <div className="flex items-center gap-3 text-xs font-bold text-charcoal/60 uppercase tracking-widest">
                     <FiCalendar size={16} className="text-orange" />
                     {new Date(event.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                  </div>
               </div>

                <div className="flex flex-wrap items-center gap-3">
                  {event.status === 'draft' && (
                     <button
                       onClick={() => onLaunch(event._id?.toString() || '')}
                       disabled={processingId === event._id?.toString()}
                       className="h-10 px-5 rounded-xl bg-orange text-white font-bold text-[11px] flex items-center gap-2 hover:bg-orange-hover transition-all duration-300 shadow-md hover:shadow-orange/20 disabled:opacity-50"
                     >
                       {processingId === event._id?.toString() ? 'Launching...' : 'Launch Event'}
                     </button>
                  )}
                  
                  {event.status === 'published' && (
                     <button
                       onClick={onCopyStatus}
                       className="h-10 px-4 rounded-xl cursor-pointer bg-beige text-charcoal font-bold text-[11px] flex items-center gap-2 hover:bg-charcoal hover:text-white transition-all shadow-sm"
                     >
                       Copy Link
                     </button>
                  )}

                  <Link
                     href={`/dashboard/events/${event._id}/attendees`}
                     className="h-10 px-5 rounded-xl bg-charcoal cursor-pointer text-white font-bold text-[11px] flex items-center gap-2 hover:bg-orange transition-all duration-300 shadow-md hover:shadow-orange/20"
                  >
                     Attendees
                  </Link>
                  
                  <Link
                     href={`/dashboard/events/${event._id}/edit`}
                     className="h-10 w-10 rounded-xl glass cursor-pointer border-charcoal/5 flex items-center justify-center text-charcoal hover:bg-beige transition-all shadow-sm"
                  >
                     <FiEdit2 size={18} />
                  </Link>
                  
                  <button
                     onClick={() => onDelete(event._id?.toString() || '')}
                     disabled={processingId === event._id?.toString()}
                     className="h-10 w-10 rounded-xl cursor-pointer glass border-red-100 flex items-center justify-center text-red-500 hover:bg-red-50 transition-all shadow-sm disabled:opacity-50"
                  >
                     <FiPlus size={18} className="rotate-45" />
                  </button>

                  <Link
                     href={`/events/${event._id}`}
                     target="_blank"
                     className="h-10 w-14 rounded-xl cursor-pointer glass border-charcoal/5 flex items-center justify-center text-charcoal hover:bg-orange hover:text-white transition-all shadow-sm"
                  >
                    <FiEye size={18} />
                  </Link>
               </div>
            </div>
         </div>
      </div>
    </div>
  )
}