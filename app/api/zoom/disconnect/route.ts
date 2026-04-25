import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import * as UserController from '@/controllers/UserController'

bootstrap()

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await UserController.clearZoomConnection(userId)
    return NextResponse.json({
      connected: Boolean(user.zoomConnected),
      status: user.zoomConnectionStatus || 'disconnected',
      zoomEmail: user.zoomEmail || null,
      zoomDisplayName: user.zoomDisplayName || null,
      zoomTokenExpiry: user.zoomTokenExpiry || null,
      zoomError: user.zoomError || null,
      zoomLastError: user.zoomLastError || null,
    })
  } catch (error) {
    console.error('POST /api/zoom/disconnect error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}