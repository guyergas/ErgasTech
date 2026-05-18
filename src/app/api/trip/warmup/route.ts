import { NextRequest, NextResponse } from "next/server";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

export const maxDuration = 600; // 10 minutes in seconds

let warmupInProgress = false;
let warmupComplete = false;

export async function GET(req: NextRequest) {
  // If already done, return immediately
  if (warmupComplete) {
    return NextResponse.json({ status: "ready" });
  }

  // If warmup in progress, return status
  if (warmupInProgress) {
    return NextResponse.json({ status: "warming" });
  }

  // Start warmup in background (don't await)
  warmupInProgress = true;

  (async () => {
    try {
      const warmupScript = `
import os
import sys
os.environ['HF_HOME'] = '/tmp/hf_cache'
os.environ['HOME'] = '/tmp'
os.environ['USER'] = 'nextjs'
os.makedirs('/tmp/hf_cache', exist_ok=True)
sys.path.insert(0, '/usr/local/lib/python3.11/dist-packages')

import torch
from transformers import AutoModelForSpeechSeq2Seq, AutoProcessor

device = "cpu"
torch_dtype = torch.float32

print("Loading model...", file=sys.stderr)
model = AutoModelForSpeechSeq2Seq.from_pretrained("openai/whisper-large-v2", torch_dtype=torch_dtype, use_safetensors=True)
model.to(device)
processor = AutoProcessor.from_pretrained("openai/whisper-large-v2")
print("✓ Model ready", file=sys.stderr)
`;

      await execAsync(`python3 << 'PYEOF'\n${warmupScript}\nPYEOF`, {
        timeout: 600000,
        maxBuffer: 10 * 1024 * 1024,
        env: {
          ...process.env,
          HF_HOME: '/tmp/hf_cache',
          HOME: '/tmp',
          USER: 'nextjs'
        } as NodeJS.ProcessEnv,
      });
      warmupComplete = true;
      console.log("✓ Whisper model warmed up");
    } catch (err) {
      console.error("Warmup failed:", err);
      warmupInProgress = false;
    }
  })();

  return NextResponse.json({ status: "warming" });
}
