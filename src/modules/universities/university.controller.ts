/**
 * University Module - Controller Layer
 * 
 * Handles HTTP request/response logic for university operations
 * This layer coordinates between route handlers and services
 */

import { NextRequest, NextResponse } from 'next/server';
import { UniversityService } from './university.service';
import {
  createUniversitySchema,
  updateUniversitySchema,
  mongoIdSchema,
  universityFiltersSchema,
  paginationSchema,
} from './university.validation';
import { ResponseBuilder } from '@/src/lib/api/response-builder';
import { connectDB } from '@/src/lib/db/mongoose';
import { ZodError } from 'zod';

/**
 * University Controller
 * Processes requests and delegates to service layer
 */
export class UniversityController {
  private service: UniversityService;

  constructor() {
    this.service = new UniversityService();
  }

  /**
   * GET /api/universities - List universities with filters and pagination
   */
  async list(request: NextRequest): Promise<NextResponse> {
    try {
      await connectDB();

      // Parse and validate query parameters
      const searchParams = request.nextUrl.searchParams;
      const queryParams = Object.fromEntries(searchParams.entries());

      // Validate filters
      const filtersResult = universityFiltersSchema.safeParse(queryParams);
      if (!filtersResult.success) {
        const firstError = filtersResult.error.issues[0];
        return ResponseBuilder.validationError(firstError.message);
      }

      // Validate pagination
      const paginationResult = paginationSchema.safeParse(queryParams);
      if (!paginationResult.success) {
        const firstError = paginationResult.error.issues[0];
        return ResponseBuilder.validationError(firstError.message);
      }

      const universities = await this.service.getAllUniversities(
        filtersResult.data,
        paginationResult.data
      );

      return ResponseBuilder.success(universities);
    } catch (error) {
      console.error('Error listing universities:', error);
      return ResponseBuilder.error('Failed to retrieve universities', 500);
    }
  }

  /**
   * GET /api/universities/[id] - Get a single university
   */
  async getOne(id: string): Promise<NextResponse> {
    try {
      await connectDB();

      // Validate ID format
      const validationResult = mongoIdSchema.safeParse(id);
      if (!validationResult.success) {
        return ResponseBuilder.validationError('Invalid university ID format');
      }

      const university = await this.service.getUniversityById(id);

      return ResponseBuilder.success(university);
    } catch (error) {
      console.error('Error getting university:', error);

      if (error instanceof Error && error.message === 'University not found') {
        return ResponseBuilder.notFound('University');
      }

      return ResponseBuilder.error('Failed to retrieve university', 500);
    }
  }

  /**
   * POST /api/universities - Create a new university
   */
  async create(request: NextRequest): Promise<NextResponse> {
    try {
      await connectDB();

      // Parse and validate request body
      const body = await request.json();
      const validatedData = createUniversitySchema.parse(body);

      const university = await this.service.createUniversity(validatedData);

      return ResponseBuilder.success(university, 201);
    } catch (error) {
      console.error('Error creating university:', error);

      // Handle validation errors
      if (error instanceof ZodError) {
        const firstError = error.issues[0];
        return ResponseBuilder.validationError(firstError.message);
      }

      // Handle country not found
      if (error instanceof Error && error.message === 'Country not found') {
        return ResponseBuilder.validationError(error.message);
      }

      // Handle duplicate slug error
      if (error instanceof Error && error.message.includes('already exists')) {
        return ResponseBuilder.error(error.message, 409, 'DUPLICATE_SLUG');
      }

      // Handle MongoDB duplicate key error
      if (error instanceof Error && error.message.includes('duplicate key')) {
        return ResponseBuilder.error('Slug already exists', 409, 'DUPLICATE_SLUG');
      }

      return ResponseBuilder.error('Failed to create university', 500);
    }
  }

  /**
   * PATCH /api/universities/[id] - Update a university
   */
  async update(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      await connectDB();

      // Validate ID format
      const idValidation = mongoIdSchema.safeParse(id);
      if (!idValidation.success) {
        return ResponseBuilder.validationError('Invalid university ID format');
      }

      // Parse and validate request body
      const body = await request.json();
      const validatedData = updateUniversitySchema.parse(body);

      // Check if at least one field is provided
      if (Object.keys(validatedData).length === 0) {
        return ResponseBuilder.validationError(
          'At least one field must be provided for update'
        );
      }

      const university = await this.service.updateUniversity(id, validatedData);

      return ResponseBuilder.success(university);
    } catch (error) {
      console.error('Error updating university:', error);

      // Handle validation errors
      if (error instanceof ZodError) {
        const firstError = error.issues[0];
        return ResponseBuilder.validationError(firstError.message);
      }

      // Handle not found
      if (
        error instanceof Error &&
        (error.message === 'University not found' || error.message === 'Country not found')
      ) {
        const resourceType = error.message.includes('University') ? 'University' : 'Country';
        return error.message === 'Country not found'
          ? ResponseBuilder.validationError(error.message)
          : ResponseBuilder.notFound(resourceType);
      }

      // Handle duplicate slug error
      if (error instanceof Error && error.message.includes('already exists')) {
        return ResponseBuilder.error(error.message, 409, 'DUPLICATE_SLUG');
      }

      // Handle MongoDB duplicate key error
      if (error instanceof Error && error.message.includes('duplicate key')) {
        return ResponseBuilder.error('Slug already exists', 409, 'DUPLICATE_SLUG');
      }

      return ResponseBuilder.error('Failed to update university', 500);
    }
  }

  /**
   * DELETE /api/universities/[id] - Delete a university
   */
  async delete(id: string): Promise<NextResponse> {
    try {
      await connectDB();

      // Validate ID format
      const validationResult = mongoIdSchema.safeParse(id);
      if (!validationResult.success) {
        return ResponseBuilder.validationError('Invalid university ID format');
      }

      const university = await this.service.deleteUniversity(id);

      return ResponseBuilder.success(university);
    } catch (error) {
      console.error('Error deleting university:', error);

      if (error instanceof Error && error.message === 'University not found') {
        return ResponseBuilder.notFound('University');
      }

      return ResponseBuilder.error('Failed to delete university', 500);
    }
  }
}
