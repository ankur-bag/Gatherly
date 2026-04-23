'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { StatusBadge, ZoomSyncBadge } from '@/components/StatusBadges'
import { IEvent } from '@/types'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiArrowLeft, FiCopy, FiExternalLink } from 'react-icons/fi'

export function DashboardEventDetailPageUI() {
  const params = useParams()
  const eventId = params.id as string
  const [event, setEvent] = useState<IEvent | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [isCancelling, setIsCancelling] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dateTime: '',
    venue: '',
    capacity: '',
  })

  useEffect(() => {
    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${eventId}`)
        if (!res.ok) throw new Error('Failed to fetch event')
        const { data } = await res.json()
        setEvent(data)
        setFormData({
          title: data.title,
          description: data.description,
          dateTime: new Date(data.dateTime).toISOString().slice(0, 16),
          venue: data.venue || '',
          capacity: data.capacity.toString(),
        })
      } catch (err: any) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId])

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault()
    setIsEditing(true)
    try {
      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
          dateTime: new Date(formData.dateTime).toISOString(),
        }),
      })
      if (!res.ok) throw new Error('Failed to update event')
      const { data } = await res.json()
      setEvent(data)
      alert('Event updated successfully!')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsEditing(false)
    }
  }

  async function handlePublish() {
    setIsPublishing(true)
    try {
      const res = await fetch(`/api/events/${eventId}/publish`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to publish event')
      const { data } = await res.json()
      setEvent(data)
      alert('Event published successfully!')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsPublishing(false)
    }
  }

  async function handleCancel() {
    if (!confirm('Are you sure you want to cancel this event?')) return
    setIsCancelling(true)
    try {
      const res = await fetch(`/api/events/${eventId}/cancel`, {
        method: 'POST',
      })
      if (!res.ok) throw new Error('Failed to cancel event')
      const { data } = await res.json()
      setEvent(data)
      alert('Event cancelled. All attendees will be notified.')
    } catch (err: any) {
      alert(err.message)
    } finally {
      setIsCancelling(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="animate-fadeIn space-y-4">
          <div className="h-12 w-1/2 animate-pulse rounded-lg bg-neutral-200" />
          <div className="h-64 animate-pulse rounded-lg bg-neutral-200" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !event) {
    return (
      <DashboardLayout>
        <div className="py-16 text-center">
          <h2 className="text-2xl font-semibold text-red-700">{error || 'Event not found'}</h2>
          <Link href="/dashboard" className="mt-4 inline-block font-medium text-primary">
            Back to Events
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  const publicUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/e/${event.slug}`

  return (
    <DashboardLayout>
      <div className="max-w-4xl animate-slideInUp space-y-8">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary-dark"
        >
          <FiArrowLeft size={20} />
          Back to Events
        </Link>

        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-foreground">{event.title}</h1>
            <div className="mt-3 flex items-center gap-3">
              <StatusBadge status={event.status} />
              {event.zoomSyncStatus && event.isOnline && <ZoomSyncBadge syncStatus={event.zoomSyncStatus} />}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {event.status === 'draft' && (
              <button
                onClick={handlePublish}
                disabled={isPublishing}
                className="rounded-lg bg-primary px-4 py-2 font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
              >
                {isPublishing ? 'Publishing...' : 'Publish'}
              </button>
            )}
            {event.status === 'published' && (
              <button
                onClick={handleCancel}
                disabled={isCancelling}
                className="rounded-lg bg-red-600 px-4 py-2 font-medium text-white transition-colors hover:bg-red-700 disabled:opacity-50"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel Event'}
              </button>
            )}
          </div>
        </div>

        {event.status === 'published' && (
          <div className="flex items-center justify-between rounded-lg border border-neutral-200 bg-neutral-50 p-4">
            <div>
              <p className="text-sm text-neutral-600">Public event link:</p>
              <p className="mt-1 font-mono text-sm text-neutral-800">{publicUrl}</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText(publicUrl)
                alert('Link copied!')
              }}
              className="rounded-lg p-2 transition-colors hover:bg-neutral-200"
            >
              <FiCopy size={20} />
            </button>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-6 rounded-lg border border-neutral-200 bg-white p-8">
          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={event.status !== 'draft'}
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-neutral-100"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-foreground">Description</label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={event.status !== 'draft'}
              className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-neutral-100"
            />
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Date & Time</label>
              <input
                type="datetime-local"
                value={formData.dateTime}
                onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                disabled={event.status !== 'draft'}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-neutral-100"
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Capacity</label>
              <input
                type="number"
                value={formData.capacity}
                onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                disabled={event.status !== 'draft'}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-neutral-100"
              />
            </div>
          </div>

          {!event.isOnline && (
            <div>
              <label className="mb-2 block text-sm font-medium text-foreground">Venue</label>
              <input
                type="text"
                value={formData.venue}
                onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
                disabled={event.status !== 'draft'}
                className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-neutral-100"
              />
            </div>
          )}

          {event.status === 'draft' && (
            <div className="flex gap-4 border-t border-neutral-200 pt-4">
              <button
                type="submit"
                disabled={isEditing}
                className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
              >
                {isEditing ? 'Saving...' : 'Save Changes'}
              </button>
              <Link href="/dashboard" className="rounded-lg px-6 py-3 text-neutral-600 transition-colors hover:bg-neutral-100">
                Discard
              </Link>
            </div>
          )}
        </form>

        {event.status === 'published' && (
          <Link
            href={`/dashboard/events/${eventId}/attendees`}
            className="inline-flex items-center gap-2 rounded-lg bg-neutral-100 px-6 py-3 font-medium text-foreground transition-colors hover:bg-neutral-200"
          >
            <FiExternalLink size={20} />
            Manage Attendees
          </Link>
        )}
      </div>
    </DashboardLayout>
  )
}