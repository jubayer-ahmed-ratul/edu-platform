import { NextRequest } from 'next/server';
import { UniversityController } from '@/src/modules/universities/university.controller';

const controller = new UniversityController();

/**
 * GET /api/universities/[id]
 * Get a single university by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return controller.getOne(id);
}

/**
 * PATCH /api/universities/[id]
 * Update a university (partial update)
 * Body: UpdateUniversityDto
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return controller.update(id, request);
}

/**
 * DELETE /api/universities/[id]
 * Delete a university
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  return controller.delete(id);
}
