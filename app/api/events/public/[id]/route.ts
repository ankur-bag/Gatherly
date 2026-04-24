import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import * as EventController from '@/controllers/EventController'

bootstrap()

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const result = await EventController.getByIdPublic(id)

    return NextResponse.json({
      data: {
        event: result.event,
        publicStatus: result.publicStatus,
        activeCount: result.activeCount,
      },
    })
  } catch (error: any) {
    console.error('GET /api/events/public/[id] error:', error)
    if (error.message === 'Not found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
