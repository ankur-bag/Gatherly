'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { StatusBadge, ZoomSyncBadge } from '@/components/StatusBadges'
import { IEvent } from '@/types'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FiEdit, FiEye, FiPlus } from 'react-icons/fi'

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
        <div className="animate-fadeIn">
          <div className="h-40 animate-pulse rounded-lg bg-neutral-200" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="animate-slideInUp space-y-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">Your Events</h1>
            <p className="mt-2 text-neutral-600">Manage and organize your events</p>
          </div>
          <Link
            href="/dashboard/events/new"
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark"
          >
            <FiPlus size={20} />
            Create Event
          </Link>
        </div>

        {events.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 py-16 text-center">
            <h3 className="text-lg font-semibold text-neutral-900">No events yet</h3>
            <p className="mb-6 mt-2 text-neutral-600">Create your first event to get started</p>
            <Link
              href="/dashboard/events/new"
              className="inline-block rounded-lg bg-primary px-6 py-2 font-medium text-white transition-colors hover:bg-primary-dark"
            >
              Create Event
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {events.map((event, idx) => (
              <div
                key={event._id}
                className="animate-slideInUp rounded-lg border border-neutral-200 bg-white p-6 transition-shadow hover:shadow-md"
                style={{ animationDelay: `${idx * 50}ms` }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-foreground">{event.title}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-neutral-600">{event.description}</p>
                    <div className="mt-4 flex flex-wrap items-center gap-3">
                      <StatusBadge status={event.status} />
                      {event.zoomSyncStatus && event.isOnline && <ZoomSyncBadge syncStatus={event.zoomSyncStatus} />}
                      <span className="text-xs text-neutral-500">
                        {new Date(event.dateTime).toLocaleDateString()} at {new Date(event.dateTime).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/dashboard/events/${event._id}`}
                      className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
                      title="Edit"
                    >
                      <FiEdit size={20} />
                    </Link>
                    {event.status === 'published' && (
                      <Link
                        href={`/dashboard/events/${event._id}/attendees`}
                        className="rounded-lg p-2 text-neutral-600 transition-colors hover:bg-neutral-100"
                        title="View Attendees"
                      >
                        <FiEye size={20} />
                      </Link>
                    )}
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