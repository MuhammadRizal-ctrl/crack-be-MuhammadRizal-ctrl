# 🚀 Quick Deployment Guide

## For Railway Deployment

1. **Push backend to separate GitHub repo**
2. **Connect to Railway**
3. **Add PostgreSQL service**
4. **Set environment variables** (see `.env.example`)
5. **Deploy!**

## Environment Variables Needed

Copy from `.env.example` and update with production values:
- `DATABASE_URL` - From Railway PostgreSQL
- `JWT_SECRET` - Generate strong random string
- `FRONTEND_URL` - Your Vercel frontend URL
- `GOOGLE_CALLBACK_URL` - `https://your-backend.railway.app/api/v1/auth/google/callback`

## After Deployment

1. Run migrations: `npx prisma migrate deploy`
2. Seed database: `npx prisma db seed`
3. Update Google OAuth redirect URI
4. Update frontend `VITE_API_BASE_URL`

## Health Check

Visit: `https://your-backend.railway.app/api/v1/health`

## Swagger Docs

Visit: `https://your-backend.railway.app/api/docs`

