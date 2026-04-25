import { dbConnect } from '@/lib/mongodb'
import User from '@/models/User'
import { IUser } from '@/types'
import type { ZoomConnectionStatus } from '@/models/User'

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

type ZoomConnectionUpdate = {
  zoomConnected: boolean
  zoomConnectionStatus: ZoomConnectionStatus
  zoomAccessToken?: string | null
  zoomRefreshToken?: string | null
  zoomTokenExpiry?: Date | null
  zoomEmail?: string | null
  zoomDisplayName?: string | null
  zoomError?: string | null
  zoomLastError?: string | null
}

export async function updateZoomConnection(clerkId: string, update: ZoomConnectionUpdate): Promise<IUser> {
  await dbConnect()

  const user = await User.findOneAndUpdate(
    { clerkId },
    {
      $set: {
        zoomConnected: update.zoomConnected,
        zoomConnectionStatus: update.zoomConnectionStatus,
        zoomAccessToken: update.zoomAccessToken ?? null,
        zoomRefreshToken: update.zoomRefreshToken ?? null,
        zoomTokenExpiry: update.zoomTokenExpiry ?? null,
        zoomEmail: update.zoomEmail ?? null,
        zoomDisplayName: update.zoomDisplayName ?? null,
        zoomError: update.zoomError ?? null,
        zoomLastError: update.zoomLastError ?? null,
      },
    },
    { returnDocument: 'after' }
  )

  if (!user) {
    throw new Error('Not found')
  }

  return user.toObject()
}

export async function clearZoomConnection(clerkId: string): Promise<IUser> {
  await dbConnect()

  const user = await User.findOneAndUpdate(
    { clerkId },
    {
      $set: {
        zoomConnected: false,
        zoomConnectionStatus: 'disconnected',
        zoomLastError: null,
      },
      $unset: {
        zoomAccessToken: 1,
        zoomRefreshToken: 1,
        zoomTokenExpiry: 1,
        zoomEmail: 1,
        zoomDisplayName: 1,
        zoomError: 1,
        zoomAccountId: 1,
        zoomClientId: 1,
        zoomClientSecret: 1,
      },
    },
    { returnDocument: 'after' }
  )

  if (!user) {
    throw new Error('Not found')
  }

  return user.toObject()
}
