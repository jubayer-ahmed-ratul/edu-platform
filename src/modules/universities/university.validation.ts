/**
 * University Module - Validation Schemas
 * 
 * Zod schemas for validating university-related requests
 */

import { z } from 'zod';

/**
 * Current year for validation
 */
const currentYear = new Date().getFullYear();

/**
 * Schema for university logo/cover image
 */
export const universityImageSchema = z.object({
  url: z.string().url('Invalid image URL').startsWith('https://', 'Image URL must use HTTPS'),
  publicId: z.string().min(1, 'Public ID is required'),
});

/**
 * Schema for university ranking
 */
const universityRankingSchema = z.object({
  organization: z.string().trim().min(1, 'Ranking organization is required'),
  rank: z.number().int().positive('Rank must be a positive number'),
  year: z
    .number()
    .int()
    .min(1800, 'Year must be 1800 or later')
    .max(currentYear, `Year cannot be in the future`),
});

/**
 * Schema for cost range
 */
const costRangeSchema = z
  .object({
    min: z.number().min(0, 'Minimum cost cannot be negative').optional(),
    max: z.number().min(0, 'Maximum cost cannot be negative').optional(),
    currency: z.string().trim().toUpperCase().optional(),
  })
  .optional()
  .refine(
    (data) => {
      if (!data || data.min === undefined || data.max === undefined) return true;
      return data.min <= data.max;
    },
    { message: 'Minimum cost cannot exceed maximum cost' }
  );

/**
 * Schema for international student information
 */
const internationalStudentInfoSchema = z
  .object({
    totalStudents: z.number().int().positive('Total students must be positive').optional(),
    internationalStudents: z
      .number()
      .int()
      .positive('International students must be positive')
      .optional(),
    internationalPercentage: z
      .number()
      .min(0, 'Percentage cannot be negative')
      .max(100, 'Percentage cannot exceed 100')
      .optional(),
    averageTuitionFee: costRangeSchema,
    scholarshipsAvailable: z.boolean().optional(),
    applicationFee: z.number().min(0, 'Application fee cannot be negative').optional(),
    applicationFeeCurrency: z.string().trim().toUpperCase().optional(),
  })
  .optional();

/**
 * Schema for creating a new university
 */
export const createUniversitySchema = z.object({
  name: z
    .string()
    .min(1, 'University name is required')
    .max(200, 'University name must not exceed 200 characters')
    .trim(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(250, 'Slug must not exceed 250 characters')
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  countryId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid country ID format'),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City name must not exceed 100 characters')
    .trim(),
  logo: universityImageSchema.optional(),
  coverImage: universityImageSchema.optional(),
  description: z.string().trim().optional(),
  website: z
    .string()
    .url('Invalid website URL')
    .startsWith('https://', 'Website URL must use HTTPS')
    .optional(),
  address: z.string().trim().optional(),
  establishedYear: z
    .number()
    .int()
    .min(1000, 'Established year must be 1000 or later')
    .max(currentYear, `Established year cannot be in the future`)
    .optional(),
  institutionType: z.enum(['public', 'private', 'other']).optional(),
  ranking: z.array(universityRankingSchema).optional(),
  internationalStudentInfo: internationalStudentInfoSchema,
  popularSubjects: z.array(z.string().trim()).optional(),
  isActive: z.boolean().optional().default(true),
});

/**
 * Schema for updating an existing university
 */
export const updateUniversitySchema = z.object({
  name: z
    .string()
    .min(1, 'University name is required')
    .max(200, 'University name must not exceed 200 characters')
    .trim()
    .optional(),
  slug: z
    .string()
    .min(1, 'Slug is required')
    .max(250, 'Slug must not exceed 250 characters')
    .trim()
    .toLowerCase()
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens')
    .optional(),
  countryId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, 'Invalid country ID format')
    .optional(),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City name must not exceed 100 characters')
    .trim()
    .optional(),
  logo: universityImageSchema.optional(),
  coverImage: universityImageSchema.optional(),
  description: z.string().trim().optional(),
  website: z
    .string()
    .url('Invalid website URL')
    .startsWith('https://', 'Website URL must use HTTPS')
    .optional(),
  address: z.string().trim().optional(),
  establishedYear: z
    .number()
    .int()
    .min(1000, 'Established year must be 1000 or later')
    .max(currentYear, `Established year cannot be in the future`)
    .optional(),
  institutionType: z.enum(['public', 'private', 'other']).optional(),
  ranking: z.array(universityRankingSchema).optional(),
  internationalStudentInfo: internationalStudentInfoSchema,
  popularSubjects: z.array(z.string().trim()).optional(),
  isActive: z.boolean().optional(),
});

/**
 * Schema for validating MongoDB ObjectId
 */
export const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');

/**
 * Schema for query filters
 */
export const universityFiltersSchema = z.object({
  countryId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'Invalid country ID format').optional(),
  city: z.string().trim().optional(),
  institutionType: z.enum(['public', 'private', 'other']).optional(),
  isActive: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .optional(),
  search: z.string().trim().optional(),
});

/**
 * Schema for pagination parameters
 */
export const paginationSchema = z.object({
  page: z
    .string()
    .optional()
    .default('1')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive()),
  limit: z
    .string()
    .optional()
    .default('10')
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().positive().max(100, 'Limit cannot exceed 100')),
});
