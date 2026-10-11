# Backend Architecture

This directory contains the backend infrastructure for the Education Platform API.

## Directory Structure

```
src/
├── lib/                    # Shared utilities and infrastructure
│   ├── api/               # API-related utilities
│   │   ├── types.ts       # Shared TypeScript types for API responses
│   │   └── response-builder.ts  # Utility for consistent JSON responses
│   └── config/            # Application configuration
│       └── index.ts       # Centralized config and environment variables
│
└── modules/               # Feature-based business modules (to be added)
    ├── students/          # Student management module (future)
    ├── consultancy/       # Consultancy features (future)
    └── auth/              # Authentication module (future)
```

## Design Principles

### 1. **Feature-Based Modular Architecture**
- Each business domain will be a separate module under `src/modules/`
- Modules are self-contained with their own models, services, and controllers
- Promotes maintainability and scalability

### 2. **Shared Infrastructure**
- `src/lib/` contains utilities used across modules
- Ensures consistency in API responses, error handling, and configuration

### 3. **Type Safety**
- Full TypeScript coverage for type safety
- Zod for runtime validation (already installed)
- Consistent type definitions in `src/lib/api/types.ts`

### 4. **Separation of Concerns**
- Route Handlers (in `app/api/`) handle HTTP layer
- Business logic lives in module services
- Data access through model layer (Mongoose)

## Current Implementation

### Health Endpoint
- **Route:** `GET /api/health`
- **Purpose:** Service health monitoring
- **Location:** `app/api/health/route.ts`
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "status": "healthy",
      "timestamp": "2026-10-10T12:00:00.000Z",
      "version": "0.1.0"
    },
    "timestamp": "2026-10-10T12:00:00.000Z"
  }
  ```

## Next Steps

1. Add database connection utilities
2. Implement authentication module
3. Create student management module
4. Add consultancy features
5. Implement testing infrastructure
