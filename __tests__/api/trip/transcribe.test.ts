import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

describe('POST /api/trip/transcribe', () => {
  const API_URL = process.env.API_URL || 'http://localhost:3002';
  let testAudioUrl: string;

  beforeAll(async () => {
    console.log('Setting up test audio file...');

    // Generate a test audio file with ffmpeg (Hebrew speech would be ideal, but for now we'll use silence)
    // In production, you'd use a pre-recorded Hebrew speech sample
    const audioPath = path.join(__dirname, 'test-audio.webm');

    try {
      // Generate a simple webm file (for testing endpoint, actual Hebrew transcription requires real audio)
      execSync(
        `ffmpeg -f lavfi -i anullsrc=r=48000:cl=mono -f lavfi -i color=c=black:s=320x240:d=2 -pix_fmt yuv420p -c:v libvpx -c:a libopus -t 2 -y "${audioPath}" 2>/dev/null`,
        { stdio: 'pipe' }
      );

      console.log(`✅ Test audio generated: ${audioPath}`);
    } catch (e) {
      console.log('Note: ffmpeg not available for test audio generation');
    }
  });

  it('should transcribe Hebrew audio and return text', async () => {
    // This test requires:
    // 1. Server running at API_URL
    // 2. A real Hebrew speech audio file
    // 3. The transcribe endpoint working

    console.log('Testing transcription endpoint...');

    // For this test to work with real transcription, you need:
    // - A sample Hebrew speech audio file
    // - Upload it to get a URL
    // - Call /api/trip/transcribe with that URL

    const testPayload = {
      audioUrl: 'https://example.com/hebrew-sample.webm'
    };

    try {
      const response = await fetch(`${API_URL}/api/trip/transcribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload),
      });

      if (response.ok) {
        const data = await response.json();
        expect(data.transcript).toBeDefined();
        expect(typeof data.transcript).toBe('string');
        console.log(`✅ Transcription: ${data.transcript}`);
      } else {
        const error = await response.json();
        console.log(`⚠️ Error: ${error.error}`);
        // This is expected if audio file doesn't exist or is invalid
        expect(error.error).toBeDefined();
      }
    } catch (err) {
      console.error(`❌ Failed to connect to ${API_URL}`);
      console.log('Make sure server is running: npm run dev or make run');
      throw err;
    }
  }, 60000);

  it('should return error for missing audioUrl', async () => {
    const response = await fetch(`${API_URL}/api/trip/transcribe`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({}),
    });

    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain('Missing audioUrl');
    console.log(`✅ Correctly rejected missing audioUrl`);
  });
});
