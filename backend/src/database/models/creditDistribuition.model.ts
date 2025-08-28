import { Schema, model, Types } from 'mongoose';

const creditDistributionSchema = new Schema({
  projectId: { type: Types.ObjectId, ref: 'CarbonProject', required: true, index: true },
  officerId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  authorityId: { type: Types.ObjectId, ref: 'User', required: true, index: true },
  totalCredits: { type: Number, required: true },
  officerWallet: { type: String, required: true },
  authorityWallet: { type: String, required: true },
  distribution: {
    officerShare: { type: Number, required: true }, // Percentage
    authorityShare: { type: Number, required: true }, // Percentage
    platformFee: { type: Number, required: true }, // Percentage
  },
  status: { type: String, required: true, enum: ['pending', 'distributed', 'failed'], index: true },
  blockchainTransactionId: { type: String, index: true },
  distributedAt: { type: Date },
}, { timestamps: true });

export const CreditDistributionModel = model('CreditDistribution', creditDistributionSchema);