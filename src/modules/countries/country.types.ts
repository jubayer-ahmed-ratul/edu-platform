/**
 * Country Module - Type Definitions
 * 
 * TypeScript interfaces and types for the Country feature
 */

import type { Document } from 'mongoose';

/**
 * Country flag image
 */
export interface CountryFlag {
  url: string;
  publicId: string;
}

/**
 * Country overview information
 */
export interface CountryOverview {
  description?: string;
  whyStudyHere?: string[];
  officialLanguages?: string[];
  currency?: {
    name: string;
    code: string;
  };
  intakes?: string[];
}

/**
 * Study costs and tuition fees
 */
export interface StudyCosts {
  currencyCode: string;
  academicYear?: string;
  averageAnnualTuition?: {
    min?: number;
    max?: number;
  };
  bachelorsTuition?: {
    min?: number;
    max?: number;
  };
  mastersTuition?: {
    min?: number;
    max?: number;
  };
  monthlyLivingCost?: {
    min?: number;
    max?: number;
  };
  monthlyAccommodationCost?: {
    min?: number;
    max?: number;
  };
  monthlyFoodCost?: {
    min?: number;
    max?: number;
  };
  annualHealthInsuranceCost?: {
    min?: number;
    max?: number;
  };
  otherEstimatedFees?: Array<{
    name: string;
    min?: number;
    max?: number;
    notes?: string;
  }>;
  sourceUrl?: string;
  lastVerifiedAt?: Date;
}

/**
 * English proficiency test information
 */
export interface EnglishTest {
  testName: string;
  minimumScore?: string;
  notes?: string;
}

/**
 * Study system information
 */
export interface StudySystem {
  bachelorsDuration?: string;
  mastersDuration?: string;
  academicYearStructure?: string;
  semestersPerYear?: number;
  intakesPerYear?: number;
  admissionRequirements?: string[];
  englishTests?: EnglishTest[];
  academicQualifications?: string[];
  sourceUrl?: string;
  lastVerifiedAt?: Date;
}

/**
 * City image
 */
export interface CityImage {
  url: string;
  publicId: string;
}

/**
 * Top student city information
 */
export interface TopCity {
  name: string;
  slug: string;
  image?: CityImage;
  description?: string;
  livingCost?: {
    min?: number;
    max?: number;
  };
  currencyCode?: string;
  popularUniversities?: string[];
  popularSubjects?: string[];
  suitableFor?: string[];
}

/**
 * Country document as stored in MongoDB
 */
export interface ICountry extends Document {
  name: string;
  code: string;
  isActive: boolean;
  flag?: CountryFlag;
  overview?: CountryOverview;
  studyCosts?: StudyCosts;
  studySystem?: StudySystem;
  topCities?: TopCity[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Data transfer object for creating a country
 */
export interface CreateCountryDto {
  name: string;
  code: string;
  isActive?: boolean;
  flag?: CountryFlag;
  overview?: CountryOverview;
  studyCosts?: StudyCosts;
  studySystem?: StudySystem;
  topCities?: TopCity[];
}

/**
 * Data transfer object for updating a country
 */
export interface UpdateCountryDto {
  name?: string;
  code?: string;
  isActive?: boolean;
  flag?: CountryFlag;
  overview?: CountryOverview;
  studyCosts?: StudyCosts;
  studySystem?: StudySystem;
  topCities?: TopCity[];
}

/**
 * Country response object (clean data for API responses)
 */
export interface CountryResponse {
  id: string;
  name: string;
  code: string;
  isActive: boolean;
  flag?: CountryFlag;
  overview?: CountryOverview;
  studyCosts?: StudyCosts;
  studySystem?: StudySystem;
  topCities?: TopCity[];
  createdAt: string;
  updatedAt: string;
}
