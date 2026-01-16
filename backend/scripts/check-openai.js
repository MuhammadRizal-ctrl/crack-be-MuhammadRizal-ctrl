#!/usr/bin/env node

/**
 * Quick script to check OpenAI API configuration
 * Usage: node scripts/check-openai.js
 */

require('dotenv').config();

const apiKey = process.env.OPENAI_API_KEY;

console.log('\n🔍 Checking OpenAI API Configuration...\n');

if (!apiKey) {
  console.log('❌ OPENAI_API_KEY is not set in .env file');
  console.log('\n📝 To configure:');
  console.log('   1. Get your API key from https://platform.openai.com/api-keys');
  console.log('   2. Add to .env file: OPENAI_API_KEY=sk-your-key-here');
  console.log('   3. Restart the server\n');
  process.exit(1);
}

if (apiKey === 'your-openai-api-key' || apiKey === 'sk-your-openai-api-key-here') {
  console.log('⚠️  OPENAI_API_KEY is set to placeholder value');
  console.log('   Please update with your actual API key\n');
  process.exit(1);
}

if (!apiKey.startsWith('sk-')) {
  console.log('⚠️  OPENAI_API_KEY format looks incorrect');
  console.log('   API keys should start with "sk-"\n');
  process.exit(1);
}

console.log('✅ OPENAI_API_KEY is configured');
console.log(`   Key: ${apiKey.substring(0, 7)}...${apiKey.substring(apiKey.length - 4)}`);
console.log(`   Model: ${process.env.OPENAI_MODEL || 'gpt-4-turbo-preview (default)'}`);
console.log(`   Max Tokens: ${process.env.OPENAI_MAX_TOKENS || '1000 (default)'}`);
console.log('\n💡 To test the integration:');
console.log('   1. Start the server: npm run start:dev');
console.log('   2. Check health: GET /api/v1/health');
console.log('   3. Test AI Tutor: POST /api/v1/tutor/chat\n');

