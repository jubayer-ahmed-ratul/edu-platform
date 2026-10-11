/**
 * Country Module - Controller Layer
 * 
 * Handles HTTP request/response logic for country operations
 * This layer coordinates between route handlers and services
 */

import { NextRequest, NextResponse } from 'next/server';
import { CountryService } from './country.service';
import {
  createCountrySchema,
  updateCountrySchema,
  mongoIdSchema,
} from './country.validation';
import { ResponseBuilder } from '@/src/lib/api/response-builder';
import { connectDB } from '@/src/lib/db/mongoose';
import { ZodError } from 'zod';

/**
 * Country Controller
 * Processes requests and delegates to service layer
 */
export class CountryController {
  private service: CountryService;

  constructor() {
    this.service = new CountryService();
  }

  /**
   * GET /api/countries - List all countries
   */
  async list(): Promise<NextResponse> {
    try {
      await connectDB();
      
      const countries = await this.service.getAllCountries();
      
      return ResponseBuilder.success(countries);
    } catch (error) {
      console.error('Error listing countries:', error);
      return ResponseBuilder.error('Failed to retrieve countries', 500);
    }
  }

  /**
   * GET /api/countries/[id] - Get a single country
   */
  async getOne(id: string): Promise<NextResponse> {
    try {
      await connectDB();

      // Validate ID format
      const validationResult = mongoIdSchema.safeParse(id);
      if (!validationResult.success) {
        return ResponseBuilder.validationError('Invalid country ID format');
      }

      const country = await this.service.getCountryById(id);
      
      return ResponseBuilder.success(country);
    } catch (error) {
      console.error('Error getting country:', error);
      
      if (error instanceof Error && error.message === 'Country not found') {
        return ResponseBuilder.notFound('Country');
      }
      
      return ResponseBuilder.error('Failed to retrieve country', 500);
    }
  }

  /**
   * POST /api/countries - Create a new country
   */
  async create(request: NextRequest): Promise<NextResponse> {
    try {
      await connectDB();

      // Parse and validate request body
      const body = await request.json();
      const validatedData = createCountrySchema.parse(body);

      const country = await this.service.createCountry(validatedData);
      
      return ResponseBuilder.success(country, 201);
    } catch (error) {
      console.error('Error creating country:', error);

      // Handle validation errors
      if (error instanceof ZodError) {
        const firstError = error.issues[0];
        return ResponseBuilder.validationError(firstError.message);
      }

      // Handle duplicate code error
      if (error instanceof Error && error.message.includes('already exists')) {
        return ResponseBuilder.error(error.message, 409, 'DUPLICATE_CODE');
      }

      // Handle MongoDB duplicate key error
      if (error instanceof Error && error.message.includes('duplicate key')) {
        return ResponseBuilder.error(
          'Country code already exists',
          409,
          'DUPLICATE_CODE'
        );
      }

      return ResponseBuilder.error('Failed to create country', 500);
    }
  }

  /**
   * PATCH /api/countries/[id] - Update a country
   */
  async update(id: string, request: NextRequest): Promise<NextResponse> {
    try {
      await connectDB();

      // Validate ID format
      const idValidation = mongoIdSchema.safeParse(id);
      if (!idValidation.success) {
        return ResponseBuilder.validationError('Invalid country ID format');
      }

      // Parse and validate request body
      const body = await request.json();
      const validatedData = updateCountrySchema.parse(body);

      // Check if at least one field is provided
      if (Object.keys(validatedData).length === 0) {
        return ResponseBuilder.validationError(
          'At least one field must be provided for update'
        );
      }

      const country = await this.service.updateCountry(id, validatedData);
      
      return ResponseBuilder.success(country);
    } catch (error) {
      console.error('Error updating country:', error);

      // Handle validation errors
      if (error instanceof ZodError) {
        const firstError = error.issues[0];
        return ResponseBuilder.validationError(firstError.message);
      }

      // Handle not found
      if (error instanceof Error && error.message === 'Country not found') {
        return ResponseBuilder.notFound('Country');
      }

      // Handle duplicate code error
      if (error instanceof Error && error.message.includes('already exists')) {
        return ResponseBuilder.error(error.message, 409, 'DUPLICATE_CODE');
      }

      // Handle MongoDB duplicate key error
      if (error instanceof Error && error.message.includes('duplicate key')) {
        return ResponseBuilder.error(
          'Country code already exists',
          409,
          'DUPLICATE_CODE'
        );
      }

      return ResponseBuilder.error('Failed to update country', 500);
    }
  }

  /**
   * DELETE /api/countries/[id] - Delete a country
   */
  async delete(id: string): Promise<NextResponse> {
    try {
      await connectDB();

      // Validate ID format
      const validationResult = mongoIdSchema.safeParse(id);
      if (!validationResult.success) {
        return ResponseBuilder.validationError('Invalid country ID format');
      }

      const country = await this.service.deleteCountry(id);
      
      return ResponseBuilder.success(country);
    } catch (error) {
      console.error('Error deleting country:', error);

      if (error instanceof Error && error.message === 'Country not found') {
        return ResponseBuilder.notFound('Country');
      }

      return ResponseBuilder.error('Failed to delete country', 500);
    }
  }
}
