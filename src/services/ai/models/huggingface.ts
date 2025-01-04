import { HfInference } from '@huggingface/inference';

// Initialize HuggingFace client with API key
const API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;
if (!API_KEY) {
  console.error('HuggingFace API key is missing!');
}

export const hf = new HfInference(API_KEY);

export interface GenerationConfig {
  maxLength?: number;
  temperature?: number;
  doSample?: boolean;
  returnFullText?: boolean;
}

export async function generateWithModel(
  model: string,
  input: string,
  config: GenerationConfig
): Promise<string> {
  if (!input?.trim()) {
    throw new Error('Input text is required');
  }

  try {
    const response = await hf.textGeneration({
      model,
      inputs: input.trim(),
      parameters: {
        max_new_tokens: config.maxLength,
        temperature: config.temperature,
        do_sample: config.doSample,
        return_full_text: config.returnFullText
      }
    });

    if (!response?.generated_text) {
      throw new Error('No text generated');
    }

    return response.generated_text.trim();
  } catch (error) {
    console.error('HuggingFace API error:', error);
    throw error;
  }
}