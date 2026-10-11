/**
 * Country Module - Mongoose Model
 * 
 * Defines the MongoDB schema and model for countries
 */

import mongoose, { Schema } from 'mongoose';
import type { ICountry } from './country.types';

/**
 * Country schema definition
 */
const countrySchema = new Schema<ICountry>(
  {
    name: {
      type: String,
      required: [true, 'Country name is required'],
      trim: true,
      maxlength: [100, 'Country name must not exceed 100 characters'],
    },
    code: {
      type: String,
      required: [true, 'Country code is required'],
      unique: true,
      uppercase: true,
      trim: true,
      minlength: [2, 'Country code must be at least 2 characters'],
      maxlength: [3, 'Country code must not exceed 3 characters'],
      match: [/^[A-Z]{2,3}$/, 'Country code must contain only uppercase letters'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    flag: {
      type: {
        url: {
          type: String,
          required: true,
        },
        publicId: {
          type: String,
          required: true,
        },
      },
      required: false,
      _id: false,
    },
    overview: {
      type: {
        description: String,
        whyStudyHere: [String],
        officialLanguages: [String],
        currency: {
          name: String,
          code: String,
        },
        intakes: [String],
      },
      required: false,
      _id: false,
    },
    studyCosts: {
      type: {
        currencyCode: {
          type: String,
          required: true,
          uppercase: true,
        },
        academicYear: String,
        averageAnnualTuition: {
          min: Number,
          max: Number,
        },
        bachelorsTuition: {
          min: Number,
          max: Number,
        },
        mastersTuition: {
          min: Number,
          max: Number,
        },
        monthlyLivingCost: {
          min: Number,
          max: Number,
        },
        monthlyAccommodationCost: {
          min: Number,
          max: Number,
        },
        monthlyFoodCost: {
          min: Number,
          max: Number,
        },
        annualHealthInsuranceCost: {
          min: Number,
          max: Number,
        },
        otherEstimatedFees: [
          {
            name: String,
            min: Number,
            max: Number,
            notes: String,
          },
        ],
        sourceUrl: String,
        lastVerifiedAt: Date,
      },
      required: false,
      _id: false,
    },
    studySystem: {
      type: {
        bachelorsDuration: String,
        mastersDuration: String,
        academicYearStructure: String,
        semestersPerYear: Number,
        intakesPerYear: Number,
        admissionRequirements: [String],
        englishTests: [
          {
            testName: String,
            minimumScore: String,
            notes: String,
          },
        ],
        academicQualifications: [String],
        sourceUrl: String,
        lastVerifiedAt: Date,
      },
      required: false,
      _id: false,
    },
    topCities: [
      {
        name: {
          type: String,
          required: true,
        },
        slug: {
          type: String,
          required: true,
        },
        image: {
          url: String,
          publicId: String,
        },
        description: String,
        livingCost: {
          min: Number,
          max: Number,
        },
        currencyCode: String,
        popularUniversities: [String],
        popularSubjects: [String],
        suitableFor: [String],
      },
    ],
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Create index on code for fast lookups
countrySchema.index({ code: 1 });

// Create index on name for searching
countrySchema.index({ name: 1 });

/**
 * Country model
 * Use existing model if it exists (handles hot reloads)
 */
export const Country =
  mongoose.models.Country || mongoose.model<ICountry>('Country', countrySchema);
