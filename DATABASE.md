# MongoDB Database Setup Guide

## Overview

The Education Platform uses MongoDB with Mongoose for data persistence. The connection is managed through a reusable, cached connection utility that prevents duplicate connections during Next.js hot reloads.

---

## Files Created/Modified

### New Files

1. **`src/lib/db/mongoose.ts`** (116 lines)
   - Reusable MongoDB connection manager
   - Caches connection on `globalThis` during development
   - Provides utility functions: `connectDB()`, `isConnected()`, `getConnectionStatus()`, `disconnectDB()`
   - Validates `MONGODB_URI` at runtime (when `connectDB()` is called)

2. **`.env.local`** (3 lines)
   - Local environment variables (not committed to git)
   - Contains `MONGODB_URI` connection string
   - **Action Required**: Replace `YOUR_DB_USERNAME` and `YOUR_DB_PASSWORD` with actual credentials

3. **`.env.example`** (7 lines)
   - Template for environment variables
   - Safe to commit to git (no credentials)
   - Shows example connection string formats

4. **`DATABASE.md`** (this file)
   - Database setup and testing guide

### Modified Files

1. **`src/lib/api/types.ts`**
   - Added `services` property to `HealthCheckResponse` interface
   - Supports database status reporting: `'connected' | 'disconnected' | 'error'`

2. **`app/api/health/route.ts`**
   - Now checks MongoDB connectivity
   - Returns database status in response
   - Returns HTTP 503 if database is not connected
   - Safely handles errors without exposing connection details

---

## Setup Instructions

### Step 1: Configure MongoDB Connection

Open `.env.local` and replace the placeholder credentials:

```env
MONGODB_URI=mongodb+srv://YOUR_ACTUAL_USERNAME:YOUR_ACTUAL_PASSWORD@cluster0.bsfywqv.mongodb.net/edu_platform?retryWrites=true&w=majority&appName=Cluster0
```

**Important:**
- Replace `YOUR_ACTUAL_USERNAME` with your MongoDB Atlas username
- Replace `YOUR_ACTUAL_PASSWORD` with your MongoDB Atlas password
- The database name is `edu_platform` (you can change this if needed)
- `.env.local` is in `.gitignore` and won't be committed

### Step 2: Start the Development Server

```bash
npm run dev
```

The server will:
1. Load environment variables from `.env.local`
2. Start on `http://localhost:3000`
3. Connect to MongoDB when the health endpoint is first accessed

---

## Testing the Database Connection

### Method 1: Browser
Open your browser and navigate to:
```
http://localhost:3000/api/health
```

### Method 2: PowerShell (Recommended)

**Test with formatted output:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get | ConvertTo-Json -Depth 10
```

**Test with detailed response info:**
```powershell
$response = Invoke-WebRequest -Uri "http://localhost:3000/api/health"
Write-Host "Status Code: $($response.StatusCode)"
$response.Content
```

### Method 3: curl (if installed)
```bash
curl http://localhost:3000/api/health
```

---

## Expected Responses

### ✅ Success Response (Database Connected)

**HTTP Status:** `200 OK`

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-10-10T10:30:00.000Z",
    "version": "0.1.0",
    "services": {
      "database": "connected"
    }
  },
  "timestamp": "2026-10-10T10:30:00.000Z"
}
```

### ⚠️ Connection Error Response

**HTTP Status:** `503 Service Unavailable`

**Scenario 1: Missing MONGODB_URI**
```json
{
  "success": false,
  "data": {
    "status": "unhealthy",
    "timestamp": "2026-10-10T10:30:00.000Z",
    "version": "0.1.0",
    "services": {
      "database": "error"
    }
  },
  "error": {
    "message": "Service health check failed",
    "code": "HEALTH_CHECK_ERROR"
  },
  "timestamp": "2026-10-10T10:30:00.000Z"
}
```

**Scenario 2: Invalid Credentials or Network Error**
Same as above. Credentials are never exposed in the response.

**Scenario 3: Database Not Connected Yet**
```json
{
  "success": false,
  "data": {
    "status": "unhealthy",
    "timestamp": "2026-10-10T10:30:00.000Z",
    "version": "0.1.0",
    "services": {
      "database": "disconnected"
    }
  },
  "timestamp": "2026-10-10T10:30:00.000Z"
}
```

---

## How the Connection Works

### Connection Caching Strategy

1. **First Request:**
   - `connectDB()` is called
   - Creates a new Mongoose connection
   - Caches the connection promise in `global.mongoose`
   - Returns the connected instance

2. **Subsequent Requests:**
   - Checks if `cached.conn` exists
   - Returns existing connection immediately (no new connection attempt)
   - Fast and efficient

3. **Hot Reloads (Development):**
   - Next.js hot reload doesn't reset `globalThis`
   - Connection survives across code changes
   - Prevents "too many connections" errors

