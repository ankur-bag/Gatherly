import { IEvent, IUser } from '@/types'

export async function getAccessToken(organizer: IUser): Promise<string> {
  // TODO: Implement Zoom OAuth token exchange
  throw new Error('Not implemented')
}

export async function createMeeting(event: IEvent, organizer: IUser): Promise<{ meetingId: string; joinUrl: string }> {
  // TODO: Create Zoom meeting via /v2/users/me/meetings
  throw new Error('Not implemented')
}

export async function updateMeeting(meetingId: string, event: IEvent, organizer: IUser): Promise<void> {
  // TODO: Update Zoom meeting via /v2/meetings/{id}
  throw new Error('Not implemented')
}

export async function deleteMeeting(meetingId: string, organizer: IUser): Promise<void> {
  // TODO: Delete Zoom meeting via /v2/meetings/{id}
  throw new Error('Not implemented')
}
