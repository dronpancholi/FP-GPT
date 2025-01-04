export function validatePrompt(prompt?: string): string {
  if (!prompt?.trim()) {
    throw new Error('Empty prompt');
  }
  return prompt.trim();
}

export function validateResponse(response?: { generated_text?: string }): string {
  if (!response?.generated_text?.trim()) {
    throw new Error('No valid response generated');
  }
  return response.generated_text.trim();
}