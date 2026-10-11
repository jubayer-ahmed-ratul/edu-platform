# Universities Management Module

Complete backend implementation for managing universities in the Education Consultancy CRM.

## Architecture

Follows modular layered architecture:
```
src/modules/universities/
├── university.types.ts       # TypeScript interfaces and types
├── university.validation.ts  # Zod validation schemas
├── university.model.ts       # Mongoose schema and model
├── university.repository.ts  # Data access layer
├── university.service.ts     # Business logic layer
└── university.controller.ts  # HTTP request handlers

app/api/universities/
├── route.ts                  # GET (list), POST (create)
└── [id]/route.ts            # GET (single), PATCH (update), DELETE
```

## University Schema

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | University name (3-200 chars) |
| `slug` | string | Yes | URL-friendly identifier (unique, lowercase, alphanumeric + hyphens) |
| `country` | ObjectId | Yes | Reference to Country document |
| `city` | string | Yes | City name (2-100 chars) |
| `logo` | object | No | University logo image |
| `logo.url` | string | No | Cloudinary image URL |
| `logo.publicId` | string | No | Cloudinary public ID for deletion |
| `coverImage` | object | No | Cover/banner image |
| `coverImage.url` | string | No | Cloudinary image URL |
| `coverImage.publicId` | string | No | Cloudinary public ID for deletion |
| `description` | string | No | Detailed description (10-5000 chars) |
| `website` | string | No | Official website URL (must be HTTPS) |
| `address` | string | No | Physical address (5-500 chars) |
| `establishedYear` | number | No | Year founded (1000 - current year) |
| `institutionType` | enum | No | 'public', 'private', or 'other' |
| `ranking` | array | No | Rankings from various organizations |
| `ranking[].organization` | string | Yes | Ranking org name (e.g., "QS World", "Times Higher Ed") |
| `ranking[].rank` | number | Yes | Rank position (positive integer) |
| `ranking[].year` | number | Yes | Ranking year (1800 - current year) |
| `internationalStudentInfo` | string | No | Info for international students |
| `popularSubjects` | array | No | List of popular subject areas |
| `isActive` | boolean | No | Active status (default: true) |
| `createdAt` | Date | Auto | Creation timestamp |
| `updatedAt` | Date | Auto | Last update timestamp |

### Indexes

- `slug`: Unique index
- `name`: Text search index
- `country`: Filter index
- `city`: Filter index
- `institutionType`: Filter index
- `isActive`: Filter index

## API Endpoints

Base URL: `http://localhost:3000/api/universities`

### 1. List Universities (GET /api/universities)

Retrieve universities with optional filters and pagination.

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | number | 1 | Page number (min: 1) |
| `limit` | number | 10 | Items per page (max: 100) |
| `countryId` | string | - | Filter by country ObjectId |
| `city` | string | - | Filter by city name |
| `institutionType` | string | - | Filter by type: 'public', 'private', 'other' |
| `isActive` | boolean | - | Filter by active status |
| `search` | string | - | Search by university name |

#### PowerShell Examples

**List all universities (default pagination):**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/universities" -Method Get
```

**With pagination:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/universities?page=2&limit=20" -Method Get
```

**Filter by country:**
```powershell
$countryId = "507f1f77bcf86cd799439011"
Invoke-RestMethod -Uri "http://localhost:3000/api/universities?countryId=$countryId" -Method Get
```

**Filter by city:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/universities?city=Melbourne" -Method Get
```

**Filter by institution type:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/universities?institutionType=public" -Method Get
```

**Search by name:**
```powershell
$searchTerm = "Cambridge"
Invoke-RestMethod -Uri "http://localhost:3000/api/universities?search=$searchTerm" -Method Get
```

**Combined filters:**
```powershell
$countryId = "507f1f77bcf86cd799439011"
Invoke-RestMethod -Uri "http://localhost:3000/api/universities?countryId=$countryId&institutionType=public&isActive=true&page=1&limit=50" -Method Get
```

#### Response Format

```json
{
  "success": true,
  "data": {
    "universities": [
      {
        "_id": "507f191e810c19729de860ea",
        "name": "University of Melbourne",
        "slug": "university-of-melbourne",
        "country": {
          "_id": "507f1f77bcf86cd799439011",
          "name": "Australia",
          "code": "AU"
        },
        "city": "Melbourne",
        "logo": {
          "url": "https://res.cloudinary.com/.../logo.jpg",
          "publicId": "universities/logo_abc123"
        },
        "coverImage": {
          "url": "https://res.cloudinary.com/.../cover.jpg",
          "publicId": "universities/cover_xyz789"
        },
        "description": "A leading research university...",
        "website": "https://www.unimelb.edu.au",
        "address": "Parkville VIC 3010, Australia",
        "establishedYear": 1853,
        "institutionType": "public",
        "ranking": [
          {
            "organization": "QS World University Rankings",
            "rank": 33,
            "year": 2024,
            "_id": "507f191e810c19729de860eb"
          }
        ],
        "internationalStudentInfo": "International students welcome...",
        "popularSubjects": ["Medicine", "Law", "Engineering", "Business"],
        "isActive": true,
        "createdAt": "2024-01-15T10:30:00.000Z",
        "updatedAt": "2024-01-20T14:45:00.000Z"
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 48,
      "itemsPerPage": 10,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  },
  "message": "Universities retrieved successfully"
}
```

