'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { EVENT_TEMPLATES } from '@/lib/utils'
import { RegistrationMode } from '@/types'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiSave, FiMapPin, FiArrowLeft, FiInfo, FiCpu, FiCheck, FiX, FiRefreshCw } from 'react-icons/fi'
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
  const [improvingDescription, setImprovingDescription] = useState(false)
  const [improveError, setImproveError] = useState('')
  const [pendingOriginalDescription, setPendingOriginalDescription] = useState<string | null>(null)
  const [zoomSettingsLoaded, setZoomSettingsLoaded] = useState(false)
  const [zoomConnected, setZoomConnected] = useState(false)

  const updateForm = <K extends keyof EventFormState>(
    field: K,
    value: EventFormState[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    let isActive = true

    async function loadZoomSettings() {
      try {
        const res = await fetch('/api/settings/zoom')
        const data = await res.json()
        if (!isActive) return
        setZoomConnected(Boolean(data.connected))
      } catch {
        if (!isActive) return
        setZoomConnected(false)
      } finally {
        if (isActive) {
          setZoomSettingsLoaded(true)
        }
      }
    }

    loadZoomSettings()

    return () => {
      isActive = false
    }
  }, [])

  const handleImproveDescription = async () => {
    const currentDescription = form.description.trim()
    if (!currentDescription || improvingDescription) {
      return
    }

    setImprovingDescription(true)
    setImproveError('')

    try {
      const res = await fetch('/api/ai/improve-description', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: currentDescription }),
      })

      const json = await res.json()
      if (!res.ok) {
        setImproveError(json.error || 'Failed to improve description')
        return
      }

      const revisedDescription = json?.data?.revisedDescription
      if (!revisedDescription || typeof revisedDescription !== 'string') {
        setImproveError('AI could not revise this description')
        return
      }

      setPendingOriginalDescription(form.description)
      updateForm('description', revisedDescription)
    } catch (err) {
      setImproveError(err instanceof Error ? err.message : 'Failed to improve description')
    } finally {
      setImprovingDescription(false)
    }
  }

  const handleAcceptImprovedDescription = () => {
    setPendingOriginalDescription(null)
  }

  const handleRejectImprovedDescription = () => {
    if (pendingOriginalDescription !== null) {
      updateForm('description', pendingOriginalDescription)
    }
    setPendingOriginalDescription(null)
  }

  const handleSubmit = async (statusOrEvent: 'draft' | 'published' | React.FormEvent = 'draft') => {
    if (typeof statusOrEvent !== 'string') {
      statusOrEvent.preventDefault()
    }
    const status = typeof statusOrEvent === 'string' ? statusOrEvent : 'draft'

    setLoading(true)
    setError('')

    if (status === 'published' && form.isOnline && (!zoomSettingsLoaded || !zoomConnected)) {
      setError('Please connect Zoom from Settings before launching an online event.')
      setLoading(false)
      return
    }

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
        status: status,
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

  const submitIfValid = (status: 'draft' | 'published') => {
    const formElement = document.querySelector('form')
    if (formElement?.checkValidity()) {
      void handleSubmit(status)
    } else {
      formElement?.reportValidity()
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
              <FiInfo size={18} className="shrink-0" />
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
              <div className="relative">
                <textarea
                  value={form.description}
                  onChange={(e) => updateForm('description', e.target.value)}
                  required
                  placeholder="What is your event about? Give attendees the context..."
                  rows={3}
                  className="w-full rounded-lg bg-white border border-charcoal/8 px-4 py-3 pr-12 font-medium text-charcoal placeholder-charcoal/30 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-transparent transition-all resize-none"
                />
                <button
                  type="button"
                  onClick={handleImproveDescription}
                  disabled={!form.description.trim() || improvingDescription}
                  className="absolute bottom-2 right-2 h-8 w-8 rounded-full border border-charcoal/10 bg-white text-orange flex items-center justify-center cursor-pointer hover:bg-orange hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  title={improvingDescription ? 'Enhancing description...' : 'Improve with AI'}
                >
                  {improvingDescription ? (
                    <FiRefreshCw size={14} className="animate-spin" />
                  ) : (
                    <FiCpu size={14} />
                  )}
                </button>
              </div>

              <p className="mt-2 text-xs font-medium text-charcoal/60">
                {improvingDescription
                  ? 'Enhancing description...'
                  : pendingOriginalDescription !== null
                    ? 'Enhanced description ready. Accept or reject.'
                    : 'Click the AI icon to enhance your description.'}
              </p>

              {improveError && (
                <p className="mt-2 text-xs font-medium text-red-600">{improveError}</p>
              )}

              {pendingOriginalDescription !== null && (
                <div className="mt-3 flex flex-wrap items-center gap-2 rounded-lg border border-orange/20 bg-orange/5 p-3">
                  <p className="text-xs font-semibold text-charcoal/70 mr-2">Use AI revised description?</p>
                  <button
                    type="button"
                    onClick={handleAcceptImprovedDescription}
                    className="h-8 px-3 rounded-lg bg-charcoal text-white text-xs font-bold flex items-center gap-1.5 hover:bg-orange transition-all"
                  >
                    <FiCheck size={12} />
                    Accept
                  </button>
                  <button
                    type="button"
                    onClick={handleRejectImprovedDescription}
                    className="h-8 px-3 rounded-lg border border-charcoal/15 bg-white text-charcoal text-xs font-bold flex items-center gap-1.5 hover:bg-charcoal/5 transition-all"
                  >
                    <FiX size={12} />
                    Reject
                  </button>
                </div>
              )}
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
                    className={`flex-1 cursor-pointer rounded-lg font-bold text-sm transition-all ${
                      !form.isOnline
                        ? 'bg-charcoal text-white shadow-sm'
                        : 'bg-white border cursor-pointer border-charcoal/8 text-charcoal hover:bg-charcoal/2'
                    }`}
                  >
                    In-Person
                  </button>
                  <button
                    type="button"
                    onClick={() => updateForm('isOnline', true)}
                    className={`flex-1 cursor-pointer rounded-lg font-bold text-sm transition-all ${
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

            {/* Venue (in-person) or Auto-Zoom info (online) */}
            {form.isOnline ? (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-100">
                <span className="mt-0.5 shrink-0 text-blue-400">
                  <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </span>
                <p className="text-sm font-medium text-blue-700">
                  A Zoom meeting link will be <span className="font-bold">automatically generated</span> when you publish this event. No manual link needed.
                </p>
              </div>
            ) : (
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-charcoal/50 mb-2.5 ml-0.5 flex items-center gap-2">
                  <FiMapPin size={12} />
                  Venue
                </label>
                <input
                  type="text"
                  value={form.venue}
                  onChange={(e) => updateForm('venue', e.target.value)}
                  required
                  placeholder="e.g., 123 Main St, San Francisco"
                  className="w-full h-11 rounded-lg bg-white border border-charcoal/8 px-4 font-semibold text-charcoal placeholder-charcoal/30 focus:outline-none focus:ring-2 focus:ring-orange/30 focus:border-transparent transition-all"
                />
              </div>
            )}

            {form.isOnline && zoomSettingsLoaded && !zoomConnected && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm font-medium text-amber-900 shadow-sm">
                <p className="font-bold text-amber-950">Zoom is not connected yet.</p>
                <p className="mt-1 text-amber-900/80">
                  Connect Zoom in Settings before launching an online event so the meeting link can be generated automatically.
                </p>
                <Link
                  href="/dashboard/settings"
                  className="mt-3 inline-flex h-10 items-center rounded-xl bg-charcoal px-4 text-xs font-bold text-white transition-colors hover:bg-orange"
                >
                  Go to Settings
                </Link>
              </div>
            )}
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
          <div className="flex items-center gap-3 pt-4">
            <button
              type="button"
              onClick={() => {
                submitIfValid('draft')
              }}
              disabled={loading}
              className="flex-1 h-14 cursor-pointer bg-white border border-charcoal/10 text-charcoal rounded-2xl font-bold flex items-center justify-center gap-2 shadow-sm hover:bg-charcoal/2 transition-all disabled:opacity-50"
            >
              {loading ? 'Saving...' : (
                <>
                  <FiSave size={18} />
                  Save as Draft
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                submitIfValid('published')
              }}
              disabled={loading || (form.isOnline && (!zoomSettingsLoaded || !zoomConnected))}
              className="flex-[1.5] h-14 bg-charcoal cursor-pointer text-white rounded-2xl font-bold flex items-center justify-center gap-2 shadow-xl hover:bg-orange transition-all disabled:opacity-50 group"
            >
              {loading ? 'Launching...' : form.isOnline && zoomSettingsLoaded && !zoomConnected ? 'Connect Zoom First' : (
                <>
                  <FiInfo size={18} className="group-hover:rotate-12 transition-transform" />
                  Launch Event
                </>
              )}
            </button>
            <Link
              href="/dashboard"
              className="h-14 px-6 rounded-2xl flex items-center justify-center text-charcoal/40 font-bold hover:text-charcoal transition-all"
            >
              Cancel
            </Link>
          </div>
        </form>
      </div>
    </DashboardLayout>
  )
}
