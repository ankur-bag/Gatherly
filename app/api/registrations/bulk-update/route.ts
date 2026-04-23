import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { bootstrap } from '@/lib/bootstrap'
import * as RegistrationController from '@/controllers/RegistrationController'

bootstrap()

export async function POST(req: Request) {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { registrationIds, action } = body

    if (!registrationIds || !Array.isArray(registrationIds) || registrationIds.length === 0) {
      return NextResponse.json({ error: 'Missing registrationIds' }, { status: 400 })
    }

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 })
    }

    // Map action to status
    const statusMap: Record<string, string> = {
      approve: 'confirmed',
      reject: 'rejected'
    }

    const newStatus = statusMap[action]
    if (!newStatus) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }

    const result = await RegistrationController.bulkUpdateStatus(userId, registrationIds, newStatus as any)
    return NextResponse.json({ data: result })
  } catch (error: any) {
    console.error('POST /api/registrations/bulk-update error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
