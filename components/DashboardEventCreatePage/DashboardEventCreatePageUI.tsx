'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { EVENT_TEMPLATES } from '@/lib/utils'
import { RegistrationMode } from '@/types'
import { useRouter, useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { FiSave, FiMapPin, FiArrowLeft, FiInfo } from 'react-icons/fi'
import Link from 'next/link'

interface EventFormState {
  title: string
  description: string
  dateTime: string
  venue: string
  isOnline: boolean
  capacity: number
  registrationMode: RegistrationMode
}

const INITIAL_FORM_STATE: EventFormState = {
  title: '',
  description: '',
  dateTime: '',
  venue: '',
  isOnline: false,
  capacity: 50,
  registrationMode: 'open',
}

export function DashboardEventCreatePageUI() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const templateId = searchParams?.get('template')

  // Initialize form state with template prefill if provided
  const getInitialForm = (): EventFormState => {
    if (templateId) {
      const template = EVENT_TEMPLATES.find((t) => t.id === templateId)
      if (template?.prefill) {
        return {
          title: template.prefill.title || '',
          description: template.prefill.description || '',
          dateTime: '',
          venue: '',
          isOnline: template.prefill.isOnline,
          capacity: template.prefill.capacity,
          registrationMode: template.prefill.registrationMode,
        }
      }
    }
    return INITIAL_FORM_STATE
  }

  const [form, setForm] = useState<EventFormState>(getInitialForm)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const updateForm = <K extends keyof EventFormState>(
    field: K,
    value: EventFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
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
        templateUsed: templateId || undefined,
        status: 'draft',
      }

      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      const json = await res.json()

      if (!res.ok) {
        setError(json.error || 'Failed to create event')
        return
      }

      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="animate-reveal max-w-3xl">
        {/* Back Button */}
        <Link
          href={templateId ? '/dashboard/events/template-selector' : '/dashboard'}
          className="inline-flex items-center gap-2 text-sm font-bold text-charcoal/60 hover:text-charcoal transition-colors mb-8 group"
        >
          <FiArrowLeft size={18} className="transition-transform group-hover:-translate-x-1" />
          Back
        </Link>

        {/* Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-display text-charcoal mb-2">Create New Event</h1>
          <p className="text-lg text-charcoal/60 font-medium">
            {templateId ? 'Customize your event details below' : 'Fill in the details to get started'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Error Alert */}
          {error && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-3">
              <FiInfo size={18} className="flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Core Details */}
          <div className="space-y-5 pb-8 border-b border-charcoal/5">
            {/* Event Name */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2.5 ml-0.5">
                Event Name
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => updateForm('title', e.target.value)}
                required
                placeholder="e.g., React Masterclass 2026"
                className="w-full h-11 rounded-lg bg-white border border-charcoal/8 px-4 font-semibold text-charcoal placeholder-charcoal/30 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-transparent transition-all"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2.5 ml-0.5">
                Description
              </label>
              <textarea
                value={form.description}
                onChange={(e) => updateForm('description', e.target.value)}
                required
                placeholder="What is your event about? Give attendees the context..."
                rows={3}
                className="w-full rounded-lg bg-white border border-charcoal/8 px-4 py-3 font-medium text-charcoal placeholder-charcoal/30 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-transparent transition-all resize-none"
              />
            </div>
          </div>

          {/* Section 2: Date & Type */}
          <div className="space-y-5 pb-8 border-b border-charcoal/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Date & Time */}
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

              {/* Event Type Toggle */}
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
                        ? 'bg-charcoal text-white shadow-sm'
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
                        ? 'bg-charcoal text-white shadow-sm'
                        : 'bg-white border border-charcoal/8 text-charcoal hover:bg-charcoal/2'
                    }`}
                  >
                    Online
                  </button>
                </div>
              </div>
            </div>

            {/* Venue / Location */}
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
                placeholder={form.isOnline ? 'e.g., https://zoom.us/j/...' : 'e.g., 123 Main St, San Francisco'}
                className="w-full h-11 rounded-lg bg-white border border-charcoal/8 px-4 font-semibold text-charcoal placeholder-charcoal/30 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-transparent transition-all"
              />
            </div>
          </div>

          {/* Section 3: Capacity & Registration */}
          <div className="space-y-5 pb-8 border-b border-charcoal/5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Capacity */}
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

              {/* Registration Mode */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2.5 ml-0.5">
                  Registration Flow
                </label>
                <select
                  name="registrationMode"
                  value={form.registrationMode}
                  onChange={(e) => updateForm('registrationMode', e.target.value as RegistrationMode)}
                  className="w-full h-11 rounded-lg bg-white border border-charcoal/8 px-4 font-semibold text-charcoal focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-transparent transition-all cursor-pointer"
                >
                  <option value="open">Auto-confirm</option>
                  <option value="shortlisted">Manual review</option>
                </select>
              </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg bg-beige/30 border border-beige/50">
              <p className="text-sm font-medium text-charcoal/70">
                <span className="font-bold">Auto-confirm:</span> Attendees are instantly registered.
                <br />
                <span className="font-bold">Manual review:</span> You approve each registration.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 h-12 bg-charcoal text-white rounded-lg font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-charcoal/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                'Creating...'
              ) : (
                <>
                  <FiSave size={18} />
                  Create Event
                </>
              )}
            </button>
            <Link
              href="/dashboard"
              className="h-12 px-6 border border-charcoal/10 rounded-lg flex items-center justify-center text-charcoal font-bold hover:bg-charcoal/2 transition-all"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
