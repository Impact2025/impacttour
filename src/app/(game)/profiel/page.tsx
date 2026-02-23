'use client'

import { useState } from 'react'
import { Settings, Heart, Lightbulb, Smile, TrendingUp } from 'lucide-react'
import { MobileShell } from '@/components/layout/mobile-shell'
import { PageHeader } from '@/components/layout/page-header'
import { BottomNav } from '@/components/ui/bottom-nav'
import { AvatarRing } from '@/components/ui/avatar-ring'
import { MiniBarChart } from '@/components/ui/mini-bar-chart'
import { BadgeItem } from '@/components/ui/badge-item'
import { ProgressBar } from '@/components/ui/progress-bar'

type Tab = 'overzicht' | 'prestaties'

const DEMO = {
  name: 'Emma de Vries',
  team: 'Team Groen',
  positie: '#1 in het team',
  level: 12,
  stats: [
    { label: 'IMPACT PUNTEN', value: 1847 },
    { label: 'MISSIES', value: 32 },
    { label: 'GOALS', value: 18 },
  ],
  groeiData: [
    { day: 'Ma', value: 60, isCurrent: false },
    { day: 'Di', value: 72, isCurrent: false },
    { day: 'Wo', value: 68, isCurrent: false },
    { day: 'Do', value: 85, isCurrent: false },
    { day: 'Vr', value: 91, isCurrent: true },
    { day: 'Za', value: 0, isCurrent: false },
    { day: 'Zo', value: 0, isCurrent: false },
  ],
  badges: [
    { icon: Heart, label: 'Verbinder', earned: true },
    { icon: Lightbulb, label: 'Creatief', earned: true },
    { icon: Smile, label: 'Enthousiast', earned: true },
    { icon: TrendingUp, label: 'Groeier', earned: true },
    { icon: Heart, label: 'Empathisch', earned: false },
    { icon: Lightbulb, label: 'Innovator', earned: false },
  ],
  prestaties: [
    { label: 'Voltooide Tochen', value: 5 },
    { label: 'Totale GMS Score', value: '1.847' },
    { label: 'Checkpoints Bereikt', value: 32 },
    { label: 'Teamactiviteiten', value: 18 },
  ],
}

export default function ProfielPage() {
  const [activeTab, setActiveTab] = useState<Tab>('overzicht')

  return (
    <MobileShell>
      <PageHeader title="Spelersprofiel" ActionIcon={Settings} />

      <div className="flex-1 overflow-y-auto">
        {/* Profiel hero */}
        <div className="animate-slide-up-fade stagger-1 px-4 pt-6 pb-4 flex flex-col items-center text-center border-b border-[#E2E8F0]">
          <AvatarRing name={DEMO.name} level={DEMO.level} size="xl" />
          <h2 className="text-lg font-bold text-[#0F172A] mt-5">{DEMO.name}</h2>
          <p className="text-sm text-[#64748B]">{DEMO.team}</p>
          <span className="mt-2 inline-flex items-center bg-[#DCFCE7] text-[#00C853] text-xs font-bold px-3 py-1 rounded-full">
            {DEMO.positie}
          </span>
          {/* LEVEL badge */}
          <span
            className="mt-2 inline-flex items-center bg-[#0F172A] text-[#00E676] text-xs font-bold px-3 py-1 rounded-full tracking-wider"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            LEVEL {DEMO.level}
          </span>
        </div>

        {/* Stats row */}
        <div className="animate-slide-up-fade stagger-2 px-4 py-4 flex gap-3 border-b border-[#E2E8F0]">
          {DEMO.stats.map((s) => (
            <div key={s.label} className="flex-1 flex flex-col items-center gap-1">
              <span
                className="text-2xl font-extrabold text-[#0F172A] leading-tight"
                style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
              >
                {typeof s.value === 'number' ? s.value.toLocaleString('nl-NL') : s.value}
              </span>
              <span className="text-[9px] text-[#94A3B8] font-semibold uppercase tracking-wider text-center leading-tight">
                {s.label}
              </span>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="animate-slide-up-fade stagger-3 flex border-b border-[#E2E8F0] px-4">
          {(['overzicht', 'prestaties'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-3 text-sm font-medium capitalize transition-all duration-200 border-b-2 active:scale-95 ${
                activeTab === tab
                  ? 'text-[#00C853] border-[#00E676]'
                  : 'text-[#64748B] border-transparent'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Tab inhoud — key triggert re-mount → fade-in animatie */}
        <div key={activeTab} className="animate-fade-in px-4 py-4 space-y-5">
          {activeTab === 'overzicht' && (
            <>
              {/* Sociale groei grafiek */}
              <div className="bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4">
                <h3 className="text-sm font-semibold text-[#0F172A] mb-3">Sociale Groei — Deze Week</h3>
                <MiniBarChart data={DEMO.groeiData} />
              </div>

              {/* Badges */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-[#0F172A]">Behaalde Badges</h3>
                  <span className="text-xs text-[#64748B]">
                    {DEMO.badges.filter((b) => b.earned).length}/{DEMO.badges.length}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {DEMO.badges.map((b, i) => (
                    <div
                      key={i}
                      className={`animate-scale-in stagger-${Math.min(i + 1, 8) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8} card-pressable`}
                    >
                      <BadgeItem Icon={b.icon} label={b.label} earned={b.earned} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'prestaties' && (
            <div className="space-y-3">
              {DEMO.prestaties.map((p, i) => (
                <div
                  key={p.label}
                  className={`animate-slide-up-fade stagger-${Math.min(i + 1, 8) as 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8} bg-white rounded-xl border border-[#E2E8F0] shadow-sm p-4`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-[#64748B]">{p.label}</span>
                    <span className="text-lg font-bold text-[#0F172A]">{p.value}</span>
                  </div>
                  <ProgressBar value={typeof p.value === 'number' ? p.value : 50} max={100} />
                </div>
              ))}
            </div>
          )}

          <div className="h-4" />
        </div>
      </div>

      <BottomNav activeTab="profiel" variant="simple" />
    </MobileShell>
  )
}
