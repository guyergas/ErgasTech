import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export const maxDuration = 600; // 10 minutes

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { audioUrl } = body;

  if (!audioUrl) {
    return NextResponse.json({ error: "Missing audioUrl" }, { status: 400 });
  }

  const tmpDir = "/tmp";
  const audioFile = path.join(tmpDir, `audio-${Date.now()}.webm`);

  try {
    let audioBuffer: ArrayBuffer;

    // Check if it's a local file path
    if (audioUrl.startsWith("/trip/uploads/")) {
      // Read directly from disk
      const localPath = path.join(process.cwd(), "public", audioUrl);
      const fileBuffer = await fs.readFile(localPath);
      audioBuffer = fileBuffer.buffer.slice(fileBuffer.byteOffset, fileBuffer.byteOffset + fileBuffer.byteLength);
    } else {
      // Fetch from external URL (support both HTTP and HTTPS)
      const audioResponse = await fetch(audioUrl);
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio: ${audioResponse.status}`);
      }
      audioBuffer = await audioResponse.arrayBuffer();
    }

    // Write to temp file
    await fs.writeFile(audioFile, Buffer.from(audioBuffer));

    // Use Python with Faster-Whisper for transcription
    // Create a Python script file to avoid heredoc issues in template strings
    const scriptFile = path.join(tmpDir, `script-${Date.now()}.py`);
    const pythonScript = `import os
import sys
os.environ['HF_HOME'] = '/tmp/hf_cache'
os.environ['HOME'] = '/tmp'
os.environ['USER'] = 'nextjs'
try:
    from faster_whisper import WhisperModel
    model = WhisperModel("small", device="cpu", compute_type="int8")
    segments, info = model.transcribe("${audioFile}", language="he", beam_size=5)
    transcript = ' '.join(segment.text for segment in segments).strip()
    if transcript:
        print(transcript)
    else:
        sys.exit(1)
except Exception as e:
    print(f"Error: {e}", file=sys.stderr)
    sys.exit(1)`;

    await fs.writeFile(scriptFile, pythonScript);

    const { stdout, stderr } = await execAsync(`python3 "${scriptFile}"`, {
      timeout: 600000,
      maxBuffer: 10 * 1024 * 1024,
      env: {
        ...process.env,
        HF_HOME: '/tmp/hf_cache',
        HOME: '/tmp',
        USER: 'nextjs'
      } as NodeJS.ProcessEnv,
    });

    // Cleanup script file
    try {
      await fs.unlink(scriptFile);
    } catch {
      // Ignore
    }

    const transcription = stdout.trim();

    // Cleanup
    try {
      await fs.unlink(audioFile);
    } catch {
      // Ignore cleanup errors
    }

    if (!transcription) {
      return NextResponse.json(
        { error: "No speech detected in audio" },
        { status: 400 }
      );
    }

    return NextResponse.json({ transcript: transcription });
  } catch (err) {
    // Cleanup on error
    try {
      await fs.unlink(audioFile);
    } catch {
      // Ignore
    }

    console.error("Transcription error:", err);
    return NextResponse.json(
      { error: `Transcription failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
