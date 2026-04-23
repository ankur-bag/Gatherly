import mongoose, { Schema, Document } from 'mongoose'

export type EventStatus = 'draft' | 'published' | 'cancelled'
export type RegistrationMode = 'open' | 'shortlisted'
export type ZoomSyncStatus = 'pending' | 'synced' | 'failed' | 'cancelled'

export interface IEvent extends Document {
  organizerClerkId: string
  title: string
  description: string
  dateTime: Date
  venue?: string
  isOnline: boolean
  capacity: number
  registrationMode: RegistrationMode
  slugBase: string
  slug: string
  status: EventStatus
  templateUsed?: string
  zoomMeetingId?: string
  zoomJoinUrl?: string
  zoomSyncStatus?: ZoomSyncStatus
  reminderSentAt?: Date
  createdAt: Date
  updatedAt: Date
}

const EventSchema = new Schema<IEvent>(
  {
    organizerClerkId: { type: String, required: true, index: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    dateTime: { type: Date, required: true },
    venue: { type: String },
    isOnline: { type: Boolean, required: true, default: false },
    capacity: { type: Number, required: true },
    registrationMode: { type: String, enum: ['open', 'shortlisted'], required: true },
    slugBase: { type: String, required: true, index: true },
    slug: { type: String, required: true, index: true }, // Keeping temporarily for backward compatibility
    status: { type: String, enum: ['draft', 'published', 'cancelled'], default: 'draft' },
    templateUsed: { type: String },
    zoomMeetingId: { type: String },
    zoomJoinUrl: { type: String },
    zoomSyncStatus: { type: String, enum: ['pending', 'synced', 'failed', 'cancelled'] },
    reminderSentAt: { type: Date },
  },
  { timestamps: true }
)

export default mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema)
