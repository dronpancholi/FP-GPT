export const AI_MODELS = {
  text: {
    gpt2: 'gpt2',
    opt: 'facebook/opt-125m',
    flan: 'google/flan-t5-small',
    bloom: 'bigscience/bloom-560m'
  },
  image: {
    stable_diffusion: 'stabilityai/stable-diffusion-2-1',
  },
  speech: {
    whisper: 'openai/whisper-small'
  }
};

export const API_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000,
  timeout: 30000,
  generation: {
    maxLength: 100,
    temperature: 0.7,
    topP: 0.9,
    repetitionPenalty: 1.2
  }
};