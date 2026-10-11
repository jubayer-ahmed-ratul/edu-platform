# Country Study Details API Documentation

## Overview

The Country Details API extends the basic Countries CRUD to support comprehensive study abroad information including overview, costs, study system, and top cities.

---

## Data Model

### Complete Country Structure

```typescript
{
  // Basic fields (required)
  name: string;
  code: string;  // 2-3 letter ISO code
  isActive: boolean;
  
  // Optional fields
  flag?: {
    url: string;
    publicId: string;
  };
  
  overview?: {
    description?: string;
    whyStudyHere?: string[];
    officialLanguages?: string[];
    currency?: {
      name: string;
      code: string;  // ISO currency code
    };
    intakes?: string[];  // e.g., ["January", "May", "September"]
  };
  
  studyCosts?: {
    currencyCode: string;  // ISO currency code (required if studyCosts present)
    academicYear?: string;  // e.g., "2026-2027"
    
    // All cost ranges are optional
    averageAnnualTuition?: { min?: number; max?: number };
    bachelorsTuition?: { min?: number; max?: number };
    mastersTuition?: { min?: number; max?: number };
    monthlyLivingCost?: { min?: number; max?: number };
    monthlyAccommodationCost?: { min?: number; max?: number };
    monthlyFoodCost?: { min?: number; max?: number };
    annualHealthInsuranceCost?: { min?: number; max?: number };
    
    otherEstimatedFees?: Array<{
      name: string;
      min?: number;
      max?: number;
      notes?: string;
    }>;
    
    sourceUrl?: string;  // HTTPS URL to source
    lastVerifiedAt?: Date;
  };
  
  studySystem?: {
    bachelorsDuration?: string;  // e.g., "3-4 years"
    mastersDuration?: string;  // e.g., "1-2 years"
    academicYearStructure?: string;  // e.g., "2 semesters"
    semestersPerYear?: number;
    intakesPerYear?: number;
    admissionRequirements?: string[];
    
    englishTests?: Array<{
      testName: string;  // e.g., "IELTS", "TOEFL", "PTE"
      minimumScore?: string;  // String because formats differ
      notes?: string;
    }>;
    
    academicQualifications?: string[];
    sourceUrl?: string;  // HTTPS URL to source
    lastVerifiedAt?: Date;
  };
  
  topCities?: Array<{
    name: string;
    slug: string;  // URL-friendly, lowercase with hyphens
    image?: {
      url: string;
      publicId: string;
    };
    description?: string;
    livingCost?: { min?: number; max?: number };
    currencyCode?: string;
    popularUniversities?: string[];
    popularSubjects?: string[];
    suitableFor?: string[];  // e.g., ["Budget students", "Tech enthusiasts"]
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}
```

---

## API Endpoints

### 1. Get Single Country with Details

**GET** `/api/countries/[id]`

Returns complete country information including all details.

**Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "67890abcdef12345",
    "name": "United Kingdom",
    "code": "GB",
    "isActive": true,
    "flag": {
      "url": "https://res.cloudinary.com/.../flag.webp",
      "publicId": "edu-platform/countries/flag_123"
    },
    "overview": {
      "description": "The UK offers world-class education with rich history and diverse culture.",
      "whyStudyHere": [
        "Home to prestigious universities like Oxford and Cambridge",
        "1-year master's programs save time and money",
        "Post-study work visa available"
      ],
      "officialLanguages": ["English"],
      "currency": {
        "name": "British Pound",
        "code": "GBP"
      },
      "intakes": ["September", "January", "May"]
    },
    "studyCosts": {
      "currencyCode": "GBP",
      "academicYear": "2026-2027",
      "bachelorsTuition": {
        "min": 10000,
        "max": 38000
      },
      "mastersTuition": {
        "min": 12000,
        "max": 45000
      },
      "monthlyLivingCost": {
        "min": 1000,
        "max": 1800
      },
      "sourceUrl": "https://www.universitiesuk.ac.uk/fees-example",
      "lastVerifiedAt": "2026-10-01T00:00:00.000Z"
    },
    "studySystem": {
      "bachelorsDuration": "3-4 years",
      "mastersDuration": "1 year",
      "academicYearStructure": "3 terms (Autumn, Spring, Summer)",
      "semestersPerYear": 3,
      "intakesPerYear": 3,
      "englishTests": [
        {
          "testName": "IELTS",
          "minimumScore": "6.0-7.5 (varies by course)",
          "notes": "Most universities accept IELTS"
        },
        {
          "testName": "TOEFL",
          "minimumScore": "80-100",
          "notes": "Widely accepted alternative"
        }
      ],
      "academicQualifications": [
        "High school diploma for undergraduate",
        "Bachelor's degree for postgraduate"
      ]
    },
    "topCities": [
      {
        "name": "London",
        "slug": "london",
        "description": "Capital city with world-class universities",
        "livingCost": {
          "min": 1200,
          "max": 2000
        },
        "currencyCode": "GBP",
        "popularUniversities": [
          "Imperial College London",
          "UCL",
          "King's College London"
        ],
        "popularSubjects": [
          "Business",
          "Engineering",
          "Medicine"
        ]
      }
    ],
    "createdAt": "2026-10-10T10:00:00.000Z",
    "updatedAt": "2026-10-10T12:00:00.000Z"
  },
  "timestamp": "2026-10-10T12:05:00.000Z"
}
```

---

### 2. Update Country Details

**PATCH** `/api/countries/[id]`

Update any combination of country fields. Each nested object is **replaced** entirely when provided.

**Request Body Examples:**

#### Example 1: Update Overview Only

```json
{
  "overview": {
    "description": "Updated description",
    "whyStudyHere": [
      "Reason 1",
      "Reason 2"
    ],
    "officialLanguages": ["English"],
    "currency": {
      "name": "US Dollar",
      "code": "USD"
    },
    "intakes": ["Fall", "Spring"]
  }
}
```

#### Example 2: Update Study Costs

```json
{
  "studyCosts": {
    "currencyCode": "CAD",
    "academicYear": "2026-2027",
    "bachelorsTuition": {
      "min": 15000,
      "max": 35000
    },
    "mastersTuition": {
      "min": 18000,
      "max": 40000
    },
    "monthlyLivingCost": {
      "min": 1000,
      "max": 1500
    },
    "sourceUrl": "https://example.com/tuition",
    "lastVerifiedAt": "2026-10-10"
  }
}
```

#### Example 3: Add Top Cities

```json
{
  "topCities": [
    {
      "name": "Toronto",
      "slug": "toronto",
      "description": "Canada's largest city with diverse culture",
      "livingCost": {
        "min": 1200,
        "max": 1800
      },
      "currencyCode": "CAD",
      "popularUniversities": [
        "University of Toronto",
        "York University"
      ],
      "popularSubjects": [
        "Computer Science",
        "Business"
      ],
      "suitableFor": [
        "Tech enthusiasts",
        "International students"
      ]
    },
    {
      "name": "Vancouver",
      "slug": "vancouver",
      "description": "Beautiful coastal city",
      "livingCost": {
        "min": 1300,
        "max": 2000
      },
      "currencyCode": "CAD"
    }
  ]
}
```

#### Example 4: Update Multiple Sections

```json
{
  "overview": {
    "description": "New description"
  },
  "studyCosts": {
    "currencyCode": "AUD",
    "bachelorsTuition": {
      "min": 20000,
      "max": 45000
    }
  }
}
```

**Response (200 OK):**
Same structure as GET response with updated data.

---

### 3. List Countries

**GET** `/api/countries`

Returns all countries with all available details.

**Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "United Kingdom",
      "code": "GB",
      "isActive": true,
      "overview": { ... },
      "studyCosts": { ... },
      ...
    },
    {
      "id": "...",
      "name": "Canada",
      "code": "CA",
      "isActive": true
      // May not have details yet
    }
  ],
  "timestamp": "..."
}
```

---

### 4. Create Country

**POST** `/api/countries`

Create a country with optional details from the start.

**Request Body:**
```json
{
  "name": "Australia",
  "code": "AU",
  "isActive": true,
  "overview": {
    "description": "Study in Australia description",
    "officialLanguages": ["English"]
  }
}
```

**Response (201 Created):**
Same structure as GET response.

---

## Validation Rules

### Cost Ranges
- All monetary values must be non-negative
- `min` cannot exceed `max`
- Both min and max are optional

### URLs
- Must be HTTPS
- Applied to: `sourceUrl`, flag URL, city image URL

### City Slugs
- Must be lowercase
- Can contain letters, numbers, and hyphens only
- Example: `new-york`, `london`, `san-francisco`

### Currency Codes
- Automatically converted to uppercase
- Should follow ISO 4217 (e.g., USD, GBP, CAD)

### English Test Names
- Free-form string
- Common values: IELTS, TOEFL, PTE, Duolingo

---

## Error Responses

### 400 Bad Request - Invalid Data

```json
{
  "success": false,
  "error": {
    "message": "Minimum cost cannot exceed maximum cost",
    "code": "VALIDATION_ERROR"
  },
  "timestamp": "..."
}
```

### 404 Not Found

```json
{
  "success": false,
  "error": {
    "message": "Country not found",
    "code": "NOT_FOUND"
  },
  "timestamp": "..."
}
```

---

## Testing with PowerShell

### Test 1: Get Country Details

```powershell
# Get a country by ID
$countryId = "YOUR_COUNTRY_ID_HERE"
Invoke-RestMethod -Uri "http://localhost:3000/api/countries/$countryId" | ConvertTo-Json -Depth 10
```