### 2. Create University (POST /api/universities)

Create a new university.

#### Request Body

```json
{
  "name": "University of Cambridge",
  "slug": "university-of-cambridge",
  "country": "507f1f77bcf86cd799439012",
  "city": "Cambridge",
  "logo": {
    "url": "https://res.cloudinary.com/.../cambridge-logo.jpg",
    "publicId": "universities/cambridge_logo_123"
  },
  "coverImage": {
    "url": "https://res.cloudinary.com/.../cambridge-cover.jpg",
    "publicId": "universities/cambridge_cover_456"
  },
  "description": "The University of Cambridge is a collegiate research university...",
  "website": "https://www.cam.ac.uk",
  "address": "The Old Schools, Trinity Ln, Cambridge CB2 1TN, UK",
  "establishedYear": 1209,
  "institutionType": "public",
  "ranking": [
    {
      "organization": "QS World University Rankings",
      "rank": 2,
      "year": 2024
    },
    {
      "organization": "Times Higher Education",
      "rank": 5,
      "year": 2024
    }
  ],
  "internationalStudentInfo": "Cambridge welcomes students from over 140 countries...",
  "popularSubjects": ["Mathematics", "Natural Sciences", "Engineering", "Computer Science", "Medicine"]
}
```

#### PowerShell Example

```powershell
$body = @{
    name = "University of Cambridge"
    slug = "university-of-cambridge"
    country = "507f1f77bcf86cd799439012"
    city = "Cambridge"
    logo = @{
        url = "https://res.cloudinary.com/.../cambridge-logo.jpg"
        publicId = "universities/cambridge_logo_123"
    }
    coverImage = @{
        url = "https://res.cloudinary.com/.../cambridge-cover.jpg"
        publicId = "universities/cambridge_cover_456"
    }
    description = "The University of Cambridge is a collegiate research university..."
    website = "https://www.cam.ac.uk"
    address = "The Old Schools, Trinity Ln, Cambridge CB2 1TN, UK"
    establishedYear = 1209
    institutionType = "public"
    ranking = @(
        @{
            organization = "QS World University Rankings"
            rank = 2
            year = 2024
        },
        @{
            organization = "Times Higher Education"
            rank = 5
            year = 2024
        }
    )
    internationalStudentInfo = "Cambridge welcomes students from over 140 countries..."
    popularSubjects = @("Mathematics", "Natural Sciences", "Engineering", "Computer Science", "Medicine")
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:3000/api/universities" -Method Post -Body $body -ContentType "application/json"
```

#### Response Format

```json
{
  "success": true,
  "data": {
    "_id": "507f191e810c19729de860ea",
    "name": "University of Cambridge",
    "slug": "university-of-cambridge",
    "country": "507f1f77bcf86cd799439012",
    "city": "Cambridge",
    "logo": {
      "url": "https://res.cloudinary.com/.../cambridge-logo.jpg",
      "publicId": "universities/cambridge_logo_123"
    },
    "coverImage": {
      "url": "https://res.cloudinary.com/.../cambridge-cover.jpg",
      "publicId": "universities/cambridge_cover_456"
    },
    "description": "The University of Cambridge is a collegiate research university...",
    "website": "https://www.cam.ac.uk",
    "address": "The Old Schools, Trinity Ln, Cambridge CB2 1TN, UK",
    "establishedYear": 1209,
    "institutionType": "public",
    "ranking": [
      {
        "organization": "QS World University Rankings",
        "rank": 2,
        "year": 2024,
        "_id": "507f191e810c19729de860eb"
      },
      {
        "organization": "Times Higher Education",
        "rank": 5,
        "year": 2024,
        "_id": "507f191e810c19729de860ec"
      }
    ],
    "internationalStudentInfo": "Cambridge welcomes students from over 140 countries...",
    "popularSubjects": ["Mathematics", "Natural Sciences", "Engineering", "Computer Science", "Medicine"],
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "University created successfully"
}
```

### 3. Get University by ID (GET /api/universities/[id])

Retrieve a single university by its ObjectId.

#### PowerShell Example

```powershell
$universityId = "507f191e810c19729de860ea"
Invoke-RestMethod -Uri "http://localhost:3000/api/universities/$universityId" -Method Get
```

#### Response Format

