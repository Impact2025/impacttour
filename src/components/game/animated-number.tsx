'use client'

import { useEffect, useRef, useState } from 'react'

interface Props {
  value: number
  duration?: number   // ms
  className?: string
}

/**
 * Telt een getal op van 0 → value met een easeOut curve.
 * Herbruikbaar in CelebrationOverlay, Scoreboard, Rapport.
 */
export function AnimatedNumber({ value, duration = 800, className }: Props) {
  const [displayed, setDisplayed] = useState(0)
  const rafRef = useRef<number | null>(null)
  const startRef = useRef<number | null>(null)
  const startValueRef = useRef(0)

  useEffect(() => {
    startValueRef.current = displayed
    startRef.current = null

    const animate = (now: number) => {
      if (startRef.current === null) startRef.current = now
      const elapsed = now - startRef.current
      const progress = Math.min(elapsed / duration, 1)
      // easeOutCubic
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(startValueRef.current + (value - startValueRef.current) * eased)
      setDisplayed(current)
      if (progress < 1) {
        rafRef.current = requestAnimationFrame(animate)
      }
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration])

  return <span className={className}>{displayed}</span>
}
