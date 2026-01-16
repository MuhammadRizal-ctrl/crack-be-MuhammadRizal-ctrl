# OpenAI API Setup Guide

This guide will help you configure the OpenAI API for the AI Tutor feature.

## Prerequisites

1. An OpenAI account (sign up at https://platform.openai.com)
2. A valid API key from OpenAI
3. Sufficient API credits (GPT-4 requires paid account)

## Step 1: Get Your OpenAI API Key

1. **Sign up/Login**: Go to https://platform.openai.com
2. **Navigate to API Keys**: 
   - Click on your profile icon (top right)
   - Select "API keys" from the menu
3. **Create New Key**:
   - Click "Create new secret key"
   - Give it a name (e.g., "CodeCamp LMS")
   - Copy the key immediately (you won't be able to see it again!)

⚠️ **Important**: Keep your API key secret! Never commit it to version control.

## Step 2: Configure the API Key

### Option 1: Environment Variable (Recommended)

1. **Open your `.env` file** in the `backend/` directory:
   ```bash
   cd backend
   nano .env  # or use your preferred editor
   ```

2. **Add or update the OpenAI API key**:
   ```env
   OPENAI_API_KEY=sk-your-actual-api-key-here
   ```

3. **Save the file**

4. **Restart your server**:
   ```bash
   npm run start:dev
   ```

### Option 2: Set in Terminal (Temporary)

For testing purposes only:
```bash
export OPENAI_API_KEY=sk-your-actual-api-key-here
npm run start:dev
```

## Step 3: Verify Configuration

1. **Check server logs** when starting:
   ```
   OpenAI service initialized
   ```
   If you see this, the API key is configured correctly.

2. **Test the AI Tutor endpoint**:
   - Go to Swagger UI: `http://localhost:3000/api/docs`
   - Navigate to `POST /tutor/chat`
   - Try sending a message
   - You should get a real AI response (not a mock)

## Configuration Options

### Model Selection

The service uses **GPT-4 Turbo** by default. To change the model, edit:
`backend/src/tutor/services/openai.service.ts`

```typescript
model: 'gpt-4-turbo-preview', // Change this line
```

**Available Models:**
- `gpt-4-turbo-preview` - Most capable, higher cost
- `gpt-4` - High quality, higher cost
- `gpt-3.5-turbo` - Faster, lower cost (recommended for production)

### Cost Optimization

**For Development/Testing:**
- Use `gpt-3.5-turbo` (much cheaper)
- Set lower `max_tokens` (e.g., 500 instead of 1000)

**For Production:**
- Use `gpt-4-turbo-preview` for best quality
- Implement rate limiting per user
- Monitor API usage and costs
- Set up billing alerts in OpenAI dashboard

## Environment Variables

Add to your `.env` file:

```env
# OpenAI Configuration
OPENAI_API_KEY=sk-your-api-key-here

# Optional: Customize model (defaults to gpt-4-turbo-preview)
OPENAI_MODEL=gpt-4-turbo-preview

# Optional: Max tokens per response (defaults to 1000)
OPENAI_MAX_TOKENS=1000
```

## Fallback Behavior

If the OpenAI API key is **not configured** or **invalid**:
- The service will automatically fall back to mock responses
- Server will log a warning: `OpenAI API key not configured, using mock responses`
- AI Tutor will still work, but with pre-defined responses

This allows the application to run without OpenAI, but with limited functionality.

## Testing the Integration

### Using Swagger UI

1. **Start the server**:
   ```bash
   npm run start:dev
   ```

2. **Open Swagger**: `http://localhost:3000/api/docs`

3. **Test AI Tutor**:
   - Navigate to `POST /tutor/chat`
   - Click "Try it out"
   - Use example request:
     ```json
     {
       "message": "What is React?",
       "personality": "teacher"
     }
     ```
   - Click "Execute"
   - You should receive a real AI-generated response

### Using curl

```bash
# First, login to get a token
TOKEN=$(curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@example.com","password":"password123"}' \
  | jq -r '.token')

# Send message to AI Tutor
curl -X POST http://localhost:3000/api/v1/tutor/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Explain JavaScript closures",
    "personality": "teacher"
  }'
```

## Troubleshooting

### Issue: "OpenAI API key not configured"
**Solution**: Make sure `OPENAI_API_KEY` is set in your `.env` file and restart the server.

### Issue: "Invalid API key"
**Solution**: 
- Verify the API key is correct (starts with `sk-`)
- Check if the key has been revoked in OpenAI dashboard
- Ensure you have sufficient credits

### Issue: "Rate limit exceeded"
**Solution**:
- Check your OpenAI usage limits
- Implement rate limiting in the application
- Consider upgrading your OpenAI plan

### Issue: "Model not found"
**Solution**:
- Verify you have access to the model (GPT-4 requires paid account)
- Switch to `gpt-3.5-turbo` if you have a free account

## Cost Management

### Monitor Usage

1. **OpenAI Dashboard**: https://platform.openai.com/usage
2. **Set Billing Alerts**: Configure alerts in OpenAI dashboard
3. **Track Costs**: Monitor API usage in your application logs

### Cost Optimization Tips

1. **Use GPT-3.5-turbo** for most interactions (10x cheaper)
2. **Limit max_tokens** to reduce costs
3. **Implement caching** for common questions
4. **Rate limit** per user to prevent abuse
5. **Use GPT-4** only for complex queries

### Estimated Costs

- **GPT-3.5-turbo**: ~$0.002 per 1K tokens
- **GPT-4 Turbo**: ~$0.01 per 1K tokens (input), ~$0.03 per 1K tokens (output)

**Example**: 1000 messages/day with GPT-3.5-turbo ≈ $2-5/month

## Security Best Practices

1. ✅ **Never commit API keys** to version control
2. ✅ **Use environment variables** for configuration
3. ✅ **Rotate API keys** periodically
4. ✅ **Set usage limits** in OpenAI dashboard
5. ✅ **Monitor for unusual activity**
6. ✅ **Use separate keys** for development/production

## Next Steps

1. ✅ Configure your API key
2. ✅ Test the integration
3. ✅ Monitor costs and usage
4. ✅ Optimize for your use case
5. ✅ Set up production configuration

## Support

- **OpenAI Documentation**: https://platform.openai.com/docs
- **OpenAI Support**: https://help.openai.com
- **API Status**: https://status.openai.com

