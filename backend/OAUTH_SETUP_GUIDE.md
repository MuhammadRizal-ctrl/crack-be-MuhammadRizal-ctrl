# OAuth Setup Guide

## ✅ What's Implemented

### OAuth Providers
- ✅ **Google OAuth** - Fully implemented
- ✅ **GitHub OAuth** - Fully implemented
- 🚧 **Apple OAuth** - Not yet implemented
- 🚧 **Facebook OAuth** - Not yet implemented

### Features
- ✅ OAuth user creation/linking
- ✅ Automatic email verification for OAuth users
- ✅ Account linking (if email matches existing account)
- ✅ JWT token generation after OAuth login
- ✅ Redirect to frontend with tokens

---

## 🔧 Setup Instructions

### 1. Google OAuth Setup

**Step 1: Create Google OAuth Credentials**

1. Go to: https://console.cloud.google.com/
2. Create a new project or select existing
3. Enable **Google+ API**
4. Go to: **APIs & Services** → **Credentials**
5. Click: **Create Credentials** → **OAuth client ID**
6. Application type: **Web application**
7. Authorized redirect URIs:
   ```
   http://localhost:3000/api/v1/auth/google/callback
   https://yourdomain.com/api/v1/auth/google/callback
   ```
8. Copy **Client ID** and **Client Secret**

**Step 2: Add to `.env`**

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/v1/auth/google/callback
```

---

### 2. GitHub OAuth Setup

**Step 1: Create GitHub OAuth App**

1. Go to: https://github.com/settings/developers
2. Click: **New OAuth App**
3. Fill in:
   - **Application name**: CodeCamp LMS
   - **Homepage URL**: `http://localhost:5173`
   - **Authorization callback URL**: `http://localhost:3000/api/v1/auth/github/callback`
4. Click: **Register application**
5. Copy **Client ID**
6. Click: **Generate a new client secret**
7. Copy **Client Secret**

**Step 2: Add to `.env`**

```env
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
GITHUB_CALLBACK_URL=http://localhost:3000/api/v1/auth/github/callback
```

---

## 🧪 Testing OAuth

### Test Google OAuth

1. **Start your server:**
   ```bash
   npm run start:dev
   ```

2. **Visit in browser:**
   ```
   http://localhost:3000/api/v1/auth/google
   ```

3. **You'll be redirected to:**
   - Google login page
   - After login, back to your callback
   - Then to frontend with tokens

### Test GitHub OAuth

1. **Visit in browser:**
   ```
   http://localhost:3000/api/v1/auth/github
   ```

2. **You'll be redirected to:**
   - GitHub login page
   - After authorization, back to your callback
   - Then to frontend with tokens

---

## 📋 API Endpoints

### Google OAuth
- `GET /api/v1/auth/google` - Initiate Google login
- `GET /api/v1/auth/google/callback` - OAuth callback (handled automatically)

### GitHub OAuth
- `GET /api/v1/auth/github` - Initiate GitHub login
- `GET /api/v1/auth/github/callback` - OAuth callback (handled automatically)

---

## 🔄 OAuth Flow

```
1. User clicks "Login with Google/GitHub"
2. Redirected to provider login page
3. User authorizes application
4. Provider redirects to /callback with code
5. Backend exchanges code for user info
6. User created/linked in database
7. JWT tokens generated
8. Redirect to frontend with tokens
```

---

## 📝 Frontend Integration

**Create callback handler in frontend:**

```typescript
// In your frontend auth callback page
const params = new URLSearchParams(window.location.search);
const token = params.get('token');
const refreshToken = params.get('refreshToken');

if (token) {
  // Store tokens
  localStorage.setItem('token', token);
  localStorage.setItem('refreshToken', refreshToken);
  
  // Redirect to dashboard
  window.location.href = '/dashboard';
}
```

**Add OAuth buttons:**

```tsx
<a href="http://localhost:3000/api/v1/auth/google">
  Login with Google
</a>

<a href="http://localhost:3000/api/v1/auth/github">
  Login with GitHub
</a>
```

---

## ✅ Status

| Provider | Status | Setup Required |
|----------|--------|----------------|
| Google | ✅ Complete | OAuth credentials |
| GitHub | ✅ Complete | OAuth app |
| Apple | ❌ Not started | - |
| Facebook | ❌ Not started | - |

---

## 🚀 Next Steps

1. **Add OAuth credentials to `.env`**
2. **Test Google OAuth**
3. **Test GitHub OAuth**
4. **Integrate frontend buttons**
5. **Add Apple/Facebook (optional)**

---

**OAuth is ready!** Just add your credentials and test it.

