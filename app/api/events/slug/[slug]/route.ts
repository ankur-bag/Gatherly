import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import * as EventController from '@/controllers/EventController'

bootstrap()

export async function GET(req: Request, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params
    const result = await EventController.getBySlug(slug)
    
    if (result.redirectUrl) {
      return NextResponse.json({ redirectUrl: result.redirectUrl }, { status: 301 })
    }

    return NextResponse.json({ data: result })
  } catch (error: any) {
    console.error('GET /api/events/slug/[slug] error:', error)
    if (error.message === 'Not found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
