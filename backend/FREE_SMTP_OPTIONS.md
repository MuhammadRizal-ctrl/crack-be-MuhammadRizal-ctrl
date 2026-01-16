# Free SMTP Options (No Credit Card Required)

Here are the best **completely free** SMTP services you can use:

## 🎯 Best Free Options

### 1. **Gmail** (Recommended - Easiest)
**Free:** ✅ Yes (500 emails/day)  
**Credit Card:** ❌ Not required  
**Best For:** Development & Testing

**Setup:**
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
EMAIL_FROM=your-email@gmail.com
```

**How to get App Password:**
1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification**
3. Go to **App passwords**
4. Create password for "Mail" → "Other" → Name it "CodeCamp"
5. Copy the 16-character password

---

### 2. **Brevo (formerly Sendinblue)** ⭐ Best Free Tier
**Free:** ✅ Yes (300 emails/day, unlimited forever)  
**Credit Card:** ❌ Not required  
**Best For:** Production (best free tier!)

**Setup:**
1. Sign up: https://www.brevo.com (free account)
2. Go to: **SMTP & API** → **SMTP**
3. Copy your SMTP credentials

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-smtp-key
EMAIL_FROM=your-verified-email@example.com
```

**Why Brevo?**
- ✅ 300 emails/day forever (no expiry)
- ✅ No credit card needed
- ✅ Good deliverability
- ✅ Easy setup

---

### 3. **Mailtrap** (Best for Testing)
**Free:** ✅ Yes (500 emails/month)  
**Credit Card:** ❌ Not required  
**Best For:** Development (catches all emails, doesn't send real emails)

**Setup:**
1. Sign up: https://mailtrap.io (free account)
2. Go to: **Email Testing** → **Inboxes** → **SMTP Settings**
3. Copy credentials

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password
EMAIL_FROM=noreply@codecamp.com
```

**Why Mailtrap?**
- ✅ Perfect for development
- ✅ Catches all emails (doesn't send to real inboxes)
- ✅ See all emails in dashboard
- ✅ No risk of sending test emails to real users

---

### 4. **Resend** (Modern & Simple)
**Free:** ✅ Yes (3,000 emails/month)  
**Credit Card:** ❌ Not required  
**Best For:** Modern apps

**Setup:**
1. Sign up: https://resend.com (free account)
2. Go to: **API Keys** → Create key
3. Get SMTP credentials from dashboard

```env
SMTP_HOST=smtp.resend.com
SMTP_PORT=587
SMTP_USER=resend
SMTP_PASSWORD=your-resend-api-key
EMAIL_FROM=onboarding@resend.dev
```

---

### 5. **Mailgun** (Good for Production)
**Free:** ✅ Yes (5,000 emails/month for 3 months, then 1,000/month)  
**Credit Card:** ⚠️ Required after 3 months  
**Best For:** Production (if you can add credit card later)

**Setup:**
1. Sign up: https://www.mailgun.com
2. Verify domain or use sandbox domain
3. Get SMTP credentials

```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=postmaster@your-domain.mailgun.org
SMTP_PASSWORD=your-mailgun-password
EMAIL_FROM=noreply@your-domain.com
```

---

## 🚀 Quick Setup Guide

### Option A: Gmail (Fastest - 5 minutes)

1. **Enable 2-Step Verification:**
   - https://myaccount.google.com/security
   - Turn on 2-Step Verification

2. **Create App Password:**
   - Go to: https://myaccount.google.com/apppasswords
   - Select: Mail → Other → "CodeCamp LMS"
   - Copy the 16-character password

3. **Add to `.env`:**
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=xxxx xxxx xxxx xxxx
   EMAIL_FROM=your-email@gmail.com
   FRONTEND_URL=http://localhost:5173
   ```

4. **Restart server and test!**

---

### Option B: Brevo (Best Free Tier - 10 minutes)

1. **Sign up:** https://www.brevo.com
2. **Verify email**
3. **Go to:** SMTP & API → SMTP
4. **Copy SMTP credentials**
5. **Add to `.env`:**
   ```env
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_USER=your-email@example.com
   SMTP_PASSWORD=your-smtp-key-from-brevo
   EMAIL_FROM=your-verified-email@example.com
   FRONTEND_URL=http://localhost:5173
   ```

6. **Restart server and test!**

---

### Option C: Mailtrap (For Development - 5 minutes)

1. **Sign up:** https://mailtrap.io
2. **Go to:** Email Testing → Inboxes → Default
3. **Copy SMTP credentials**
4. **Add to `.env`:**
   ```env
   SMTP_HOST=smtp.mailtrap.io
   SMTP_PORT=2525
   SMTP_USER=your-mailtrap-username
   SMTP_PASSWORD=your-mailtrap-password
   EMAIL_FROM=noreply@codecamp.com
   FRONTEND_URL=http://localhost:5173
   ```

5. **Restart server and test!**
6. **Check Mailtrap dashboard** to see all emails

---

## 📊 Comparison Table

| Service | Free Tier | Credit Card | Best For | Setup Time |
|---------|-----------|-------------|----------|------------|
| **Gmail** | 500/day | ❌ No | Development | ⭐ 5 min |
| **Brevo** | 300/day | ❌ No | Production | ⭐⭐ 10 min |
| **Mailtrap** | 500/month | ❌ No | Testing | ⭐ 5 min |
| **Resend** | 3K/month | ❌ No | Modern apps | ⭐⭐ 10 min |
| **Mailgun** | 1K/month* | ⚠️ After 3mo | Production | ⭐⭐⭐ 15 min |

*5K/month for first 3 months

---

## 🎯 My Recommendation

**For Development/Testing:**
- Use **Mailtrap** - Perfect for catching test emails without sending real ones

**For Production (Free):**
- Use **Brevo** - Best free tier (300/day forever, no credit card)

**For Quick Testing:**
- Use **Gmail** - Fastest setup, works immediately

---

## ✅ Quick Test

After adding credentials to `.env`:

1. **Restart server:**
   ```bash
   cd backend
   npm run start:dev
   ```

2. **Check logs:**
   ```
   ✅ Email service initialized
   ```

3. **Test registration:**
   - Go to: `http://localhost:3000/api/docs`
   - Try `POST /auth/register`
   - Check email (or Mailtrap dashboard)

---

## 🆘 Troubleshooting

**Gmail:**
- Must use App Password (not regular password)
- Must enable 2-Step Verification first

**Brevo:**
- Verify your sender email first
- Check spam folder

**Mailtrap:**
- Emails won't go to real inboxes
- Check Mailtrap dashboard instead

---

## 💡 Pro Tip

**For Development:** Use Mailtrap (catches all emails, no risk)  
**For Production:** Use Brevo (best free tier, reliable)

You can switch between them by just changing `.env` variables!

---

**Which one do you want to use?** I recommend **Brevo** for production or **Mailtrap** for development/testing.

