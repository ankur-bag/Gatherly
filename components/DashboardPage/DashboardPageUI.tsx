'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { StatusBadge, ZoomSyncBadge } from '@/components/StatusBadges'
import { IEvent } from '@/types'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FiCalendar, FiEdit2, FiEye, FiPlus, FiUsers, FiArrowRight } from 'react-icons/fi'

export function DashboardPageUI() {
  const { isLoaded } = useAuth()
  const [events, setEvents] = useState<IEvent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!isLoaded) return

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

    fetchEvents()
  }, [isLoaded])

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

  return (
    <DashboardLayout>
      <div className="animate-reveal space-y-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div>
            <h1 className="text-charcoal leading-none mb-4 font-display">Your Events</h1>
            <p className="text-base text-charcoal/40 font-medium">Manage and organize your operational flows with precision.</p>
          </div>
          <Link
            href="/dashboard/events/new"
            className="h-14 px-10 rounded-2xl bg-charcoal text-white font-bold inline-flex items-center gap-2 shadow-lg hover:bg-orange transition-all duration-300 hover:-translate-y-1 active:scale-95 translate-gpu"
          >
            <FiPlus size={20} />
            Create Event
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
              href="/dashboard/events/new"
              className="mt-10 h-14 px-10 rounded-2xl bg-charcoal text-white font-bold flex items-center gap-2 hover:bg-orange transition-all duration-300"
            >
              Create First Event
            </Link>
          </div>
        ) : (
          <div className="grid gap-8">
            {events.map((event, idx) => (
              <div
                key={event._id?.toString() || idx}
                className="bento-card !p-0 overflow-hidden group border-none"
                style={{ animationDelay: `${idx * 100}ms` }}
              >
                <div className="flex flex-col md:flex-row md:items-stretch">
                   {/* Date Column */}
                   <div className="w-full md:w-48 bg-charcoal/5 flex flex-col items-center justify-center p-8 border-b md:border-b-0 md:border-r border-black/5">
                      <span className="text-[10px] uppercase font-bold tracking-[0.3em] text-charcoal/30 mb-2">
                         {new Date(event.dateTime).toLocaleDateString('en-US', { weekday: 'short' })}
                      </span>
                      <span className="text-5xl font-display text-charcoal leading-none">
                         {new Date(event.dateTime).getDate()}
                      </span>
                      <span className="text-sm font-bold text-orange mt-2 tracking-widest uppercase">
                         {new Date(event.dateTime).toLocaleDateString('en-US', { month: 'short' })}
                      </span>
                   </div>

                   {/* Main Content */}
                   <div className="flex-1 p-10 flex flex-col justify-between">
                      <div className="flex flex-wrap items-start justify-between gap-6 mb-4">
                         <div className="min-w-0">
                            <h3 className="text-3xl font-display text-charcoal group-hover:text-orange transition-colors truncate mb-3">
                               {event.title}
                            </h3>
                            <p className="text-base text-charcoal/40 leading-relaxed font-medium line-clamp-2 max-w-2xl">{event.description}</p>
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
                               {event.capacity} Capacity
                            </div>
                            <div className="flex items-center gap-3 text-xs font-bold text-charcoal/60 uppercase tracking-widest">
                               <FiCalendar size={16} className="text-orange" />
                               {new Date(event.dateTime).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                            </div>
                         </div>

                         <div className="flex items-center gap-3">
                            <Link
                              href={`/dashboard/events/${event._id}/attendees`}
                              className="h-12 px-8 rounded-xl bg-charcoal text-white font-bold text-xs flex items-center gap-2 hover:bg-orange transition-all duration-300"
                            >
                               Attendees
                            </Link>
                            <Link
                              href={`/dashboard/events/${event._id}`}
                              className="h-12 w-12 rounded-xl glass border-black/5 flex items-center justify-center text-charcoal hover:bg-black/5 transition-all shadow-sm"
                            >
                               <FiEdit2 size={18} />
                            </Link>
                            <Link
                              href={`/events/${event.slug || ''}`}
                              target="_blank"
                              className="h-12 w-12 rounded-xl glass border-black/5 flex items-center justify-center text-charcoal hover:bg-orange hover:text-white transition-all shadow-sm"
                            >
                               <FiEye size={18} />
                            </Link>
                         </div>
                      </div>
                   </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}