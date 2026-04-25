import mongoose, { Schema, Document } from 'mongoose'

export type ZoomConnectionStatus = 'connected' | 'refreshing' | 'expired' | 'revoked' | 'disconnected'

export interface IUser extends Document {
  clerkId: string
  name: string
  email: string
  zoomConnected?: boolean
  zoomConnectionStatus?: ZoomConnectionStatus
  zoomAccessToken?: string | null
  zoomRefreshToken?: string | null
  zoomTokenExpiry?: Date | null
  zoomEmail?: string | null
  zoomDisplayName?: string | null
  zoomError?: string | null
  zoomLastError?: string | null
  zoomAccountId?: string
  zoomClientId?: string
  zoomClientSecret?: string
  createdAt: Date
}

const UserSchema = new Schema<IUser>(
  {
    clerkId: { type: String, required: true, unique: true, index: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, index: true },
    zoomConnected: { type: Boolean, default: false },
    zoomConnectionStatus: {
      type: String,
      enum: ['connected', 'refreshing', 'expired', 'revoked', 'disconnected'],
      default: 'disconnected',
    },
    zoomAccessToken: { type: String },
    zoomRefreshToken: { type: String },
    zoomTokenExpiry: { type: Date },
    zoomEmail: { type: String },
    zoomDisplayName: { type: String },
    zoomError: { type: String },
    zoomLastError: { type: String },
    zoomAccountId: { type: String },
    zoomClientId: { type: String },
    zoomClientSecret: { type: String },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
