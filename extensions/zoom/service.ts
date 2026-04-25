import { dbConnect } from '@/lib/mongodb'
import User from '@/models/User'
import { IEvent, IUser } from '@/types'

type ZoomOAuthTokenResponse = {
  access_token?: string
  refresh_token?: string
  expires_in?: number
}

type ZoomUserInfo = {
  email?: string
  display_name?: string
}

function getZoomClientCredentials() {
  const clientId = process.env.ZOOM_CLIENT_ID || ''
  const clientSecret = process.env.ZOOM_CLIENT_SECRET || ''

  if (!clientId || !clientSecret) {
    throw new Error('Zoom OAuth credentials are missing. Set ZOOM_CLIENT_ID and ZOOM_CLIENT_SECRET.')
  }

  return { clientId, clientSecret }
}

function basicAuthHeader(clientId: string, clientSecret: string): string {
  return `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString('base64')}`
}

async function requestTokenResponse(params: {
  grantType: 'authorization_code' | 'refresh_token'
  code?: string
  refreshToken?: string
  redirectUri?: string
}): Promise<ZoomOAuthTokenResponse> {
  const { clientId, clientSecret } = getZoomClientCredentials()

  const body = new URLSearchParams({ grant_type: params.grantType })
  if (params.code) {
    body.set('code', params.code)
  }
  if (params.refreshToken) {
    body.set('refresh_token', params.refreshToken)
  }
  if (params.redirectUri) {
    body.set('redirect_uri', params.redirectUri)
  }

  const res = await fetch('https://zoom.us/oauth/token', {
    method: 'POST',
    headers: {
      Authorization: basicAuthHeader(clientId, clientSecret),
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body,
    cache: 'no-store',
  })

  const data = (await res.json().catch(() => ({}))) as ZoomOAuthTokenResponse & {
    error?: string
    error_description?: string
  }

  if (!res.ok) {
    const message = data.error_description || data.error || `Status ${res.status}`
    throw new Error(`Failed to fetch Zoom token (${res.status}): ${message}`)
  }

  if (!data.access_token) {
    throw new Error('Zoom token response missing access_token')
  }

  return data
}

async function fetchZoomUserInfo(accessToken: string): Promise<ZoomUserInfo> {
  const res = await fetch('https://api.zoom.us/v2/users/me', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`Failed to fetch Zoom account details (${res.status}): ${errorBody}`)
  }

  return (await res.json()) as ZoomUserInfo
}

function classifyRefreshFailure(message: string): 'expired' | 'revoked' {
  const normalized = message.toLowerCase()
  if (normalized.includes('invalid_grant') || normalized.includes('revoked') || normalized.includes('refresh token')) {
    return 'revoked'
  }
  return 'expired'
}

async function loadZoomUser(clerkId: string) {
  await dbConnect()
  const user = await User.findOne({ clerkId })
  if (!user) {
    throw new Error('Not found')
  }
  return user
}

export async function completeZoomOAuthConnection(clerkId: string, code: string, redirectUri: string): Promise<IUser> {
  const tokenData = await requestTokenResponse({
    grantType: 'authorization_code',
    code,
    redirectUri,
  })

  if (!tokenData.refresh_token) {
    throw new Error('Zoom token response missing refresh_token')
  }

  const accessToken = tokenData.access_token
  const refreshToken = tokenData.refresh_token
  if (!accessToken) {
    throw new Error('Zoom token response missing access_token')
  }
  const expiresIn = tokenData.expires_in ?? 3600
  const userInfo = await fetchZoomUserInfo(accessToken)

  const user = await loadZoomUser(clerkId)
  user.zoomConnected = true
  user.zoomConnectionStatus = 'connected'
  user.zoomAccessToken = accessToken
  user.zoomRefreshToken = refreshToken
  user.zoomTokenExpiry = new Date(Date.now() + expiresIn * 1000)
  user.zoomEmail = userInfo.email || user.zoomEmail
  user.zoomDisplayName = userInfo.display_name || user.zoomDisplayName
  user.zoomError = null
  user.zoomLastError = null
  await user.save()

  return user.toObject()
}

