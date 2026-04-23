import { currentUser, auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'
import { dbConnect } from '@/lib/mongodb'
import User from '@/models/User'

export async function POST() {
  try {
    const { userId } = await auth()
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const clerkUser = await currentUser()

    if (!clerkUser) {
      return NextResponse.json({ error: 'Clerk user not found' }, { status: 404 })
    }

    const user = await User.findOneAndUpdate(
      { clerkId: userId },
      {
        clerkId: userId,
        name: clerkUser.fullName || `${clerkUser.firstName} ${clerkUser.lastName}`.trim() || 'User',
        email: clerkUser.emailAddresses[0]?.emailAddress,
      },
      { upsert: true, new: true }
    )

    return NextResponse.json({ data: user.toObject() })
  } catch (error: any) {
    console.error('POST /api/users/me error:', error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
