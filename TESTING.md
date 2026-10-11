# Testing the Education Platform API

## Running the Development Server

Start the Next.js development server:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## Testing the Health Endpoint

### Method 1: Using a Web Browser

Open your browser and navigate to:
```
http://localhost:3000/api/health
```

### Method 2: Using PowerShell (Invoke-RestMethod)

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get | ConvertTo-Json -Depth 10
```

### Method 3: Using PowerShell (Invoke-WebRequest)

```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/health" -Method Get
$response.Content
```

### Method 4: Using curl (if installed)

```bash
curl http://localhost:3000/api/health
```

## Expected Response

When the service is healthy, you should receive a `200 OK` response with this JSON structure:

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

## Response Fields Explained

- **success**: Boolean indicating if the request was successful
- **data**: The actual response payload
  - **status**: Health status (`"healthy"` or `"unhealthy"`)
  - **timestamp**: ISO 8601 timestamp when the health check was performed
  - **version**: Application version from configuration
- **timestamp**: ISO 8601 timestamp when the response was generated

## Testing Error Scenarios

The health endpoint includes error handling. In case of an unexpected error, it will return a `503 Service Unavailable` response:

```json
{
  "status": "unhealthy",
  "timestamp": "2026-10-10T12:00:00.000Z",
  "error": "Error message here"
}
```

## Production Build Testing

To test the production build locally:

```bash
# Build the application
npm run build

# Start the production server
npm start
```

Then test the endpoint at `http://localhost:3000/api/health` using any of the methods above.

## Next Steps

Once the health endpoint is verified:
1. Database connection can be added and checked in the health endpoint
2. Authentication endpoints can be implemented
3. Student management APIs can be developed
4. More comprehensive testing infrastructure can be added
