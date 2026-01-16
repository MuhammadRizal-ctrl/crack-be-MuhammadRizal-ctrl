# 🚀 Step-by-Step Deployment Instructions

## 📦 Step 1: Prepare Backend Repository (5 min)

```bash
# Navigate to backend folder
cd backend

# Initialize git (if not already)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Ready for deployment"

# Create new GitHub repository first, then:
git remote add origin https://github.com/YOUR_USERNAME/crack-fe-backend.git
git branch -M main
git push -u origin main
```

**Verify these files exist:**
- ✅ `package.json`
- ✅ `prisma/schema.prisma`
- ✅ `.env.example`
- ✅ `Dockerfile`
- ✅ `railway.json`

---

## 🗄️ Step 2: Deploy Database (5 min)

### Option A: Railway (Recommended)

1. Go to https://railway.app
2. Sign up/Login with GitHub
3. **New Project** → **"New"** → **"Database"** → **"Add PostgreSQL"**
4. Wait for PostgreSQL to provision
5. Click on PostgreSQL service
6. Go to **"Variables"** tab
7. Copy `DATABASE_URL` (format: `postgresql://postgres:password@host:port/railway`)

### Option B: Supabase

1. Go to https://supabase.com
2. Create new project
3. Settings → Database → Connection string (URI)
4. Copy connection string

---

## 🚂 Step 3: Deploy Backend (10 min)

### On Railway:

1. **New Project** → **"Deploy from GitHub repo"**
2. Select your `crack-fe-backend` repository
3. Railway will auto-detect Node.js and start building

4. **Add PostgreSQL Service** (if not already added):
   - Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
   - Link it to your backend service

5. **Set Environment Variables**:
   - Click on your backend service
   - Go to **"Variables"** tab
   - Add these variables:

```env
# Database (from PostgreSQL service)
DATABASE_URL=${{Postgres.DATABASE_URL}}

# JWT Secrets (generate strong random strings)
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-chars
JWT_REFRESH_EXPIRES_IN=7d

# OpenAI
OPENAI_API_KEY=sk-proj-...

# Email
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com

# Frontend URL (your Vercel URL)
FRONTEND_URL=https://your-frontend.vercel.app

# OAuth - Google
GOOGLE_CLIENT_ID=644670628572-fnd7f006gls4hteh8pjan36kj009lrnd.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
GOOGLE_CALLBACK_URL=https://your-backend.railway.app/api/v1/auth/google/callback

# OAuth - GitHub (optional)
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=https://your-backend.railway.app/api/v1/auth/github/callback

# Port (Railway sets this automatically)
PORT=3000
```

6. **Configure Build**:
   - Railway auto-detects, but verify:
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm run start:prod`

7. **Wait for deployment** to complete
8. **Get your backend URL**: `https://your-app.railway.app`

---

## 🔧 Step 4: Run Database Migrations (2 min)

### Via Railway Console:

1. Click on your backend service
2. Click **"View Logs"** → **"Open Console"**
3. Run:
   ```bash
   npx prisma migrate deploy
   npx prisma db seed
   ```

Or add to Railway as a one-time command:
- Settings → Deploy → Add build command with migrations

---

## 🔐 Step 5: Update Google OAuth (3 min)

1. Go to https://console.cloud.google.com
2. **APIs & Services** → **Credentials**
3. Click your OAuth 2.0 Client ID
4. Under **"Authorized redirect URIs"**, add:
   ```
   https://your-backend.railway.app/api/v1/auth/google/callback
   ```
5. **Save**

---

## 🔗 Step 6: Update Frontend (2 min)

### Via Vercel Dashboard:

1. Go to https://vercel.com
2. Select your frontend project
3. **Settings** → **Environment Variables**
4. Add/Update:
   ```
   Name: VITE_API_BASE_URL
   Value: https://your-backend.railway.app/api
   Environment: Production, Preview, Development
   ```
5. **Save**
6. **Redeploy**: Go to **"Deployments"** → Click **"..."** → **"Redeploy"**

---

## ✅ Step 7: Test Everything (5 min)

1. **Backend Health**: 
   - Visit: `https://your-backend.railway.app/api/v1/health`
   - Should return: `{"status":"ok",...}`

2. **Swagger Docs**: 
   - Visit: `https://your-backend.railway.app/api/docs`
   - Should show API documentation

3. **Frontend**: 
   - Visit your Vercel URL
   - Try login/register
   - Check browser console (F12) for API calls
   - Verify API calls go to Railway URL

4. **OAuth**: 
   - Click "Google" button
   - Should redirect to Google login
   - After login, should redirect back to frontend

---

## 🎯 Quick Reference

### URLs After Deployment:
- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-app.railway.app`
- **API Base**: `https://your-app.railway.app/api`
- **Health**: `https://your-app.railway.app/api/v1/health`
- **Swagger**: `https://your-app.railway.app/api/docs`

### Environment Variables Summary:

**Backend (Railway):**
- `DATABASE_URL` - From PostgreSQL service
- `JWT_SECRET` - Strong random string
- `FRONTEND_URL` - Your Vercel URL
- `GOOGLE_CALLBACK_URL` - Railway URL + `/api/v1/auth/google/callback`

**Frontend (Vercel):**
- `VITE_API_BASE_URL` - Railway URL + `/api`

**Google Console:**
- Add redirect URI: Railway URL + `/api/v1/auth/google/callback`

---

## 🐛 Troubleshooting

### Build Fails
- Check Railway logs
- Verify Node.js version (should be 18+)
- Check all dependencies in `package.json`

### Database Connection Error
- Verify `DATABASE_URL` format
- Check database is running
- Ensure migrations ran

### CORS Errors
- Verify `FRONTEND_URL` in backend matches Vercel URL exactly
- Check CORS settings in `main.ts`

### OAuth Redirect Error
- Verify callback URL matches exactly in Google Console
- Check backend URL is HTTPS
- Ensure `GOOGLE_CALLBACK_URL` in backend env vars

---

**Total Time: ~30 minutes** ⏱️

**You're ready to deploy!** 🚀

