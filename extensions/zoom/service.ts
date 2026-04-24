// ─── Token cache ──────────────────────────────────────────────────────────────
let cachedToken: string | null = null
let tokenExpiry = 0

export async function getAccessToken(): Promise<string> {
  const now = Date.now()

  if (cachedToken && now < tokenExpiry) {
    return cachedToken
  }

  const url = new URL('https://zoom.us/oauth/token')
  url.searchParams.append('grant_type', 'account_credentials')
  url.searchParams.append('account_id', process.env.ZOOM_ACCOUNT_ID || '')

  const res = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      Authorization: `Basic ${Buffer.from(
        `${process.env.ZOOM_CLIENT_ID}:${process.env.ZOOM_CLIENT_SECRET}`
      ).toString('base64')}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
  })

  if (!res.ok) {
    throw new Error(`Failed to fetch Zoom access token: ${res.status}`)
  }

  const data = await res.json()

  cachedToken = data.access_token
  // Expire 60 seconds before actual expiry to be safe
  tokenExpiry = now + (data.expires_in - 60) * 1000

  return cachedToken as string
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
export async function createMeeting(event: any) {
  return safeZoomCall(async () => {
    const token = await getAccessToken()

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

export async function updateMeeting(meetingId: string, event: any) {
  return safeZoomCall(async () => {
    const token = await getAccessToken()

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

export async function deleteMeeting(meetingId: string) {
  return safeZoomCall(async () => {
    const token = await getAccessToken()

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
