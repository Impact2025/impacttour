import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const key = process.env.PUBLISH_API_KEY
  const auth = request.headers.get('authorization')
  return NextResponse.json({
    hasKey: Boolean(key),
    keyFirst8: key ? key.slice(0, 8) : null,
    keyLen: key ? key.length : 0,
    authHeader: auth,
    isVercel: process.env.VERCEL === '1',
  })
}
