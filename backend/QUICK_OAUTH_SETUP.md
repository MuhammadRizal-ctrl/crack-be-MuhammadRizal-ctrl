# Quick OAuth Setup Guide

## 🔵 Google OAuth Setup (5 minutes)

### Step 1: Create Google Cloud Project

1. Go to: **https://console.cloud.google.com/**
2. Click **"Select a project"** → **"New Project"**
3. Name: `CodeCamp LMS` (or any name)
4. Click **"Create"**

### Step 2: Enable Google+ API

1. In your project, go to: **APIs & Services** → **Library**
2. Search for: **"Google+ API"**
3. Click on it and click **"Enable"**

### Step 3: Create OAuth Credentials

1. Go to: **APIs & Services** → **Credentials**
2. Click: **"+ CREATE CREDENTIALS"** → **"OAuth client ID"**
3. If prompted, configure OAuth consent screen:
   - User Type: **External** (or Internal if you have Google Workspace)
   - App name: `CodeCamp LMS`
   - User support email: Your email
   - Developer contact: Your email
   - Click **"Save and Continue"** through the steps
4. Back to Credentials, click **"OAuth client ID"** again
5. Application type: **Web application**
6. Name: `CodeCamp LMS Web Client`
7. **Authorized redirect URIs:**
   ```
   http://localhost:3000/api/v1/auth/google/callback
   ```
   (Add production URL later: `https://yourdomain.com/api/v1/auth/google/callback`)
8. Click **"Create"**
9. **Copy the Client ID and Client Secret** (you'll see them once)

### Step 4: Add to `.env`

```env
GOOGLE_CLIENT_ID=your-client-id-here.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
```

---

## 🐙 GitHub OAuth Setup (3 minutes)

### Step 1: Create GitHub OAuth App

1. Go to: **https://github.com/settings/developers**
2. Click: **"New OAuth App"** (or "OAuth Apps" → "New OAuth App")
3. Fill in:
   - **Application name**: `CodeCamp LMS`
   - **Homepage URL**: `http://localhost:5173` (your frontend URL)
   - **Authorization callback URL**: `http://localhost:3000/api/v1/auth/github/callback`
4. Click: **"Register application"**
5. **Copy the Client ID** (shown immediately)
6. Click: **"Generate a new client secret"**
7. **Copy the Client Secret** (shown once, save it!)

### Step 2: Add to `.env`

```env
GITHUB_CLIENT_ID=your-github-client-id-here
GITHUB_CLIENT_SECRET=your-github-client-secret-here
GITHUB_CALLBACK_URL=http://localhost:3000/api/v1/auth/github/callback
```

---

## ✅ Complete `.env` Example

Add all these to your `backend/.env` file:

```env
# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback

# GitHub OAuth
GITHUB_CLIENT_ID=Iv1.abcdefghijklmnop
GITHUB_CLIENT_SECRET=abcdefghijklmnopqrstuvwxyz1234567890
GITHUB_CALLBACK_URL=http://localhost:3000/api/v1/auth/github/callback

# Frontend URL (for redirects)
FRONTEND_URL=http://localhost:5173
```

---

## 🧪 Test OAuth

### Test Google OAuth

1. **Restart your server:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Open in browser:**
   ```
   http://localhost:3000/api/v1/auth/google
   ```

3. **You'll be redirected to:**
   - Google login page
   - After login, back to callback
   - Then to frontend with tokens

### Test GitHub OAuth

1. **Open in browser:**
   ```
   http://localhost:3000/api/v1/auth/github
   ```

2. **You'll be redirected to:**
   - GitHub authorization page
   - After authorization, back to callback
   - Then to frontend with tokens

---

## 🔗 Frontend Integration

After OAuth login, users are redirected to:
```
http://localhost:5173/auth/callback?token=JWT_TOKEN&refreshToken=REFRESH_TOKEN
```

**Create a callback page in your frontend:**

```typescript
// frontend/src/pages/AuthCallback.tsx
import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

export function AuthCallback() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    const refreshToken = searchParams.get('refreshToken');

    if (token && refreshToken) {
      // Store tokens
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      
      // Redirect to dashboard
      navigate('/dashboard');
    } else {
      // Error handling
      navigate('/login?error=oauth_failed');
    }
  }, [searchParams, navigate]);

  return <div>Logging you in...</div>;
}
```

**Add OAuth buttons:**

```tsx
<a href="http://localhost:3000/api/v1/auth/google">
  <button>Login with Google</button>
</a>

<a href="http://localhost:3000/api/v1/auth/github">
  <button>Login with GitHub</button>
</a>
```

---

## 🆘 Troubleshooting

### Google OAuth Issues

**"redirect_uri_mismatch"**
- ✅ Check callback URL matches exactly in Google Console
- ✅ Must be: `http://localhost:3000/api/v1/auth/google/callback`

**"invalid_client"**
- ✅ Check Client ID and Secret are correct
- ✅ No extra spaces in `.env` file

### GitHub OAuth Issues

**"redirect_uri_mismatch"**
- ✅ Check callback URL matches exactly
- ✅ Must be: `http://localhost:3000/api/v1/auth/github/callback`

**"bad_verification_code"**
- ✅ Check Client Secret is correct
- ✅ Regenerate if needed

### General Issues

**"OAuth not working"**
- ✅ Check `.env` file has all variables
- ✅ Restart server after adding credentials
- ✅ Check server logs for errors
- ✅ Verify callback URLs match exactly

---

## 📝 Quick Checklist

- [ ] Google Cloud project created
- [ ] Google+ API enabled
- [ ] Google OAuth client created
- [ ] Google credentials added to `.env`
- [ ] GitHub OAuth app created
- [ ] GitHub credentials added to `.env`
- [ ] Server restarted
- [ ] Tested Google OAuth
- [ ] Tested GitHub OAuth

---

**That's it!** Once you add the credentials to `.env` and restart your server, OAuth will work.

