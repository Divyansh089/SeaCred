import { Schema, model, Types } from 'mongoose';

const verificationReportSchema = new Schema({
  projectId: { type: Types.ObjectId, ref: 'CarbonProject', required: true, index: true },
  officerId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  status: { type: String, required: true, enum: ['draft', 'submitted', 'approved', 'rejected'], index: true },
  landDetails: {
    area: Number,
    areaUnit: String,
    // Using the GeoJSON format for proper geospatial queries
    location: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], required: true } // [longitude, latitude]
    },
    landType: String,
    ownershipStatus: String,
    // ... other land details
  },
  images: [{
    type: String,
    url: String,
    description: String,
    uploadedAt: Date,
  }],
  aiAnalysis: { type: Schema.Types.Mixed }, // Storing a flexible object
  officerAssessment: { type: Schema.Types.Mixed },
  creditCalculation: {
    methodology: String,
    vintage: Number,
    totalCredits: Number,
    pricePerCredit: Number,
  },
  rejectionReason: { type: String },
  submittedAt: { type: Date },
  approvedAt: { type: Date },
  officerAssessment: { type: Schema.Types.Mixed },
  creditCalculation: { type: Schema.Types.Mixed },
}, { timestamps: true });

export const VerificationReportModel = model('VerificationReport', verificationReportSchema);