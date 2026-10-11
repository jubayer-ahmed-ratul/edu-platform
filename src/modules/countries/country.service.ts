/**
 * Country Module - Service Layer
 * 
 * Contains business logic for country operations
 * This layer sits between controllers and repositories
 */

import { CountryRepository } from './country.repository';
import { deleteImage } from '@/src/lib/cloudinary';
import type {
  CreateCountryDto,
  UpdateCountryDto,
  CountryResponse,
} from './country.types';

/**
 * Country Service
 * Implements business logic and data transformation
 */
export class CountryService {
  private repository: CountryRepository;

  constructor() {
    this.repository = new CountryRepository();
  }

  /**
   * Get all countries
   */
  async getAllCountries(): Promise<CountryResponse[]> {
    const countries = await this.repository.findAll();
    return countries.map(this.toResponse);
  }

  /**
   * Get a single country by ID
   * @throws Error if country not found
   */
  async getCountryById(id: string): Promise<CountryResponse> {
    const country = await this.repository.findById(id);
    
    if (!country) {
      throw new Error('Country not found');
    }
    
    return this.toResponse(country);
  }

  /**
   * Create a new country
   * @throws Error if country code already exists
   */
  async createCountry(data: CreateCountryDto): Promise<CountryResponse> {
    // Check if country code already exists
    const exists = await this.repository.existsByCode(data.code);
    
    if (exists) {
      throw new Error(`Country code '${data.code.toUpperCase()}' already exists`);
    }
    
    const country = await this.repository.create(data);
    return this.toResponse(country);
  }

  /**
   * Update an existing country
   * @throws Error if country not found or code already exists
   */
  async updateCountry(
    id: string,
    data: UpdateCountryDto
  ): Promise<CountryResponse> {
    // Check if country exists
    const existingCountry = await this.repository.findById(id);
    if (!existingCountry) {
      throw new Error('Country not found');
    }

    // If updating code, check it's not already in use by another country
    if (data.code) {
      const codeExists = await this.repository.existsByCode(data.code, id);
      if (codeExists) {
        throw new Error(`Country code '${data.code.toUpperCase()}' already exists`);
      }
    }

    // If replacing flag, delete old one after successful update
    const oldFlagPublicId = existingCountry.flag?.publicId;

    const updatedCountry = await this.repository.update(id, data);
    
    if (!updatedCountry) {
      throw new Error('Failed to update country');
    }
    
    // Delete old flag if it was replaced
    if (data.flag && oldFlagPublicId && oldFlagPublicId !== data.flag.publicId) {
      try {
        await deleteImage(oldFlagPublicId);
      } catch (error) {
        console.error('Failed to delete old flag image:', oldFlagPublicId, error);
        // Continue - don't fail the update if cleanup fails
      }
    }
    
    return this.toResponse(updatedCountry);
  }

  /**
   * Delete a country
   * @throws Error if country not found
   */
  async deleteCountry(id: string): Promise<CountryResponse> {
    // Get country first to retrieve flag info
    const existingCountry = await this.repository.findById(id);
    if (!existingCountry) {
      throw new Error('Country not found');
    }
    
    const country = await this.repository.delete(id);
    
    if (!country) {
      throw new Error('Country not found');
    }
    
    // Delete flag image if it exists
    if (existingCountry.flag?.publicId) {
      try {
        await deleteImage(existingCountry.flag.publicId);
      } catch (error) {
        console.error('Failed to delete flag image:', existingCountry.flag.publicId, error);
        // Continue - don't fail the deletion if cleanup fails
      }
    }
    
    return this.toResponse(country);
  }

  /**
   * Transform database document to API response format
   */
  private toResponse(country: any): CountryResponse {
    const response: CountryResponse = {
      id: country._id.toString(),
      name: country.name,
      code: country.code,
      isActive: country.isActive,
      createdAt: country.createdAt.toISOString(),
      updatedAt: country.updatedAt.toISOString(),
    };
    
    if (country.flag) {
      response.flag = country.flag;
    }
    
    if (country.overview) {
      response.overview = country.overview;
    }
    
    if (country.studyCosts) {
      response.studyCosts = {
        ...country.studyCosts,
        lastVerifiedAt: country.studyCosts.lastVerifiedAt
          ? country.studyCosts.lastVerifiedAt.toISOString()
          : undefined,
      };
    }
    
    if (country.studySystem) {
      response.studySystem = {
        ...country.studySystem,
        lastVerifiedAt: country.studySystem.lastVerifiedAt
          ? country.studySystem.lastVerifiedAt.toISOString()
          : undefined,
      };
    }
    
    if (country.topCities) {
      response.topCities = country.topCities;
    }
    
    return response;
  }
}
