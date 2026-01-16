# Quick Free SMTP Setup

## 🎯 Easiest Option: Gmail (5 minutes)

### Step 1: Get Gmail App Password

1. Go to: https://myaccount.google.com/security
2. Enable **2-Step Verification** (if not already)
3. Go to: https://myaccount.google.com/apppasswords
4. Select:
   - App: **Mail**
   - Device: **Other (Custom name)**
   - Name: `CodeCamp LMS`
5. Click **Generate**
6. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### Step 2: Add to `.env`

Open `backend/.env` and add:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=abcd efgh ijkl mnop
EMAIL_FROM=your-email@gmail.com
FRONTEND_URL=http://localhost:5173
```

**Replace:**
- `your-email@gmail.com` with your Gmail address
- `abcd efgh ijkl mnop` with your app password (remove spaces or keep them, both work)

### Step 3: Test

```bash
cd backend
npm run start:dev
```

Look for: `✅ Email service initialized`

Then test registration at: `http://localhost:3000/api/docs`

---

## 🎯 Best Free Option: Brevo (10 minutes)

### Step 1: Sign Up

1. Go to: https://www.brevo.com
2. Click **Sign up free**
3. Create account (no credit card needed)
4. Verify your email

### Step 2: Get SMTP Credentials

1. Login to Brevo dashboard
2. Go to: **SMTP & API** (left menu)
3. Click: **SMTP** tab
4. You'll see:
   - SMTP Server: `smtp-relay.brevo.com`
   - Port: `587`
   - Login: Your email
   - Password: Your SMTP key (click "Generate" if needed)

### Step 3: Add to `.env`

```env
SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your-email@example.com
SMTP_PASSWORD=your-brevo-smtp-key
EMAIL_FROM=your-email@example.com
FRONTEND_URL=http://localhost:5173
```

### Step 4: Test

Restart server and test!

---

## 🎯 For Testing: Mailtrap (5 minutes)

**Perfect for development** - catches all emails, doesn't send real ones!

### Step 1: Sign Up

1. Go to: https://mailtrap.io
2. Sign up free (no credit card)
3. Verify email

### Step 2: Get Credentials

1. Go to: **Email Testing** → **Inboxes**
2. Click on **Default** inbox
3. Go to **SMTP Settings** tab
4. Copy:
   - Host: `smtp.mailtrap.io`
   - Port: `2525`
   - Username & Password

### Step 3: Add to `.env`

```env
SMTP_HOST=smtp.mailtrap.io
SMTP_PORT=2525
SMTP_USER=your-mailtrap-username
SMTP_PASSWORD=your-mailtrap-password
EMAIL_FROM=noreply@codecamp.com
FRONTEND_URL=http://localhost:5173
```

### Step 4: Test

1. Restart server
2. Register a user
3. **Check Mailtrap dashboard** (not your email inbox!)
4. All emails appear in Mailtrap inbox

---

## ✅ Which Should You Use?

- **Gmail**: Quick testing, 500 emails/day
- **Brevo**: Production, 300 emails/day forever
- **Mailtrap**: Development, catches all emails safely

**Recommendation:** Start with **Mailtrap** for development, switch to **Brevo** for production.

---

## 🆘 Quick Fixes

**Gmail "Authentication failed":**
- Make sure you're using App Password, not regular password
- Enable 2-Step Verification first

**Brevo "Connection failed":**
- Verify your sender email in Brevo dashboard
- Check SMTP key is correct

**Mailtrap "No emails":**
- Check Mailtrap dashboard, not your email inbox
- Emails are caught, not sent

---

**That's it!** Pick one and add the credentials to `.env`, then restart your server.

