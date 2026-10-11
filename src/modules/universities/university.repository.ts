/**
 * University Module - Repository Layer
 * 
 * Handles direct database operations for universities
 * This layer abstracts MongoDB/Mongoose operations
 */

import { University } from './university.model';
import type {
  IUniversity,
  CreateUniversityDto,
  UpdateUniversityDto,
  UniversityFilters,
  PaginationParams,
} from './university.types';

/**
 * University Repository
 * Provides data access methods for university operations
 */
export class UniversityRepository {
  /**
   * Find universities with filters and pagination
   */
  async findAll(
    filters: UniversityFilters = {},
    pagination?: PaginationParams
  ): Promise<{ universities: IUniversity[]; total: number }> {
    const query: any = {};

    // Apply filters
    if (filters.countryId) {
      query.country = filters.countryId;
    }
    if (filters.city) {
      query.city = { $regex: filters.city, $options: 'i' }; // Case-insensitive search
    }
    if (filters.institutionType) {
      query.institutionType = filters.institutionType;
    }
    if (filters.isActive !== undefined) {
      query.isActive = filters.isActive;
    }
    if (filters.search) {
      query.$text = { $search: filters.search };
    }

    // Get total count for pagination
    const total = await University.countDocuments(query);

    // Build query with pagination
    let queryBuilder = University.find(query)
      .populate('country', 'name code') // Populate country reference
      .sort({ name: 1 });

    if (pagination) {
      const skip = (pagination.page - 1) * pagination.limit;
      queryBuilder = queryBuilder.skip(skip).limit(pagination.limit);
    }

    const universities = await queryBuilder.lean();

    return { universities, total };
  }

  /**
   * Find university by ID
   */
  async findById(id: string): Promise<IUniversity | null> {
    return University.findById(id).populate('country', 'name code').lean();
  }

  /**
   * Find university by slug
   */
  async findBySlug(slug: string): Promise<IUniversity | null> {
    return University.findOne({ slug: slug.toLowerCase() })
      .populate('country', 'name code')
      .lean();
  }

  /**
   * Create a new university
   */
  async create(data: CreateUniversityDto): Promise<IUniversity> {
    const universityData: any = {
      name: data.name.trim(),
      slug: data.slug.toLowerCase().trim(),
      country: data.countryId,
      city: data.city.trim(),
      isActive: data.isActive ?? true,
    };

    // Add optional fields if provided
    if (data.logo) {
      universityData.logo = data.logo;
    }
    if (data.coverImage) {
      universityData.coverImage = data.coverImage;
    }
    if (data.description) {
      universityData.description = data.description.trim();
    }
    if (data.website) {
      universityData.website = data.website.trim();
    }
    if (data.address) {
      universityData.address = data.address.trim();
    }
    if (data.establishedYear) {
      universityData.establishedYear = data.establishedYear;
    }
    if (data.institutionType) {
      universityData.institutionType = data.institutionType;
    }
    if (data.ranking) {
      universityData.ranking = data.ranking;
    }
    if (data.internationalStudentInfo) {
      universityData.internationalStudentInfo = data.internationalStudentInfo;
    }
    if (data.popularSubjects) {
      universityData.popularSubjects = data.popularSubjects;
    }

    const university = await University.create(universityData);
    return university.toObject();
  }

  /**
   * Update a university by ID
   */
  async update(id: string, data: UpdateUniversityDto): Promise<IUniversity | null> {
    const updateData: any = {};

    // Build update object with only provided fields
    if (data.name !== undefined) {
      updateData.name = data.name.trim();
    }
    if (data.slug !== undefined) {
      updateData.slug = data.slug.toLowerCase().trim();
    }
    if (data.countryId !== undefined) {
      updateData.country = data.countryId;
    }
    if (data.city !== undefined) {
      updateData.city = data.city.trim();
    }
    if (data.logo !== undefined) {
      updateData.logo = data.logo;
    }
    if (data.coverImage !== undefined) {
      updateData.coverImage = data.coverImage;
    }
    if (data.description !== undefined) {
      updateData.description = data.description.trim();
    }
    if (data.website !== undefined) {
      updateData.website = data.website.trim();
    }
    if (data.address !== undefined) {
      updateData.address = data.address.trim();
    }
    if (data.establishedYear !== undefined) {
      updateData.establishedYear = data.establishedYear;
    }
    if (data.institutionType !== undefined) {
      updateData.institutionType = data.institutionType;
    }
    if (data.ranking !== undefined) {
      updateData.ranking = data.ranking;
    }
    if (data.internationalStudentInfo !== undefined) {
      updateData.internationalStudentInfo = data.internationalStudentInfo;
    }
    if (data.popularSubjects !== undefined) {
      updateData.popularSubjects = data.popularSubjects;
    }
    if (data.isActive !== undefined) {
      updateData.isActive = data.isActive;
    }

    return University.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    )
      .populate('country', 'name code')
      .lean();
  }

  /**
   * Delete a university by ID
   */
  async delete(id: string): Promise<IUniversity | null> {
    return University.findByIdAndDelete(id).populate('country', 'name code').lean();
  }

  /**
   * Check if a slug already exists
   */
  async existsBySlug(slug: string, excludeId?: string): Promise<boolean> {
    const query: any = { slug: slug.toLowerCase() };

    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const count = await University.countDocuments(query);
    return count > 0;
  }

  /**
   * Count universities by country
   */
  async countByCountry(countryId: string): Promise<number> {
    return University.countDocuments({ country: countryId });
  }
}
