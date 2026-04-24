import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import * as AiController from '@/controllers/AiController'

bootstrap()

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const revised = await AiController.improveEventDescription(userId, body?.description || '')

    return NextResponse.json({ data: { revisedDescription: revised } })
  } catch (error: any) {
    console.error('POST /api/ai/improve-description error:', error)

    if (error.message === 'Description is required') {
      return NextResponse.json({ error: 'Description is required' }, { status: 400 })
    }

    if (error.message === 'AI service is not configured') {
      return NextResponse.json({ error: 'AI service is not configured' }, { status: 500 })
    }

    if (typeof error.message === 'string' && error.message.startsWith('AI service request failed')) {
      return NextResponse.json({ error: error.message }, { status: 502 })
    }

    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
