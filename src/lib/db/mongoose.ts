/**
 * MongoDB Connection Manager
 * 
 * Provides a singleton Mongoose connection with caching to prevent
 * duplicate connections during Next.js hot reloads in development.
 * 
 * Usage:
 *   import { connectDB } from '@/src/lib/db/mongoose';
 *   await connectDB();
 */

import mongoose from 'mongoose';

// Type for our cached connection
interface MongooseCache {
  conn: typeof mongoose | null;
  promise: Promise<typeof mongoose> | null;
}

// Extend globalThis to include our cached connection
declare global {
  // eslint-disable-next-line no-var
  var mongoose: MongooseCache | undefined;
}

/**
 * Global cache for Mongoose connection
 * In development, hot reloads can cause multiple connection attempts.
 * We cache the connection promise globally to reuse across hot reloads.
 */
let cached: MongooseCache = global.mongoose || { conn: null, promise: null };

if (!global.mongoose) {
  global.mongoose = cached;
}

/**
 * Connect to MongoDB using Mongoose
 * 
 * - Caches the connection in development to survive hot reloads
 * - Returns existing connection if already established
 * - Throws error if MONGODB_URI is not configured
 * 
 * @returns Promise<typeof mongoose> - Connected Mongoose instance
 */
export async function connectDB(): Promise<typeof mongoose> {
  // Get MongoDB URI from environment variables
  const MONGODB_URI = process.env.MONGODB_URI;

  // Validate that MONGODB_URI is provided
  if (!MONGODB_URI) {
    throw new Error(
      'Please define the MONGODB_URI environment variable inside .env.local'
    );
  }

  // Return existing connection if available
  if (cached.conn) {
    return cached.conn;
  }

  // Reuse existing connection promise if one is in progress
  if (!cached.promise) {
    const opts = {
      bufferCommands: false, // Disable mongoose buffering
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

/**
 * Check if MongoDB is connected
 * 
 * @returns boolean - true if connected, false otherwise
 */
export function isConnected(): boolean {
  return mongoose.connection.readyState === 1;
}

/**
 * Get connection status as a string
 * 
 * @returns string - Connection status description
 */
export function getConnectionStatus(): string {
  const states: Record<number, string> = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };
  
  return states[mongoose.connection.readyState] || 'unknown';
}

/**
 * Disconnect from MongoDB
 * Primarily used for testing or graceful shutdown
 * 
 * @returns Promise<void>
 */
export async function disconnectDB(): Promise<void> {
  if (cached.conn) {
    await mongoose.connection.close();
    cached.conn = null;
    cached.promise = null;
  }
}
