# Cloudinary Flag Upload - Quick Setup

## 1. Get Cloudinary Credentials

1. Sign up at https://cloudinary.com
2. Go to Dashboard
3. Copy these from "Product Environment Credentials":
   - Cloud Name
   - API Key
   - API Secret

## 2. Add to .env.local

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

## 3. Restart Server

```bash
npm run dev
```

## 4. Test

1. Go to http://localhost:3000/countries
2. Click "+ Add Country"
3. Fill form and upload flag image
4. Verify flag displays in table

## Files Modified/Created

### New Files (2):
- `src/lib/cloudinary.ts` - Cloudinary utilities
- `app/api/uploads/country-flag/route.ts` - Upload endpoint
- `app/countries/page.tsx` - Countries Management UI

### Updated Files (5):
- `src/modules/countries/country.types.ts` - Added flag field
- `src/modules/countries/country.model.ts` - Added flag to schema
- `src/modules/countries/country.validation.ts` - Added flag validation
- `src/modules/countries/country.repository.ts` - Flag support
- `src/modules/countries/country.service.ts` - Cleanup logic

## Features

- ✅ Upload from local computer (no manual URL entry)
- ✅ Preview before upload
- ✅ Validation (PNG, JPEG, WebP, max 2MB)
- ✅ Auto-cleanup old images on replace/delete
- ✅ Secure (server-side only credentials)

## Security Notes

⚠️ **Before Production:**
- Add authentication to protect `/api/uploads/country-flag`
- Add authorization (admin only)
- Add rate limiting

## Troubleshooting

**"Image upload is not configured"**
- Check all 3 Cloudinary variables in `.env.local`
- Restart dev server

**Images not showing**
- Verify URL is HTTPS
- Check browser console for errors
- Test URL directly in browser

**Old images not deleted**
- Check server logs
- Verify API Secret is correct
- May need manual cleanup in Cloudinary dashboard

## Request Flow

```
User → UI → Upload API → Cloudinary → Get URL
                ↓
         Country API → MongoDB (save URL)
```

## Next Steps

See CLOUDINARY_TESTING_GUIDE.md for comprehensive testing instructions.
