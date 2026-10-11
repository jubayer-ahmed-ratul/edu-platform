/**
 * Countries API Routes - Individual Country
 * 
 * GET /api/countries/[id] - Get a single country
 * PATCH /api/countries/[id] - Update a country
 * DELETE /api/countries/[id] - Delete a country
 */

import { NextRequest } from 'next/server';
import { CountryController } from '@/src/modules/countries/country.controller';

const controller = new CountryController();

/**
 * GET /api/countries/[id]
 * Get a single country by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return controller.getOne(id);
}

/**
 * PATCH /api/countries/[id]
 * Update a country by ID
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return controller.update(id, request);
}

/**
 * DELETE /api/countries/[id]
 * Delete a country by ID
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return controller.delete(id);
}
