# Countries Module Documentation

## Overview

The Countries module is a complete CRUD API implementation following a clean, layered architecture pattern. This serves as a reference implementation for other modules in the Education Platform.

---

## Module Structure

```
src/modules/countries/
├── country.types.ts        # TypeScript type definitions
├── country.validation.ts   # Zod validation schemas
├── country.model.ts        # Mongoose database model
├── country.repository.ts   # Data access layer
├── country.service.ts      # Business logic layer
└── country.controller.ts   # HTTP request handling

app/api/countries/
├── route.ts                # List and Create endpoints
└── [id]/
    └── route.ts            # Get, Update, Delete endpoints
```

---

## API Endpoints

### 1. List All Countries
- **Method:** GET
- **Path:** `/api/countries`
- **Response:** Array of country objects
- **Status:** 200 OK

### 2. Get Single Country
- **Method:** GET
- **Path:** `/api/countries/[id]`
- **Response:** Single country object
- **Status:** 200 OK | 404 Not Found | 400 Bad Request

### 3. Create Country
- **Method:** POST
- **Path:** `/api/countries`
- **Body:** `{ name: string, code: string, isActive?: boolean }`
- **Response:** Created country object
- **Status:** 201 Created | 400 Bad Request | 409 Conflict

### 4. Update Country
- **Method:** PATCH
- **Path:** `/api/countries/[id]`
- **Body:** `{ name?: string, code?: string, isActive?: boolean }`
- **Response:** Updated country object
- **Status:** 200 OK | 400 Bad Request | 404 Not Found | 409 Conflict

### 5. Delete Country
- **Method:** DELETE
- **Path:** `/api/countries/[id]`
- **Response:** Deleted country object
- **Status:** 200 OK | 404 Not Found | 400 Bad Request

---

## Data Model

### Country Schema
```typescript
{
  name: string;        // Required, 1-100 characters
  code: string;        // Required, unique, 2-3 uppercase letters
  isActive: boolean;   // Default: true
  createdAt: Date;     // Auto-managed
  updatedAt: Date;     // Auto-managed
}
```

### Validation Rules
- **name:** Trimmed, 1-100 characters
- **code:** Uppercase, 2-3 letters only, must be unique
- **isActive:** Boolean, optional, defaults to true

---

## Architecture Layers

### 1. Types Layer (`country.types.ts`)
- Defines TypeScript interfaces
- Ensures type safety across the module
- Separates DB types from API types

### 2. Validation Layer (`country.validation.ts`)
- Zod schemas for request validation
- Automatic data transformation (trim, uppercase)
- Clear validation error messages

### 3. Model Layer (`country.model.ts`)
- Mongoose schema definition
- Database constraints and indexes
- Automatic timestamp management

### 4. Repository Layer (`country.repository.ts`)
- Direct database operations
- Abstracts MongoDB/Mongoose details
- Focused, single-purpose methods

### 5. Service Layer (`country.service.ts`)
- Business logic implementation
- Duplicate code prevention
- Data transformation for responses

### 6. Controller Layer (`country.controller.ts`)
- HTTP request/response handling
- Input validation coordination
- Error handling and status codes

### 7. Route Layer (`app/api/countries/`)
- Next.js App Router integration
- HTTP method routing
- Thin wrappers around controller

---

## Request Flow

```
HTTP Request
    ↓
Route Handler (app/api/countries/route.ts)
    ↓
Controller (country.controller.ts)
    ├─→ Connect to DB
    ├─→ Validate input (Zod)
    └─→ Call Service
            ↓
Service (country.service.ts)
    ├─→ Business logic
    ├─→ Duplicate checks
    └─→ Call Repository
            ↓
Repository (country.repository.ts)
    └─→ Database operations
            ↓
MongoDB (via Mongoose)
    ↓
Response flows back through layers
    ↓
HTTP Response (JSON)
```

---

## Error Handling

### HTTP Status Codes
- **200 OK** - Successful GET, PATCH, DELETE
- **201 Created** - Successful POST
- **400 Bad Request** - Validation errors, invalid input
- **404 Not Found** - Resource doesn't exist
- **409 Conflict** - Duplicate country code
- **500 Internal Server Error** - Unexpected errors

