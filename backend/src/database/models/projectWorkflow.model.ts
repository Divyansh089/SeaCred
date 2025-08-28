import { Schema, model, Types } from 'mongoose';

const projectWorkflowSchema = new Schema({
  projectId: { type: Types.ObjectId, ref: 'CarbonProject', required: true, unique: true },
  currentStep: { type: String, default: 'Initial Review' },
  completedSteps: [{ type: String }],
  status: { type: String, default: 'active', enum: ['active', 'paused', 'completed', 'cancelled'] },
}, { timestamps: true });

export const ProjectWorkflowModel = model('ProjectWorkflow', projectWorkflowSchema);