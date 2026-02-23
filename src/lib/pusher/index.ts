/**
 * Pusher server-side client (voor API routes)
 * Gebruik: import { pusherServer } from '@/lib/pusher'
 *
 * Pusher channel strategie:
 *   game-{sessionId}          → alle team events
 *   private-game-{sessionId}  → spelleider-only (geofence alerts)
 *   presence-lobby-{sessionId}→ lobby aanwezigheid
 */

import Pusher from 'pusher'

// Lazy singleton - voorkomt build-time fout als env vars ontbreken
let _pusher: Pusher | null = null
export function getPusherServer(): Pusher {
  if (!_pusher) {
    _pusher = new Pusher({
      appId: process.env.PUSHER_APP_ID!,
      key: process.env.PUSHER_KEY!,
      secret: process.env.PUSHER_SECRET!,
      cluster: process.env.PUSHER_CLUSTER!,
      useTLS: true,
    })
  }
  return _pusher
}

// Backwards compat alias
export const pusherServer = {
  trigger: (...args: Parameters<Pusher['trigger']>) => getPusherServer().trigger(...args),
  authorizeChannel: (...args: Parameters<Pusher['authorizeChannel']>) => getPusherServer().authorizeChannel(...args),
}

// ─── Event types ──────────────────────────────────────────────────────────────

/** Stuur GPS update van team naar spelleider */
export async function broadcastTeamPosition(
  sessionId: string,
  payload: {
    teamId: string
    teamName: string
    lat: number
    lng: number
    isOutsideGeofence?: boolean
  }
) {
  await pusherServer.trigger(`private-game-${sessionId}`, 'team-position', payload)
}

/** Broadcast checkpoint unlock naar alle deelnemers in sessie */
export async function broadcastCheckpointUnlocked(
  sessionId: string,
  payload: {
    teamId: string
    teamName: string
    checkpointIndex: number
    checkpointName: string
    gmsEarned: number
  }
) {
  await pusherServer.trigger(`game-${sessionId}`, 'checkpoint-unlocked', payload)
}

/** Broadcast score update naar scorebord */
export async function broadcastScoreUpdate(
  sessionId: string,
  payload: {
    teamId: string
    teamName: string
    totalGmsScore: number
    rank?: number
  }
) {
  await pusherServer.trigger(`game-${sessionId}`, 'score-update', payload)
}

/** Geofence alarm naar spelleider */
export async function broadcastGeofenceAlert(
  sessionId: string,
  payload: {
    teamId: string
    teamName: string
    lat: number
    lng: number
  }
) {
  await pusherServer.trigger(
    `private-game-${sessionId}`,
    'geofence-alert',
    payload
  )
}

/** Sessie status veranderd (bijv. 'active' → 'completed') */
export async function broadcastSessionStatus(
  sessionId: string,
  status: 'lobby' | 'active' | 'paused' | 'completed' | 'cancelled'
) {
  await pusherServer.trigger(`game-${sessionId}`, 'session-status', { status })
}
