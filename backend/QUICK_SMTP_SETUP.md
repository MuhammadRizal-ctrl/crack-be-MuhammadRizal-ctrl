# Quick SMTP Setup (5 Minutes)

## 🚀 Fastest Option: SendGrid

### Step 1: Get SendGrid API Key (2 minutes)

1. Go to: https://signup.sendgrid.com
2. Sign up (free account)
3. Verify your email
4. Go to: **Settings → API Keys**
5. Click: **"Create API Key"**
6. Name: `CodeCamp LMS`
7. Permissions: **"Full Access"** (or "Restricted Access" with Mail Send)
8. **Copy the key** (starts with `SG.`)

### Step 2: Verify Sender (2 minutes)

1. Go to: **Settings → Sender Authentication**
2. Click: **"Verify a Single Sender"**
3. Fill in your email details
4. Check your email and click verify link

### Step 3: Add to .env (1 minute)

Open `backend/.env` and add:

```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.your-actual-api-key-here
EMAIL_FROM=your-verified-email@example.com
FRONTEND_URL=http://localhost:5173
```

**Important:** 
- `SMTP_USER` must be exactly `apikey` (not your email)
- `SMTP_PASSWORD` is your API key (starts with `SG.`)
- `EMAIL_FROM` must be your verified sender email

### Step 4: Test It

1. **Restart server:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Check logs** - should see:
   ```
   ✅ Email service initialized
   ```

3. **Test registration:**
   - Go to: `http://localhost:3000/api/docs`
   - Try `POST /auth/register`
   - Check your email inbox!

---

## 🎯 Alternative: Gmail (For Testing)

### Step 1: Enable App Password

1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not enabled)
3. Go to: **App passwords**
4. Select: **Mail** → **Other**
5. Name: `CodeCamp LMS`
6. **Copy the 16-character password**

### Step 2: Add to .env

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-16-char-app-password
EMAIL_FROM=your-email@gmail.com
FRONTEND_URL=http://localhost:5173
```

### Step 3: Test

Same as SendGrid - restart server and test!

---

## ✅ Verification

After setup, you should see in server logs:
```
✅ Email service initialized
```

If you see:
```
⚠️ Email service not configured
```

Check:
- ✅ All variables in `.env`
- ✅ No typos
- ✅ Server restarted
- ✅ Credentials are correct

---

## 🆘 Quick Troubleshooting

**"Authentication failed"**
- SendGrid: Make sure `SMTP_USER=apikey` (literal)
- Gmail: Use App Password, not regular password

**"Connection timeout"**
- Check firewall
- Try port 465 instead of 587

**"Emails not sending"**
- Check spam folder
- Verify sender email is authenticated
- Check provider dashboard for errors

---

**That's it!** Your email service should now work. Test by registering a new user.

