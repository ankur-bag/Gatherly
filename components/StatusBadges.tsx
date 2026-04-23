'use client'

export type AllStatues = 
  | 'draft' | 'published' | 'cancelled' | 'completed' 
  | 'pending' | 'confirmed' | 'rejected' | 'revoked'
  | 'Open' | 'Full' | 'Closed'

export function StatusBadge({ status }: { status: AllStatues | string }) {
  const styles: Record<string, string> = {
    // Event Statuses
    draft: 'bg-black/5 text-charcoal/50 border-charcoal/10',
    published: 'bg-green-50 text-green-600 border-green-100',
    cancelled: 'bg-red-50 text-red-500 border-red-200',
    completed: 'bg-blue-50 text-blue-500 border-blue-200',
    
    // Registration Statuses
    pending: 'bg-orange/10 text-orange border-orange/20',
    confirmed: 'bg-green-50 text-green-600 border-green-100',
    approved: 'bg-green-50 text-green-600 border-green-100',
    rejected: 'bg-red-50 text-red-500 border-red-200',
    revoked: 'bg-charcoal/10 text-charcoal/40 border-charcoal/20',

    // Public Visibility Statuses
    Open: 'bg-sage/10 text-sage border-sage/20',
    Full: 'bg-orange/10 text-orange border-orange/20',
    Closed: 'bg-black/5 text-charcoal/50 border-charcoal/10',
  }

  const normalizedStatus = status as keyof typeof styles
  const currentStyle = styles[normalizedStatus] || styles.draft

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border transition-all ${currentStyle}`}>
      {status}
    </span>
  )
}

export function ZoomSyncBadge({ syncStatus }: { syncStatus: string }) {
  const colors: Record<string, string> = {
    pending: 'bg-orange/10 text-orange border-orange/10',
    synced: 'bg-blue-50 text-blue-500 border-blue-100',
    failed: 'bg-red-50 text-red-500 border-red-100',
  }

  return (
    <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border ${colors[syncStatus] || colors.pending}`}>
      Zoom {syncStatus}
    </span>
  )
}