export async function getUserAccessToken(organizer?: IUser): Promise<string> {
  if (!organizer?.clerkId) {
    throw new Error('Zoom disconnected, please reconnect')
  }

  if (!organizer.zoomConnected) {
    throw new Error('Zoom disconnected, please reconnect')
  }

  const hasValidAccessToken = Boolean(
    organizer.zoomConnected &&
      organizer.zoomAccessToken &&
      organizer.zoomTokenExpiry &&
      new Date(organizer.zoomTokenExpiry).getTime() > Date.now() + 60_000
  )

  if (hasValidAccessToken && organizer.zoomAccessToken) {
    return organizer.zoomAccessToken
  }

  if (!organizer.zoomRefreshToken) {
    throw new Error('Zoom disconnected, please reconnect')
  }

  const user = await loadZoomUser(organizer.clerkId)
  user.zoomConnectionStatus = 'refreshing'
  await user.save()

  try {
    const tokenData = await requestTokenResponse({
      grantType: 'refresh_token',
      refreshToken: organizer.zoomRefreshToken,
    })

    if (!tokenData.refresh_token) {
      throw new Error('Zoom token response missing refresh_token')
    }

    const refreshedAccessToken = tokenData.access_token
    const refreshedRefreshToken = tokenData.refresh_token
    if (!refreshedAccessToken) {
      throw new Error('Zoom token response missing access_token')
    }
    const expiresIn = tokenData.expires_in ?? 3600

    user.zoomConnected = true
    user.zoomConnectionStatus = 'connected'
    user.zoomAccessToken = refreshedAccessToken
    user.zoomRefreshToken = refreshedRefreshToken
    user.zoomTokenExpiry = new Date(Date.now() + expiresIn * 1000)
    user.zoomError = null
    user.zoomLastError = null
    await user.save()

    return refreshedAccessToken
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    user.zoomConnected = false
    user.zoomConnectionStatus = classifyRefreshFailure(message)
    user.zoomAccessToken = null
    user.zoomRefreshToken = null
    user.zoomTokenExpiry = null
    user.zoomError = message
    user.zoomLastError = message
    await user.save()

    throw new Error('Zoom disconnected, please reconnect')
  }
}

// ─── Safe wrapper ─────────────────────────────────────────────────────────────
async function safeZoomCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (err) {
    console.error('[Zoom Error]', err)
    throw err
  }
}

// ─── Meetings ─────────────────────────────────────────────────────────────────
export async function createMeeting(event: IEvent, organizer?: IUser) {
  return safeZoomCall(async () => {
    const token = await getUserAccessToken(organizer)
    if (!token) {
      throw new Error('Zoom access token unavailable')
    }

    const res = await fetch('https://api.zoom.us/v2/users/me/meetings', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: event.title,
        type: 2, // Scheduled
        start_time: new Date(event.dateTime).toISOString(), // Explicit ISO with timezone
        duration: 60,
      }),
    })

    if (!res.ok) {
      const err = await res.text()
      throw new Error(`Failed to create Zoom meeting: ${res.status} ${err}`)
    }

    return res.json()
  })
}

export async function updateMeeting(meetingId: string, event: IEvent, organizer?: IUser) {
  return safeZoomCall(async () => {
    const token = await getUserAccessToken(organizer)

    const res = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        topic: event.title,
        start_time: new Date(event.dateTime).toISOString(), // Explicit ISO with timezone
      }),
    })

    if (res.status !== 204 && !res.ok) {
      const err = await res.text()
      throw new Error(`Failed to update Zoom meeting: ${res.status} ${err}`)
    }
  })
}

export async function deleteMeeting(meetingId: string, organizer?: IUser) {
  return safeZoomCall(async () => {
    const token = await getUserAccessToken(organizer)

    const res = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (res.status !== 204 && !res.ok) {
      const err = await res.text()
      throw new Error(`Failed to delete Zoom meeting: ${res.status} ${err}`)
    }
  })
}

export async function endMeeting(meetingId: string, organizer?: IUser) {
  return safeZoomCall(async () => {
    const token = await getUserAccessToken(organizer)

    const res = await fetch(`https://api.zoom.us/v2/meetings/${meetingId}/status`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ action: 'end' }),
    })

    if (res.status !== 204 && !res.ok) {
      const err = await res.text()
      throw new Error(`Failed to end Zoom meeting: ${res.status} ${err}`)
    }
  })
}
