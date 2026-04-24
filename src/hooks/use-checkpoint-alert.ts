'use client'

import { useCallback, useRef } from 'react'

function playCheckpointSound() {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new AudioCtx()

    // Stijgende drieklank: C5 → E5 → G5
    const notes = [
      { freq: 523.25, start: 0,    duration: 0.18 },
      { freq: 659.25, start: 0.14, duration: 0.20 },
      { freq: 783.99, start: 0.28, duration: 0.35 },
    ]

    notes.forEach(({ freq, start, duration }) => {
      const osc  = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.type = 'sine'
      osc.frequency.value = freq
      const t = ctx.currentTime + start
      gain.gain.setValueAtTime(0, t)
      gain.gain.linearRampToValueAtTime(0.28, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, t + duration)
      osc.start(t)
      osc.stop(t + duration)
    })

    setTimeout(() => ctx.close(), 1200)
  } catch {
    // Web Audio API niet beschikbaar
  }
}

function triggerVibration() {
  if (!('vibrate' in navigator)) return
  // Twee korte trillingen: je bent er!
  navigator.vibrate([180, 80, 180])
}

export function useCheckpointAlert() {
  const firedRef = useRef(false)

  const onNearbyCheckpoint = useCallback((isNearby: boolean) => {
    if (isNearby && !firedRef.current) {
      firedRef.current = true
      triggerVibration()
      playCheckpointSound()
    } else if (!isNearby) {
      firedRef.current = false
    }
  }, [])

  return { onNearbyCheckpoint }
}
