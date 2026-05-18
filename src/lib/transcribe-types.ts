export interface TranscriptionRequest {
  id: string;
  audioPath: string;
}

export interface TranscriptionResponse {
  id: string;
  success: boolean;
  transcript?: string;
  error?: string;
}

export interface WorkerMessage {
  type: 'request' | 'response';
  data: TranscriptionRequest | TranscriptionResponse;
}
