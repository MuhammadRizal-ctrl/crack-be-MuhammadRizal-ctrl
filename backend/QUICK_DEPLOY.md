# ⚡ Quick Deployment (5 Minutes)

## 1. Push Backend to GitHub

```bash
cd backend
git init
git add .
git commit -m "Ready for deployment"
git remote add origin https://github.com/YOUR_USERNAME/crack-fe-backend.git
git push -u origin main
```

## 2. Deploy on Railway

1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select your backend repo
4. Add PostgreSQL service
5. Set these env vars:

```env
DATABASE_URL=<from-postgres-service>
JWT_SECRET=<random-string>
JWT_REFRESH_SECRET=<random-string>
FRONTEND_URL=https://your-frontend.vercel.app
GOOGLE_CALLBACK_URL=https://your-backend.railway.app/api/v1/auth/google/callback
```

6. Deploy!

## 3. Run Migrations

Railway Console:
```bash
npx prisma migrate deploy
```

## 4. Update Google OAuth

Add redirect URI: `https://your-backend.railway.app/api/v1/auth/google/callback`

## 5. Update Frontend

Vercel → Environment Variables:
```
VITE_API_BASE_URL=https://your-backend.railway.app/api
```

Redeploy frontend.

**Done!** 🎉

