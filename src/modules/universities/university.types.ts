/**
 * University Module - Type Definitions
 * 
 * TypeScript interfaces and types for the University feature
 */

import type { Document, Types } from 'mongoose';

/**
 * University logo image
 */
export interface UniversityLogo {
  url: string;
  publicId: string;
}

/**
 * University cover image
 */
export interface UniversityCoverImage {
  url: string;
  publicId: string;
}

/**
 * University ranking information
 */
export interface UniversityRanking {
  organization: string; // e.g., "QS World University Rankings"
  rank: number;
  year: number;
}

/**
 * International student information
 */
export interface InternationalStudentInfo {
  totalStudents?: number;
  internationalStudents?: number;
  internationalPercentage?: number;
  averageTuitionFee?: {
    min?: number;
    max?: number;
    currency?: string;
  };
  scholarshipsAvailable?: boolean;
  applicationFee?: number;
  applicationFeeCurrency?: string;
}

/**
 * University document as stored in MongoDB
 */
export interface IUniversity extends Document {
  name: string;
  slug: string;
  country: Types.ObjectId; // Reference to Country model
  city: string;
  logo?: UniversityLogo;
  coverImage?: UniversityCoverImage;
  description?: string;
  website?: string;
  address?: string;
  establishedYear?: number;
  institutionType?: 'public' | 'private' | 'other';
  ranking?: UniversityRanking[];
  internationalStudentInfo?: InternationalStudentInfo;
  popularSubjects?: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data transfer object for creating a university
 */
export interface CreateUniversityDto {
  name: string;
  slug: string;
  countryId: string; // MongoDB ObjectId as string
  city: string;
  logo?: UniversityLogo;
  coverImage?: UniversityCoverImage;
  description?: string;
  website?: string;
  address?: string;
  establishedYear?: number;
  institutionType?: 'public' | 'private' | 'other';
  ranking?: UniversityRanking[];
  internationalStudentInfo?: InternationalStudentInfo;
  popularSubjects?: string[];
  isActive?: boolean;
}

/**
 * Data transfer object for updating a university
 */
export interface UpdateUniversityDto {
  name?: string;
  slug?: string;
  countryId?: string;
  city?: string;
  logo?: UniversityLogo;
  coverImage?: UniversityCoverImage;
  description?: string;
  website?: string;
  address?: string;
  establishedYear?: number;
  institutionType?: 'public' | 'private' | 'other';
  ranking?: UniversityRanking[];
  internationalStudentInfo?: InternationalStudentInfo;
  popularSubjects?: string[];
  isActive?: boolean;
}

/**
 * University response object with populated country
 */
export interface UniversityResponse {
  id: string;
  name: string;
  slug: string;
  country: {
    id: string;
    name: string;
    code: string;
  };
  city: string;
  logo?: UniversityLogo;
  coverImage?: UniversityCoverImage;
  description?: string;
  website?: string;
  address?: string;
  establishedYear?: number;
  institutionType?: 'public' | 'private' | 'other';
  ranking?: UniversityRanking[];
  internationalStudentInfo?: InternationalStudentInfo;
  popularSubjects?: string[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * Query filters for university list
 */
export interface UniversityFilters {
  countryId?: string;
  city?: string;
  institutionType?: 'public' | 'private' | 'other';
  isActive?: boolean;
  search?: string;
}

/**
 * Pagination parameters
 */
export interface PaginationParams {
  page: number;
  limit: number;
}

/**
 * Paginated university response
 */
export interface PaginatedUniversityResponse {
  data: UniversityResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
