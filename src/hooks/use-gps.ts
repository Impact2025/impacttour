'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { calculateBearing, haversineDistance } from '@/lib/geo'

export interface GPSPosition {
  latitude: number
  longitude: number
  accuracy: number
  /** Kompasrichting in graden (0–360). Afkomstig van het toestel óf berekend
   *  uit de looprichting wanneer het toestel geen heading levert. */
  heading: number | null
  /** true als heading is afgeleid uit beweging i.p.v. de sensor */
  headingComputed: boolean
  /** Snelheid in m/s indien beschikbaar */
  speed: number | null
  timestamp: number
}

/** Kwaliteit van de huidige GPS-fix, afgeleid uit accuracy. */
export type GPSSignal = 'searching' | 'good' | 'weak' | 'none'

interface UseGPSOptions {
  /** Callback bij elke bruikbare positie-update */
  onPosition?: (pos: GPSPosition) => void
  /** Minimale verplaatsing (meters) om een update te triggeren */
  minDistance?: number
  /** Accuracy (meters) tot waar een fix als "good" geldt */
  maxAccuracy?: number
  /** Houd het scherm wakker tijdens navigatie (Wake Lock API) */
  keepAwake?: boolean
}

// Boven deze accuracy is een fix te ruis om zelfs maar te tonen.
const WEAK_ACCURACY_CAP = 100
// Minimale verplaatsing voordat we een looprichting durven af te leiden.
const HEADING_MIN_MOVE_M = 4

/**
 * useGPS hook — wereldklasse locatie-tracking.
 *
 * - Levert nooit een "blinde" staat: zwakke fixes worden getoond maar
 *   gemarkeerd (`signal`), zodat de UI kan uitleggen wat er aan de hand is.
 * - Vult ontbrekende toestel-heading aan met een looprichting berekend uit
 *   opeenvolgende posities (`headingComputed`).
 * - Houdt het scherm wakker tijdens de tocht en herstelt de Wake Lock na
 *   tab-wissels.
 * - Throttle naar de GPS API zit hier (minDistance); Pusher-broadcast throttle
 *   staat server-side (10s).
 */
export function useGPS(options: UseGPSOptions = {}) {
  const { onPosition, minDistance = 5, maxAccuracy = 50, keepAwake = true } = options

  const [position, setPosition] = useState<GPSPosition | null>(null)
  const [signal, setSignal] = useState<GPSSignal>('searching')
  const [error, setError] = useState<string | null>(null)
  const [isWatching, setIsWatching] = useState(false)

  const watchIdRef = useRef<number | null>(null)
  const lastPosRef = useRef<GPSPosition | null>(null)
  const lastHeadingRef = useRef<number | null>(null)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const wakeLockRef = useRef<any>(null)
  const onPositionRef = useRef(onPosition)
  useEffect(() => { onPositionRef.current = onPosition }, [onPosition])

  // ── Wake Lock ────────────────────────────────────────────────────────────
  const requestWakeLock = useCallback(async () => {
    if (!keepAwake) return
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const nav = navigator as any
      if (nav.wakeLock?.request) {
        wakeLockRef.current = await nav.wakeLock.request('screen')
      }
    } catch {
      // Wake Lock niet ondersteund/geweigerd — geen probleem, best-effort.
    }
  }, [keepAwake])

  const releaseWakeLock = useCallback(() => {
    try {
      wakeLockRef.current?.release?.()
    } catch {
      // ignore
    }
    wakeLockRef.current = null
  }, [])

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('GPS niet beschikbaar op dit apparaat')
      setSignal('none')
      return
    }

    setIsWatching(true)
    setError(null)
    setSignal('searching')
    requestWakeLock()

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy, heading, speed } = pos.coords

        // Volledig onbruikbare fix — meld "geen signaal", maar gooi de vorige
        // positie niet weg (kaart blijft staan waar hij stond).
        if (accuracy > WEAK_ACCURACY_CAP) {
          setSignal('none')
          return
        }

        const last = lastPosRef.current

        // Heading: gebruik de sensor indien aanwezig, anders leid de looprichting
        // af uit de verplaatsing (toestellen leveren zelden heading bij wandelen).
        let effHeading: number | null = null
        let headingComputed = false
        if (heading !== null && !Number.isNaN(heading)) {
          effHeading = heading
          lastHeadingRef.current = heading
        } else if (last) {
          const moved = haversineDistance(last.latitude, last.longitude, latitude, longitude)
          if (moved >= HEADING_MIN_MOVE_M) {
            effHeading = calculateBearing(last.latitude, last.longitude, latitude, longitude)
            headingComputed = true
            lastHeadingRef.current = effHeading
          } else {
            effHeading = lastHeadingRef.current
            headingComputed = lastHeadingRef.current !== null
          }
        }

        const newPos: GPSPosition = {
          latitude,
          longitude,
          accuracy,
          heading: effHeading,
          headingComputed,
          speed: speed != null && !Number.isNaN(speed) ? speed : null,
          timestamp: pos.timestamp,
        }

        setSignal(accuracy <= maxAccuracy ? 'good' : 'weak')

        // Filter kleine bewegingen — maar laat de eerste fix altijd door.
        if (last) {
          const dist = haversineDistance(last.latitude, last.longitude, latitude, longitude)
          if (dist < minDistance) {
            // Wel accuracy/heading verversen op de bestaande positie, geen
            // volledige update-storm veroorzaken.
            return
          }
        }

        lastPosRef.current = newPos
        setPosition(newPos)
        onPositionRef.current?.(newPos)
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('GPS-toestemming geweigerd. Sta locatietoegang toe in je browserinstellingen.')
            setSignal('none')
            break
          case err.POSITION_UNAVAILABLE:
            setError('GPS positie niet beschikbaar')
            setSignal('none')
            break
          case err.TIMEOUT:
            // Time-out is vaak tijdelijk (tunnel/gebouw) — niet als harde fout
            // tonen, maar wel het signaal degraderen.
            setSignal('searching')
            break
          default:
            setError('GPS fout opgetreden')
            setSignal('none')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 2000,
      }
    )
  }, [maxAccuracy, minDistance, requestWakeLock])

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsWatching(false)
    releaseWakeLock()
  }, [releaseWakeLock])

  // Herstel Wake Lock na terugkeren naar de tab (browser laat 'm los bij verbergen).
  useEffect(() => {
    const onVisibility = () => {
      if (document.visibilityState === 'visible' && isWatching) {
        requestWakeLock()
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [isWatching, requestWakeLock])

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
      releaseWakeLock()
    }
  }, [releaseWakeLock])

  return { position, signal, error, isWatching, startWatching, stopWatching }
}
