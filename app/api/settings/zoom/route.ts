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
      await UserController.updateSettings(userId, {
        zoomAccountId: process.env.ZOOM_ACCOUNT_ID || '',
        zoomClientId: process.env.ZOOM_CLIENT_ID || '',
        zoomClientSecret: process.env.ZOOM_CLIENT_SECRET || '',
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
