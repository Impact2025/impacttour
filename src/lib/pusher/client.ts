'use client'

/**
 * Pusher client-side singleton
 * Gebruik: import { getPusherClient } from '@/lib/pusher/client'
 */

import PusherClient from 'pusher-js'

let pusherClient: PusherClient | null = null

/**
 * Geeft de Pusher client terug, of null als de env vars niet geconfigureerd zijn.
 * Zelfde patroon als de server-side fix (fire-and-forget zonder crash).
 */
export function getPusherClient(): PusherClient | null {
  const key = process.env.NEXT_PUBLIC_PUSHER_KEY
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER
  if (!key || !cluster) return null

  if (!pusherClient) {
    pusherClient = new PusherClient(key, {
      cluster,
      channelAuthorization: {
        endpoint: '/api/pusher/auth',
        transport: 'ajax',
      },
    })
  }
  return pusherClient
}
