# ✅ Deployment Checklist

## Pre-Deployment

- [ ] Backend code pushed to separate GitHub repository
- [ ] All environment variables documented in `.env.example`
- [ ] Database migrations tested locally
- [ ] Build succeeds locally (`npm run build`)
- [ ] All tests pass (if any)

## Database Setup

- [ ] PostgreSQL instance created (Railway/Supabase/Neon)
- [ ] Database connection string obtained
- [ ] Database accessible from deployment platform

## Backend Deployment

- [ ] Backend repository connected to Railway/Render
- [ ] All environment variables set in deployment platform
- [ ] Build command configured: `npm install && npx prisma generate && npm run build`
- [ ] Start command configured: `npm run start:prod`
- [ ] Backend URL obtained (e.g., `https://your-app.railway.app`)

## Database Migrations

- [ ] Migrations run on production database
- [ ] Database seeded with initial data (optional)
- [ ] Database schema verified

## OAuth Configuration

- [ ] Google OAuth redirect URI updated:
  - `https://your-backend.railway.app/api/v1/auth/google/callback`
- [ ] GitHub OAuth redirect URI updated (if using):
  - `https://your-backend.railway.app/api/v1/auth/github/callback`

## Frontend Updates

- [ ] Frontend environment variable updated:
  - `VITE_API_BASE_URL=https://your-backend.railway.app/api`
- [ ] Frontend redeployed on Vercel
- [ ] Frontend loads without errors

## Testing

- [ ] Backend health check: `/api/v1/health`
- [ ] Swagger docs accessible: `/api/docs`
- [ ] Login works
- [ ] Register works
- [ ] OAuth login works (Google)
- [ ] API calls from frontend succeed
- [ ] CORS working correctly

## Security

- [ ] JWT secrets are strong and unique
- [ ] Database credentials secure
- [ ] API keys not exposed in frontend
- [ ] HTTPS enabled (Railway does this automatically)

## Monitoring

- [ ] Logs accessible in deployment platform
- [ ] Error tracking set up (optional)
- [ ] Health checks configured

---

**Deployment Complete!** 🎉

