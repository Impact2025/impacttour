'use client'

import { MapPin, Zap, FileText, ChevronRight } from 'lucide-react'

interface WelcomeOverlayProps {
  tourName: string
  teamName: string
  welcomeMessage: string | null
  variant: string
  totalCheckpoints: number
  onStart: () => void
}

const STEPS = [
  {
    icon: MapPin,
    title: 'Loop naar het checkpoint',
    description: 'De kaart wijst de weg. GPS geeft aan hoe ver je nog bent.',
  },
  {
    icon: Zap,
    title: 'Ontgrendel als je er bent',
    description: 'Binnen 50 meter verschijnt de unlock-knop automatisch.',
  },
  {
    icon: FileText,
    title: 'Doe de missie',
    description: 'Beantwoord de opdracht — hoe echter, hoe meer punten.',
  },
]

// VaarTocht: navigeren gaat per sloep en de unlock-zones op het water zijn ruimer
const STEPS_VAREN = [
  {
    icon: MapPin,
    title: 'Vaar naar het checkpoint',
    description: 'De kaart wijst de koers. GPS geeft aan hoe ver je nog bent.',
  },
  {
    icon: Zap,
    title: 'Ontgrendel op het water',
    description: 'De zones zijn ruim — vaar rustig aan, de unlock-knop verschijnt vanzelf.',
  },
  {
    icon: FileText,
    title: 'Doe de missie',
    description: 'Aan boord of aan land — hoe echter, hoe meer punten. Veiligheid eerst.',
  },
]

export function WelcomeOverlay({
  tourName,
  teamName,
  welcomeMessage,
  variant,
  totalCheckpoints,
  onStart,
}: WelcomeOverlayProps) {
  const isKoppel = variant === 'familietocht' || variant === 'koppeltocht'
  const isKids = variant === 'jeugdtocht' || variant === 'voetbalmissie'
  const isVaren = variant === 'vaartocht'
  const steps = isVaren ? STEPS_VAREN : STEPS

  return (
    <div className="absolute inset-0 z-[2000] flex items-end justify-center bg-black/60 backdrop-blur-sm">
      <div
        className="w-full max-w-md bg-white rounded-t-3xl overflow-hidden"
        style={{ boxShadow: '0 -8px 40px rgba(0,0,0,0.25)' }}
      >
        {/* Groene top-bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#00E676] via-[#00C853] to-[#69F0AE]" />

        <div className="px-6 pt-5 pb-8">
          {/* Header */}
          <div className="mb-5">
            <p className="text-xs font-bold text-[#00C853] uppercase tracking-widest mb-1">
              {teamName}
            </p>
            <h1
              className="text-2xl font-black text-[#0F172A] leading-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {tourName}
            </h1>
            <p className="text-sm text-[#64748B] mt-1">
              {totalCheckpoints} checkpoints · {isKoppel ? 'voor twee' : isKids ? 'voor de kids' : 'voor jullie team'}
            </p>
          </div>

          {/* Welkomstbericht van de spelleider */}
          {welcomeMessage && (
            <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-4 mb-5">
              <p className="text-sm text-[#166534] leading-relaxed">{welcomeMessage}</p>
            </div>
          )}

          {/* Hoe werkt het — 3 stappen */}
          <div className="space-y-3 mb-6">
            {steps.map(({ icon: Icon, title, description }, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-xl bg-[#F1F5F9] flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className="w-4.5 h-4.5 text-[#0F172A]" strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#0F172A]">{title}</p>
                  <p className="text-xs text-[#64748B] mt-0.5">{description}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Start knop */}
          <button
            onClick={onStart}
            className="w-full py-4 bg-[#00E676] text-[#0F172A] rounded-2xl font-black text-lg italic uppercase tracking-wide active:scale-95 transition-transform flex items-center justify-center gap-2"
            style={{
              fontFamily: 'var(--font-display)',
              boxShadow: '0 4px 20px rgba(0,230,118,0.35)',
            }}
          >
            {isKoppel ? 'Begin onze tocht' : 'Begin!'}
            <ChevronRight className="w-5 h-5" strokeWidth={3} />
          </button>
        </div>
      </div>
    </div>
  )
}
