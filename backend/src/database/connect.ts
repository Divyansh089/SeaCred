// src/database/connect.ts

import mongoose from 'mongoose';
import { config } from '../config';

export const connectDB = async () => {
  try {
    await mongoose.connect(config.mongoUri);
    console.log('✅ MongoDB connected successfully!');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Exit process with failure
    process.exit(1);
  }
};