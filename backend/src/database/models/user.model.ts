import { Schema, model } from 'mongoose';
import { IUserDocument } from '../../types';

const userSchema = new Schema({
  email: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true },
  password: { type: String, required: true, select: false }, // Don't return password by default
  role: { type: String, required: true, enum: ['admin', 'officer', 'project_authority'] },
  avatar: { type: String },

    notificationSettings: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: false },
    projectUpdates: { type: Boolean, default: true },
    verificationAlerts: { type: Boolean, default: true },
    marketingEmails: { type: Boolean, default: false },
  },
  preferences: {
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' },
    dateFormat: { type: String, default: 'MM/DD/YYYY' },
  },
  // Officer-specific fields
  jurisdiction: { type: String },
  specialization: [{ type: String }],
}, { timestamps: true });

export const UserModel = model<IUserDocument>('User', userSchema);