/**
 * University Module - Service Layer
 * 
 * Contains business logic for university operations
 * This layer sits between controllers and repositories
 */

import { UniversityRepository } from './university.repository';
import { CountryRepository } from '../countries/country.repository';
import { deleteImage } from '@/src/lib/cloudinary';
import type {
  CreateUniversityDto,
  UpdateUniversityDto,
  UniversityResponse,
  UniversityFilters,
  PaginationParams,
  PaginatedUniversityResponse,
} from './university.types';

/**
 * University Service
 * Implements business logic and data transformation
 */
export class UniversityService {
  private repository: UniversityRepository;
  private countryRepository: CountryRepository;

  constructor() {
    this.repository = new UniversityRepository();
    this.countryRepository = new CountryRepository();
  }

  /**
   * Get all universities with filters and pagination
   */
  async getAllUniversities(
    filters: UniversityFilters = {},
    pagination?: PaginationParams
  ): Promise<PaginatedUniversityResponse | UniversityResponse[]> {
    const { universities, total } = await this.repository.findAll(filters, pagination);

    const universityResponses = universities.map(this.toResponse);

    // Return paginated response if pagination is provided
    if (pagination) {
      return {
        data: universityResponses,
        pagination: {
          page: pagination.page,
          limit: pagination.limit,
          total,
          pages: Math.ceil(total / pagination.limit),
        },
      };
    }

    // Return simple array if no pagination
    return universityResponses;
  }

  /**
   * Get a single university by ID
   * @throws Error if university not found
   */
  async getUniversityById(id: string): Promise<UniversityResponse> {
    const university = await this.repository.findById(id);

    if (!university) {
      throw new Error('University not found');
    }

    return this.toResponse(university);
  }

  /**
   * Create a new university
   * @throws Error if country not found or slug already exists
   */
  async createUniversity(data: CreateUniversityDto): Promise<UniversityResponse> {
    // Verify country exists
    const country = await this.countryRepository.findById(data.countryId);
    if (!country) {
      throw new Error('Country not found');
    }

    // Check if slug already exists
    const slugExists = await this.repository.existsBySlug(data.slug);
    if (slugExists) {
      throw new Error(`Slug '${data.slug}' already exists`);
    }

    const university = await this.repository.create(data);

    // Fetch with populated country
    const created = await this.repository.findById(university._id.toString());
    if (!created) {
      throw new Error('Failed to create university');
    }

    return this.toResponse(created);
  }

  /**
   * Update an existing university
   * @throws Error if university not found, country not found, or slug already exists
   */
  async updateUniversity(id: string, data: UpdateUniversityDto): Promise<UniversityResponse> {
    // Check if university exists
    const existingUniversity = await this.repository.findById(id);
    if (!existingUniversity) {
      throw new Error('University not found');
    }

    // If updating country, verify it exists
    if (data.countryId) {
      const country = await this.countryRepository.findById(data.countryId);
      if (!country) {
        throw new Error('Country not found');
      }
    }

    // If updating slug, check it's not already in use by another university
    if (data.slug) {
      const slugExists = await this.repository.existsBySlug(data.slug, id);
      if (slugExists) {
        throw new Error(`Slug '${data.slug}' already exists`);
      }
    }

    // Store old image publicIds for cleanup after successful update
    const oldLogoPublicId = existingUniversity.logo?.publicId;
    const oldCoverImagePublicId = existingUniversity.coverImage?.publicId;

    const updatedUniversity = await this.repository.update(id, data);

    if (!updatedUniversity) {
      throw new Error('Failed to update university');
    }

    // Delete old logo if it was replaced
    if (data.logo && oldLogoPublicId && oldLogoPublicId !== data.logo.publicId) {
      try {
        await deleteImage(oldLogoPublicId);
      } catch (error) {
        console.error('Failed to delete old logo image:', oldLogoPublicId, error);
        // Continue - don't fail the update if cleanup fails
      }
    }

    // Delete old cover image if it was replaced
    if (
      data.coverImage &&
      oldCoverImagePublicId &&
      oldCoverImagePublicId !== data.coverImage.publicId
    ) {
      try {
        await deleteImage(oldCoverImagePublicId);
      } catch (error) {
        console.error('Failed to delete old cover image:', oldCoverImagePublicId, error);
        // Continue - don't fail the update if cleanup fails
      }
    }

    return this.toResponse(updatedUniversity);
  }

  /**
   * Delete a university
   * @throws Error if university not found
   */
  async deleteUniversity(id: string): Promise<UniversityResponse> {
    // Get university first to retrieve image info
    const existingUniversity = await this.repository.findById(id);
    if (!existingUniversity) {
      throw new Error('University not found');
    }

    const university = await this.repository.delete(id);

    if (!university) {
      throw new Error('University not found');
    }

    // Delete logo image if it exists
    if (existingUniversity.logo?.publicId) {
      try {
        await deleteImage(existingUniversity.logo.publicId);
      } catch (error) {
        console.error('Failed to delete logo image:', existingUniversity.logo.publicId, error);
        // Continue - don't fail the deletion if cleanup fails
      }
    }

    // Delete cover image if it exists
    if (existingUniversity.coverImage?.publicId) {
      try {
        await deleteImage(existingUniversity.coverImage.publicId);
      } catch (error) {
        console.error(
          'Failed to delete cover image:',
          existingUniversity.coverImage.publicId,
          error
        );
        // Continue - don't fail the deletion if cleanup fails
      }
    }

    return this.toResponse(university);
  }

  /**
   * Transform database document to API response format
   */
  private toResponse(university: any): UniversityResponse {
    const response: UniversityResponse = {
      id: university._id.toString(),
      name: university.name,
      slug: university.slug,
      country: {
        id: university.country._id.toString(),
        name: university.country.name,
        code: university.country.code,
      },
      city: university.city,
      isActive: university.isActive,
      createdAt: university.createdAt.toISOString(),
      updatedAt: university.updatedAt.toISOString(),
    };

    // Add optional fields if they exist
    if (university.logo) {
      response.logo = university.logo;
    }
    if (university.coverImage) {
      response.coverImage = university.coverImage;
    }
    if (university.description) {
      response.description = university.description;
    }
    if (university.website) {
      response.website = university.website;
    }
    if (university.address) {
      response.address = university.address;
    }
    if (university.establishedYear) {
      response.establishedYear = university.establishedYear;
    }
    if (university.institutionType) {
      response.institutionType = university.institutionType;
    }
    if (university.ranking && university.ranking.length > 0) {
      response.ranking = university.ranking;
    }
    if (university.internationalStudentInfo) {
      response.internationalStudentInfo = university.internationalStudentInfo;
    }
    if (university.popularSubjects && university.popularSubjects.length > 0) {
      response.popularSubjects = university.popularSubjects;
    }

    return response;
  }
}
