import mongoose from 'mongoose';
import { config } from './env';

export const connectDB = async (): Promise<void> => {
  try {
    mongoose.set('bufferTimeoutMS', 2500);
    const conn = await mongoose.connect(config.mongoUri, {
      serverSelectionTimeoutMS: 3000,
    });
    console.log(`[MongoDB] Connected successfully: ${conn.connection.host}/${conn.connection.name}`);
  } catch (error: any) {
    console.warn(`[MongoDB Warning] Could not connect to primary MongoDB at ${config.mongoUri}: ${error.message}`);
    console.warn(`[MongoDB] Running in resilient offline fallback mode until MongoDB is started.`);
  }
};
