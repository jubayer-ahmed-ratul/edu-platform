/**
 * Health Check Endpoint
 * GET /api/health
 * 
 * Returns the health status of the API service including database connectivity
 * Used for monitoring, load balancers, and deployment health checks
 */

import { NextResponse } from 'next/server';
import { ResponseBuilder } from '@/src/lib/api/response-builder';
import { config } from '@/src/lib/config';
import { connectDB, getConnectionStatus } from '@/src/lib/db/mongoose';
import type { HealthCheckResponse } from '@/src/lib/api/types';

export async function GET() {
  let dbStatus: 'connected' | 'disconnected' | 'error' = 'disconnected';
  
  try {
    // Attempt to connect to MongoDB
    await connectDB();
    
    // Get the connection status
    const status = getConnectionStatus();
    dbStatus = status === 'connected' ? 'connected' : 'disconnected';
    
    const healthData: HealthCheckResponse = {
      status: dbStatus === 'connected' ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: config.app.version,
      services: {
        database: dbStatus,
      },
    };

    // Return 503 if database is not connected
    const httpStatus = dbStatus === 'connected' ? 200 : 503;
    
    return NextResponse.json(
      {
        success: dbStatus === 'connected',
        data: healthData,
        timestamp: new Date().toISOString(),
      },
      { status: httpStatus }
    );
  } catch (error) {
    // Handle connection errors safely without exposing internal details
    dbStatus = 'error';
    
    return NextResponse.json(
      {
        success: false,
        data: {
          status: 'unhealthy',
          timestamp: new Date().toISOString(),
          version: config.app.version,
          services: {
            database: dbStatus,
          },
        },
        error: {
          message: 'Service health check failed',
          code: 'HEALTH_CHECK_ERROR',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    );
  }
}
