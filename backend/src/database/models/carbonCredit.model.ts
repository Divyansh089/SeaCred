import { Schema, model, Types } from 'mongoose';

const carbonCreditSchema = new Schema({
  projectId: { type: Types.ObjectId, ref: 'CarbonProject', required: true, index: true },
  serialNumber: { type: String, required: true, unique: true },
  vintage: { type: Number, required: true }, // The year the credit was generated
  amount: { type: Number, default: 1 }, // Typically 1 credit = 1 tonne CO2e
  status: { type: String, required: true, enum: ['available', 'distributed', 'retired'], index: true },
  issuedAt: { type: Date, default: Date.now },
  distributedAt: { type: Date },
});

export const CarbonCreditModel = model('CarbonCredit', carbonCreditSchema);