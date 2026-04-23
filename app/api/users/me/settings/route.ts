import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import * as UserController from '@/controllers/UserController'

bootstrap()

export async function PATCH(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = await UserController.updateSettings(userId, body)
    return NextResponse.json({ data: result })
  } catch (error: any) {
    console.error('PATCH /api/users/me/settings error:', error)
    if (error.message === 'Not found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (error.message === 'Missing required fields') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
