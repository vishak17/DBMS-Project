import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' }); // Important for non-Next.js runtime

import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env.local');
}

let isConnected = false;

export async function connectDB() {
  if (isConnected) {
    return;
  }

  try {
    const options = {
      bufferCommands: false,
      serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
      socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      maxPoolSize: 10, // Maintain up to 10 socket connections
      minPoolSize: 5, // Maintain at least 5 socket connections
      connectTimeoutMS: 10000, // Give up initial connection after 10s
    };

    await mongoose.connect(MONGODB_URI!, options);
    isConnected = true;
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnected = false; // Reset connection state on error
    throw error;
  }
} 