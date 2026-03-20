'use client'

import { useState, useMemo } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import {
  MapPin, Clock, Users, Star, ChevronRight, Zap, Heart, Shield, Target,
  Search, SlidersHorizontal,
} from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface TourRow {
  id: string
  name: string
  description: string | null
  variant: string
  estimatedDurationMin: number | null
  maxTeams: number | null
  priceInCents: number | null
  pricingModel: string
  pricePerPersonCents: number
  aiConfig: Record<string, unknown> | null
  checkpointCount: number
}

// ─── Variant metadata ─────────────────────────────────────────────────────────

const VARIANT_META: Record<string, {
  label: string; color: string; bg: string; textColor: string;
  icon: React.ComponentType<{ className?: string }>
}> = {
  wijktocht:     { label: 'WijkTocht',     color: '#3B82F6', bg: '#EFF6FF', textColor: '#1D4ED8', icon: MapPin },
  impactsprint:  { label: 'ImpactSprint',  color: '#8B5CF6', bg: '#F5F3FF', textColor: '#6D28D9', icon: Zap },
  familietocht:  { label: 'Familie & Koppels',  color: '#EC4899', bg: '#FDF2F8', textColor: '#BE185D', icon: Heart },
  jeugdtocht:    { label: 'JeugdTocht',    color: '#F59E0B', bg: '#FFFBEB', textColor: '#B45309', icon: Shield },
  voetbalmissie: { label: 'VoetbalMissie', color: '#00C853', bg: '#F0FDF4', textColor: '#166534', icon: Target },
}

const FILTER_TABS = [
  { key: 'alle', label: 'Alle tochten' },
  { key: 'wijktocht',    label: 'WijkTocht' },
  { key: 'impactsprint', label: 'ImpactSprint' },
  { key: 'familietocht', label: 'Familie & Koppels' },
  { key: 'jeugdtocht',   label: 'JeugdTocht' },
  { key: 'voetbalmissie', label: 'VoetbalMissie' },
]

// ─── Helpers ──────────────────────────────────────────────────────────────────

function priceDisplay(tour: TourRow) {
  if (tour.pricingModel === 'per_person' && tour.pricePerPersonCents > 0) {
    return { main: `€${(tour.pricePerPersonCents / 100).toFixed(0)}`, sub: 'p.p. excl. BTW' }
  }
  if ((tour.priceInCents ?? 0) > 0) {
    return { main: `€${((tour.priceInCents ?? 0) / 100).toFixed(0)}`, sub: 'vast excl. BTW' }
  }
  return { main: 'Gratis', sub: '' }
}

function durationLabel(min: number | null): string {
  if (!min) return '—'
  const h = Math.floor(min / 60)
  const m = min % 60
  return m > 0 ? `${h}u ${m}m` : `${h} uur`
}

// ─── Tour Card ────────────────────────────────────────────────────────────────

