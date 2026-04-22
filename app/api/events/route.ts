import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import * as EventController from '@/controllers/EventController'

bootstrap()

export async function POST(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const result = await EventController.create(userId, body)
    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/events error:', error)
    if (error.message === 'Missing required fields') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: Request) {
  try {
    const { userId } = auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await EventController.list(userId)
    return NextResponse.json({ data: result })
  } catch (error: any) {
    console.error('GET /api/events error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
