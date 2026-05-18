import { nanoid } from 'nanoid';
import { writeFile, readFile, unlink } from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import * as path from 'path';
import * as http from 'http';
import * as https from 'https';

const WORKER_HOST = 'localhost';
const WORKER_PORT = 9999;
const REQUEST_TIMEOUT = 120000; // 120 seconds

interface PendingRequest {
  resolve: (value: string) => void;
  reject: (error: Error) => void;
  timeout: NodeJS.Timeout;
}

export class TranscriptionClient {
  private pendingRequests: Map<string, PendingRequest> = new Map();
  private socket: http.ClientRequest | null = null;

  async transcribe(audioUrl: string): Promise<string> {
    const requestId = nanoid();
    let tempAudioPath: string | null = null;

    try {
      // Step 1: Get audio file
      let audioPath: string;
      if (audioUrl.startsWith('/trip/uploads/')) {
        // Local file: resolve to absolute path
        audioPath = path.join(process.cwd(), 'public', audioUrl);
      } else if (audioUrl.startsWith('http://') || audioUrl.startsWith('https://')) {
        // Remote URL: download and save to temp
        tempAudioPath = path.join('/tmp', `transcribe-${requestId}.webm`);
        await this.fetchAndSave(audioUrl, tempAudioPath);
        audioPath = tempAudioPath;
      } else {
        throw new Error('Invalid audio URL format');
      }

      // Step 2: Send request to worker
      const transcript = await this.sendRequest(requestId, audioPath);
      return transcript;
    } finally {
      // Cleanup temp file
      if (tempAudioPath) {
        try {
          await unlink(tempAudioPath);
        } catch {
          // Ignore cleanup errors
        }
      }
    }
  }

  private async fetchAndSave(url: string, filepath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const file = createWriteStream(filepath);
      const client = url.startsWith('https') ? https : http;

      const request = client.get(url, (response) => {
        if (response.statusCode !== 200) {
          file.destroy();
          reject(new Error(`Failed to fetch audio: ${response.statusCode}`));
          return;
        }
        response.pipe(file);
      });

      request.on('error', (err) => {
        file.destroy();
        reject(err);
      });

      file.on('finish', () => {
        file.close();
        resolve();
      });

      file.on('error', (err) => {
        reject(err);
      });
    });
  }

  private async sendRequest(requestId: string, audioPath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        this.pendingRequests.delete(requestId);
        reject(new Error('Transcription timeout (120s)'));
      }, REQUEST_TIMEOUT);

      const pendingRequest: PendingRequest = {
        resolve,
        reject,
        timeout,
      };

      this.pendingRequests.set(requestId, pendingRequest);

      // Send request to worker via HTTP
      const requestBody = JSON.stringify({
        id: requestId,
        audioPath,
      });

      const options = {
        hostname: WORKER_HOST,
        port: WORKER_PORT,
        path: '/transcribe',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(requestBody),
        },
        timeout: REQUEST_TIMEOUT,
      };

      const req = http.request(options, (res) => {
        let data = '';
        res.on('data', (chunk) => {
          data += chunk;
        });
        res.on('end', () => {
          try {
            const response = JSON.parse(data);
            const pending = this.pendingRequests.get(requestId);
            if (pending) {
              clearTimeout(pending.timeout);
              this.pendingRequests.delete(requestId);

              if (response.success && response.transcript) {
                pending.resolve(response.transcript);
              } else {
                pending.reject(new Error(response.error || 'Transcription failed'));
              }
            }
          } catch (err) {
            const pending = this.pendingRequests.get(requestId);
            if (pending) {
              clearTimeout(pending.timeout);
              this.pendingRequests.delete(requestId);
              pending.reject(new Error('Invalid worker response'));
            }
          }
        });
      });

      req.on('error', (err) => {
        const pending = this.pendingRequests.get(requestId);
        if (pending) {
          clearTimeout(pending.timeout);
          this.pendingRequests.delete(requestId);
          pending.reject(new Error(`Worker communication failed: ${err.message}`));
        }
      });

      req.on('timeout', () => {
        req.destroy();
        const pending = this.pendingRequests.get(requestId);
        if (pending) {
          clearTimeout(pending.timeout);
          this.pendingRequests.delete(requestId);
          pending.reject(new Error('Worker request timeout'));
        }
      });

      req.write(requestBody);
      req.end();
    });
  }
}
