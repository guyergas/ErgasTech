#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_URL = process.env.API_URL || 'http://localhost:3002';
const TEST_AUDIO_URL = process.env.TEST_AUDIO_URL || 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

async function fetchAudio(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = Buffer.alloc(0);
      res.on('data', chunk => data = Buffer.concat([data, chunk]));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function testTranscribe() {
  console.log('🧪 Testing Transcription Endpoint\n');
  console.log(`API URL: ${API_URL}`);

  try {
    // Test 1: Missing audioUrl
    console.log('\n📝 Test 1: Missing audioUrl');
    let response = await fetch(`${API_URL}/api/trip/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });
    if (response.status === 400) {
      const data = await response.json();
      console.log(`✅ Correctly returned 400: ${data.error}`);
    } else {
      console.log(`❌ Expected 400, got ${response.status}`);
    }

    // Test 2: Invalid audioUrl
    console.log('\n📝 Test 2: Invalid audioUrl');
    response = await fetch(`${API_URL}/api/trip/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioUrl: 'https://example.com/nonexistent.webm' }),
    });
    const data = await response.json();
    if (response.ok) {
      console.log(`✅ Response: ${data.transcript.substring(0, 100)}...`);
    } else {
      console.log(`⚠️ Error (expected): ${data.error}`);
    }

    // Test 3: With real audio URL (optional)
    console.log('\n📝 Test 3: Real audio transcription (optional)');
    console.log(`Testing with: ${TEST_AUDIO_URL}`);
    response = await fetch(`${API_URL}/api/trip/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioUrl: TEST_AUDIO_URL }),
      timeout: 120000,
    });

    if (response.ok) {
      const result = await response.json();
      console.log(`✅ Transcription successful!`);
      console.log(`📄 Text: ${result.transcript.substring(0, 200)}...`);
    } else {
      const error = await response.json();
      console.log(`⚠️ Transcription error: ${error.error}`);
    }

    console.log('\n✅ All tests completed!');
  } catch (err) {
    console.error(`\n❌ Error: ${err.message}`);
    console.log(`\nMake sure the server is running:`);
    console.log(`  npm run dev     # Development`);
    console.log(`  make run        # Production Docker`);
    process.exit(1);
  }
}

testTranscribe();
