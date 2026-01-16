#!/usr/bin/env node

/**
 * Test OpenAI API connection
 * Usage: node scripts/test-openai-connection.js
 */

require('dotenv').config();
const OpenAI = require('openai');

const apiKey = process.env.OPENAI_API_KEY;

console.log('\n🧪 Testing OpenAI API Connection...\n');

if (!apiKey || apiKey === 'your-openai-api-key' || !apiKey.startsWith('sk-')) {
  console.log('❌ OpenAI API key not configured properly');
  console.log('   Please set OPENAI_API_KEY in your .env file\n');
  process.exit(1);
}

const openai = new OpenAI({ apiKey });

async function testConnection() {
  try {
    console.log('📡 Connecting to OpenAI API...');
    
    // Test 1: List models (lightweight request)
    console.log('   Test 1: Listing available models...');
    const models = await openai.models.list();
    console.log(`   ✅ Connected! Found ${models.data.length} models`);
    
    // Test 2: Simple chat completion
    console.log('   Test 2: Testing chat completion...');
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Say "Hello, OpenAI is working!" in one sentence.' },
      ],
      max_tokens: 20,
    });
    
    const response = completion.choices[0]?.message?.content;
    console.log(`   ✅ Chat completion works!`);
    console.log(`   Response: "${response}"`);
    
    console.log('\n✅ All tests passed! OpenAI API is configured correctly.\n');
    console.log('💡 Your AI Tutor will now use real OpenAI responses!\n');
    
  } catch (error) {
    console.log('\n❌ Connection test failed!\n');
    
    if (error.status === 401) {
      console.log('   Error: Invalid API key');
      console.log('   Please check your OPENAI_API_KEY in .env file\n');
    } else if (error.status === 429) {
      console.log('   Error: Rate limit exceeded');
      console.log('   Please wait a moment and try again\n');
    } else if (error.code === 'ENOTFOUND' || error.code === 'ECONNREFUSED') {
      console.log('   Error: Network connection failed');
      console.log('   Please check your internet connection\n');
    } else {
      console.log(`   Error: ${error.message}`);
      console.log(`   Status: ${error.status || 'Unknown'}\n`);
    }
    
    process.exit(1);
  }
}

testConnection();

