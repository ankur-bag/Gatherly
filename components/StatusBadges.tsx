'use client'

export function StatusBadge({ status }: { status: string }) {
  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    draft: { bg: 'bg-neutral-100', text: 'text-neutral-700', label: 'Draft' },
    published: { bg: 'bg-green-100', text: 'text-green-700', label: 'Published' },
    cancelled: { bg: 'bg-red-100', text: 'text-red-700', label: 'Cancelled' },
    open: { bg: 'bg-green-100', text: 'text-green-700', label: 'Open' },
    full: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Full' },
    closed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Closed' },
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
    registered: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Registered' },
    approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
    rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
    revoked: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Revoked' },
  }

  const config = statusConfig[status] || statusConfig.draft

  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}>
      {config.label}
    </span>
  )
}

export function ZoomSyncBadge({ syncStatus }: { syncStatus?: string }) {
  if (!syncStatus) return null

  const config: Record<string, { bg: string; text: string; label: string }> = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Syncing...' },
    synced: { bg: 'bg-green-100', text: 'text-green-700', label: 'Zoom Synced' },
    failed: { bg: 'bg-red-100', text: 'text-red-700', label: 'Sync Failed' },
    cancelled: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Cancelled' },
  }

  const item = config[syncStatus] || config.pending

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${item.bg} ${item.text}`}>
      {syncStatus === 'pending' && <span className="animate-pulse">●</span>}
      {syncStatus === 'synced' && <span>✓</span>}
      {syncStatus === 'failed' && <span>✕</span>}
      {item.label}
    </span>
  )
}
