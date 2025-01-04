export type Message = {
  id: string;
  content: string;
  role: 'user' | 'assistant';
  timestamp: Date;
  attachments?: File[];
};

export type FileType = 'image' | 'document' | 'other';

export type ModelConfig = {
  learningRate: number;
  epochs: number;
  batchSize: number;
};

export type TrainingData = {
  input: string;
  output: string;
  timestamp: Date;
};

export interface ImageGenerationOptions {
  width?: number;
  height?: number;
  numberOfImages?: number;
  style?: string;
}

export interface ImageResponse {
  url: string;
  width: number;
  height: number;
}