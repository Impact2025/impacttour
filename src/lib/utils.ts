import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** Willekeurige 6-karakter alphanumerieke code genereren (joinCode) */
export function generateJoinCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // geen O/0, I/1
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

/** Willekeurig team token genereren */
export function generateTeamToken(): string {
  return crypto.randomUUID().replace(/-/g, '')
}

/** Formatteer GMS score naar label */
export function gmsLabel(score: number): string {
  if (score >= 70) return 'Hoge Impact'
  if (score >= 50) return 'Goede Impact'
  if (score >= 30) return 'Matige Impact'
  return 'Lage Impact'
}

/** Formatteer minuten naar leesbare duur (bijv. "1u 30m") */
export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes}m`
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}u ${m}m` : `${h}u`
}
