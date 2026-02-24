'use client'

import { useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Lightbulb, Smile, TrendingUp, Zap } from 'lucide-react'
import { AnimatedNumber } from './animated-number'
import type { CheckpointInfo } from '@/app/(game)/game/[sessionId]/page'

interface Props {
  checkpoint: CheckpointInfo | null
  earnedScore?: number
  onOpenMission: () => void
}

const dimensionDefs = [
  { key: 'connection', label: 'Verbinding', icon: Heart,      color: '#EC4899' },
  { key: 'meaning',    label: 'Betekenis',  icon: Lightbulb,  color: '#8B5CF6' },
  { key: 'joy',        label: 'Plezier',    icon: Smile,       color: '#F59E0B' },
  { key: 'growth',     label: 'Groei',      icon: TrendingUp,  color: '#00E676' },
] as const

// Confetti factory — lazy imported
let confettiFn: ((opts: Record<string, unknown>) => void) | null = null
async function fireConfetti() {
  if (!confettiFn) {
    const mod = await import('canvas-confetti')
    confettiFn = mod.default as (opts: Record<string, unknown>) => void
  }
  confettiFn({
    particleCount: 200,
    spread: 80,
    startVelocity: 45,
    origin: { x: 0.5, y: 0.4 },
    colors: ['#00E676', '#0F172A', '#F59E0B', '#FFFFFF', '#00C853'],
    ticks: 200,
  })
}

export function CelebrationOverlay({ checkpoint, earnedScore = 0, onOpenMission }: Props) {
  const firedRef = useRef(false)

  useEffect(() => {
    if (checkpoint && !firedRef.current) {
      firedRef.current = true
      fireConfetti()
    }
    if (!checkpoint) firedRef.current = false
  }, [checkpoint])

  return (
    <AnimatePresence>
      {checkpoint && (
        <motion.div
          key="celebration"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-[2000] bg-[#0F172A] flex flex-col items-center justify-center px-6"
          style={{ backgroundImage: 'radial-gradient(ellipse at center, #0f2a1a 0%, #0F172A 70%)' }}
        >
          {/* Checkpoint nummer */}
          <motion.div
            initial={{ scale: 0, rotate: -20 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 16, delay: 0.1 }}
            className="mb-5"
          >
            <div
              className="w-28 h-28 rounded-full border-4 border-[#00E676] flex items-center justify-center"
              style={{ boxShadow: '0 0 40px rgba(0,230,118,0.4), 0 0 80px rgba(0,230,118,0.15)' }}
            >
              <span
                className="text-6xl font-black text-[#00E676]"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {checkpoint.orderIndex + 1}
              </span>
            </div>
          </motion.div>

          {/* Titel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.4 }}
            className="text-center mb-2"
          >
            <p className="text-[10px] font-bold text-[#00E676] uppercase tracking-widest mb-1">
              Checkpoint ontgrendeld!
            </p>
            <h2
              className="text-4xl font-black italic text-white uppercase tracking-tight"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {checkpoint.name}
            </h2>
          </motion.div>

          {/* Score counter */}
          {earnedScore > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
              className="flex items-baseline gap-1.5 mb-6"
            >
              <AnimatedNumber
                value={earnedScore}
                duration={700}
                className="text-5xl font-black text-[#00E676]"
              />
              <span className="text-lg font-bold text-[#64748B]">GMS punten</span>
            </motion.div>
          )}

          {/* GMS dimension badges — staggered */}
          <div className="flex gap-3 mb-8 flex-wrap justify-center">
            {dimensionDefs.map((dim, i) => (
              <motion.div
                key={dim.key}
                initial={{ opacity: 0, y: 24, scale: 0.7 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  delay: 0.5 + i * 0.12,
                  type: 'spring',
                  stiffness: 300,
                  damping: 18,
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ backgroundColor: `${dim.color}20`, border: `1px solid ${dim.color}40` }}
              >
                <dim.icon className="w-3.5 h-3.5" style={{ color: dim.color }} />
                <span className="text-xs font-bold" style={{ color: dim.color }}>{dim.label}</span>
              </motion.div>
            ))}
          </div>

          {/* CTA knop */}
          <motion.button
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.0, type: 'spring', stiffness: 280, damping: 14 }}
            onClick={onOpenMission}
            className="flex items-center gap-2.5 px-8 py-4 bg-[#00E676] text-[#0F172A] rounded-2xl font-black italic text-lg uppercase tracking-wide active:scale-95 transition-transform"
            style={{
              fontFamily: 'var(--font-display)',
              boxShadow: '0 0 0 4px rgba(0,230,118,0.25), 0 8px 32px rgba(0,230,118,0.40)',
            }}
          >
            <Zap className="w-5 h-5" fill="#0F172A" />
            Open Missie
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
