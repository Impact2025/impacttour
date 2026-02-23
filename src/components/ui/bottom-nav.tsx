'use client'

import { Home, Users, Plus, BarChart2, User, Zap, type LucideIcon } from 'lucide-react'

export type BottomNavTab = 'home' | 'teams' | 'add' | 'stats' | 'profiel' | 'impact'

interface TabDef {
  id: BottomNavTab
  label: string
  Icon: LucideIcon
  isFab?: boolean
}

const gameTabs: TabDef[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'teams', label: 'Teams', Icon: Users },
  { id: 'add', label: '', Icon: Plus, isFab: true },
  { id: 'stats', label: 'Stats', Icon: BarChart2 },
  { id: 'profiel', label: 'Profiel', Icon: User },
]

const simpleTabs: TabDef[] = [
  { id: 'home', label: 'Home', Icon: Home },
  { id: 'impact', label: 'Impact', Icon: Zap },
  { id: 'teams', label: 'Teams', Icon: Users },
  { id: 'profiel', label: 'Profiel', Icon: User },
]

interface BottomNavProps {
  activeTab?: BottomNavTab
  onTabChange?: (tab: BottomNavTab) => void
  variant?: 'game' | 'simple'
}

export function BottomNav({ activeTab, onTabChange, variant = 'game' }: BottomNavProps) {
  const tabs = variant === 'simple' ? simpleTabs : gameTabs

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#E2E8F0]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="flex items-end justify-around px-2 h-16">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id

          if (tab.isFab) {
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className="relative -top-5 flex items-center justify-center w-14 h-14 rounded-full bg-[#00E676] shadow-lg shadow-[#00E676]/40 active:scale-90 transition-transform duration-150"
                aria-label="Actie"
              >
                <Plus className="w-7 h-7 text-[#0F172A]" strokeWidth={2.5} />
              </button>
            )
          }

          return (
            <button
              key={tab.id}
              onClick={() => onTabChange?.(tab.id)}
              className="flex flex-col items-center justify-center flex-1 h-full active:scale-95 transition-transform duration-150"
            >
              <div
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-colors duration-200 ${
                  isActive ? 'bg-[#00E676]/12' : ''
                }`}
              >
                <tab.Icon
                  className={`w-5 h-5 transition-all duration-200 ${
                    isActive ? 'text-[#00C853]' : 'text-[#94A3B8]'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                <span
                  className={`text-[10px] font-semibold transition-colors duration-200 ${
                    isActive ? 'text-[#00C853]' : 'text-[#94A3B8]'
                  }`}
                >
                  {tab.label}
                </span>
              </div>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
