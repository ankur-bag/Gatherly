import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import * as RegistrationController from '@/controllers/RegistrationController'

export const runtime = 'nodejs'

bootstrap()

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const body = await req.json()
    const result = await RegistrationController.create(id, body)
    return NextResponse.json({ data: result }, { status: 201 })
  } catch (error: any) {
    console.error('POST /api/events/[id]/registrations error:', error)
    if (error.message === 'Not found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (error.message === 'Missing required fields') {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (error.message.startsWith('Event is')) {
      return NextResponse.json({ error: error.message }, { status: 409 })
    }
    if (error.message === 'Already registered') {
      return NextResponse.json({ error: 'Already registered' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const url = new URL(req.url)
    const search = url.searchParams.get('search') || undefined
    const status = url.searchParams.get('status') || undefined

    const result = await RegistrationController.list(userId, id, { search: search, status: status })
    return NextResponse.json({ data: result })
  } catch (error: any) {
    console.error('GET /api/events/[id]/registrations error:', error)
    if (error.message === 'Not found') {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    if (error.message === 'Forbidden') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
