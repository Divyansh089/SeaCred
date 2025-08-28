// src/server.ts

import app from './app';
import { config } from './config';
import { connectDB } from './database/connect';

const startServer = async () => {
  // Connect to the database first
  await connectDB();

  app.listen(config.port, () => {
    console.log(`🚀 Server is running on http://localhost:${config.port}`);
  });
};

startServer();