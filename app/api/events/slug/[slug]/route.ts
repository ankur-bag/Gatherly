import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import * as EventController from '@/controllers/EventController'

bootstrap()

export async function GET(req: Request, { params }: { params: { slug: string } }) {
  try {
    const result = await EventController.getBySlug(params.slug)
    return NextResponse.json({ data: result })
  } catch (error: any) {
    console.error('GET /api/events/slug/[slug] error:', error)
    if (error.message === 'Not found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
