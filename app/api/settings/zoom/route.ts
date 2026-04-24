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
    const isSynced = Boolean(user.zoomAccountId && user.zoomClientId && user.zoomClientSecret)
    
    return NextResponse.json({ status: isSynced ? 'synced' : 'pending' })
  } catch (error: any) {
    console.error('GET /api/settings/zoom error:', error)
    if (error.message === 'Not found') {
      return NextResponse.json({ status: 'pending' })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    
    if (body.action === 'connect') {
      const zoomAccountId = process.env.ZOOM_ACCOUNT_ID || ''
      const zoomClientId = process.env.ZOOM_CLIENT_ID || ''
      const zoomClientSecret = process.env.ZOOM_CLIENT_SECRET || ''

      if (!zoomAccountId || !zoomClientId || !zoomClientSecret) {
        return NextResponse.json(
          { error: 'Zoom environment variables are missing. Please configure ZOOM_ACCOUNT_ID, ZOOM_CLIENT_ID, and ZOOM_CLIENT_SECRET.' },
          { status: 400 }
        )
      }

      await UserController.updateSettings(userId, {
        zoomAccountId,
        zoomClientId,
        zoomClientSecret,
      })
      return NextResponse.json({ status: 'synced' })
    } else if (body.action === 'disconnect') {
      await UserController.updateSettings(userId, {
        zoomAccountId: '',
        zoomClientId: '',
        zoomClientSecret: '',
      })
      return NextResponse.json({ status: 'pending' })
    }
    
    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error: any) {
    console.error('POST /api/settings/zoom error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
