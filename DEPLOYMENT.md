# 🚀 Quick Deployment Commands

## Step 1: Git Setup
```bash
# Initialize git (if not done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit: Education CRM"

# Create repo on GitHub first, then:
git remote add origin https://github.com/YOUR_USERNAME/edu-platform.git
git branch -M main
git push -u origin main
```

## Step 2: Verify .env.local is NOT pushed
```bash
# Should show nothing (file is ignored)
git ls-files | grep .env.local

# Should be in .gitignore
cat .gitignore | grep .env
```

## Step 3: Deploy to Vercel

### Option 1: Vercel Dashboard (Recommended)
1. Go to https://vercel.com
2. Import from GitHub
3. Add environment variables:
   - MONGODB_URI
   - CLOUDINARY_CLOUD_NAME
   - CLOUDINARY_API_KEY
   - CLOUDINARY_API_SECRET
4. Deploy!

### Option 2: Vercel CLI
```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Set environment variables
vercel env add MONGODB_URI
vercel env add CLOUDINARY_CLOUD_NAME
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET

# Deploy to production
vercel --prod
```

## Step 4: MongoDB Atlas IP Whitelist
1. Go to MongoDB Atlas
2. Network Access → Add IP Address
3. Allow: 0.0.0.0/0 (for Vercel)

## Step 5: Test Deployment
Visit your deployed URL:
- Homepage: https://your-app.vercel.app
- Countries: https://your-app.vercel.app/countries
- Health API: https://your-app.vercel.app/api/health

## Environment Variables from .env.local

Copy these to Vercel:
```
MONGODB_URI=<your_mongodb_connection_string>
CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>
```

⚠️ NEVER commit .env.local to GitHub!

## Continuous Deployment
After initial setup, just push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push

# Vercel auto-deploys! 🎉
```

## Troubleshooting

### Database connection failed?
- Check MongoDB IP whitelist (0.0.0.0/0)
- Verify MONGODB_URI in Vercel env vars
- Use standard format (not SRV)

### Image upload failed?
- Verify all 3 Cloudinary env vars
- Check Cloudinary account is active

### Build failed?
- Run `npm run build` locally first
- Fix all errors
- Push to GitHub

## Performance Expected
- First Load: 1-2 seconds
- API Response: 100-300ms
- Page Navigation: Instant

## Cost
- Free tier is enough! ✅
- 100 GB bandwidth/month
- Unlimited deployments
