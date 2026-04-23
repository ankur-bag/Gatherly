'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { FiArrowLeft, FiCheck, FiSave, FiAlertCircle } from 'react-icons/fi'
import Link from 'next/link'

export function DashboardEventCreatePageUI() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      dateTime: formData.get('dateTime'),
      location: formData.get('location'),
      isOnline: formData.get('isOnline') === 'true',
      capacity: Number(formData.get('capacity')),
      status: 'draft',
    }

    try {
      const res = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      })

      if (!res.ok) throw new Error('Failed to create event')
      
      router.push('/dashboard')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="animate-reveal max-w-2xl mx-auto">
        {/* Back Button */}
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm font-bold text-charcoal/40 hover:text-charcoal transition-colors mb-10 group">
          <FiArrowLeft className="transition-transform group-hover:-translate-x-1" />
          Back to list
        </Link>

        {/* Header */}
        <div className="mb-12">
           <h1 className="text-charcoal leading-none mb-1">New Event</h1>
           <p className="text-charcoal/40 font-medium">Define your operational flow and guest list.</p>
        </div>

        {/* Error State */}
        {error && (
          <div className="mb-8 flex items-center gap-3 rounded-2xl bg-red-50 p-4 text-sm font-bold text-red-500 border border-red-100">
            <FiAlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-8">
           <div className="bento-card space-y-6">
              <div className="space-y-2">
                <label htmlFor="title" className="text-xs font-bold uppercase tracking-widest text-black/30 ml-1">Event Title</label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  required
                  placeholder="e.g. Designer Coffee Morning"
                  className="w-full h-14 rounded-2xl bg-black/5 border-none px-6 text-charcoal font-bold placeholder:text-black/20 focus:ring-2 focus:ring-orange/20 transition-all outline-none"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="description" className="text-xs font-bold uppercase tracking-widest text-black/30 ml-1">Context & Details</label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  placeholder="Tell your guests what this event is about..."
                  className="w-full rounded-2xl bg-black/5 border-none p-6 text-charcoal font-bold placeholder:text-black/20 focus:ring-2 focus:ring-orange/20 transition-all outline-none resize-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                 <div className="space-y-2">
                    <label htmlFor="dateTime" className="text-xs font-bold uppercase tracking-widest text-black/30 ml-1">Date & Time</label>
                    <input
                      id="dateTime"
                      name="dateTime"
                      type="datetime-local"
                      required
                      className="w-full h-14 rounded-2xl bg-black/5 border-none px-6 text-charcoal font-bold focus:ring-2 focus:ring-orange/20 transition-all outline-none"
                    />
                 </div>
                 <div className="space-y-2">
                    <label htmlFor="capacity" className="text-xs font-bold uppercase tracking-widest text-black/30 ml-1">Total Capacity</label>
                    <input
                      id="capacity"
                      name="capacity"
                      type="number"
                      required
                      defaultValue={50}
                      className="w-full h-14 rounded-2xl bg-black/5 border-none px-6 text-charcoal font-bold focus:ring-2 focus:ring-orange/20 transition-all outline-none"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="location" className="text-xs font-bold uppercase tracking-widest text-black/30 ml-1">Location or Link</label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  required
                  placeholder="e.g. SoHo House, London"
                  className="w-full h-14 rounded-2xl bg-black/5 border-none px-6 text-charcoal font-bold focus:ring-2 focus:ring-orange/20 transition-all outline-none"
                />
              </div>

              <div className="pt-4 border-t border-black/5">
                 <div className="flex items-center justify-between">
                    <div>
                       <p className="text-sm font-bold text-charcoal">Online Event?</p>
                       <p className="text-xs text-charcoal/40 font-medium tracking-tight">Enable automated Zoom synchronization hooks.</p>
                    </div>
                    <select 
                       name="isOnline" 
                       className="h-10 rounded-xl bg-orange/10 text-orange font-bold text-xs px-4 border-none focus:ring-0 cursor-pointer"
                    >
                       <option value="false">No</option>
                       <option value="true">Yes</option>
                    </select>
                 </div>
              </div>
           </div>

           <div className="flex items-center gap-4 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="h-14 flex-1 bg-charcoal text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-black/10 hover:bg-orange hover:shadow-orange/20 transition-all disabled:opacity-50"
              >
                {loading ? 'Processing...' : (
                  <>
                    <FiSave size={20} />
                    Create and Save Draft
                  </>
                )}
              </button>
              <Link href="/dashboard" className="h-14 px-8 border border-black/10 rounded-2xl flex items-center justify-center text-charcoal font-bold hover:bg-black/5 transition-all">
                 Cancel
              </Link>
           </div>
        </form>
      </div>
    </DashboardLayout>
  )
}