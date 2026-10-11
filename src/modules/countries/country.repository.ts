/**
 * Country Module - Repository Layer
 * 
 * Handles direct database operations for countries
 * This layer abstracts MongoDB/Mongoose operations
 */

import { Country } from './country.model';
import type { ICountry, CreateCountryDto, UpdateCountryDto } from './country.types';

/**
 * Country Repository
 * Provides data access methods for country operations
 */
export class CountryRepository {
  /**
   * Find all countries
   */
  async findAll(): Promise<ICountry[]> {
    return Country.find().sort({ name: 1 }).lean();
  }

  /**
   * Find country by ID
   */
  async findById(id: string): Promise<ICountry | null> {
    return Country.findById(id).lean();
  }

  /**
   * Find country by code
   */
  async findByCode(code: string): Promise<ICountry | null> {
    return Country.findOne({ code: code.toUpperCase() }).lean();
  }

  /**
   * Create a new country
   */
  async create(data: CreateCountryDto): Promise<ICountry> {
    const countryData: any = {
      name: data.name.trim(),
      code: data.code.toUpperCase().trim(),
      isActive: data.isActive ?? true,
    };
    
    if (data.flag) {
      countryData.flag = data.flag;
    }
    if (data.overview) {
      countryData.overview = data.overview;
    }
    if (data.studyCosts) {
      countryData.studyCosts = data.studyCosts;
    }
    if (data.studySystem) {
      countryData.studySystem = data.studySystem;
    }
    if (data.topCities) {
      countryData.topCities = data.topCities;
    }
    
    const country = await Country.create(countryData);
    return country.toObject();
  }

  /**
   * Update a country by ID
   */
  async update(id: string, data: UpdateCountryDto): Promise<ICountry | null> {
    const updateData: Partial<ICountry> = {};

    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (data.code !== undefined) {
      updateData.code = data.code.toUpperCase().trim();
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }
    if (data.flag !== undefined) {
      updateData.flag = data.flag;
    }
    if (data.overview !== undefined) {
      updateData.overview = data.overview;
    }
    if (data.studyCosts !== undefined) {
      updateData.studyCosts = data.studyCosts;
    }
    if (data.studySystem !== undefined) {
      updateData.studySystem = data.studySystem;
    }
    if (data.topCities !== undefined) {
      updateData.topCities = data.topCities;
    }

    return Country.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    ).lean();
  }

  /**
   * Delete a country by ID
   */
  async delete(id: string): Promise<ICountry | null> {
    return Country.findByIdAndDelete(id).lean();
  }

  /**
   * Check if a country code already exists
   */
  async existsByCode(code: string, excludeId?: string): Promise<boolean> {
    const query: any = { code: code.toUpperCase() };
    
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    
    const count = await Country.countDocuments(query);
    return count > 0;
  }
}
