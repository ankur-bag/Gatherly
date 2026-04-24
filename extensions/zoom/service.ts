import { IUser, IEvent } from '@/types'

type ZoomCredentials = {
  accountId: string
  clientId: string
  clientSecret: string
}

type TokenCacheEntry = {
  token: string
  expiresAt: number
}

const tokenCache = new Map<string, TokenCacheEntry>()

function credentialsKey(credentials: ZoomCredentials): string {
  return `${credentials.accountId}:${credentials.clientId}`
}

function buildCredentialCandidates(organizer?: IUser): ZoomCredentials[] {
  const candidates: ZoomCredentials[] = []

  const organizerCredentials: ZoomCredentials = {
    accountId: organizer?.zoomAccountId || '',
    clientId: organizer?.zoomClientId || '',
    clientSecret: organizer?.zoomClientSecret || '',
  }

  const envCredentials: ZoomCredentials = {
    accountId: process.env.ZOOM_ACCOUNT_ID || '',
    clientId: process.env.ZOOM_CLIENT_ID || '',
    clientSecret: process.env.ZOOM_CLIENT_SECRET || '',
  }

  if (organizerCredentials.accountId && organizerCredentials.clientId && organizerCredentials.clientSecret) {
    candidates.push(organizerCredentials)
  }

  if (envCredentials.accountId && envCredentials.clientId && envCredentials.clientSecret) {
    const isDifferentFromOrganizer =
      envCredentials.accountId !== organizerCredentials.accountId ||
      envCredentials.clientId !== organizerCredentials.clientId ||
      envCredentials.clientSecret !== organizerCredentials.clientSecret
    if (!candidates.length || isDifferentFromOrganizer) {
      candidates.push(envCredentials)
    }
  }

  return candidates
}

async function requestAccessToken(credentials: ZoomCredentials): Promise<string> {
  const now = Date.now()
  const cacheKey = credentialsKey(credentials)
  const cached = tokenCache.get(cacheKey)

  if (cached && now < cached.expiresAt) {
    return cached.token
  }

  const url = new URL('https://zoom.us/oauth/token')
  url.searchParams.append('grant_type', 'account_credentials')
  url.searchParams.append('account_id', credentials.accountId)

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(`${credentials.clientId}:${credentials.clientSecret}`).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    cache: 'no-store',
  })

  if (!res.ok) {
    const errorBody = await res.text()
    throw new Error(`Failed to fetch Zoom access token (${res.status}): ${errorBody}`)
  }

  const data = (await res.json()) as { access_token?: string; expires_in?: number }
  if (!data.access_token) {
    throw new Error('Zoom token response missing access_token')
  }

  const expiresIn = data.expires_in ?? 3600
  tokenCache.set(cacheKey, {
    token: data.access_token,
    expiresAt: now + Math.max(expiresIn - 60, 60) * 1000,
  })

  return data.access_token
}

export async function getAccessToken(organizer?: IUser): Promise<string> {
  const candidates = buildCredentialCandidates(organizer)
  if (!candidates.length) {
    throw new Error('Missing Zoom credentials. Set Zoom credentials in Settings or environment variables.')
  }

  const failures: string[] = []
  for (const candidate of candidates) {
    try {
      return await requestAccessToken(candidate)
    } catch (error) {
      const reason = error instanceof Error ? error.message : 'Unknown error'
      failures.push(reason)
    }
  }

  throw new Error(failures.join(' | '))
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
    const token = await getAccessToken(organizer)

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
    const token = await getAccessToken(organizer)

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
    const token = await getAccessToken(organizer)

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
    const token = await getAccessToken(organizer)

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
