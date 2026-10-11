import { NextRequest } from 'next/server';
import { UniversityController } from '@/src/modules/universities/university.controller';

const controller = new UniversityController();

/**
 * GET /api/universities
 * List universities with optional filters and pagination
 * Query params: page, limit, countryId, city, institutionType, isActive, search
 */
export async function GET(request: NextRequest) {
  return controller.list(request);
}

/**
 * POST /api/universities
 * Create a new university
 * Body: CreateUniversityDto
 */
export async function POST(request: NextRequest) {
  return controller.create(request);
}
