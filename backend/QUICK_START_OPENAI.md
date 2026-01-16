# Quick Start: OpenAI Configuration

## 🚀 3-Step Setup

### Step 1: Get Your API Key

1. Go to https://platform.openai.com
2. Sign up or log in
3. Navigate to **API keys** (click profile → API keys)
4. Click **"Create new secret key"**
5. **Copy the key** (starts with `sk-`)

### Step 2: Add to .env File

Open `backend/.env` and add:

```env
OPENAI_API_KEY=sk-your-actual-key-here
```

**Important**: Replace `sk-your-actual-key-here` with your actual key!

### Step 3: Restart Server

```bash
cd backend
npm run start:dev
```

Look for this in the logs:
```
✅ OpenAI service initialized with model: gpt-4-turbo-preview
```

## ✅ Verify It Works

### Option 1: Health Check

```bash
curl http://localhost:3000/api/v1/health
```

Look for:
```json
{
  "services": {
    "openai": {
      "configured": true,
      "accessible": true,
      "model": "gpt-4-turbo-preview"
    }
  }
}
```

### Option 2: Test in Swagger

1. Go to: `http://localhost:3000/api/docs`
2. Navigate to `POST /tutor/chat`
3. Click "Try it out"
4. Use example:
   ```json
   {
     "message": "What is React?",
     "personality": "teacher"
   }
   ```
5. Click "Execute"
6. You should get a **real AI-generated response** (not a mock)

## 💰 Cost Optimization

**For Development/Testing** (Cheaper):
```env
OPENAI_MODEL=gpt-3.5-turbo
OPENAI_MAX_TOKENS=500
```

**For Production** (Best Quality):
```env
OPENAI_MODEL=gpt-4-turbo-preview
OPENAI_MAX_TOKENS=1000
```

## ❌ Troubleshooting

**Problem**: Still getting mock responses
- ✅ Check `.env` file has `OPENAI_API_KEY=sk-...`
- ✅ Restart the server after adding the key
- ✅ Check server logs for errors
- ✅ Verify key starts with `sk-`

**Problem**: "Invalid API key" error
- ✅ Check if key is correct (no extra spaces)
- ✅ Verify key hasn't been revoked in OpenAI dashboard
- ✅ Ensure you have credits in your OpenAI account

**Problem**: "Rate limit exceeded"
- ✅ Check your OpenAI usage limits
- ✅ Wait a few minutes and try again
- ✅ Consider upgrading your OpenAI plan

## 📚 More Information

See [OPENAI_SETUP.md](OPENAI_SETUP.md) for:
- Detailed setup instructions
- Cost management tips
- Security best practices
- Advanced configuration

## 🎉 That's It!

Once configured, all AI Tutor conversations will use real OpenAI responses with the personality you choose!

