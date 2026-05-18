#!/usr/bin/env python3
"""
Persistent Whisper transcription worker.

Listens on HTTP port 9999 for transcription requests.
Loads the Faster-Whisper model once and keeps it in memory.
Processes requests serially to avoid concurrent GPU/CPU issues.
"""

import os
import sys
import json
import logging
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse
import threading
import queue
from pathlib import Path

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [WHISPER] %(levelname)s: %(message)s',
    stream=sys.stderr
)
logger = logging.getLogger(__name__)

# Set up environment
os.environ['HF_HOME'] = '/tmp/hf_cache'
os.environ['HOME'] = '/tmp'
os.environ['USER'] = 'nextjs'
os.makedirs('/tmp/hf_cache', exist_ok=True)

# Import Faster-Whisper
try:
    from faster_whisper import WhisperModel
    logger.info("Faster-Whisper imported successfully")
except ImportError as e:
    logger.error(f"Failed to import faster_whisper: {e}")
    logger.error("Install it with: pip install faster-whisper")
    sys.exit(1)

# Global model instance
MODEL = None
MODEL_NAME = "base"  # Options: tiny, base, small, medium, large
DEVICE = "cpu"
COMPUTE_TYPE = "int8"  # Quantization for CPU efficiency

def load_model():
    """Load the Whisper model once at startup."""
    global MODEL
    logger.info(f"Loading Whisper {MODEL_NAME} model with {COMPUTE_TYPE} quantization...")
    try:
        MODEL = WhisperModel(MODEL_NAME, device=DEVICE, compute_type=COMPUTE_TYPE)
        logger.info("✓ Model loaded and ready")
    except Exception as e:
        logger.error(f"Failed to load model: {e}")
        sys.exit(1)

def transcribe_audio(audio_path: str) -> dict:
    """
    Transcribe an audio file.

    Args:
        audio_path: Path to the audio file

    Returns:
        dict with 'success', 'transcript', and optional 'error'
    """
    if not MODEL:
        return {'success': False, 'error': 'Model not loaded'}

    try:
        # Check if file exists
        if not Path(audio_path).exists():
            return {'success': False, 'error': f'Audio file not found: {audio_path}'}

        logger.info(f"Transcribing: {audio_path}")

        # Transcribe
        segments, info = MODEL.transcribe(audio_path, language='he', beam_size=5)

        # Combine segments into single transcript
        transcript = ' '.join(segment.text for segment in segments).strip()

        if not transcript:
            return {'success': False, 'error': 'No speech detected in audio'}

        logger.info(f"Transcription complete: {len(transcript)} chars")
        return {'success': True, 'transcript': transcript}

    except Exception as e:
        logger.error(f"Transcription error: {e}")
        return {'success': False, 'error': str(e)}

class TranscriptionHandler(BaseHTTPRequestHandler):
    """HTTP request handler for transcription requests."""

    def do_POST(self):
        """Handle POST requests."""
        if self.path == '/transcribe':
            try:
                # Read request body
                content_length = int(self.headers.get('Content-Length', 0))
                body = self.rfile.read(content_length)
                request_data = json.loads(body.decode())

                request_id = request_data.get('id', 'unknown')
                audio_path = request_data.get('audioPath', '')

                if not audio_path:
                    response = {'success': False, 'error': 'Missing audioPath'}
                else:
                    # Transcribe
                    response = transcribe_audio(audio_path)

                response['id'] = request_id

                # Send response
                response_json = json.dumps(response).encode()
                self.send_response(200)
                self.send_header('Content-Type', 'application/json')
                self.send_header('Content-Length', len(response_json))
                self.end_headers()
                self.wfile.write(response_json)

            except json.JSONDecodeError:
                self.send_response(400)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"success": false, "error": "Invalid JSON"}')
            except Exception as e:
                logger.error(f"Handler error: {e}")
                self.send_response(500)
                self.send_header('Content-Type', 'application/json')
                self.end_headers()
                self.wfile.write(b'{"success": false, "error": "Internal server error"}')

        elif self.path == '/health':
            # Health check endpoint
            self.send_response(200)
            self.send_header('Content-Type', 'application/json')
            self.end_headers()
            self.wfile.write(b'{"status": "ok", "model": "loaded"}')

        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        """Override to use our logger."""
        logger.debug(format % args)

def run_server(port=9999):
    """Run the HTTP server."""
    server_address = ('0.0.0.0', port)
    httpd = HTTPServer(server_address, TranscriptionHandler)
    logger.info(f"Whisper worker listening on port {port}")
    try:
        httpd.serve_forever()
    except KeyboardInterrupt:
        logger.info("Shutting down gracefully...")
        httpd.shutdown()

if __name__ == '__main__':
    logger.info("Starting Whisper transcription worker...")
    load_model()
    run_server(port=9999)
