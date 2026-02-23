import { auth } from '@/lib/auth'
import { pusherServer } from '@/lib/pusher'
import { NextResponse } from 'next/server'

/**
 * POST /api/pusher/auth
 * Authoriseert spelleiders voor private Pusher channels
 */
export async function POST(req: Request) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })

  const body = await req.text()
  const params = new URLSearchParams(body)
  const socketId = params.get('socket_id')
  const channelName = params.get('channel_name')

  if (!socketId || !channelName) {
    return NextResponse.json({ error: 'Ongeldige parameters' }, { status: 400 })
  }

  // Alleen spelleiders mogen private channels autoriseren
  const authResponse = pusherServer.authorizeChannel(socketId, channelName, {
    user_id: session.user.id,
    user_info: { role: session.user.role },
  })

  return NextResponse.json(authResponse)
}
