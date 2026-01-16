# Test Your Email Setup

## ✅ Configuration Added

Your Gmail SMTP has been configured:
- **Email**: rizalfatkhurikh@gmail.com
- **SMTP Host**: smtp.gmail.com
- **Port**: 587

## 🧪 How to Test

### Step 1: Restart Your Server

```bash
cd backend
npm run start:dev
```

**Look for this in the logs:**
```
✅ Email service initialized
```

If you see:
```
⚠️ Email service not configured
```
Then check your `.env` file.

### Step 2: Test via Swagger UI

1. **Open Swagger:** http://localhost:3000/api/docs
2. **Navigate to:** `POST /auth/register`
3. **Click:** "Try it out"
4. **Use example:**
   ```json
   {
     "email": "test@example.com",
     "password": "password123",
     "fullName": "Test User",
     "role": "student"
   }
   ```
5. **Click:** "Execute"
6. **Check your Gmail inbox** (rizalfatkhurikh@gmail.com) for verification email

### Step 3: Test Password Reset

1. **In Swagger:** `POST /auth/forgot-password`
2. **Use:**
   ```json
   {
     "email": "test@example.com"
   }
   ```
3. **Check email** for password reset link

## 🔍 Troubleshooting

### Issue: "Authentication failed"

**Solutions:**
- ✅ Make sure you're using App Password (not regular password)
- ✅ Verify 2-Step Verification is enabled
- ✅ Check password has no extra spaces
- ✅ Try regenerating App Password

### Issue: "Connection timeout"

**Solutions:**
- ✅ Check internet connection
- ✅ Try port 465 instead (requires code change)
- ✅ Check firewall settings

### Issue: "Emails not arriving"

**Solutions:**
- ✅ Check spam folder
- ✅ Wait a few minutes (Gmail can be slow)
- ✅ Check Gmail account activity
- ✅ Verify sender email matches your Gmail

## ✅ Success Indicators

You'll know it's working when:
- ✅ Server logs show: `Email service initialized`
- ✅ Registration sends verification email
- ✅ Email arrives in your Gmail inbox
- ✅ Verification link works

## 📧 What Emails Will Be Sent

1. **Registration:** Verification email with link
2. **Password Reset:** Reset link (if requested)
3. **Welcome:** Welcome email after registration

All emails will be sent from: **rizalfatkhurikh@gmail.com**

---

**Ready to test!** Restart your server and try registering a user.


# Quick Test Command:
# curl -X POST http://localhost:3000/api/v1/auth/register \
#   -H 'Content-Type: application/json' \
#   -d '{"email":"test@example.com","password":"password123","fullName":"Test User","role":"student"}'

