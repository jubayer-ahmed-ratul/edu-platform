/**
 * Response builder utility for consistent API responses
 * Provides helper functions to create standardized JSON responses
 */

import { NextResponse } from 'next/server';
import type { ApiResponse } from './types';

export class ResponseBuilder {
  /**
   * Create a successful response
   */
  static success<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
    return NextResponse.json(
      {
        success: true,
        data,
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }

  /**
   * Create an error response
   */
  static error(
    message: string,
    status = 500,
    code?: string
  ): NextResponse<ApiResponse> {
    return NextResponse.json(
      {
        success: false,
        error: {
          message,
          code,
        },
        timestamp: new Date().toISOString(),
      },
      { status }
    );
  }

  /**
   * Create a validation error response
   */
  static validationError(message: string): NextResponse<ApiResponse> {
    return this.error(message, 400, 'VALIDATION_ERROR');
  }

  /**
   * Create a not found response
   */
  static notFound(resource = 'Resource'): NextResponse<ApiResponse> {
    return this.error(`${resource} not found`, 404, 'NOT_FOUND');
  }
}
