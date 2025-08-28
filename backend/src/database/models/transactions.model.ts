import { Schema, model, Types } from 'mongoose';

const activitySchema = new Schema({
    type: { type: String, required: true },
    title: { type: String, required: true },
    description: { type: String },
    userId: { type: Types.ObjectId, ref: 'User', required: true },
    projectId: { type: Types.ObjectId, ref: 'CarbonProject' },
}, { timestamps: { createdAt: 'timestamp', updatedAt: false } });

export const ActivityModel = model('Activity', activitySchema);