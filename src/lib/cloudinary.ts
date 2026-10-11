/**
 * Cloudinary Configuration and Utilities
 * 
 * Server-side only module for managing image uploads to Cloudinary
 * NEVER import this file in client-side code
 */

import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;

/**
 * Check if Cloudinary is configured
 */
export function isCloudinaryConfigured(): boolean {
  return !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
}

/**
 * Get configuration error message
 */
export function getConfigError(): string | null {
  const missing: string[] = [];
  
  if (!CLOUDINARY_CLOUD_NAME) missing.push('CLOUDINARY_CLOUD_NAME');
  if (!CLOUDINARY_API_KEY) missing.push('CLOUDINARY_API_KEY');
  if (!CLOUDINARY_API_SECRET) missing.push('CLOUDINARY_API_SECRET');
  
  if (missing.length === 0) return null;
  
  return `Missing Cloudinary configuration: ${missing.join(', ')}. Please add these to .env.local`;
}

/**
 * Initialize Cloudinary configuration
 * Call this before any Cloudinary operations
 */
export function initCloudinary(): void {
  if (!isCloudinaryConfigured()) {
    throw new Error(getConfigError()!);
  }
  
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true, // Always use HTTPS
  });
}

/**
 * Upload image buffer to Cloudinary
 * 
 * @param buffer - Image file buffer
 * @param folder - Cloudinary folder path (e.g., 'edu-platform/countries')
 * @param publicIdPrefix - Optional prefix for the public ID
 * @returns Object with url and publicId
 */
export async function uploadImage(
  buffer: Buffer,
  folder: string = 'edu-platform',
  publicIdPrefix?: string
): Promise<{ url: string; publicId: string }> {
  initCloudinary();
  
  return new Promise((resolve, reject) => {
    const uploadOptions: any = {
      folder,
      resource_type: 'image',
      format: 'webp', // Convert to WebP for better performance
      transformation: [
        { quality: 'auto:good' },
        { fetch_format: 'auto' },
      ],
    };
    
    if (publicIdPrefix) {
      uploadOptions.public_id = `${publicIdPrefix}_${Date.now()}`;
    }
    
    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(error);
        } else if (result) {
          resolve({
            url: result.secure_url,
            publicId: result.public_id,
          });
        } else {
          reject(new Error('Upload failed - no result returned'));
        }
      }
    );
    
    uploadStream.end(buffer);
  });
}

/**
 * Delete image from Cloudinary
 * 
 * @param publicId - Cloudinary public ID of the image
 * @returns Promise<void>
 */
export async function deleteImage(publicId: string): Promise<void> {
  if (!publicId) {
    throw new Error('Public ID is required for deletion');
  }
  
  initCloudinary();
  
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    // Log error but don't throw - cleanup failures shouldn't break operations
    console.error('Failed to delete image from Cloudinary:', publicId, error);
  }
}

/**
 * Validate image file
 * 
 * @param file - File to validate
 * @param maxSizeInBytes - Maximum file size (default: 2MB)
 * @returns Object with isValid and error message
 */
export function validateImageFile(
  file: File,
  maxSizeInBytes: number = 2 * 1024 * 1024 // 2MB
): { isValid: boolean; error?: string } {
  // Check file size
  if (file.size > maxSizeInBytes) {
    return {
      isValid: false,
      error: `File size exceeds ${maxSizeInBytes / (1024 * 1024)}MB limit`,
    };
  }
  
  // Check file type by MIME type
  const allowedTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    return {
      isValid: false,
      error: 'Only PNG, JPEG, and WebP images are allowed',
    };
  }
  
  return { isValid: true };
}

/**
 * Validate image buffer by checking magic numbers (file signatures)
 * More secure than trusting MIME types
 * 
 * @param buffer - File buffer
 * @returns boolean - true if valid image format
 */
export function validateImageBuffer(buffer: Buffer): boolean {
  // Check PNG signature: 89 50 4E 47
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return true;
  }
  
  // Check JPEG signature: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true;
  }
  
  // Check WebP signature: RIFF ... WEBP
  if (
    buffer[0] === 0x52 &&
    buffer[1] === 0x49 &&
    buffer[2] === 0x46 &&
    buffer[3] === 0x46 &&
    buffer[8] === 0x57 &&
    buffer[9] === 0x45 &&
    buffer[10] === 0x42 &&
    buffer[11] === 0x50
  ) {
    return true;
  }
  
  return false;
}
