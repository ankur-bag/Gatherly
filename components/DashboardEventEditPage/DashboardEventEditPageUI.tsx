'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { RegistrationMode } from '@/types'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiSave, FiMapPin, FiArrowLeft, FiInfo, FiTrash2 } from 'react-icons/fi'
import Link from 'next/link'
import { useAuth } from '@clerk/nextjs'

interface EventFormState {
  title: string
  description: string
  dateTime: string
  venue: string
  isOnline: boolean
  capacity: number
  registrationMode: RegistrationMode
  status: string
}

export function DashboardEventEditPageUI({ eventId }: { eventId: string }) {
  const router = useRouter()
  const { isLoaded } = useAuth()
  
  const [form, setForm] = useState<EventFormState | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isLoaded) return

    async function fetchEvent() {
      try {
        const res = await fetch(`/api/events/${eventId}`)
        const data = await res.json()
        if (data.data) {
          const event = data.data
          // Format date for datetime-local input
          const dt = new Date(event.dateTime)
          const formattedDate = dt.toISOString().slice(0, 16)
          
          setForm({
            title: event.title,
            description: event.description,
            dateTime: formattedDate,
            venue: event.venue || '',
            isOnline: event.isOnline,
            capacity: event.capacity,
            registrationMode: event.registrationMode,
            status: event.status,
          })
        } else {
          setError('Event not found')
        }
      } catch (err) {
        setError('Failed to load event')
      } finally {
        setLoading(false)
      }
    }

    fetchEvent()
  }, [eventId, isLoaded])

  const updateForm = <K extends keyof EventFormState>(
    field: K,
    value: EventFormState[K]
  ) => {
    setForm((prev) => prev ? ({ ...prev, [field]: value }) : null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form) return
    
    setSaving(true)
    setError('')

    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        dateTime: form.dateTime,
        venue: form.isOnline ? undefined : form.venue.trim(),
        isOnline: form.isOnline,
        capacity: Number(form.capacity),
        registrationMode: form.registrationMode,
      }

      const res = await fetch(`/api/events/${eventId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Failed to update event')
        return
      }

      router.push(`/dashboard/events/${eventId}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
     return (
       <DashboardLayout>
         <div className="space-y-8 animate-pulse">
            <div className="skeleton h-6 w-24" />
            <div className="skeleton h-12 w-1/2 mt-8" />
            <div className="skeleton h-64 w-full mt-12 rounded-3xl" />
         </div>
       </DashboardLayout>
     )
  }

  if (error || !form) {
    return (
      <DashboardLayout>
        <div className="rounded-3xl border border-red-100 bg-red-50 p-8 text-red-600">
          <h3 className="font-bold flex items-center gap-2">
            <FiInfo /> {error || 'Event not found'}
          </h3>
          <Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 font-bold hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="animate-reveal max-w-3xl">
        {/* Back Button */}
        <Link
          href={`/dashboard/events/${eventId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-charcoal/60 hover:text-charcoal transition-colors mb-8 group"
        >
          <FiArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Back to details
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-display text-charcoal mb-2">Edit Event</h1>
          <p className="text-lg text-charcoal/60 font-medium">Update your operational flow details</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Core Details */}
          <div className="space-y-5 pb-8 border-b border-charcoal/5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2.5 ml-0.5">
                Event Name
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                required
                className="w-full h-11 rounded-lg bg-white border border-charcoal/8 px-4 font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2.5 ml-0.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                required
                rows={4}
                className="w-full rounded-lg bg-white border border-charcoal/8 px-4 py-3 font-medium text-charcoal focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Section 2: Date & Type */}
          <div className="space-y-5 pb-8 border-b border-charcoal/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2.5 ml-0.5">
                  Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={form.dateTime}
                  onChange={(e) => updateForm('dateTime', e.target.value)}
                  required
                  className="w-full h-11 rounded-lg bg-white border border-charcoal/8 px-4 font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2.5 ml-0.5">
                  Event Type
                </label>
                <div className="flex gap-2 h-11">
                  <button
                    type="button"
                    onClick={() => updateForm('isOnline', false)}
                    className={`flex-1 rounded-lg font-bold text-sm transition-all ${
                      !form.isOnline
                        ? 'bg-charcoal text-white'
                        : 'bg-white border border-charcoal/8 text-charcoal hover:bg-charcoal/2'
                    }`}
                  >
                    In-Person
                  </button>
                  <button
                    type="button"
                    onClick={() => updateForm('isOnline', true)}
                    className={`flex-1 rounded-lg font-bold text-sm transition-all ${
                      form.isOnline
                        ? 'bg-charcoal text-white'
                        : 'bg-white border border-charcoal/8 text-charcoal hover:bg-charcoal/2'
                    }`}
                  >
                    Online
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2.5 ml-0.5 flex items-center gap-2">
                <FiMapPin size={12} />
                {form.isOnline ? 'Meeting Link' : 'Venue'}
              </label>
              <input
                type="text"
                value={form.venue}
                onChange={(e) => updateForm('venue', e.target.value)}
                required={!form.isOnline}
                className="w-full h-11 rounded-lg bg-white border border-charcoal/8 px-4 font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-5 pb-8 border-b border-charcoal/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2.5 ml-0.5">
                  Total Capacity
                </label>
                <input
                  type="number"
                  value={form.capacity}
                  onChange={(e) => updateForm('capacity', Number(e.target.value))}
                  required
                  min="1"
                  className="w-full h-11 rounded-lg bg-white border border-charcoal/8 px-4 font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2.5 ml-0.5">
                  Registration Flow
                </label>
                <select
                  value={form.registrationMode}
                  onChange={(e) => updateForm('registrationMode', e.target.value as RegistrationMode)}
                  className="w-full h-11 rounded-lg bg-white border border-charcoal/8 px-4 font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="open">Auto-confirm</option>
                  <option value="shortlisted">Manual review</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              type="submit"
              disabled={saving}
              className="flex-1 h-14 bg-charcoal text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-orange transition-all disabled:opacity-50"
            >
              {saving ? 'Saving changes...' : (
                <>
                  <FiSave size={18} />
                  Save Changes
                </>
              )}
            </button>
            <Link
              href={`/dashboard/events/${eventId}`}
              className="h-14 px-8 rounded-2xl flex items-center justify-center text-charcoal/40 font-bold hover:text-charcoal transition-all"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