### Error Response Format
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "code": "ERROR_CODE"
  },
  "timestamp": "2026-10-10T..."
}
```

### Error Codes
- `VALIDATION_ERROR` - Invalid input
- `NOT_FOUND` - Resource not found
- `DUPLICATE_CODE` - Country code already exists

---

## Features

### Implemented
- ✅ Full CRUD operations
- ✅ Input validation with Zod
- ✅ Duplicate code prevention
- ✅ Automatic data transformation
- ✅ MongoDB ID validation
- ✅ Consistent error handling
- ✅ Type safety with TypeScript
- ✅ Database indexes for performance
- ✅ Automatic timestamps

### Security
- ✅ Input sanitization (trim, uppercase)
- ✅ MongoDB ID format validation
- ✅ Safe error messages (no DB details exposed)
- ✅ Parameterized queries (via Mongoose)
- ✅ Unique constraints at DB level

---

## Testing

See `TESTING_COUNTRIES.md` for complete testing instructions.

### Quick Test Commands

**List countries:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/countries" -Method Get | ConvertTo-Json -Depth 10
```

**Create country:**
```powershell
$body = @{ name = "United States"; code = "US" } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/countries" -Method Post -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 10
```

**Get single country:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/countries/{id}" -Method Get | ConvertTo-Json -Depth 10
```

**Update country:**
```powershell
$body = @{ isActive = $false } | ConvertTo-Json
Invoke-RestMethod -Uri "http://localhost:3000/api/countries/{id}" -Method Patch -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 10
```

**Delete country:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/countries/{id}" -Method Delete | ConvertTo-Json -Depth 10
```

---

## Design Patterns Used

1. **Repository Pattern** - Data access abstraction
2. **Service Layer Pattern** - Business logic separation
3. **Controller Pattern** - HTTP handling
4. **DTO Pattern** - Data transfer objects
5. **Singleton Pattern** - Database connection caching
6. **Builder Pattern** - Response building

---

## Benefits of This Architecture

### 1. Separation of Concerns
Each layer has a single, well-defined responsibility.

### 2. Testability
Easy to unit test each layer in isolation.

### 3. Maintainability
Changes are localized to specific layers.

### 4. Reusability
Service methods can be used by multiple controllers.

### 5. Type Safety
Full TypeScript coverage prevents runtime errors.

### 6. Scalability
Easy to add features without affecting existing code.

---

## Usage Examples

### Create a Country
```typescript
// In your code
import { CountryService } from '@/src/modules/countries/country.service';

const service = new CountryService();
const country = await service.createCountry({
  name: "United States",
  code: "US",
  isActive: true
});
```

### Get All Countries
```typescript
const countries = await service.getAllCountries();
```

### Update a Country
```typescript
const updated = await service.updateCountry(id, {
  isActive: false
});
```

---

## Extending This Module

### Add a New Field
1. Update `ICountry` interface in `country.types.ts`
2. Update Mongoose schema in `country.model.ts`
3. Update validation schemas in `country.validation.ts`
4. Update repository methods if needed
5. Update service's `toResponse` method

### Add Search/Filtering
1. Add query parameters to list endpoint
2. Update repository's `findAll` method
3. Add Zod schema for query validation

### Add Pagination
1. Add `page` and `limit` parameters
2. Update repository to use `.skip()` and `.limit()`
3. Return pagination metadata in response

---

## Next Steps

1. **Test all endpoints** - Follow the testing guide
2. **Study the code** - Understand each layer
3. **Apply this pattern** - Use for Students, Consultancy modules
4. **Extend features** - Add search, pagination, etc.

---

## References

- Next.js App Router: https://nextjs.org/docs/app
- Mongoose: https://mongoosejs.com/
- Zod: https://zod.dev/
- TypeScript: https://www.typescriptlang.org/

---

## Support

For questions or issues:
1. Review the implementation guide
2. Check the testing guide
3. Review error messages in server logs
4. Verify database connection with `/api/health`

---

**This module serves as the reference implementation for all future API modules in the Education Platform.**