```json
{
  "success": true,
  "data": {
    "_id": "507f191e810c19729de860ea",
    "name": "University of Cambridge",
    "slug": "university-of-cambridge",
    "country": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "United Kingdom",
      "code": "GB"
    },
    "city": "Cambridge",
    "logo": {
      "url": "https://res.cloudinary.com/.../cambridge-logo.jpg",
      "publicId": "universities/cambridge_logo_123"
    },
    "coverImage": {
      "url": "https://res.cloudinary.com/.../cambridge-cover.jpg",
      "publicId": "universities/cambridge_cover_456"
    },
    "description": "The University of Cambridge is a collegiate research university...",
    "website": "https://www.cam.ac.uk",
    "address": "The Old Schools, Trinity Ln, Cambridge CB2 1TN, UK",
    "establishedYear": 1209,
    "institutionType": "public",
    "ranking": [
      {
        "organization": "QS World University Rankings",
        "rank": 2,
        "year": 2024,
        "_id": "507f191e810c19729de860eb"
      }
    ],
    "internationalStudentInfo": "Cambridge welcomes students from over 140 countries...",
    "popularSubjects": ["Mathematics", "Natural Sciences", "Engineering", "Computer Science", "Medicine"],
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "University retrieved successfully"
}
```

### 4. Update University (PATCH /api/universities/[id])

Update a university (partial update - only provided fields are updated).

#### Request Body (Example - partial update)

```json
{
  "description": "Updated description with more details...",
  "ranking": [
    {
      "organization": "QS World University Rankings",
      "rank": 2,
      "year": 2025
    }
  ],
  "popularSubjects": ["Mathematics", "Physics", "Engineering", "Medicine", "Law"]
}
```

#### PowerShell Example

```powershell
$universityId = "507f191e810c19729de860ea"
$body = @{
    description = "Updated description with more details..."
    ranking = @(
        @{
            organization = "QS World University Rankings"
            rank = 2
            year = 2025
        }
    )
    popularSubjects = @("Mathematics", "Physics", "Engineering", "Medicine", "Law")
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:3000/api/universities/$universityId" -Method Patch -Body $body -ContentType "application/json"
```

#### Response Format

```json
{
  "success": true,
  "data": {
    "_id": "507f191e810c19729de860ea",
    "name": "University of Cambridge",
    "slug": "university-of-cambridge",
    "country": {
      "_id": "507f1f77bcf86cd799439012",
      "name": "United Kingdom",
      "code": "GB"
    },
    "city": "Cambridge",
    "logo": {
      "url": "https://res.cloudinary.com/.../cambridge-logo.jpg",
      "publicId": "universities/cambridge_logo_123"
    },
    "coverImage": {
      "url": "https://res.cloudinary.com/.../cambridge-cover.jpg",
      "publicId": "universities/cambridge_cover_456"
    },
    "description": "Updated description with more details...",
    "website": "https://www.cam.ac.uk",
    "address": "The Old Schools, Trinity Ln, Cambridge CB2 1TN, UK",
    "establishedYear": 1209,
    "institutionType": "public",
    "ranking": [
      {
        "organization": "QS World University Rankings",
        "rank": 2,
        "year": 2025,
        "_id": "507f191e810c19729de860ed"
      }
    ],
    "internationalStudentInfo": "Cambridge welcomes students from over 140 countries...",
    "popularSubjects": ["Mathematics", "Physics", "Engineering", "Medicine", "Law"],
    "isActive": true,
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-20T15:30:00.000Z"
  },
  "message": "University updated successfully"
}
```

### 5. Delete University (DELETE /api/universities/[id])

Delete a university and clean up associated Cloudinary images.

#### PowerShell Example

```powershell
$universityId = "507f191e810c19729de860ea"
Invoke-RestMethod -Uri "http://localhost:3000/api/universities/$universityId" -Method Delete
```

#### Response Format

```json
{
  "success": true,
  "data": null,
  "message": "University deleted successfully"
}
```

## Postman Collection

### Environment Variables

Create a Postman environment with:
- `BASE_URL`: `http://localhost:3000`
- `UNIVERSITY_ID`: (set after creating a university)
- `COUNTRY_ID`: (ObjectId of an existing country)

### Collection Structure

```
Universities Management
├── List Universities
│   └── GET {{BASE_URL}}/api/universities
├── List with Filters
│   └── GET {{BASE_URL}}/api/universities?countryId={{COUNTRY_ID}}&institutionType=public&page=1&limit=20
├── Create University
│   └── POST {{BASE_URL}}/api/universities
├── Get University
│   └── GET {{BASE_URL}}/api/universities/{{UNIVERSITY_ID}}
├── Update University
│   └── PATCH {{BASE_URL}}/api/universities/{{UNIVERSITY_ID}}
└── Delete University
    └── DELETE {{BASE_URL}}/api/universities/{{UNIVERSITY_ID}}
```

