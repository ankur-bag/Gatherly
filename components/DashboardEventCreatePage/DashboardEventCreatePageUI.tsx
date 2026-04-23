'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { EVENT_TEMPLATES } from '@/lib/utils'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FiArrowLeft } from 'react-icons/fi'

export function DashboardEventCreatePageUI() {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null)

  if (selectedTemplate) {
    const template = EVENT_TEMPLATES.find((t) => t.id === selectedTemplate)
    return (
      <DashboardLayout>
        <div className="max-w-3xl animate-slideInUp">
          <button
            onClick={() => setSelectedTemplate(null)}
            className="mb-8 flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary-dark"
          >
            <FiArrowLeft size={20} />
            Back to templates
          </button>

          <div className="space-y-8">
            <h1 className="text-3xl font-semibold text-foreground">{template?.label}</h1>
            <EventForm template={template!} />
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="animate-slideInUp space-y-8">
        <div>
          <h1 className="text-3xl font-semibold text-foreground">Create Event</h1>
          <p className="mt-2 text-neutral-600">Choose a template to get started</p>
        </div>

        <div className="grid grid-cols-2 gap-6">
          {EVENT_TEMPLATES.map((template) => (
            <button
              key={template.id}
              onClick={() => setSelectedTemplate(template.id)}
              className="group animate-slideInUp rounded-lg border-2 border-neutral-200 bg-white p-6 text-left transition-all hover:border-primary hover:bg-neutral-50"
              style={{ animationDelay: `${EVENT_TEMPLATES.indexOf(template) * 50}ms` }}
            >
              <div className="mb-4 text-4xl transition-transform group-hover:scale-110">{template.icon}</div>
              <h3 className="text-xl font-semibold text-foreground transition-colors group-hover:text-primary">{template.label}</h3>
              <p className="mt-2 text-sm text-neutral-600">{template.description}</p>
            </button>
          ))}
        </div>
      </div>
    </DashboardLayout>
  )
}

function EventForm({ template }: { template: (typeof EVENT_TEMPLATES)[0] }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    title: template.prefill.title,
    description: template.prefill.description,
    dateTime: new Date().toISOString().slice(0, 16),
    venue: '',
    isOnline: template.prefill.isOnline,
    capacity: template.prefill.capacity.toString(),
    registrationMode: template.prefill.registrationMode,
  })

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          capacity: parseInt(formData.capacity),
          dateTime: new Date(formData.dateTime).toISOString(),
          templateUsed: template.id,
        }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Failed to create event')
      }

      const { data } = await res.json()
      router.push(`/dashboard/events/${data._id}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 rounded-lg border border-neutral-200 bg-white p-8">
      {error && <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{error}</div>}

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Event Title *</label>
        <input
          type="text"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium text-foreground">Description *</label>
        <textarea
          required
          rows={4}
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Date & Time *</label>
          <input
            type="datetime-local"
            required
            value={formData.dateTime}
            onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Capacity *</label>
          <input
            type="number"
            required
            min="1"
            value={formData.capacity}
            onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
          />
        </div>
      </div>

      {!formData.isOnline && (
        <div>
          <label className="mb-2 block text-sm font-medium text-foreground">Venue *</label>
          <input
            type="text"
            required={!formData.isOnline}
            value={formData.venue}
            onChange={(e) => setFormData({ ...formData, venue: e.target.value })}
            className="w-full rounded-lg border border-neutral-300 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-0"
          />
        </div>
      )}

      <div className="flex items-center gap-6 border-t border-neutral-200 pt-4">
        <button
          type="submit"
          disabled={loading}
          className="rounded-lg bg-primary px-6 py-3 font-medium text-white transition-colors hover:bg-primary-dark disabled:opacity-50"
        >
          {loading ? 'Creating...' : 'Create Event'}
        </button>
        <Link href="/dashboard" className="text-neutral-600 transition-colors hover:text-foreground">
          Cancel
        </Link>
      </div>
    </form>
  )
}