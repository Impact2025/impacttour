type StatusType =
  | 'pending'
  | 'processed'
  | 'failed'
  | 'duplicate'
  | 'draft'
  | 'lobby'
  | 'active'
  | 'paused'
  | 'completed'
  | 'cancelled'
  | 'paid'
  | 'free'
  | 'refunded'
  | string

const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string }> = {
  // Webhook
  pending: { label: 'In behandeling', bg: '#FEF9C3', text: '#854D0E' },
  processed: { label: 'Verwerkt', bg: '#DCFCE7', text: '#166534' },
  failed: { label: 'Mislukt', bg: '#FEE2E2', text: '#991B1B' },
  duplicate: { label: 'Duplicaat', bg: '#F1F5F9', text: '#64748B' },
  // Session
  draft: { label: 'Concept', bg: '#F1F5F9', text: '#64748B' },
  lobby: { label: 'Lobby', bg: '#DBEAFE', text: '#1D4ED8' },
  active: { label: 'Actief', bg: '#DCFCE7', text: '#166534' },
  paused: { label: 'Gepauzeerd', bg: '#FEF9C3', text: '#854D0E' },
  completed: { label: 'Voltooid', bg: '#F0FDF4', text: '#166534' },
  cancelled: { label: 'Geannuleerd', bg: '#F1F5F9', text: '#94A3B8' },
  // Order
  paid: { label: 'Betaald', bg: '#DCFCE7', text: '#166534' },
  free: { label: 'Gratis', bg: '#F0F9FF', text: '#0369A1' },
  refunded: { label: 'Terugbetaald', bg: '#FEF3C7', text: '#92400E' },
}

export function AdminStatusBadge({ status }: { status: StatusType }) {
  const config = STATUS_CONFIG[status] ?? { label: status, bg: '#F1F5F9', text: '#64748B' }
  return (
    <span
      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold whitespace-nowrap"
      style={{ backgroundColor: config.bg, color: config.text }}
    >
      {config.label}
    </span>
  )
}
