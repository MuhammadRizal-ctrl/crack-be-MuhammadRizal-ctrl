# SMTP Setup Guide

This guide will help you configure SMTP for email functionality (verification, password reset, notifications).

## 🎯 Quick Setup Options

### Option 1: SendGrid (Recommended - Free Tier Available)

**Why SendGrid?**
- ✅ Free tier: 100 emails/day forever
- ✅ Easy setup
- ✅ Reliable delivery
- ✅ Good for production

**Steps:**

1. **Sign up for SendGrid:**
   - Go to https://signup.sendgrid.com
   - Create a free account
   - Verify your email

2. **Create API Key:**
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name it (e.g., "CodeCamp LMS")
   - Select "Full Access" or "Restricted Access" with Mail Send permissions
   - **Copy the key immediately** (you won't see it again!)

3. **Verify Sender Identity:**
   - Go to Settings → Sender Authentication
   - Choose "Single Sender Verification" (easiest for testing)
   - Add your email address
   - Verify via email

4. **Add to `.env` file:**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=SG.your-actual-api-key-here
   EMAIL_FROM=your-verified-email@example.com
   ```

---

### Option 2: Gmail (Good for Development)

**Why Gmail?**
- ✅ Free
- ✅ Easy to test
- ⚠️ Limited to 500 emails/day
- ⚠️ Requires App Password (not regular password)

**Steps:**

1. **Enable 2-Factor Authentication:**
   - Go to Google Account → Security
   - Enable 2-Step Verification

2. **Create App Password:**
   - Go to Google Account → Security
   - Under "2-Step Verification", click "App passwords"
   - Select "Mail" and "Other (Custom name)"
   - Enter "CodeCamp LMS"
   - Copy the 16-character password

3. **Add to `.env` file:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-16-char-app-password
   EMAIL_FROM=your-email@gmail.com
   ```

---

### Option 3: Mailgun (Good for Production)

**Why Mailgun?**
- ✅ Free tier: 5,000 emails/month for 3 months
- ✅ Great deliverability
- ✅ Good analytics

**Steps:**

1. **Sign up:** https://www.mailgun.com
2. **Get SMTP credentials:**
   - Go to Sending → Domain Settings
   - Use "Default SMTP credentials"
3. **Add to `.env`:**
   ```env
   SMTP_HOST=smtp.mailgun.org
   SMTP_PORT=587
   SMTP_USER=postmaster@your-domain.mailgun.org
   SMTP_PASSWORD=your-mailgun-password
   EMAIL_FROM=noreply@your-domain.com
   ```

---

### Option 4: AWS SES (For High Volume)

**Why AWS SES?**
- ✅ Very cheap ($0.10 per 1,000 emails)
- ✅ Highly scalable
- ⚠️ Requires AWS account setup
- ⚠️ More complex configuration

**Steps:**

1. **Set up AWS SES:**
   - Create AWS account
   - Go to SES → SMTP Settings
   - Create SMTP credentials
2. **Add to `.env`:**
   ```env
   SMTP_HOST=email-smtp.us-east-1.amazonaws.com
   SMTP_PORT=587
   SMTP_USER=your-smtp-username
   SMTP_PASSWORD=your-smtp-password
   EMAIL_FROM=noreply@your-domain.com
   ```

---

## 📝 Configuration

### Update `.env` File

Open `backend/.env` and add:

```env
# SMTP Configuration
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=your-actual-password-here
EMAIL_FROM=noreply@codecamp.com

# Frontend URL (for email links)
FRONTEND_URL=http://localhost:5173
```

**Important Notes:**
- For SendGrid: `SMTP_USER` must be `apikey` (literal string)
- For Gmail: Use your full email as `SMTP_USER`
- For Mailgun: Use the provided SMTP username
- `EMAIL_FROM` must match your verified sender

---

## ✅ Testing Your SMTP Setup

### Method 1: Test via Registration

1. **Restart your server:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Check server logs:**
   - Look for: `✅ Email service initialized`
   - If you see warnings, SMTP is not configured correctly

3. **Register a new user:**
   ```bash
   curl -X POST http://localhost:3000/api/v1/auth/register \
     -H "Content-Type: application/json" \
     -d '{
       "email": "test@example.com",
       "password": "password123",
       "fullName": "Test User",
       "role": "student"
     }'
   ```

4. **Check your email inbox** for verification email

### Method 2: Test via Swagger

1. Go to: `http://localhost:3000/api/docs`
2. Navigate to `POST /auth/register`
3. Use the example request
4. Check email inbox

### Method 3: Test Password Reset

```bash
curl -X POST http://localhost:3000/api/v1/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "your-email@example.com"}'
```

---

## 🔍 Troubleshooting

### Issue: "Email service not configured"

**Solution:**
- Check `.env` file has all SMTP variables
- Restart server after adding variables
- Check for typos in variable names

### Issue: "Authentication failed"

**Solution:**
- Verify SMTP credentials are correct
- For Gmail: Use App Password, not regular password
- For SendGrid: `SMTP_USER` must be exactly `apikey`
- Check if 2FA is enabled (Gmail)

### Issue: "Connection timeout"

**Solution:**
- Check firewall/network settings
- Try port 465 with `secure: true` (requires code change)
- Verify SMTP host and port are correct

### Issue: "Emails not arriving"

**Solution:**
- Check spam folder
- Verify sender email is authenticated
- Check SendGrid/Mailgun dashboard for delivery status
- Verify `EMAIL_FROM` matches verified sender

### Issue: "Rate limit exceeded"

**Solution:**
- Check your provider's limits
- Wait before sending more emails
- Upgrade your plan if needed

---

## 🔧 Advanced Configuration

### Using Port 465 (SSL)

If port 587 doesn't work, you can use port 465 with SSL:

**Update `.env`:**
```env
SMTP_PORT=465
```

**Update `email.service.ts`** (if needed):
```typescript
secure: true, // for port 465
```

### Using Custom SMTP Settings

You can modify `backend/src/email/email.service.ts` to add:
- Custom timeout settings
- TLS options
- Connection pooling
- Retry logic

---

## 📊 Provider Comparison

| Provider | Free Tier | Best For | Setup Difficulty |
|----------|-----------|----------|------------------|
| **SendGrid** | 100/day forever | Production | ⭐ Easy |
| **Gmail** | 500/day | Development | ⭐⭐ Medium |
| **Mailgun** | 5K/month (3 months) | Production | ⭐ Easy |
| **AWS SES** | Pay per use | High volume | ⭐⭐⭐ Complex |

---

## 🎯 Recommended Setup

**For Development:**
- Use **Gmail** (quick setup, easy testing)

**For Production:**
- Use **SendGrid** (reliable, free tier, easy setup)

**For High Volume:**
- Use **AWS SES** (cheap, scalable)

---

## ✅ Verification Checklist

After setup, verify:

- [ ] SMTP variables added to `.env`
- [ ] Server restarted
- [ ] Logs show "Email service initialized"
- [ ] Test registration sends email
- [ ] Verification email link works
- [ ] Password reset email works

---

## 🚀 Quick Start (SendGrid)

1. **Sign up:** https://signup.sendgrid.com
2. **Create API Key:** Settings → API Keys → Create
3. **Verify sender:** Settings → Sender Authentication
4. **Add to `.env`:**
   ```env
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=SG.your-key-here
   EMAIL_FROM=your-verified-email@example.com
   ```
5. **Restart server**
6. **Test registration**

---

## 📚 Additional Resources

- **SendGrid Docs:** https://docs.sendgrid.com/for-developers/sending-email/getting-started-smtp
- **Gmail App Passwords:** https://support.google.com/accounts/answer/185833
- **Mailgun Docs:** https://documentation.mailgun.com/en/latest/user_manual.html#sending-via-smtp
- **AWS SES:** https://docs.aws.amazon.com/ses/latest/dg/send-email-smtp.html

---

**Need Help?** Check server logs for detailed error messages. Most issues are credential-related.