### Test 2: Update Overview

```powershell
$body = @{
  overview = @{
    description = "Test overview description"
    whyStudyHere = @("Reason 1", "Reason 2", "Reason 3")
    officialLanguages = @("English")
    currency = @{
      name = "British Pound"
      code = "GBP"
    }
    intakes = @("September", "January")
  }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:3000/api/countries/$countryId" -Method Patch -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 10
```

### Test 3: Update Study Costs

```powershell
$body = @{
  studyCosts = @{
    currencyCode = "USD"
    academicYear = "2026-2027"
    bachelorsTuition = @{
      min = 25000
      max = 55000
    }
    mastersTuition = @{
      min = 30000
      max = 65000
    }
    monthlyLivingCost = @{
      min = 1000
      max = 2000
    }
    sourceUrl = "https://example.com/costs"
  }
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:3000/api/countries/$countryId" -Method Patch -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 10
```

### Test 4: Add Cities

```powershell
$body = @{
  topCities = @(
    @{
      name = "London"
      slug = "london"
      description = "Capital city"
      livingCost = @{
        min = 1200
        max = 2000
      }
      currencyCode = "GBP"
      popularUniversities = @("Imperial", "UCL", "King's")
      popularSubjects = @("Engineering", "Business", "Medicine")
      suitableFor = @("International students", "Research-focused students")
    }
  )
} | ConvertTo-Json -Depth 10

Invoke-RestMethod -Uri "http://localhost:3000/api/countries/$countryId" -Method Patch -Body $body -ContentType "application/json" | ConvertTo-Json -Depth 10
```

### Test 5: Invalid Cost Range (Should Fail)

```powershell
$body = @{
  studyCosts = @{
    currencyCode = "USD"
    bachelorsTuition = @{
      min = 50000
      max = 30000  # Invalid: min > max
    }
  }
} | ConvertTo-Json -Depth 10

try {
  Invoke-RestMethod -Uri "http://localhost:3000/api/countries/$countryId" -Method Patch -Body $body -ContentType "application/json"
} catch {
  $_.Exception.Response | ConvertTo-Json
}
```

### Test 6: Negative Cost (Should Fail)

```powershell
$body = @{
  studyCosts = @{
    currencyCode = "USD"
    monthlyLivingCost = @{
      min = -100  # Invalid: negative
      max = 1000
    }
  }
} | ConvertTo-Json -Depth 10

try {
  Invoke-RestMethod -Uri "http://localhost:3000/api/countries/$countryId" -Method Patch -Body $body -ContentType "application/json"
} catch {
  Write-Host "Error (Expected):" $_.Exception.Message
}
```

---

## Data Migration

**No destructive migration required.**

- Existing countries without new fields will continue to work
- New fields are optional and won't appear in responses if not set
- You can gradually add details to existing countries via PATCH requests

---

## Important Notes

### 1. Data is Illustrative

All tuition fees, costs, and requirements in examples are **sample data for testing purposes**. Do not treat them as factual information.

### 2. Verification Required

When adding real country data:
- Always include `sourceUrl` pointing to official sources
- Set `lastVerifiedAt` to track data freshness
- Review and update information periodically as fees and requirements change

### 3. Institution-Specific Information

Country-level data provides **general guidance only**. Actual:
- Tuition fees vary by university and program
- Admission requirements differ by institution and course
- English test scores are minimums; competitive programs may require higher
- Living costs vary by city and lifestyle

### 4. Nested Object Replacement

When updating nested objects like `overview` or `studyCosts`:
- The **entire object is replaced**
- If you only want to update one field, you must send the complete object
- Example: To update only `description`, you must also include other overview fields you want to keep

### 5. City Images

City images use the same Cloudinary infrastructure as country flags. Upload city images via the country flag upload endpoint, then use the returned `url` and `publicId` in city data.

---

## Best Practices

### 1. Source Documentation

Always document where information came from:
```json
{
  "studyCosts": {
    "sourceUrl": "https://www.gov.uk/study-in-uk/fees",
    "lastVerifiedAt": "2026-10-10"
  }
}
```

### 2. Cost Ranges

Provide ranges rather than exact figures:
```json
{
  "bachelorsTuition": {
    "min": 10000,
    "max": 38000
  }
}
```

### 3. Clear Disclaimers

In your frontend, always display:
- "Fees are estimates and vary by institution"
- "Requirements are general guidelines"
- "Last verified: [date]"

### 4. Regular Updates

- Review cost data annually
- Update `lastVerifiedAt` when information is reverified
- Archive outdated source URLs

---

## Summary

✅ Backend implementation complete
✅ All fields optional (except required basic country fields)
✅ Existing countries remain compatible
✅ Validation prevents invalid data
✅ Ready for frontend integration

The API is ready for testing. Use the PowerShell examples above to populate and verify country details.
