/**
 * University Module - Mongoose Model
 * 
 * Defines the MongoDB schema and model for universities
 */

import mongoose, { Schema } from 'mongoose';
import type { IUniversity } from './university.types';

/**
 * University schema definition
 */
const universitySchema = new Schema<IUniversity>(
  {
    name: {
      type: String,
      required: [true, 'University name is required'],
      trim: true,
      maxlength: [200, 'University name must not exceed 200 characters'],
    },
    slug: {
      type: String,
      required: [true, 'Slug is required'],
      unique: true,
      lowercase: true,
      trim: true,
      maxlength: [250, 'Slug must not exceed 250 characters'],
      match: [/^[a-z0-9-]+$/, 'Slug must contain only lowercase letters, numbers, and hyphens'],
    },
    country: {
      type: Schema.Types.ObjectId,
      ref: 'Country',
      required: [true, 'Country is required'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      maxlength: [100, 'City name must not exceed 100 characters'],
    },
    logo: {
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
    coverImage: {
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
    description: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
      match: [/^https:\/\/.+/, 'Website URL must use HTTPS'],
    },
    address: {
      type: String,
      trim: true,
    },
    establishedYear: {
      type: Number,
      min: [1000, 'Established year must be 1000 or later'],
      max: [new Date().getFullYear(), 'Established year cannot be in the future'],
    },
    institutionType: {
      type: String,
      enum: {
        values: ['public', 'private', 'other'],
        message: 'Institution type must be public, private, or other',
      },
    },
    ranking: [
      {
        organization: {
          type: String,
          required: true,
          trim: true,
        },
        rank: {
          type: Number,
          required: true,
          min: [1, 'Rank must be a positive number'],
        },
        year: {
          type: Number,
          required: true,
          min: [1800, 'Year must be 1800 or later'],
          max: [new Date().getFullYear(), 'Year cannot be in the future'],
        },
      },
    ],
    internationalStudentInfo: {
      type: {
        totalStudents: {
          type: Number,
          min: [0, 'Total students cannot be negative'],
        },
        internationalStudents: {
          type: Number,
          min: [0, 'International students cannot be negative'],
        },
        internationalPercentage: {
          type: Number,
          min: [0, 'Percentage cannot be negative'],
          max: [100, 'Percentage cannot exceed 100'],
        },
        averageTuitionFee: {
          min: Number,
          max: Number,
          currency: String,
        },
        scholarshipsAvailable: Boolean,
        applicationFee: {
          type: Number,
          min: [0, 'Application fee cannot be negative'],
        },
        applicationFeeCurrency: String,
      },
      required: false,
      _id: false,
    },
    popularSubjects: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Create indexes for optimized queries
universitySchema.index({ slug: 1 }); // Unique slug lookup
universitySchema.index({ name: 1 }); // Name search
universitySchema.index({ country: 1 }); // Filter by country
universitySchema.index({ city: 1 }); // Filter by city
universitySchema.index({ institutionType: 1 }); // Filter by institution type
universitySchema.index({ isActive: 1 }); // Filter by active status
universitySchema.index({ name: 'text' }); // Full-text search on name

/**
 * University model
 * Use existing model if it exists (handles hot reloads)
 */
export const University =
  mongoose.models.University || mongoose.model<IUniversity>('University', universitySchema);
