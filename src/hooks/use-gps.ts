'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

export interface GPSPosition {
  latitude: number
  longitude: number
  accuracy: number
  timestamp: number
}

interface UseGPSOptions {
  /** Callback bij elke positie-update */
  onPosition?: (pos: GPSPosition) => void
  /** Minimale verplaatsing (meters) om update te triggeren */
  minDistance?: number
  /** Maximale GPS accuracy (meters) — slechter wordt genegeerd */
  maxAccuracy?: number
}

/**
 * useGPS hook
 * Wacht op Geolocation API, geeft realtime positie.
 * Throttle naar GPS API zit in de component zelf (min afstand).
 * Throttle voor Pusher broadcasts staat server-side (10s).
 */
export function useGPS(options: UseGPSOptions = {}) {
  const { onPosition, minDistance = 5, maxAccuracy = 50 } = options

  const [position, setPosition] = useState<GPSPosition | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isWatching, setIsWatching] = useState(false)
  const watchIdRef = useRef<number | null>(null)
  const lastPosRef = useRef<GPSPosition | null>(null)

  const haversine = (a: GPSPosition, b: GPSPosition): number => {
    const R = 6371000
    const toRad = (d: number) => (d * Math.PI) / 180
    const dLat = toRad(b.latitude - a.latitude)
    const dLon = toRad(b.longitude - a.longitude)
    const x =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(a.latitude)) *
        Math.cos(toRad(b.latitude)) *
        Math.sin(dLon / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
  }

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError('GPS niet beschikbaar op dit apparaat')
      return
    }

    setIsWatching(true)
    setError(null)

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords

        // Filter slechte accuracy
        if (accuracy > maxAccuracy) return

        const newPos: GPSPosition = {
          latitude,
          longitude,
          accuracy,
          timestamp: pos.timestamp,
        }

        // Filter kleine bewegingen
        if (lastPosRef.current) {
          const dist = haversine(lastPosRef.current, newPos)
          if (dist < minDistance) return
        }

        lastPosRef.current = newPos
        setPosition(newPos)
        onPosition?.(newPos)
      },
      (err) => {
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setError('GPS-toestemming geweigerd. Sta locatietoegang toe in je browserinstellingen.')
            break
          case err.POSITION_UNAVAILABLE:
            setError('GPS positie niet beschikbaar')
            break
          case err.TIMEOUT:
            setError('GPS time-out. Zorg voor een betere verbinding.')
            break
          default:
            setError('GPS fout opgetreden')
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 5000,
      }
    )
  }, [maxAccuracy, minDistance, onPosition])

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current)
      watchIdRef.current = null
    }
    setIsWatching(false)
  }, [])

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
      }
    }
  }, [])

  return { position, error, isWatching, startWatching, stopWatching }
}
