import { dbConnect } from '@/lib/mongodb'
import User from '@/models/User'
import { IUser } from '@/types'

export async function syncOrGet(clerkId: string, { name, email }: { name: string; email: string }): Promise<IUser> {
  await dbConnect()

  if (!clerkId || !name || !email) {
    throw new Error('Missing required fields')
  }

  const user = await User.findOneAndUpdate(
    { clerkId },
    {
      clerkId,
      name,
      email,
    },
    { upsert: true, returnDocument: 'after' }
  )

  return user.toObject()
}

export async function getByClerkId(clerkId: string): Promise<IUser> {
  await dbConnect()

  const user = await User.findOne({ clerkId })
  if (!user) {
    throw new Error('Not found')
  }

  return user.toObject()
}

export async function updateSettings(
  clerkId: string,
  { zoomAccountId, zoomClientId, zoomClientSecret }: { zoomAccountId?: string; zoomClientId?: string; zoomClientSecret?: string }
): Promise<IUser> {
  await dbConnect()

  const updateData: Record<string, any> = {}

  if (zoomAccountId !== undefined) {
    updateData.zoomAccountId = zoomAccountId
  }
  if (zoomClientId !== undefined) {
    updateData.zoomClientId = zoomClientId
  }
  if (zoomClientSecret !== undefined) {
    updateData.zoomClientSecret = zoomClientSecret
  }

  const user = await User.findOneAndUpdate({ clerkId }, updateData, { returnDocument: 'after' })
  if (!user) {
    throw new Error('Not found')
  }

  return user.toObject()
}
