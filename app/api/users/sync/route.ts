import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import * as UserController from '@/controllers/UserController'

bootstrap()

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { name, email } = body

    if (!name || !email) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const result = await UserController.syncOrGet(userId, { name, email })
    return NextResponse.json({ data: result })
  } catch (error: any) {
    console.error('POST /api/users/sync error:', error)
    if (error.message === 'Missing required fields') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
