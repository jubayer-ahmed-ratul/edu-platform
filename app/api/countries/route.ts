/**
 * Countries API Routes
 * 
 * GET /api/countries - List all countries
 * POST /api/countries - Create a new country
 */

import { NextRequest } from 'next/server';
import { CountryController } from '@/src/modules/countries/country.controller';

const controller = new CountryController();

/**
 * GET /api/countries
 * List all countries
 */
export async function GET() {
  return controller.list();
}

/**
 * POST /api/countries
 * Create a new country
 */
export async function POST(request: NextRequest) {
  return controller.create(request);
}
