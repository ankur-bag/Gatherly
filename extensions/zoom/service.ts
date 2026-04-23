import { IEvent, IUser } from '@/types'

export async function getAccessToken(organizer: IUser): Promise<string> {
  const accountId = organizer.zoomAccountId || process.env.ZOOM_ACCOUNT_ID
  const clientId = organizer.zoomClientId || process.env.ZOOM_CLIENT_ID
  const clientSecret = organizer.zoomClientSecret || process.env.ZOOM_CLIENT_SECRET

  if (!accountId || !clientId || !clientSecret) {
    throw new Error('Missing Zoom credentials')
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')
  const tokenUrl = `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${encodeURIComponent(accountId)}`

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Zoom token request failed (${response.status}): ${errorBody}`)
  }

  const data = (await response.json()) as { access_token?: string }
  if (!data.access_token) {
    throw new Error('Zoom token response missing access token')
  }

  return data.access_token
}

export async function createMeeting(event: IEvent, organizer: IUser): Promise<{ meetingId: string; joinUrl: string }> {
  const accessToken = await getAccessToken(organizer)

  const response = await fetch('https://api.zoom.us/v2/users/me/meetings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: event.title,
      type: 2,
      start_time: new Date(event.dateTime).toISOString(),
      duration: 60,
      timezone: 'UTC',
      agenda: event.description,
      settings: {
        join_before_host: false,
        waiting_room: true,
        approval_type: 2,
      },
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Zoom create meeting failed (${response.status}): ${errorBody}`)
  }

  const data = (await response.json()) as { id?: number | string; join_url?: string }
  if (!data.id || !data.join_url) {
    throw new Error('Zoom create meeting response missing id or join_url')
  }

  return {
    meetingId: String(data.id),
    joinUrl: data.join_url,
  }
}

export async function updateMeeting(meetingId: string, event: IEvent, organizer: IUser): Promise<void> {
  const accessToken = await getAccessToken(organizer)

  const response = await fetch(`https://api.zoom.us/v2/meetings/${encodeURIComponent(meetingId)}`, {
    method: 'PATCH',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      topic: event.title,
      start_time: new Date(event.dateTime).toISOString(),
      agenda: event.description,
      duration: 60,
      timezone: 'UTC',
    }),
    cache: 'no-store',
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Zoom update meeting failed (${response.status}): ${errorBody}`)
  }
}

export async function deleteMeeting(meetingId: string, organizer: IUser): Promise<void> {
  const accessToken = await getAccessToken(organizer)

  const response = await fetch(`https://api.zoom.us/v2/meetings/${encodeURIComponent(meetingId)}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
    cache: 'no-store',
  })

  if (!response.ok && response.status !== 404) {
    const errorBody = await response.text()
    throw new Error(`Zoom delete meeting failed (${response.status}): ${errorBody}`)
  }
}
