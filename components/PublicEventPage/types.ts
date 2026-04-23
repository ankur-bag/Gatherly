import { IEvent } from '@/types'

export type PublicStatus = 'Open' | 'Full' | 'Closed' | 'Cancelled' | null

export interface PublicEventPayload {
  event: IEvent
  publicStatus: PublicStatus
  activeCount: number
}

export interface RegistrationFormState {
  attendeeName: string
  attendeeEmail: string
}

export interface FeedbackState {
  kind: 'success' | 'error'
  message: string
}