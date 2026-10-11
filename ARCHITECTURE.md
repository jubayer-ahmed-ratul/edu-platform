# Backend Architecture Documentation

## Overview

This document explains the architectural decisions and implementation details for the Education Platform backend API built with Next.js 16 App Router.

## Project Structure

```
edu-platform/
├── app/                           # Next.js App Router directory
│   ├── api/                      # API route handlers
│   │   └── health/
│   │       └── route.ts          # Health check endpoint
│   ├── layout.tsx                # Root layout
│   └── page.tsx                  # Home page
│
├── src/                          # Source code (backend logic)
│   ├── lib/                      # Shared infrastructure
│   │   ├── api/
│   │   │   ├── types.ts          # API type definitions
│   │   │   └── response-builder.ts  # Response utility
│   │   └── config/
│   │       └── index.ts          # App configuration
│   └── modules/                  # Feature modules (future)
│
├── public/                       # Static assets
├── ARCHITECTURE.md               # This file
├── TESTING.md                    # Testing guide
└── package.json                  # Dependencies
```

---

## Architectural Decisions

### 1. Feature-Based Modular Architecture

**Decision:** Organize code by business features rather than technical layers.

**Rationale:**
- **Scalability**: Each module (students, consultancy, auth) is self-contained
- **Maintainability**: Changes to one feature don't ripple across the codebase
- **Team Collaboration**: Multiple developers can work on different modules independently
- **Clear Boundaries**: Business logic is isolated within module boundaries

**Future Structure:**
```
src/modules/
├── students/
│   ├── models/
│   ├── services/
│   ├── validators/
│   └── types.ts
├── consultancy/
└── auth/
```

### 2. Separation of Concerns

**Decision:** Split infrastructure (src/lib) from business logic (src/modules).

**Rationale:**
- **Reusability**: Common utilities are shared across all modules
- **Consistency**: All API responses follow the same format
- **Testing**: Infrastructure can be tested independently
- **Single Responsibility**: Each file has one clear purpose

**Benefits:**
- Response formatting is centralized in `ResponseBuilder`
- Type safety is enforced through shared type definitions
- Configuration is managed in one place

### 3. Next.js 16 App Router with Route Handlers

**Decision:** Use Next.js App Router's native Route Handlers for API endpoints.

**Rationale:**
- **Modern Approach**: App Router is the recommended Next.js architecture
- **Type Safety**: Full TypeScript support out of the box
- **Performance**: Built-in optimizations and caching strategies
- **Simplicity**: No need for additional API frameworks (Express, Fastify)

**Implementation:**
- API routes live in `app/api/` directory
- Each route is a `route.ts` file with exported HTTP method functions (GET, POST, etc.)
- Route Handlers are kept thin, delegating to services for business logic

### 4. Consistent API Response Format

**Decision:** Standardize all API responses with a common structure.

**Rationale:**
- **Predictability**: Frontend knows what to expect from every endpoint
- **Error Handling**: Unified error format simplifies client-side error handling
- **Debugging**: Timestamps help with request tracing and debugging
- **Developer Experience**: Clear success/error states

**Response Schema:**
```typescript
{
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
  timestamp: string;  // ISO 8601
}
```

**Example Usage:**
```typescript
// Success
ResponseBuilder.success(data);

// Error
ResponseBuilder.error('Something went wrong', 500);

// Validation Error
ResponseBuilder.validationError('Invalid email format');
```

### 5. TypeScript Path Aliases

**Decision:** Use `@/` path alias for clean imports.

**Configuration:**
```json
{
  "paths": {
    "@/*": ["./*"],
    "@/src/*": ["./src/*"]
  }
}
```

**Rationale:**
- **Readability**: `@/src/lib/api/types` vs `../../../lib/api/types`
- **Refactoring**: Moving files doesn't break imports
- **Consistency**: Standard pattern across the project

### 6. Health Check Endpoint Design

**Decision:** Simple, lightweight health endpoint without database checks initially.

**Rationale:**
- **Fast Response**: No external dependencies means quick health checks
- **Deployment Ready**: Can be used by load balancers and orchestrators immediately
- **Extensible**: Easy to add database, cache, or external service checks later

**Current Implementation:**
- Returns HTTP 200 for healthy status
- Returns HTTP 503 for unhealthy status
- Includes timestamp and version information
- Catches and reports unexpected errors

**Future Enhancements:**
```typescript
// Can be extended to include:
{
  status: 'healthy',
  timestamp: '...',
  version: '...',
  services: {
    database: 'connected',
    cache: 'connected',
    externalAPI: 'available'
  }
}
```

---

## Technology Stack

