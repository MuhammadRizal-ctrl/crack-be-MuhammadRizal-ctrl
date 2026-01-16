# Backend Deployment Guide 🚀

## 📋 Prerequisites

- Node.js 18+ installed
- PostgreSQL database (we'll use Railway/Supabase/Neon)
- GitHub account
- Vercel account (for frontend)

---

## 🗄️ Step 1: Deploy Database

### Option A: Railway (Recommended - Easy & Free Tier)

1. **Go to Railway**: https://railway.app
2. **Sign up/Login** with GitHub
3. **Create New Project** → "New Project"
4. **Add PostgreSQL**:
   - Click "+ New"
   - Select "PostgreSQL"
   - Railway will create a PostgreSQL instance
5. **Get Connection String**:
   - Click on PostgreSQL service
   - Go to "Variables" tab
   - Copy `DATABASE_URL` (format: `postgresql://postgres:password@host:port/railway`)

### Option B: Supabase (Free Tier)

1. **Go to Supabase**: https://supabase.com
2. **Create New Project**
3. **Get Connection String**:
   - Go to Settings → Database
   - Copy "Connection string" (URI format)

### Option C: Neon (Free Tier)

1. **Go to Neon**: https://neon.tech
2. **Create New Project**
3. **Get Connection String**:
   - Copy connection string from dashboard

---

## 🚂 Step 2: Deploy Backend to Railway

### 2.1 Prepare Backend Repository

1. **Create new GitHub repository** for backend:
   ```bash
   # In backend folder
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/crack-fe-backend.git
   git push -u origin main
   ```

2. **Verify these files exist**:
   - ✅ `package.json`
   - ✅ `tsconfig.json`
   - ✅ `nest-cli.json`
   - ✅ `prisma/schema.prisma`
   - ✅ `.env.example` (create if missing)

### 2.2 Deploy on Railway

1. **Go to Railway**: https://railway.app
2. **New Project** → "Deploy from GitHub repo"
3. **Select your backend repository**
4. **Configure Environment Variables**:
   - Click on your service
   - Go to "Variables" tab
   - Add these variables:

```env
# Database
DATABASE_URL=postgresql://postgres:password@host:port/railway

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-this
JWT_REFRESH_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Frontend URL (Vercel URL)
FRONTEND_URL=https://your-frontend.vercel.app

# OAuth - Google
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=https://your-backend.railway.app/api/v1/auth/google/callback

# OAuth - GitHub (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://your-backend.railway.app/api/v1/auth/github/callback

# Port (Railway sets this automatically)
PORT=3000
```

5. **Configure Build Settings**:
   - Railway auto-detects Node.js
   - Build command: `npm install && npm run build`
   - Start command: `npm run start:prod`

6. **Run Database Migrations**:
   - Railway will run `npm install` automatically
   - Add a one-time command to run migrations:
     - Go to "Settings" → "Deploy"
     - Add build command: `npm install && npx prisma generate && npm run build`
     - Or add a separate service for migrations

7. **Get Your Backend URL**:
   - Railway will assign a URL like: `https://your-app.railway.app`
   - Copy this URL

---

## 🔧 Step 3: Run Database Migrations

### Option A: Run via Railway Console

1. Go to your Railway service
2. Click "View Logs" → "Open Console"
3. Run:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Option B: Run Locally (with production DB)

1. Set `DATABASE_URL` in your local `.env` to production URL
2. Run:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

### Option C: Add Migration Script

Add to `package.json`:
```json
"scripts": {
  "migrate:deploy": "prisma migrate deploy",
  "postinstall": "prisma generate"
}
```

---

## 🔐 Step 4: Update Google OAuth Settings

1. **Go to Google Cloud Console**: https://console.cloud.google.com
2. **APIs & Services** → **Credentials**
3. **Click your OAuth 2.0 Client ID**
4. **Add Authorized redirect URIs**:
   ```
   https://your-backend.railway.app/api/v1/auth/google/callback
   ```
5. **Save**

---

## 🔗 Step 5: Update Frontend

1. **Go to Vercel Dashboard**
2. **Select your frontend project**
3. **Go to Settings** → **Environment Variables**
4. **Add/Update**:
   ```
   VITE_API_BASE_URL=https://your-backend.railway.app/api
   ```
5. **Redeploy** frontend

Or update `frontend/.env.production`:
```env
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

---

## ✅ Step 6: Verify Deployment

1. **Check Backend Health**:
   ```
   https://your-backend.railway.app/api/v1/health
   ```

2. **Check Swagger Docs**:
   ```
   https://your-backend.railway.app/api/docs
   ```

3. **Test Frontend**:
   - Go to your Vercel URL
   - Try login/register
   - Check browser console for API calls

---

## 🐛 Troubleshooting

### Database Connection Issues
- Check `DATABASE_URL` format
- Ensure database is accessible (not blocked by firewall)
- Check Railway/Supabase logs

### Build Failures
- Check Node.js version (should be 18+)
- Verify all dependencies in `package.json`
- Check build logs in Railway

### CORS Issues
- Update `FRONTEND_URL` in backend env vars
- Check CORS settings in `main.ts`

### OAuth Redirect Issues
- Verify callback URL matches exactly
- Check Google Console redirect URIs
- Ensure backend URL is HTTPS

---

## 📝 Production Checklist

- [ ] Database deployed and migrated
- [ ] Backend deployed on Railway
- [ ] Environment variables set
- [ ] Database migrations run
- [ ] Google OAuth redirect URIs updated
- [ ] Frontend API URL updated
- [ ] Frontend redeployed
- [ ] Health check passes
- [ ] Login/Register tested
- [ ] OAuth login tested

---

## 🔄 Alternative Deployment Options

### Render
- Similar to Railway
- Free tier available
- Auto-deploy from GitHub

### Heroku
- Requires credit card for free tier
- Good for production apps

### DigitalOcean App Platform
- Simple deployment
- Pay-as-you-go

---

**Your backend is now ready for deployment!** 🎉

