/**
 * Country Module - Validation Schemas
 * 
 * Zod schemas for validating country-related requests
 */

import { z } from 'zod';

/**
 * Schema for country flag object
 */
export const countryFlagSchema = z.object({
  url: z.string().url('Invalid image URL').startsWith('https://', 'Image URL must use HTTPS'),
  publicId: z.string().min(1, 'Public ID is required'),
});

/**
 * Schema for cost range (min/max)
 */
const costRangeSchema = z
  .object({
    min: z.number().min(0, 'Minimum cost cannot be negative').optional(),
    max: z.number().min(0, 'Maximum cost cannot be negative').optional(),
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
 * Schema for country overview
 */
const countryOverviewSchema = z
  .object({
    description: z.string().trim().optional(),
    whyStudyHere: z.array(z.string().trim()).optional(),
    officialLanguages: z.array(z.string().trim()).optional(),
    currency: z
      .object({
        name: z.string().trim(),
        code: z.string().trim().toUpperCase(),
      })
      .optional(),
    intakes: z.array(z.string().trim()).optional(),
  })
  .optional();

/**
 * Schema for study costs
 */
const studyCostsSchema = z
  .object({
    currencyCode: z.string().trim().toUpperCase(),
    academicYear: z.string().trim().optional(),
    averageAnnualTuition: costRangeSchema,
    bachelorsTuition: costRangeSchema,
    mastersTuition: costRangeSchema,
    monthlyLivingCost: costRangeSchema,
    monthlyAccommodationCost: costRangeSchema,
    monthlyFoodCost: costRangeSchema,
    annualHealthInsuranceCost: costRangeSchema,
    otherEstimatedFees: z
      .array(
        z
          .object({
            name: z.string().trim(),
            min: z.number().min(0, 'Fee amount cannot be negative').optional(),
            max: z.number().min(0, 'Fee amount cannot be negative').optional(),
            notes: z.string().trim().optional(),
          })
          .refine(
            (data) => {
              if (data.min === undefined || data.max === undefined) return true;
              return data.min <= data.max;
            },
            { message: 'Minimum fee cannot exceed maximum fee' }
          )
      )
      .optional(),
    sourceUrl: z.string().url('Invalid source URL').startsWith('https://').optional(),
    lastVerifiedAt: z.coerce.date().optional(),
  })
  .optional();

/**
 * Schema for English proficiency tests
 */
const englishTestSchema = z.object({
  testName: z.string().trim(),
  minimumScore: z.string().trim().optional(),
  notes: z.string().trim().optional(),
});

/**
 * Schema for study system
 */
const studySystemSchema = z
  .object({
    bachelorsDuration: z.string().trim().optional(),
    mastersDuration: z.string().trim().optional(),
    academicYearStructure: z.string().trim().optional(),
    semestersPerYear: z.number().int().min(1).optional(),
    intakesPerYear: z.number().int().min(1).optional(),
    admissionRequirements: z.array(z.string().trim()).optional(),
    englishTests: z.array(englishTestSchema).optional(),
    academicQualifications: z.array(z.string().trim()).optional(),
    sourceUrl: z.string().url('Invalid source URL').startsWith('https://').optional(),
    lastVerifiedAt: z.coerce.date().optional(),
  })
  .optional();

/**
 * Schema for city image
 */
const cityImageSchema = z.object({
  url: z.string().url('Invalid image URL').startsWith('https://', 'Image URL must use HTTPS'),
  publicId: z.string().min(1, 'Public ID is required'),
});

/**
 * Schema for top cities
 */
const topCitySchema = z.object({
  name: z.string().trim().min(1, 'City name is required'),
  slug: z
    .string()
    .trim()
    .min(1, 'City slug is required')
    .regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'),
  image: cityImageSchema.optional(),
  description: z.string().trim().optional(),
  livingCost: costRangeSchema,
  currencyCode: z.string().trim().toUpperCase().optional(),
  popularUniversities: z.array(z.string().trim()).optional(),
  popularSubjects: z.array(z.string().trim()).optional(),
  suitableFor: z.array(z.string().trim()).optional(),
});

/**
 * Schema for creating a new country
 */
export const createCountrySchema = z.object({
  name: z
    .string()
    .min(1, 'Country name is required')
    .max(100, 'Country name must not exceed 100 characters')
    .trim(),
  code: z
    .string()
    .min(2, 'Country code must be at least 2 characters')
    .max(3, 'Country code must not exceed 3 characters')
    .toUpperCase()
    .regex(/^[A-Z]{2,3}$/, 'Country code must contain only uppercase letters')
    .trim(),
  isActive: z.boolean().optional().default(true),
  flag: countryFlagSchema.optional(),
  overview: countryOverviewSchema,
  studyCosts: studyCostsSchema,
  studySystem: studySystemSchema,
  topCities: z.array(topCitySchema).optional(),
});

/**
 * Schema for updating an existing country
 */
export const updateCountrySchema = z.object({
  name: z
    .string()
    .min(1, 'Country name is required')
    .max(100, 'Country name must not exceed 100 characters')
    .trim()
    .optional(),
  code: z
    .string()
    .min(2, 'Country code must be at least 2 characters')
    .max(3, 'Country code must not exceed 3 characters')
    .toUpperCase()
    .regex(/^[A-Z]{2,3}$/, 'Country code must contain only uppercase letters')
    .trim()
    .optional(),
  isActive: z.boolean().optional(),
  flag: countryFlagSchema.optional(),
  overview: countryOverviewSchema,
  studyCosts: studyCostsSchema,
  studySystem: studySystemSchema,
  topCities: z.array(topCitySchema).optional(),
});

/**
 * Schema for validating MongoDB ObjectId
 */
export const mongoIdSchema = z
  .string()
  .regex(/^[0-9a-fA-F]{24}$/, 'Invalid ID format');