### Core Framework
- **Next.js 16.4.0**: React framework with App Router
- **React 19.3.0**: UI library
- **TypeScript 5.x**: Type safety

### Data Layer (Pre-installed)
- **Mongoose 9.11.1**: MongoDB ODM
- **Zod 4.6.5**: Runtime validation

### Development Tools
- **ESLint**: Code linting
- **Tailwind CSS 4.x**: Styling (with Turbopack integration)

---

## Design Patterns

### 1. Builder Pattern (ResponseBuilder)
Provides a fluent interface for creating API responses:
```typescript
ResponseBuilder.success(data);
ResponseBuilder.error(message, status);
```

### 2. Configuration as Code
Centralized configuration in `src/lib/config/index.ts`:
```typescript
export const config = {
  app: { name, version, env },
  api: { baseUrl },
} as const;
```

### 3. Type-First Development
- Define TypeScript interfaces before implementation
- Use types to document expected data structures
- Leverage TypeScript for compile-time safety

---

## Implementation Details

### File: `src/lib/api/types.ts`
**Purpose:** Shared TypeScript type definitions for API responses.

**Key Types:**
- `ApiResponse<T>`: Generic wrapper for all API responses
- `HealthCheckResponse`: Specific type for health endpoint

**Why Separate Types File:**
- Prevents circular dependencies
- Single source of truth for API contracts
- Easy to import across modules

### File: `src/lib/api/response-builder.ts`
**Purpose:** Utility class for consistent response creation.

**Methods:**
- `success<T>(data, status)`: Creates successful response
- `error(message, status, code)`: Creates error response
- `validationError(message)`: Convenience for validation errors
- `notFound(resource)`: Convenience for 404 responses

**Why Builder Pattern:**
- Ensures consistency across all endpoints
- Reduces boilerplate in route handlers
- Makes testing easier (mock the builder)

### File: `src/lib/config/index.ts`
**Purpose:** Centralized application configuration.

**Benefits:**
- Environment variables accessed in one place
- Type-safe configuration with `as const`
- Easy to extend with database URLs, API keys, etc.

### File: `app/api/health/route.ts`
**Purpose:** Health check endpoint implementation.

**Implementation Details:**
1. Imports only what it needs
2. Exports GET function (Next.js 16 Route Handler)
3. Uses try-catch for error handling
4. Returns 503 on errors (service unavailable)
5. Includes version and timestamp

**HTTP Methods:**
- Only GET is implemented (appropriate for health checks)
- Returns same response regardless of query parameters
- No authentication required (public endpoint)

---

## Next Steps & Future Enhancements

### Immediate Next Steps
1. **Database Connection**: Add MongoDB connection using Mongoose
2. **Environment Variables**: Set up `.env.local` for configuration
3. **Authentication Module**: Implement JWT-based auth in `src/modules/auth`
4. **Error Logging**: Add structured logging (Winston, Pino)

### Future Enhancements
1. **Enhanced Health Checks**: Include database and external service status
2. **API Versioning**: Support multiple API versions (v1, v2)
3. **Rate Limiting**: Protect endpoints from abuse
4. **Request Validation**: Use Zod schemas for input validation
5. **API Documentation**: Add Swagger/OpenAPI documentation
6. **Testing Infrastructure**: Unit tests, integration tests, E2E tests
7. **Monitoring**: Application performance monitoring (APM)
8. **Caching**: Implement Redis for performance

---

## Guidelines for Adding New Endpoints

1. **Create the Route Handler**: Add to `app/api/[feature]/route.ts`
2. **Define Types**: Add types to module's `types.ts` file
3. **Use ResponseBuilder**: Always use for consistent responses
4. **Validate Input**: Use Zod schemas for request validation
5. **Handle Errors**: Use try-catch and appropriate HTTP status codes
6. **Document**: Add comments explaining the endpoint's purpose
7. **Test**: Write tests before marking as complete

**Example Template:**
```typescript
// app/api/[feature]/route.ts
import { NextRequest } from 'next/server';
import { ResponseBuilder } from '@/src/lib/api/response-builder';

export async function GET(request: NextRequest) {
  try {
    // 1. Extract query parameters
    // 2. Validate input
    // 3. Call service layer
    // 4. Return success response
    return ResponseBuilder.success(data);
  } catch (error) {
    // Handle specific error types
    return ResponseBuilder.error('Error message', 500);
  }
}
```

---

## Conclusion

This architecture provides:
- ✅ Clean separation of concerns
- ✅ Type-safe development experience
- ✅ Scalable modular structure
- ✅ Consistent API responses
- ✅ Easy to test and maintain
- ✅ Ready for team collaboration

The foundation is now in place to build robust features for the Education Consultancy and Student CRM platform.
