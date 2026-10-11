# MongoDB Connection Troubleshooting

## Issue: DNS SRV Resolution Error

### Error Message
```
querySrv ECONNREFUSED _mongodb._tcp.cluster0.bsfywqv.mongodb.net
```

### Root Cause
Your system's DNS resolver is having trouble resolving MongoDB Atlas SRV records. This is a common issue with:
- Corporate networks with restricted DNS
- VPNs with custom DNS configurations
- Windows DNS cache issues
- Firewalls blocking DNS queries

### Solution Applied

Changed from `mongodb+srv://` format to standard `mongodb://` format with explicit hostnames.

**Before (SRV format):**
```
mongodb+srv://user:pass@cluster0.bsfywqv.mongodb.net/database
```

**After (Standard format):**
```
mongodb://user:pass@host1:27017,host2:27017,host3:27017/database?ssl=true&replicaSet=...
```

This bypasses DNS SRV lookups entirely by specifying the MongoDB nodes directly.

---

## Testing the Fix

### Step 1: Restart Dev Server

Stop the current dev server (Ctrl+C) and restart:
```bash
npm run dev
```

### Step 2: Test the Health Endpoint

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/debug-health" -Method Get | ConvertTo-Json -Depth 10
```

### Step 3: Check for Success

**Expected Output (Success):**
```json
{
  "timestamp": "2026-10-10T...",
  "version": "0.1.0",
  "env": {
    "hasMongoUri": true,
    "mongoUriPrefix": "mongodb://edu-pl...",
    "nodeEnv": "development"
  },
  "connectionStatus": "disconnected",
  "attempting": "Attempting to connect...",
  "connected": true,
  "finalStatus": "connected"
}
```

### Step 4: Test Production Health Endpoint

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/health" -Method Get | ConvertTo-Json -Depth 10
```

**Expected Output (Success):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2026-10-10T...",
    "version": "0.1.0",
    "services": {
      "database": "connected"
    }
  },
  "timestamp": "2026-10-10T..."
}
```

### Step 5: Clean Up Debug Endpoint

Once confirmed working, delete the debug endpoint:
```bash
Remove-Item app\api\debug-health\route.ts
```

---

## Alternative Solutions (If Standard Format Doesn't Work)

### Option 1: Fix DNS Configuration

**Flush DNS cache:**
```powershell
ipconfig /flushdns
```

**Change DNS to Google or Cloudflare:**
```powershell
# This requires admin privileges
# Google DNS: 8.8.8.8, 8.8.4.4
# Cloudflare DNS: 1.1.1.1, 1.0.0.1
```

### Option 2: Use MongoDB Connection String from Atlas

1. Go to MongoDB Atlas Dashboard
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Select "Node.js" as driver
5. Copy the connection string provided
6. It may give you the standard format instead of SRV

### Option 3: Check MongoDB Atlas Settings

**Verify IP Whitelist:**
1. Go to MongoDB Atlas → Network Access
2. Add your current IP address
3. Or add `0.0.0.0/0` for testing (not recommended for production)

**Verify Database User:**
1. Go to MongoDB Atlas → Database Access
2. Ensure user `edu-platform` exists
3. Check password is correct: `iloveYou3000`
4. Ensure user has read/write permissions on `edu_platform` database

**Verify Cluster is Running:**
1. Go to MongoDB Atlas → Database
2. Ensure cluster is not paused
3. Free tier clusters pause after 60 days of inactivity

---

## Common Connection String Parameters

### Standard Format Parameters

| Parameter | Value | Description |
|-----------|-------|-------------|
| `ssl=true` | Required | Atlas requires SSL/TLS |
| `replicaSet` | Cluster-specific | Atlas cluster replica set name |
| `authSource=admin` | Required | Authentication database |
| `retryWrites=true` | Optional | Retry failed writes |
| `w=majority` | Optional | Write concern level |

### Getting Replica Set Name

If the connection still fails, you may need to find the exact replica set name:

1. Connect using MongoDB Compass (if available)
2. Or check MongoDB Atlas dashboard
3. Or try `rs.status()` once connected

The format in the `.env.local` uses a guessed replica set name (`atlas-y1ygq7-shard-0`). If this doesn't work, you can try:
- Omitting the `replicaSet` parameter entirely
- Getting the exact name from MongoDB Atlas

---

## Verification Commands

### Test DNS Resolution

```powershell
# Test with Google DNS
nslookup -type=SRV _mongodb._tcp.cluster0.bsfywqv.mongodb.net 8.8.8.8
```

### Test Direct Host Resolution

```powershell
# Test if individual hosts are reachable
nslookup ac-k3ihwuj-shard-00-00.bsfywqv.mongodb.net
```

### Test Connection from Node

Create a temporary test script:

```javascript
// test-mongo.js
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;
console.log('Connecting to:', uri.substring(0, 30) + '...');

mongoose.connect(uri)
  .then(() => {
    console.log('✅ Connected successfully!');
    console.log('Connection state:', mongoose.connection.readyState);
    process.exit(0);
  })
  .catch((err) => {
    console.error('❌ Connection failed:', err.message);
    process.exit(1);
  });
```

Run it:
```bash
node test-mongo.js
```

---

## Current Status

✅ DNS issue identified
✅ Standard connection format applied to `.env.local`
✅ Debug endpoint created for detailed error checking
⏳ Waiting for restart and test

---

## Next Steps After Successful Connection

1. ✅ Test both debug and production health endpoints
2. ✅ Verify database status shows "connected"
3. ✅ Delete debug endpoint: `app/api/debug-health/route.ts`
4. ✅ Update `.env.example` with working format
5. ✅ Start building database models

---

## Notes

- The standard connection format is more reliable in enterprise environments
- SRV format is easier but requires proper DNS configuration
- Both formats work equally well once connected
- Standard format is slightly more verbose but more explicit

If you continue to have issues after trying the standard format, there may be:
- Firewall blocking MongoDB ports (27017)
- VPN or proxy interfering with connections
- Incorrect credentials or IP not whitelisted
- Cluster is paused or unavailable
