import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import * as EventController from '@/controllers/EventController'

bootstrap()

export async function POST(req: Request, { params }: { params: { id: string } }) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const result = await EventController.publish(userId, params.id)
    return NextResponse.json({ data: result })
  } catch (error: any) {
    console.error('POST /api/events/[id]/publish error:', error)
    if (error.message === 'Not found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (error.message === 'Missing required fields' || error.message === 'In-person events must have a venue') {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
