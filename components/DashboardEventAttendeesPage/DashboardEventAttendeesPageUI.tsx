'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { StatusBadge } from '@/components/StatusBadges'
import { IEvent, IRegistration } from '@/types'
import { useAuth } from '@clerk/nextjs'
import Link from 'next/link'
import { useEffect, useState } from 'react'
import { FiArrowLeft, FiCheck, FiFilter, FiMail, FiSearch, FiX, FiUser } from 'react-icons/fi'
import { useToast } from '../ui/Toast'

export function DashboardEventAttendeesPageUI({ eventId }: { eventId: string }) {
  const { isLoaded } = useAuth()
  const { showToast } = useToast()
  const [event, setEvent] = useState<IEvent | null>(null)
  const [registrations, setRegistrations] = useState<IRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [bulkActionLoading, setBulkActionLoading] = useState(false)

  const fetchAttendees = async () => {
    try {
      const [resEvent, resReg] = await Promise.all([
        fetch(`/api/events/${eventId}`),
        fetch(`/api/events/${eventId}/registrations`),
      ])

      const dataEvent = await resEvent.json()
      const dataReg = await resReg.json()

      if (dataEvent.data) setEvent(dataEvent.data)
      if (dataReg.data) setRegistrations(dataReg.data)
    } catch {
      setError('Failed to fetch attendees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (isLoaded) fetchAttendees()
  }, [eventId, isLoaded])

  async function updateStatus(regId: string, status: string) {
    try {
      const res = await fetch(`/api/registrations/${regId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      })
      if (!res.ok) throw new Error('Status update failed')
      showToast('Status updated successfully')
      fetchAttendees()
    } catch (err) {
      showToast('Failed to update status', 'error')
    }
  }

  const handleSelectAll = () => {
    if (selectedIds.length > 0) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredData.map(r => r._id?.toString() || ''))
    }
  }

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id])
  }

  async function handleBulkAction(action: 'approve' | 'reject') {
    if (!confirm(`Are you sure you want to ${action} ${selectedIds.length} selected guests?`)) return
    
    setBulkActionLoading(true)
    try {
      const res = await fetch('/api/registrations/bulk-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationIds: selectedIds, action }),
      })
      if (!res.ok) throw new Error('Bulk action failed')
      
      showToast(`Bulk ${action} successful`)
      setSelectedIds([])
      fetchAttendees()
    } catch (err) {
      showToast(`Failed to ${action} guests`, 'error')
    } finally {
      setBulkActionLoading(false)
    }
  }

  const filteredData = registrations.filter((reg) => {
    const matchesSearch =
      reg.attendeeName.toLowerCase().includes(search.toLowerCase()) ||
      reg.attendeeEmail.toLowerCase().includes(search.toLowerCase())
    const matchesFilter = filter === 'all' || reg.status === filter
    return matchesSearch && matchesFilter
  })

  // Group stats
  const stats = registrations.reduce(
    (acc, reg) => {
      acc[reg.status] = (acc[reg.status] || 0) + 1
      acc.total++
      return acc
    },
    { total: 0, pending: 0, confirmed: 0, rejected: 0, revoked: 0, approved: 0, registered: 0 } as Record<string, number>
  )

  if (loading) {
    return (
      <DashboardLayout>
        <div className="space-y-4">
          <div className="skeleton h-6 w-48" />
          <div className="skeleton mt-6 h-24 w-full" />
          <div className="skeleton mt-4 h-96 w-full rounded-3xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (error || !event) {
    return (
      <DashboardLayout>
        <div className="rounded-3xl border border-red-100 bg-red-50 p-6 text-red-600">
          <h3 className="font-bold flex items-center gap-2">
            <FiX /> {error || 'Event not found'}
          </h3>
          <Link href="/dashboard" className="mt-4 inline-flex items-center gap-2 font-bold hover:underline">
            <FiArrowLeft size={16} /> Back to Dashboard
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="animate-reveal space-y-8">
        <Link
          href={`/dashboard/events/${eventId}`}
          className="inline-flex items-center gap-2 text-sm font-bold text-charcoal/40 transition-colors hover:text-charcoal group"
        >
          <FiArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          Back to Event
        </Link>

        {/* Header Block */}
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl text-charcoal leading-none mb-1.5">Attendees</h1>
            <p className="text-xs lg:text-sm text-charcoal/40 font-medium">{event.title}</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-2xl glass px-3 lg:px-4 py-1.5 lg:py-2 border-black/5 shadow-sm text-[10px] lg:text-xs font-bold text-charcoal/60 uppercase tracking-widest">
              Total: {stats.total}
            </div>
            <div className="rounded-2xl bg-green-50 px-3 lg:px-4 py-1.5 lg:py-2 border border-green-100 shadow-sm text-[10px] lg:text-xs font-bold text-green-600 uppercase tracking-widest">
              Confirmed: {stats.confirmed || 0}
            </div>
            {(stats.pending || 0) > 0 && (
            <div className="rounded-2xl bg-orange/10 px-3 lg:px-4 py-1.5 lg:py-2 border border-orange/10 shadow-sm text-[10px] lg:text-xs font-bold text-orange uppercase tracking-widest">
                Pending: {stats.pending}
              </div>
            )}
          </div>
        </div>

        {/* Search & Filter Toolbar */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="relative w-full sm:w-64">
            <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/20" size={18} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-10 rounded-xl bg-charcoal/5 px-10 text-[13px] font-bold text-charcoal focus:ring-2 focus:ring-orange/20 outline-none transition-all placeholder:text-charcoal/20"
            />
          </div>
          
          <div className="flex flex-wrap items-center gap-2 flex-1 justify-start sm:justify-end">
            {selectedIds.length > 0 && (
              <div className="flex items-center gap-2 mr-2">
                <span className="text-[10px] font-bold text-charcoal/60 uppercase tracking-widest px-2">
                  {selectedIds.length} Selected
                </span>
                <button
                  onClick={() => handleBulkAction('approve')}
                  disabled={bulkActionLoading}
                  className="h-10 px-4 rounded-xl bg-green-50 text-green-600 text-[13px] font-bold border border-green-100 hover:bg-green-600 hover:text-white transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <FiCheck size={14} /> Approve All
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  disabled={bulkActionLoading}
                  className="h-10 px-4 rounded-xl bg-red-50 text-red-500 text-[13px] font-bold border border-red-100 hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50"
                >
                  <FiX size={14} /> Reject All
                </button>
              </div>
            )}
            
            <button
              onClick={handleSelectAll}
              className={`h-10 px-4 rounded-xl text-[13px] font-bold transition-all cursor-pointer border ${selectedIds.length > 0 ? 'bg-orange text-white border-orange shadow-md shadow-orange/20' : 'bg-charcoal/5 text-charcoal hover:bg-charcoal/10 border-transparent'}`}
            >
              {selectedIds.length > 0 ? 'Deselect All' : 'Select All'}
            </button>

            <div className="relative">
              <FiFilter className="absolute left-4 top-1/2 -translate-y-1/2 text-charcoal/20" size={16} />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="h-10 w-full sm:w-40 cursor-pointer rounded-xl bg-charcoal/5 pl-10 pr-6 text-[13px] font-bold text-charcoal focus:ring-2 focus:ring-orange/20 outline-none transition-all appearance-none border-transparent"
              >
                <option value="all">All Records</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="rejected">Rejected</option>
                <option value="revoked">Revoked</option>
              </select>
            </div>
          </div>
        </div>

        {/* Modern List Container */}
        <div className="bento-card !p-0 overflow-hidden border-none shadow-framer">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-medium border-collapse">
              <thead>
                <tr className="bg-charcoal/5 border-b border-black/5 text-[10px] lg:text-xs font-bold text-charcoal/30 uppercase tracking-[0.2em]">
                  {selectedIds.length > 0 && (
                    <th className="px-4 py-2.5 lg:py-3.5 w-12 text-center">
                      <input 
                        type="checkbox" 
                        onChange={handleSelectAll}
                        checked={selectedIds.length > 0}
                        className="cursor-pointer accent-orange w-4 h-4 rounded"
                      />
                    </th>
                  )}
                  <th className="px-4 sm:px-6 lg:px-8 py-2.5 lg:py-3.5">Guest Information</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-2.5 lg:py-3.5">Flow Status</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-2.5 lg:py-3.5">Joined On</th>
                  <th className="px-4 sm:px-6 lg:px-8 py-2.5 lg:py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-black/5">
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={selectedIds.length > 0 ? 5 : 4} className="px-8 py-20 text-center">
                      <div className="flex flex-col items-center gap-3">
                         <div className="h-12 w-12 rounded-full bg-charcoal/5 flex items-center justify-center text-charcoal/20">
                            <FiUser size={24} />
                         </div>
                         <p className="text-charcoal/40 font-bold">No attendees found</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredData.map((reg) => (
                    <tr key={reg._id?.toString()} className={`group transition-colors ${selectedIds.includes(reg._id?.toString() || '') ? 'bg-orange/5' : 'hover:bg-black/[0.02]'}`}>
                      {selectedIds.length > 0 && (
                        <td className="px-4 py-4 lg:py-6 text-center">
                          <input 
                            type="checkbox" 
                            checked={selectedIds.includes(reg._id?.toString() || '')}
                            onChange={() => toggleSelection(reg._id?.toString() || '')}
                            className="cursor-pointer accent-orange w-4 h-4 rounded"
                          />
                        </td>
                      )}
                      <td className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
                        <div>
                           <p className="font-bold text-charcoal mb-0.5">{reg.attendeeName}</p>
                           <p className="text-xs text-charcoal/40 flex items-center gap-1.5 font-bold">
                              <FiMail size={12} /> {reg.attendeeEmail}
                           </p>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6">
                        <StatusBadge status={reg.status} />
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6 text-charcoal/40 font-bold whitespace-nowrap">
                        {new Date(reg.createdAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </td>
                      <td className="px-4 sm:px-6 lg:px-8 py-4 lg:py-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {reg.status === 'pending' && (
                            <>
                              <button
                                onClick={() => updateStatus(reg._id?.toString() || '', 'confirmed')}
                                className="h-9 px-4 rounded-xl bg-green-50 text-green-600 text-xs font-bold border border-green-100 hover:bg-green-600 hover:text-white transition-all cursor-pointer flex items-center gap-2"
                              >
                                <FiCheck size={14} /> Confirm
                              </button>
                              <button
                                onClick={() => updateStatus(reg._id?.toString() || '', 'rejected')}
                                className="h-9 px-4 rounded-xl bg-red-50 text-red-500 text-xs font-bold border border-red-100 hover:bg-red-500 hover:text-white transition-all cursor-pointer flex items-center gap-2"
                              >
                                <FiX size={14} /> Reject
                              </button>
                            </>
                          )}
                          {reg.status === 'confirmed' && (
                            <button
                              onClick={() => updateStatus(reg._id?.toString() || '', 'revoked')}
                              className="h-9 px-4 rounded-xl bg-charcoal/5 border border-black/5 text-charcoal/40 text-xs font-bold hover:bg-charcoal hover:text-white transition-all cursor-pointer"
                            >
                              Revoke
                            </button>
                          )}
                          {(reg.status === 'rejected' || reg.status === 'revoked') && (
                            <button
                              onClick={() => updateStatus(reg._id?.toString() || '', 'confirmed')}
                              className="h-9 px-4 rounded-xl bg-green-50 text-green-600 text-xs font-bold border border-green-100 hover:bg-green-600 hover:text-white transition-all cursor-pointer flex items-center gap-2"
                            >
                              <FiCheck size={14} /> Confirm
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}