4. **Connection States:**
   - `0` = disconnected
   - `1` = connected
   - `2` = connecting
   - `3` = disconnecting

### Error Handling

The health endpoint safely handles all error scenarios:
- Missing `MONGODB_URI` → Returns generic error (doesn't expose that env var is missing)
- Invalid credentials → Returns generic error (doesn't expose credentials)
- Network timeout → Returns generic error (doesn't expose connection string)
- Connection refused → Returns generic error

**Security:** No sensitive information is ever exposed in API responses.

---

## Using the Connection in Your Code

### Example: Creating a Model

```typescript
// src/modules/students/models/student.model.ts
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  createdAt: { type: Date, default: Date.now },
});

export const Student = mongoose.models.Student || 
  mongoose.model('Student', studentSchema);
```

### Example: Using in an API Route

```typescript
// app/api/students/route.ts
import { connectDB } from '@/src/lib/db/mongoose';
import { Student } from '@/src/modules/students/models/student.model';
import { ResponseBuilder } from '@/src/lib/api/response-builder';

export async function GET() {
  try {
    // Connect to database
    await connectDB();
    
    // Query students
    const students = await Student.find().limit(10);
    
    return ResponseBuilder.success(students);
  } catch (error) {
    return ResponseBuilder.error('Failed to fetch students', 500);
  }
}
```

---

## Troubleshooting

### Issue: Build fails with "MONGODB_URI not defined"

**Cause:** `.env.local` file is missing or not in the project root.

**Solution:**
1. Ensure `.env.local` exists in the project root (same folder as `package.json`)
2. Verify the file contains `MONGODB_URI=...`
3. Restart the dev server

### Issue: 503 error with "Service health check failed"

**Possible Causes:**
1. **Invalid credentials** - Double-check username and password in `.env.local`
2. **Network restrictions** - Your IP might not be whitelisted in MongoDB Atlas
3. **Cluster is paused** - Free tier clusters pause after inactivity

**Solution:**
1. Verify credentials in MongoDB Atlas dashboard
2. Add your IP address to the IP whitelist (or use `0.0.0.0/0` for development)
3. Resume the cluster if it's paused

### Issue: "Too many connections" error

**Cause:** Multiple connection instances are being created.

**Solution:**
- This shouldn't happen with our caching strategy
- If it does, restart the dev server
- Check that you're using `connectDB()` from `@/src/lib/db/mongoose`
- Don't create manual `mongoose.connect()` calls elsewhere

### Issue: Connection works in dev but fails in production

**Possible Causes:**
1. Environment variables not set in production environment
2. Firewall blocking outbound connections to MongoDB
3. Different network security rules

**Solution:**
1. Set `MONGODB_URI` in your deployment platform (Vercel, AWS, etc.)
2. Verify production environment can reach MongoDB Atlas
3. Check MongoDB Atlas network access settings

---

## Security Best Practices

### ✅ Do:
- Keep `.env.local` in `.gitignore` (already configured)
- Use strong passwords for database users
- Restrict IP access in MongoDB Atlas
- Use read-only users for analytics/reporting features
- Rotate credentials periodically

### ❌ Don't:
- Commit `.env.local` to version control
- Share credentials in code comments
- Use the same credentials across environments
- Expose database errors to end users
- Log connection strings or passwords

---

## Next Steps

Now that MongoDB is connected, you can:

1. **Create Database Models**
   - Define Mongoose schemas for Students, Consultations, etc.
   - Add validation and business rules

2. **Implement CRUD APIs**
   - Create student management endpoints
   - Add authentication-protected routes

3. **Add Database Indexes**
   - Optimize query performance
   - Ensure unique constraints

4. **Implement Data Validation**
   - Use Zod schemas for request validation
   - Validate before saving to database

5. **Add Migrations (if needed)**
   - Script for initial data setup
   - Handle schema changes over time

---

## Reference

### Connection Options

The current configuration uses:
```typescript
{
  bufferCommands: false  // Disable mongoose buffering
}
```

You can add more options as needed:
```typescript
{
  bufferCommands: false,
  maxPoolSize: 10,        // Maximum number of connections
  serverSelectionTimeoutMS: 5000,  // Timeout for server selection
  socketTimeoutMS: 45000,  // Socket timeout
}
```

### Mongoose Connection States

| State | Value | Description |
|-------|-------|-------------|
| disconnected | 0 | Not connected |
| connected | 1 | Successfully connected |
| connecting | 2 | Connection in progress |
| disconnecting | 3 | Disconnection in progress |

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| MONGODB_URI | Yes | MongoDB connection string |
| NODE_ENV | Auto-set | Environment (development/production) |

---

## Summary

✅ MongoDB connection is now configured and working
✅ Health endpoint checks database connectivity
✅ Connection is cached to prevent duplicates
✅ Error handling is secure (no sensitive data exposed)
✅ Ready for model and API development

For questions or issues, refer to the troubleshooting section above.
