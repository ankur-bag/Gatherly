'use client'

import DashboardLayout from '@/components/DashboardLayout'
import { StatusBadge } from '@/components/StatusBadges'
import { IEvent, IRegistration } from '@/types'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { FiArrowLeft, FiCheck, FiSearch, FiTrash2, FiX } from 'react-icons/fi'

export function DashboardEventAttendeesPageUI() {
  const params = useParams()
  const eventId = params.id as string
  const [event, setEvent] = useState<IEvent | null>(null)
  const [registrations, setRegistrations] = useState<IRegistration[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [updatingId, setUpdatingId] = useState('')

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventRes, regRes] = await Promise.all([
          fetch(`/api/events/${eventId}`),
          fetch(
            `/api/events/${eventId}/registrations?${new URLSearchParams({
              search,
              status: statusFilter,
            })}`
          ),
        ])

        if (eventRes.ok) {
          const eventData = await eventRes.json()
          setEvent(eventData.data)
        }

        if (regRes.ok) {
          const regData = await regRes.json()
          setRegistrations(regData.data || [])
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [eventId, search, statusFilter])

  async function updateStatus(registrationId: string, newStatus: string) {
    setUpdatingId(registrationId)
    try {
      const res = await fetch(`/api/registrations/${registrationId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Failed to update status')
      const { data } = await res.json()
      setRegistrations(registrations.map((r) => (r._id === registrationId ? data : r)))
      alert('Status updated!')
    } catch (error: any) {
      alert(error.message)
    } finally {
      setUpdatingId('')
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

  if (!event) {
    return (
      <DashboardLayout>
        <div className="py-16 text-center">
          <h2 className="text-2xl font-semibold text-red-700">Event not found</h2>
          <Link href="/dashboard" className="mt-4 inline-block font-medium text-primary">
            Back to Events
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl animate-slideInUp space-y-8">
        <Link
          href={`/dashboard/events/${eventId}`}
          className="flex items-center gap-2 font-medium text-primary transition-colors hover:text-primary-dark"
        >
          <FiArrowLeft size={20} />
          Back to Event
        </Link>

        <div>
          <h1 className="text-3xl font-semibold text-foreground">{event.title}</h1>
          <p className="mt-2 text-neutral-600">Manage {registrations.length} registration(s)</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative max-w-sm flex-1">
            <FiSearch className="absolute left-3 top-3 text-neutral-500" size={20} />
            <input
              type="text"
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-lg border border-neutral-300 py-3 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Status</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="registered">Registered</option>
            <option value="rejected">Rejected</option>
            <option value="revoked">Revoked</option>
          </select>
        </div>

        {registrations.length === 0 ? (
          <div className="rounded-lg border border-neutral-200 bg-neutral-50 py-16 text-center">
            <p className="text-neutral-600">No registrations found</p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-neutral-200">
            <table className="w-full">
              <thead className="border-b border-neutral-200 bg-neutral-50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Name</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Email</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-neutral-900">Registered</th>
                  <th className="px-6 py-4 text-right text-sm font-semibold text-neutral-900">Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map((reg) => (
                  <tr key={reg._id} className="border-b border-neutral-200 transition-colors hover:bg-neutral-50">
                    <td className="px-6 py-4 text-sm text-foreground">{reg.attendeeName}</td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{reg.attendeeEmail}</td>
                    <td className="px-6 py-4">
                      <StatusBadge status={reg.status} />
                    </td>
                    <td className="px-6 py-4 text-sm text-neutral-600">{new Date(reg.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {reg.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateStatus(reg._id, 'approved')}
                              disabled={updatingId === reg._id}
                              className="rounded-lg p-2 text-green-600 transition-colors hover:bg-green-50 disabled:opacity-50"
                              title="Approve"
                            >
                              <FiCheck size={20} />
                            </button>
                            <button
                              onClick={() => updateStatus(reg._id, 'rejected')}
                              disabled={updatingId === reg._id}
                              className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                              title="Reject"
                            >
                              <FiX size={20} />
                            </button>
                          </>
                        )}
                        {(reg.status === 'approved' || reg.status === 'registered') && (
                          <button
                            onClick={() => updateStatus(reg._id, 'revoked')}
                            disabled={updatingId === reg._id}
                            className="rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
                            title="Revoke"
                          >
                            <FiTrash2 size={20} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}