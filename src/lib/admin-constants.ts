export const VARIANT_LABELS: Record<string, string> = {
  wijktocht: 'WijkTocht',
  impactsprint: 'ImpactSprint',
  familietocht: 'FamilieTocht',
  jeugdtocht: 'JeugdTocht',
  voetbalmissie: 'VoetbalMissie',
  vrijwilligersdankdag: 'Vrijwilligers Dankdag',
  vaartocht: 'VaarTocht',
}

export const VARIANT_COLORS: Record<string, string> = {
  wijktocht: '#00E676',
  impactsprint: '#3B82F6',
  familietocht: '#F59E0B',
  jeugdtocht: '#8B5CF6',
  voetbalmissie: '#EF4444',
  vrijwilligersdankdag: '#EC4899',
  vaartocht: '#0EA5E9',
}

export const VARIANT_OPTIONS = Object.entries(VARIANT_LABELS).map(([value, label]) => ({ value, label }))

export const CHECKPOINT_TYPE_OPTIONS = [
  { value: 'kennismaking', label: 'Kennismaking' },
  { value: 'samenwerking', label: 'Samenwerking' },
  { value: 'reflectie', label: 'Reflectie' },
  { value: 'actie', label: 'Actie' },
  { value: 'feest', label: 'Feest' },
]

export const MISSION_TYPE_OPTIONS = [
  { value: 'opdracht', label: 'Opdracht' },
  { value: 'foto', label: 'Foto-opdracht' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'video', label: 'Video' },
]

export function variantColor(variant: string | null | undefined): string {
  return VARIANT_COLORS[variant ?? ''] ?? '#94A3B8'
}

export function variantLabel(variant: string | null | undefined): string {
  return VARIANT_LABELS[variant ?? ''] ?? variant ?? 'Onbekend'
}

export function formatEuro(cents: number): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(cents / 100)
}
