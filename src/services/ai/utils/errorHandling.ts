export class AIError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'AIError';
  }
}

export function isAIError(error: unknown): error is AIError {
  return error instanceof AIError;
}

export function handleAIError(error: unknown): string {
  if (isAIError(error)) {
    return error.message;
  }
  return "I apologize, but I'm having trouble generating a response right now. Please try again in a moment.";
}