import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import * as UserController from '@/controllers/UserController'

bootstrap()

export async function GET(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await UserController.getByClerkId(userId)
    const connected = Boolean(user.zoomConnected)

    return NextResponse.json({
      connected,
      status: user.zoomConnectionStatus || (connected ? 'connected' : 'disconnected'),
      zoomEmail: user.zoomEmail || null,
      zoomDisplayName: user.zoomDisplayName || null,
      zoomTokenExpiry: user.zoomTokenExpiry || null,
      zoomError: user.zoomError || null,
      zoomLastError: user.zoomLastError || null,
    })
  } catch (error: any) {
    console.error('GET /api/settings/zoom error:', error)
    if (error.message === 'Not found') {
      return NextResponse.json({
        connected: false,
        status: 'disconnected',
        zoomEmail: null,
        zoomDisplayName: null,
        zoomTokenExpiry: null,
        zoomError: null,
        zoomLastError: null,
      })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  return NextResponse.json(
    {
      error:
        'Manual connect/disconnect is disabled. Configure Zoom credentials via environment variables.',
    },
    { status: 405 }
  )
}
