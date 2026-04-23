import mongoose, { Schema, Document, Types } from 'mongoose'

export type RegistrationStatus = 'pending' | 'confirmed' | 'rejected' | 'revoked'

export interface IRegistration extends Document {
  eventId: Types.ObjectId
  attendeeName: string
  attendeeEmail: string
  status: RegistrationStatus
  createdAt: Date
  updatedAt: Date
}

const RegistrationSchema = new Schema<IRegistration>(
  {
    eventId: { type: Schema.Types.ObjectId, ref: 'Event', required: true, index: true },
    attendeeName: { type: String, required: true },
    attendeeEmail: { type: String, required: true },
    status: { type: String, enum: ['pending', 'confirmed', 'rejected', 'revoked'], default: 'pending' },
  },
  { timestamps: true }
)

// Unique index: prevent duplicate registrations (same email per event)
RegistrationSchema.index({ eventId: 1, attendeeEmail: 1 }, { unique: true })

export default mongoose.models.Registration || mongoose.model<IRegistration>('Registration', RegistrationSchema)
