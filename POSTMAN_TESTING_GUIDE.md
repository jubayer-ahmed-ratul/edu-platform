# Postman দিয়ে Countries API Test করার Guide

## 📥 Step 1: Postman Collection Import করো

### Option A: File Import
1. Postman খোলো
2. উপরে **Import** button এ click করো
3. **Choose Files** এ click করো
4. এই file select করো: `postman/Countries-API.postman_collection.json`
5. **Import** button এ click করো

### Option B: Drag & Drop
1. Postman খোলো
2. `postman/Countries-API.postman_collection.json` file টা drag করে Postman এ drop করো

---

## 🚀 Step 2: Dev Server চালাও

Terminal এ যাও এবং run করো:
```bash
npm run dev
```

Server চলছে কিনা check করো: `http://localhost:3000` দেখো

---

## ✅ Step 3: Health Check করো

### Postman এ:
1. Left sidebar থেকে **"Health Check"** request select করো
2. **Send** button এ click করো

### Expected Response (200 OK):
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

✅ যদি `"database": "connected"` দেখো, তাহলে সব ঠিক আছে!

---

## 🧪 Step 4: পর্যায়ক্রমে Test করো

### Test 1: List All Countries (Empty)
**Request:** `1. List All Countries (Empty)`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [],
  "timestamp": "2026-10-10T..."
}
```

খালি array আসবে কারণ এখনো কোনো country add করো নি।

---

### Test 2: Create Bangladesh
**Request:** `2. Create Country - Bangladesh`

Body already আছে:
```json
{
  "name": "Bangladesh",
  "code": "BD"
}
```

**Send** button এ click করো।

**Expected Response (201 Created):**
```json
{
  "success": true,
  "data": {
    "id": "671234abcd567890ef123456",
    "name": "Bangladesh",
    "code": "BD",
    "isActive": true,
    "createdAt": "2026-10-10T...",
    "updatedAt": "2026-10-10T..."
  },
  "timestamp": "2026-10-10T..."
}
```

**🔥 Important:** `id` টা copy করো! পরের test এ লাগবে।

---

### Test 3: Create More Countries
একইভাবে run করো:
- `3. Create Country - United States`
- `4. Create Country - India`

প্রতিবার 201 Created status পাবে।

---

### Test 4: List All Countries (With Data)
**Request:** `5. List All Countries (With Data)`

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id": "...",
      "name": "Bangladesh",
      "code": "BD",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    },
    {
      "id": "...",
      "name": "India",
      "code": "IN",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    },
    {
      "id": "...",
      "name": "United States",
      "code": "US",
      "isActive": true,
      "createdAt": "...",
      "updatedAt": "..."
    }
  ],
  "timestamp": "..."
}
```

---

### Test 5: Get Single Country
**Request:** `6. Get Single Country by ID`

#### URL এ ID দিতে হবে:
1. URL দেখো: `http://localhost:3000/api/countries/{{country_id}}`
2. `{{country_id}}` এর জায়গায় actual ID paste করো
3. অথবা Collection variable set করো:
   - Right-click on collection → Edit
   - Variables tab এ যাও
   - `country_id` এর Current Value তে তোমার ID paste করো

**Send** করো।

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "671234abcd567890ef123456",
    "name": "Bangladesh",
    "code": "BD",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  },
  "timestamp": "..."
}
```

---

### Test 6: Update Country - Make Inactive
**Request:** `7. Update Country - Make Inactive`

URL এ ID replace করো, Body তে আছে:
```json
{
  "isActive": false
}
```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "data": {
    "id": "...",
    "name": "Bangladesh",
    "code": "BD",
    "isActive": false,  ← Changed!
    "createdAt": "...",
    "updatedAt": "..."  ← New timestamp
  },
  "timestamp": "..."
}
```

---

### Test 7: Update Country Name
**Request:** `8. Update Country - Change Name`

**Expected Response (200 OK):**
Name পরিবর্তন হয়ে যাবে।

---

### Test 8: Delete Country
**Request:** `9. Delete Country`

**Expected Response (200 OK):**
Deleted country এর data return করবে।

এরপর আবার List করলে ঐ country আর পাবে না।

---

## 🔴 Step 5: Error Cases Test করো

### Test 9: Duplicate Country Code
**Request:** `ERROR: Duplicate Country Code`

