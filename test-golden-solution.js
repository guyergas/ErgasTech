#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');

const API_URL = process.env.API_URL || 'http://localhost:3002';
const TEST_AUDIO_URL = 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3';

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function fetchAudio(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = Buffer.alloc(0);
      res.on('data', chunk => data = Buffer.concat([data, chunk]));
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function testHealthCheck() {
  console.log('\n1️⃣ Testing worker health check...');
  try {
    const res = await fetch(`${API_URL}/api/trip/warmup`);
    const data = await res.json();
    if (res.ok && data.status === 'ready') {
      console.log('✅ Worker is ready');
      return true;
    } else if (res.status === 503) {
      console.log('⏳ Worker still warming up...');
      return false;
    } else {
      console.log(`⚠️ Unexpected status: ${data.status}`);
      return false;
    }
  } catch (err) {
    console.log(`⚠️ Health check failed: ${err.message}`);
    return false;
  }
}

async function waitForWorker(maxWait = 120000) {
  console.log('\n⏳ Waiting for worker to be ready (max 2 minutes)...');
  const startTime = Date.now();
  while (Date.now() - startTime < maxWait) {
    if (await testHealthCheck()) {
      console.log('✅ Worker ready!');
      return true;
    }
    await sleep(5000);
  }
  console.log('❌ Worker failed to become ready in time');
  return false;
}

async function testTranscriptionWithExternalURL() {
  console.log('\n2️⃣ Testing transcription with external URL...');
  console.log(`   Audio: ${TEST_AUDIO_URL}`);

  try {
    const startTime = Date.now();
    const res = await fetch(`${API_URL}/api/trip/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioUrl: TEST_AUDIO_URL }),
    });
    const elapsed = Date.now() - startTime;

    const data = await res.json();

    if (res.ok && data.transcript) {
      console.log(`✅ Transcription successful (${elapsed}ms)`);
      console.log(`   First 150 chars: ${data.transcript.substring(0, 150)}...`);
      return true;
    } else {
      console.log(`❌ Transcription failed: ${data.error}`);
      return false;
    }
  } catch (err) {
    console.log(`❌ Request failed: ${err.message}`);
    return false;
  }
}

async function testTranscriptionWithBadURL() {
  console.log('\n3️⃣ Testing error handling (invalid URL)...');

  try {
    const res = await fetch(`${API_URL}/api/trip/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioUrl: 'https://example.com/nonexistent.mp3' }),
    });

    const data = await res.json();
    if (!res.ok && data.error) {
      console.log(`✅ Error handled correctly: ${data.error.substring(0, 80)}...`);
      return true;
    } else {
      console.log(`⚠️ Unexpected response: ${res.status}`);
      return false;
    }
  } catch (err) {
    console.log(`✅ Request correctly failed: ${err.message}`);
    return true;
  }
}

async function testConcurrentRequests() {
  console.log('\n4️⃣ Testing concurrent requests (queue handling)...');

  try {
    const req1 = fetch(`${API_URL}/api/trip/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioUrl: TEST_AUDIO_URL }),
    }).then(r => r.json()).then(d => ({ success: !!d.transcript, error: d.error }));

    const req2 = fetch(`${API_URL}/api/trip/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audioUrl: TEST_AUDIO_URL }),
    }).then(r => r.json()).then(d => ({ success: !!d.transcript, error: d.error }));

    const [res1, res2] = await Promise.all([req1, req2]);

    if (res1.success && res2.success) {
      console.log('✅ Both requests completed successfully');
      console.log('   (Worker queued them properly)');
      return true;
    } else {
      console.log(`⚠️ One or both requests failed:`);
      console.log(`   Req1: ${res1.success ? 'OK' : res1.error}`);
      console.log(`   Req2: ${res2.success ? 'OK' : res2.error}`);
      return false;
    }
  } catch (err) {
    console.log(`❌ Test failed: ${err.message}`);
    return false;
  }
}

async function runTests() {
  console.log('🧪 GOLDEN SOLUTION TRANSCRIPTION TESTS');
  console.log(`📍 API URL: ${API_URL}`);
  console.log('━'.repeat(50));

  const results = [];

  // Wait for worker
  const workerReady = await waitForWorker();
  if (!workerReady) {
    console.log('\n❌ Worker not ready. Cannot run tests.');
    process.exit(1);
  }

  // Run tests
  results.push(await testTranscriptionWithExternalURL());
  results.push(await testTranscriptionWithBadURL());
  results.push(await testConcurrentRequests());

  // Summary
  console.log('\n' + '━'.repeat(50));
  const passed = results.filter(r => r).length;
  const total = results.length;
  console.log(`📊 Results: ${passed}/${total} tests passed`);

  if (passed === total) {
    console.log('✅ All tests passed!');
    process.exit(0);
  } else {
    console.log(`❌ ${total - passed} test(s) failed`);
    process.exit(1);
  }
}

// Run
console.log('Starting tests in 5 seconds...\n');
setTimeout(runTests, 5000);