### Sample Postman Request - Create University

**Method:** POST  
**URL:** `{{BASE_URL}}/api/universities`  
**Headers:**
- `Content-Type`: `application/json`

**Body (raw JSON):**
```json
{
  "name": "Harvard University",
  "slug": "harvard-university",
  "country": "{{COUNTRY_ID}}",
  "city": "Cambridge",
  "description": "Harvard University is a private Ivy League research university in Cambridge, Massachusetts.",
  "website": "https://www.harvard.edu",
  "address": "Massachusetts Hall, Cambridge, MA 02138, USA",
  "establishedYear": 1636,
  "institutionType": "private",
  "ranking": [
    {
      "organization": "QS World University Rankings",
      "rank": 4,
      "year": 2024
    }
  ],
  "popularSubjects": ["Law", "Medicine", "Business", "Computer Science"]
}
```

**Tests (Postman Scripts):**
```javascript
// Save university ID to environment
if (pm.response.code === 201) {
    const response = pm.response.json();
    pm.environment.set("UNIVERSITY_ID", response.data._id);
}

// Test success
pm.test("University created successfully", function () {
    pm.response.to.have.status(201);
    pm.response.to.have.jsonBody("success", true);
});
```

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "name",
      "message": "Name must be at least 3 characters"
    },
    {
      "field": "website",
      "message": "Website must use HTTPS"
    }
  ]
}
```

### Not Found (404)
```json
{
  "success": false,
  "error": "University not found"
}
```

### Duplicate Slug (409)
```json
{
  "success": false,
  "error": "A university with this slug already exists"
}
```

### Invalid Country (404)
```json
{
  "success": false,
  "error": "Country not found"
}
```

### Server Error (500)
```json
{
  "success": false,
  "error": "Internal server error",
  "message": "An unexpected error occurred"
}
```

## Business Rules

1. **Country Validation**: Referenced country must exist in the Countries collection
2. **Slug Uniqueness**: Slug must be unique across all universities
3. **Image Cleanup**: When updating/deleting, old Cloudinary images are automatically removed
4. **Partial Updates**: PATCH only updates provided fields, preserving others
5. **Population**: Country data is populated in responses (shows country name and code, not just ID)
6. **Text Search**: Search query uses MongoDB text index on name field
7. **Pagination Limits**: Maximum 100 items per page
8. **URL Validation**: Website URLs must use HTTPS protocol
9. **Year Validation**: Established year between 1000 and current year; ranking year between 1800 and current year
10. **Active Status**: isActive defaults to true if not provided

## Future Integration

Universities will be referenced by Courses module:
- Course schema will include `university` field (ObjectId reference)
- Deleting a university should be prevented if courses reference it (future enhancement)
- Or cascade delete/orphan courses (decision pending)

## Testing Checklist

- [ ] List all universities (empty state)
- [ ] Create university with all fields
- [ ] Create university with required fields only
- [ ] List universities (verify pagination)
- [ ] Filter by country
- [ ] Filter by city
- [ ] Filter by institution type
- [ ] Search by name
- [ ] Combined filters
- [ ] Get single university
- [ ] Update university (partial)
- [ ] Update with image change (verify old image deleted)
- [ ] Try duplicate slug (should fail)
- [ ] Try invalid country ID (should fail)
- [ ] Try invalid URL format (should fail)
- [ ] Try year out of range (should fail)
- [ ] Delete university (verify images deleted)
- [ ] Try to get deleted university (should 404)

## Database Queries

### Find universities in a specific country
```javascript
db.universities.find({ country: ObjectId("507f1f77bcf86cd799439012") })
```

### Find public universities
```javascript
db.universities.find({ institutionType: "public" })
```

### Text search
```javascript
db.universities.find({ $text: { $search: "cambridge" } })
```

### Count universities by country
```javascript
db.universities.countDocuments({ country: ObjectId("507f1f77bcf86cd799439012") })
```

### Find by slug
```javascript
db.universities.findOne({ slug: "harvard-university" })
```

## Module Dependencies

```typescript
// External dependencies
- next (Next.js 16 framework)
- mongoose (MongoDB ODM)
- zod (validation)

// Internal dependencies
- @/lib/db/mongoose (database connection)
- @/lib/cloudinary (image management)
- @/lib/api/response-builder (API responses)
- @/modules/countries/country.model (country validation)
```

## Notes

- All timestamps are in UTC
- ObjectIds are MongoDB's 24-character hex strings
- Images are stored in Cloudinary, only URLs and publicIds in database
- Text search is case-insensitive
- Slug format: lowercase, alphanumeric, hyphens only (validated by regex)
- Country population uses Mongoose populate, not manual aggregation
- Repository handles data access, service handles business logic, controller handles HTTP
