/**
 * Country Flag Upload Endpoint
 * POST /api/uploads/country-flag
 * 
 * Accepts multipart/form-data with an image file
 * Uploads to Cloudinary and returns the secure URL and public ID
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  uploadImage,
  validateImageBuffer,
  isCloudinaryConfigured,
  getConfigError,
} from '@/src/lib/cloudinary';
import { ResponseBuilder } from '@/src/lib/api/response-builder';

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];

export async function POST(request: NextRequest) {
  try {
    // Check Cloudinary configuration
    if (!isCloudinaryConfigured()) {
      return ResponseBuilder.error(
        'Image upload is not configured. Please contact administrator.',
        503,
        'UPLOAD_NOT_CONFIGURED'
      );
    }

    // Parse multipart form data
    const formData = await request.formData();
    const file = formData.get('file') as File | null;

    // Validate file exists
    if (!file) {
      return ResponseBuilder.validationError('No file provided');
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return ResponseBuilder.validationError(
        'Invalid file type. Only PNG, JPEG, and WebP images are allowed'
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return ResponseBuilder.validationError(
        `File size exceeds 2MB limit. Your file is ${(file.size / (1024 * 1024)).toFixed(2)}MB`
      );
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Validate actual file content (check magic numbers)
    if (!validateImageBuffer(buffer)) {
      return ResponseBuilder.validationError(
        'Invalid image file. The file content does not match the expected image format'
      );
    }

    // Upload to Cloudinary
    const result = await uploadImage(
      buffer,
      'edu-platform/countries',
      'flag'
    );

    // Return success response with URL and publicId
    return ResponseBuilder.success(
      {
        url: result.url,
        publicId: result.publicId,
      },
      201
    );
  } catch (error) {
    console.error('Error uploading country flag:', error);

    // Handle specific error cases
    if (error instanceof Error) {
      if (error.message.includes('File too large')) {
        return ResponseBuilder.validationError('File is too large');
      }
      if (error.message.includes('configuration')) {
        return ResponseBuilder.error(
          'Upload service is not properly configured',
          503,
          'CONFIG_ERROR'
        );
      }
    }

    return ResponseBuilder.error('Failed to upload image', 500);
  }
}
