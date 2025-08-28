import { Schema, model, Types } from 'mongoose';

const projectDocumentSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String }, // e.g., 'Project Design Document', 'Land Title'
  url: { type: String, required: true }, // URL from IPFS or other storage
  uploadedAt: { type: Date, default: Date.now },
});

const carbonProjectSchema = new Schema({
  name: { type: String, required: true, index: true },
  description: { type: String, required: true },
  location: { type: String }, // Can be enhanced with GeoJSON
  projectType: { type: String, required: true, enum: ['forestry', 'renewable_energy', 'energy_efficiency', 'methane_capture', 'other'] },
  status: { type: String, required: true, enum: ['pending', 'approved', 'rejected', 'active', 'completed', 'suspended'], index: true },
  totalCredits: { type: Number, default: 0 },
  availableCredits: { type: Number, default: 0 },
  pricePerCredit: { type: Number },
  projectAuthorityId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  assignedOfficerId: { type: Types.ObjectId, ref: 'User', index: true },
  documents: [projectDocumentSchema],
  landImages: [projectDocumentSchema],
  contactPerson: {
    name: String,
    email: String,
    phone: String,
  },
  technicalDetails: {
    methodology: String,
    baselineScenario: String,
    projectScenario: String,
    monitoringPlan: String,
  },
  landArea: Number,
  landAreaUnit: String,
}, { timestamps: true });

export const CarbonProjectModel = model('CarbonProject', carbonProjectSchema);