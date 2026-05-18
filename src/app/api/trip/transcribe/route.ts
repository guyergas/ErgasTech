import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);

export const maxDuration = 600; // 10 minutes in seconds

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

    // Check if it's a local path (starts with /trip/uploads/)
    if (audioUrl.startsWith("/trip/uploads/")) {
      // Read directly from disk
      const localPath = path.join(process.cwd(), "public", audioUrl);
      audioBuffer = await fs.readFile(localPath).then(buf => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength));
    } else {
      // Fetch from external URL
      const audioResponse = await fetch(audioUrl);
      if (!audioResponse.ok) {
        throw new Error(`Failed to fetch audio: ${audioResponse.status}`);
      }
      audioBuffer = await audioResponse.arrayBuffer();
    }

    // Write to temp file
    await fs.writeFile(audioFile, Buffer.from(audioBuffer));

    // Use Python with transformers to transcribe
    const pythonScript = `
import os
import sys

# Set up environment and create cache dir BEFORE any imports
os.environ['HF_HOME'] = '/tmp/hf_cache'
os.environ['HOME'] = '/tmp'
os.environ['USER'] = 'nextjs'
os.makedirs('/tmp/hf_cache', exist_ok=True)

sys.path.insert(0, '/usr/local/lib/python3.11/dist-packages')

import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor, pipeline

device = "cpu"
torch_dtype = torch.float32

print("Loading model...", file=sys.stderr)
model = AutoModelForSpeechSeq2Seq.from_pretrained("openai/whisper-large-v2", torch_dtype=torch_dtype, use_safetensors=True)
model.to(device)

processor = AutoProcessor.from_pretrained("openai/whisper-large-v2")

pipe = pipeline(
    "automatic-speech-recognition",
    model=model,
    tokenizer=processor.tokenizer,
    feature_extractor=processor.feature_extractor,
    torch_dtype=torch_dtype,
    device=device,
)

print("Transcribing...", file=sys.stderr)
result = pipe("${audioFile}", return_timestamps=True)
print(result["text"])
`;

    const { stdout, stderr } = await execAsync(`python3 << 'PYEOF'\n${pythonScript}\nPYEOF`, {
      timeout: 600000,
      maxBuffer: 10 * 1024 * 1024,
      env: {
        ...process.env,
        HF_HOME: '/tmp/hf_cache',
        HOME: '/tmp',
        USER: 'nextjs'
      } as NodeJS.ProcessEnv,
    });

    const transcription = stdout.trim();

    // Cleanup
    try {
      await fs.unlink(audioFile);
    } catch (e) {
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
    } catch (e) {
      // Ignore
    }

    console.error("Transcription error:", err);
    return NextResponse.json(
      { error: `Transcription failed: ${err instanceof Error ? err.message : String(err)}` },
      { status: 500 }
    );
  }
}
