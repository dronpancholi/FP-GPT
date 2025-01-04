import { HfInference } from '@huggingface/inference';
import { AI_MODELS } from '../../config/constants';
import { generateEnhancedResponse } from './responseGenerator';
import { Message } from '../../types';

const hf = new HfInference(import.meta.env.VITE_HUGGINGFACE_API_KEY);

const MODELS = {
  primary: 'gpt2',
  fallback: 'facebook/opt-125m'
};

export async function generateText(prompt: string, messages: Message[] = []): Promise<string> {
  try {
    // First try enhanced response for special queries
    const enhancedResponse = await generateEnhancedResponse(prompt, messages);
    if (enhancedResponse) {
      return enhancedResponse;
    }

    // Fallback to HuggingFace model
    const response = await hf.textGeneration({
      model: MODELS.primary,
      inputs: prompt.trim(),
      parameters: {
        max_new_tokens: 100,
        temperature: 0.7,
        do_sample: true,
        return_full_text: false,
        repetition_penalty: 1.2
      }
    });

    return response.generated_text?.trim() || "I apologize, but I couldn't generate a proper response. Could you rephrase your question?";
  } catch (error) {
    console.error('Primary model failed, trying fallback:', error);
    
    try {
      const fallbackResponse = await hf.textGeneration({
        model: MODELS.fallback,
        inputs: prompt.trim(),
        parameters: {
          max_new_tokens: 50,
          temperature: 0.6,
          do_sample: true
        }
      });
      
      return fallbackResponse.generated_text?.trim() || "I'm having trouble understanding. Could you try again?";
    } catch (fallbackError) {
      console.error('Fallback model failed:', fallbackError);
      return "I apologize, but I'm having technical difficulties. Please try again in a moment.";
    }
  }
}