function TourCard({ tour }: { tour: TourRow }) {
  const meta = VARIANT_META[tour.variant] ?? VARIANT_META.wijktocht
  const Icon = meta.icon
  const cfg = tour.aiConfig ?? {}
  const location = (cfg.location as string) || ''
  const tagline  = (cfg.tagline  as string) || tour.description || ''
  const emoji    = (cfg.emoji    as string) || '📍'
  const imageUrl = (cfg.imageUrl as string) || null
  const price    = priceDisplay(tour)

  return (
    <Link
      href={`/tochten/${tour.id}`}
      className="group flex flex-col bg-white rounded-2xl border border-[#E2E8F0] hover:border-[#00E676] hover:shadow-xl transition-all duration-200 overflow-hidden"
    >
      {/* Card header — photo when available, gradient+emoji fallback */}
      <div
        className="relative h-44 flex flex-col items-center justify-center overflow-hidden"
        style={imageUrl ? undefined : { background: `linear-gradient(145deg, ${meta.color}20 0%, ${meta.color}35 100%)` }}
      >
        {imageUrl ? (
          <>
            <Image
              src={imageUrl}
              alt={tour.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            {/* Dark gradient overlay for legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          </>
        ) : (
          <>
            {/* Decorative blur */}
            <div
              className="absolute -bottom-8 -right-8 w-32 h-32 rounded-full opacity-20"
              style={{ backgroundColor: meta.color }}
            />
            <span className="text-5xl relative z-10 mb-1 select-none">{emoji}</span>
          </>
        )}

        {/* Variant badge */}
        <div
          className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest z-10"
          style={{ backgroundColor: meta.bg, color: meta.textColor, border: `1px solid ${meta.color}30` }}
        >
          <Icon className="w-3 h-3" />
          {meta.label}
        </div>

        {/* Price badge */}
        <div className="absolute top-3 right-3 bg-[#0F172A] text-white rounded-xl px-2.5 py-1 text-center z-10">
          <p className="text-sm font-black leading-tight" style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}>
            {price.main}
          </p>
          {price.sub && <p className="text-[8px] text-[#94A3B8] leading-none">{price.sub}</p>}
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col p-5">
        {/* Location */}
        {location && (
          <div className="flex items-center gap-1 text-[#94A3B8] text-xs mb-1.5">
            <MapPin className="w-3 h-3" />
            {location}
          </div>
        )}

        <h3
          className="font-black text-[#0F172A] text-lg leading-tight mb-1.5 group-hover:text-[#00C853] transition-colors"
          style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
        >
          {tour.name}
        </h3>

        {tagline && (
          <p className="text-[#64748B] text-xs leading-relaxed mb-4 line-clamp-2 flex-1">
            {tagline}
          </p>
        )}

        {/* Stats row */}
        <div className="flex items-center gap-3 text-xs text-[#94A3B8] pt-3 border-t border-[#F1F5F9]">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {durationLabel(tour.estimatedDurationMin)}
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-3 h-3" />
            max {tour.maxTeams}
          </span>
          <span className="flex items-center gap-1">
            <Star className="w-3 h-3" />
            {tour.checkpointCount} CP
          </span>
          <span className="ml-auto flex items-center gap-1 text-[#0F172A] font-bold group-hover:text-[#00C853] transition-colors">
            Bekijk <ChevronRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function TochtenFilter({ tours }: { tours: TourRow[] }) {
  const searchParams = useSearchParams()
  const initialVariant = searchParams.get('variant') ?? 'alle'
  const [activeVariant,  setActiveVariant]  = useState(initialVariant)
  const [activeLocation, setActiveLocation] = useState('alle')
  const [search,         setSearch]         = useState('')

  const locations = useMemo(() => {
    const s = new Set<string>()
    tours.forEach((t) => { if (t.aiConfig?.location) s.add(t.aiConfig.location as string) })
    return Array.from(s).sort()
  }, [tours])

  const filtered = useMemo(() => tours.filter((t) => {
    if (activeVariant !== 'alle' && t.variant !== activeVariant) return false
    if (activeLocation !== 'alle' && (t.aiConfig?.location as string) !== activeLocation) return false
    if (search.trim()) {
      const q = search.toLowerCase()
      if (!`${t.name} ${t.description ?? ''} ${t.aiConfig?.location ?? ''}`.toLowerCase().includes(q)) return false
    }
    return true
  }), [tours, activeVariant, activeLocation, search])

  return (
    <div>
      {/* ── Sticky filter bar ── */}
      <div className="sticky top-14 z-40 bg-white/95 backdrop-blur border-b border-[#E2E8F0] shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8">
          {/* Variant tabs */}
          <div className="flex items-center gap-1 py-3 overflow-x-auto scrollbar-none">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveVariant(tab.key)}
                className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-bold transition-colors ${
                  activeVariant === tab.key
                    ? 'bg-[#0F172A] text-white'
                    : 'text-[#64748B] hover:bg-[#F1F5F9]'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Location + search */}
          <div className="flex items-center gap-2 pb-3 overflow-x-auto scrollbar-none">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
            <button
              onClick={() => setActiveLocation('alle')}
              className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                activeLocation === 'alle'
                  ? 'bg-[#00E676] text-[#0F172A] border-[#00E676]'
                  : 'border-[#E2E8F0] text-[#64748B] hover:border-[#00E676]'
              }`}
            >
              Alle regio&apos;s
            </button>
            {locations.map((loc) => (
              <button
                key={loc}
                onClick={() => setActiveLocation(loc)}
                className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-bold border transition-colors ${
                  activeLocation === loc
                    ? 'bg-[#00E676] text-[#0F172A] border-[#00E676]'
                    : 'border-[#E2E8F0] text-[#64748B] hover:border-[#00E676]'
                }`}
              >
                {loc}
              </button>
            ))}
            <div className="ml-auto relative shrink-0">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
              <input
                type="text"
                placeholder="Zoek..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs rounded-full border border-[#E2E8F0] focus:border-[#00E676] outline-none w-32"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-6xl mx-auto px-4 md:px-8 py-10">
        {filtered.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-4xl mb-4">🔍</p>
            <p className="text-[#64748B] font-semibold">Geen tochten gevonden</p>
            <button
              onClick={() => { setActiveVariant('alle'); setActiveLocation('alle'); setSearch('') }}
              className="mt-3 text-sm font-bold text-[#00C853] hover:underline"
            >
              Reset filters
            </button>
          </div>
        ) : (
          <>
            <p className="text-xs text-[#94A3B8] mb-6">
              {filtered.length} tocht{filtered.length !== 1 ? 'en' : ''} gevonden
              {activeLocation !== 'alle' ? ` in ${activeLocation}` : ''}
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map((t) => <TourCard key={t.id} tour={t} />)}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
