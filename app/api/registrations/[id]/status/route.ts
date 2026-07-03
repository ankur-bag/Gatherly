import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import * as RegistrationController from '@/controllers/RegistrationController'

export const runtime = 'nodejs'

bootstrap()

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status } = body

    if (!status) {
      return NextResponse.json({ error: 'Missing status' }, { status: 400 })
    }

    const result = await RegistrationController.updateStatus(userId, id, status)
    return NextResponse.json({ data: result })
  } catch (error: any) {
    console.error('PATCH /api/registrations/[id]/status error:', error)
    if (error.message === 'Not found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    if (error.message.startsWith('Cannot transition')) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    if (error.message === 'Event is full') {
      return NextResponse.json({ error: 'Event is full' }, { status: 409 })
    }
    if (error.message === 'Event is cancelled') {
      return NextResponse.json({ error: 'Event is cancelled' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
