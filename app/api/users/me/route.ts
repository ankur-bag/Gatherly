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

    const result = await UserController.getByClerkId(userId)
    return NextResponse.json({ data: result })
  } catch (error: any) {
    console.error('GET /api/users/me error:', error)
    if (error.message === 'Not found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
