import { IUser, ZoomConnectionStatus } from '@/models/User'
import { IEvent, EventStatus, RegistrationMode, ZoomSyncStatus } from '@/models/Event'
import { IRegistration, RegistrationStatus } from '@/models/Registration'

export type { IUser, IEvent, IRegistration, EventStatus, RegistrationMode, RegistrationStatus, ZoomSyncStatus, ZoomConnectionStatus }

export type PublicStatus = 'Open' | 'Full' | 'Closed' | 'Cancelled' | null

export interface CreateEventInput {
  title: string
  description: string
  dateTime: Date
  venue?: string
  isOnline: boolean
  capacity: number
  registrationMode: RegistrationMode
  templateUsed?: string
  status?: EventStatus
}

export interface UpdateEventInput {
  title?: string
  description?: string
  dateTime?: Date
  venue?: string
  isOnline?: boolean
  capacity?: number
  registrationMode?: RegistrationMode
}

export interface CreateRegistrationInput {
  attendeeName: string
  attendeeEmail: string
}

export interface HookPayload {
  'registration.created': { registration: IRegistration; event: IEvent }
  'registration.approved': { registration: IRegistration; event: IEvent }
  'registration.rejected': { registration: IRegistration; event: IEvent }
  'registration.revoked': { registration: IRegistration; event: IEvent }
  'event.published': { event: IEvent; organizer: IUser }
  'event.updated': { event: IEvent; organizer: IUser; changedFields: string[] }
  'event.cancelled': { event: IEvent; organizer: IUser; activeRegistrations: IRegistration[] }
  'event.reminder': { eventId: string }
}