একই code (BD) দিয়ে আরেকবার create করার চেষ্টা করো।

**Expected Response (409 Conflict):**
```json
{
  "success": false,
  "error": {
    "message": "Country code 'BD' already exists",
    "code": "DUPLICATE_CODE"
  },
  "timestamp": "..."
}
```

---

### Test 10: Invalid Country Code
**Request:** `ERROR: Invalid Country Code`

1 letter code দেওয়া (minimum 2 চাই)।

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Country code must be at least 2 characters",
    "code": "VALIDATION_ERROR"
  },
  "timestamp": "..."
}
```

---

### Test 11: Missing Required Field
**Request:** `ERROR: Missing Name`

Name ছাড়া create করার চেষ্টা।

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Country name is required",
    "code": "VALIDATION_ERROR"
  },
  "timestamp": "..."
}
```

---

### Test 12: Invalid ID Format
**Request:** `ERROR: Invalid ID Format`

Wrong format ID দিয়ে get করার চেষ্টা।

**Expected Response (400 Bad Request):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid country ID format",
    "code": "VALIDATION_ERROR"
  },
  "timestamp": "..."
}
```

---

### Test 13: Country Not Found
**Request:** `ERROR: Country Not Found`

Valid format কিন্তু non-existent ID দিয়ে get করার চেষ্টা।

**Expected Response (404 Not Found):**
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

## 📊 Test Results Summary

সব test শেষে তোমার এরকম results থাকা উচিত:

| Test | Method | Expected Status | ✅/❌ |
|------|--------|----------------|-------|
| Health Check | GET | 200 OK | ✅ |
| List (Empty) | GET | 200 OK | ✅ |
| Create Bangladesh | POST | 201 Created | ✅ |
| Create US | POST | 201 Created | ✅ |
| Create India | POST | 201 Created | ✅ |
| List (With Data) | GET | 200 OK | ✅ |
| Get Single | GET | 200 OK | ✅ |
| Update (Inactive) | PATCH | 200 OK | ✅ |
| Update (Name) | PATCH | 200 OK | ✅ |
| Delete | DELETE | 200 OK | ✅ |
| Duplicate Code | POST | 409 Conflict | ✅ |
| Invalid Code | POST | 400 Bad Request | ✅ |
| Missing Name | POST | 400 Bad Request | ✅ |
| Invalid ID | GET | 400 Bad Request | ✅ |
| Not Found | GET | 404 Not Found | ✅ |

---

## 🎯 Pro Tips

### 1. Save Responses
প্রতিটা request এর response save করতে পারো:
- **Save Response** → Example name দাও

### 2. Environment Variables
Collection variable এর বদলে Environment বানাও:
- Manage Environments → Add
- `base_url` = `http://localhost:3000`
- `country_id` = dynamic set করো

### 3. Tests Tab
Postman এ automated tests লিখতে পারো:
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response has success true", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData.success).to.eql(true);
});
```

### 4. Pre-request Script
Automatic ID capture করার জন্য:
```javascript
// Create request এর Tests tab এ:
var jsonData = pm.response.json();
pm.collectionVariables.set("country_id", jsonData.data.id);
```

---

## 🐛 Troubleshooting

### Error: Connect ECONNREFUSED
**সমাধান:** Dev server চালু নেই। `npm run dev` run করো।

### Error: 503 Service Unavailable
**সমাধান:** Database connect হয় নি। `.env.local` check করো।

### Error: Cannot POST/GET/etc
**সমাধান:** URL ঠিক আছে কিনা check করো। Port 3000 ব্যবহার হচ্ছে কিনা দেখো।

### Status 500 Internal Server Error
**সমাধান:** Terminal/Console এ error log দেখো। MongoDB connection check করো।

---

## ✅ Success Checklist

সব test শেষে:
- [ ] Health check কাজ করছে
- [ ] Countries create হচ্ছে
- [ ] List দেখাচ্ছে
- [ ] Single country get করতে পারছি
- [ ] Update করতে পারছি
- [ ] Delete করতে পারছি
- [ ] Duplicate code error দিচ্ছে
- [ ] Validation error proper আসছে
- [ ] Not found error কাজ করছে

---

**এখন Postman খুলে test করতে থাকো! 🚀**

কোনো সমস্যা হলে বলো, আমি help করবো। Happy testing! 😊
