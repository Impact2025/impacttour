'use client'

import { useEffect, useRef } from 'react'
import { getPusherClient } from '@/lib/pusher/client'

export interface GameEvents {
  'checkpoint-unlocked': {
    teamId: string
    teamName: string
    checkpointIndex: number
    checkpointName: string
    gmsEarned: number
  }
  'score-update': {
    teamId: string
    teamName: string
    totalGmsScore: number
    rank?: number
  }
  'session-status': {
    status: 'lobby' | 'active' | 'paused' | 'completed' | 'cancelled'
  }
  'team-position': {
    teamId: string
    teamName: string
    lat: number
    lng: number
    isOutsideGeofence?: boolean
  }
  'geofence-alert': {
    teamId: string
    teamName: string
    lat: number
    lng: number
  }
}

type EventHandler<T extends keyof GameEvents> = (data: GameEvents[T]) => void

type PollSnapshot = {
  status?: string
  scoreboard?: Array<{ teamName: string; totalGmsScore: number; rank: number }>
}

export interface PusherChannelOptions {
  /**
   * teamToken voor fallback-polling via /api/game/session/[sessionId].
   * Zonder dit wordt polling niet geactiveerd bij Pusher-disconnect.
   */
  teamToken?: string
  /** Polling interval in ms bij disconnect. Default: 5000 */
  pollIntervalMs?: number
}

/**
 * usePusherChannel
 * Abonneert op Pusher game channel voor realtime game events.
 * Valt automatisch terug op HTTP-polling als Pusher verbreekt.
 */
export function usePusherChannel(
  sessionId: string | null,
  handlers: Partial<{ [K in keyof GameEvents]: EventHandler<K> }>,
  options?: PusherChannelOptions
) {
  // Refs zodat polling-callbacks altijd de nieuwste handlers zien (geen stale closure)
  const handlersRef = useRef(handlers)
  handlersRef.current = handlers

  const optionsRef = useRef(options)
  optionsRef.current = options

  const pollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const prevSnapshotRef = useRef<PollSnapshot>({})

  useEffect(() => {
    if (!sessionId) return

    const pusher = getPusherClient()
    const channel = pusher.subscribe(`game-${sessionId}`)

    // Bind game event handlers
    Object.entries(handlers).forEach(([event, handler]) => {
      if (handler) channel.bind(event, handler)
    })

    // ─── Polling fallback ─────────────────────────────────────────────────────

    const startPolling = () => {
      if (pollTimerRef.current) return // al actief
      const token = optionsRef.current?.teamToken
      if (!token) return // geen token → polling niet mogelijk

      const intervalMs = optionsRef.current?.pollIntervalMs ?? 5000

      pollTimerRef.current = setInterval(async () => {
        try {
          const res = await fetch(`/api/game/session/${sessionId}`, {
            headers: { 'x-team-token': token },
          })
          if (!res.ok) return

          const data = await res.json()
          const h = handlersRef.current
          const prev = prevSnapshotRef.current

          // Synthetiseer session-status event
          if (h['session-status'] && data.status !== prev.status) {
            h['session-status']!({ status: data.status })
          }

          // Synthetiseer score-update per team (alleen gewijzigde scores)
          if (h['score-update'] && Array.isArray(data.scoreboard)) {
            for (const entry of data.scoreboard as PollSnapshot['scoreboard'] & object[]) {
              const prevEntry = prev.scoreboard?.find((p) => p.teamName === entry.teamName)
              if (!prevEntry || prevEntry.totalGmsScore !== entry.totalGmsScore) {
                h['score-update']!({
                  teamId: '',
                  teamName: entry.teamName,
                  totalGmsScore: entry.totalGmsScore,
                  rank: entry.rank,
                })
              }
            }
          }

          prevSnapshotRef.current = {
            status: data.status,
            scoreboard: data.scoreboard ?? [],
          }
        } catch {
          // Netwerk-fout — stilzwijgend doorgaan tot Pusher herstelt
        }
      }, intervalMs)
    }

    const stopPolling = () => {
      if (pollTimerRef.current) {
        clearInterval(pollTimerRef.current)
        pollTimerRef.current = null
      }
    }

    // Pusher connection state → polling aan/uit
    pusher.connection.bind('disconnected', startPolling)
    pusher.connection.bind('unavailable', startPolling)
    pusher.connection.bind('connected', stopPolling)

    return () => {
      pusher.connection.unbind('disconnected', startPolling)
      pusher.connection.unbind('unavailable', startPolling)
      pusher.connection.unbind('connected', stopPolling)
      stopPolling()
      Object.keys(handlers).forEach((event) => channel.unbind(event))
      pusher.unsubscribe(`game-${sessionId}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])
}

/**
 * useSpelleiderChannel
 * Abonneert op private spelleider channel (team posities + geofence alerts).
 * Noot: polling-fallback niet geïmplementeerd voor spelleider (aparte auth vereist).
 */
export function useSpelleiderChannel(
  sessionId: string | null,
  handlers: Partial<Pick<{ [K in keyof GameEvents]: EventHandler<K> }, 'team-position' | 'geofence-alert'>>
) {
  useEffect(() => {
    if (!sessionId) return

    const pusher = getPusherClient()
    const channel = pusher.subscribe(`private-game-${sessionId}`)

    Object.entries(handlers).forEach(([event, handler]) => {
      if (handler) channel.bind(event, handler)
    })

    return () => {
      Object.keys(handlers).forEach((event) => channel.unbind(event))
      pusher.unsubscribe(`private-game-${sessionId}`)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId])
}
