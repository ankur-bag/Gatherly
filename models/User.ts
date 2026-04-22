import mongoose, { Schema, Document } from 'mongoose'

export interface IUser extends Document {
  clerkId: string
  name: string
  email: string
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
    zoomAccountId: { type: String },
    zoomClientId: { type: String },
    zoomClientSecret: { type: String },
  },
  { timestamps: true }
)

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema)
