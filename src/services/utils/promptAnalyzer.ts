export type PromptType = 'general' | 'image' | 'document' | 'code' | 'question' | 'greeting' | 'personal';

const promptPatterns = {
  greeting: [
    'hi',
    'hello',
    'hey',
    'good morning',
    'good afternoon',
    'good evening',
    'how are you'
  ],
  personal: [
    'remember',
    'you said',
    'we talked',
    'earlier',
    'before',
    'tell me more',
    'what do you think'
  ],
  question: [
    'what',
    'how',
    'why',
    'when',
    'where',
    'who',
    'can you',
    'could you'
  ],
  image: [
    'image',
    'picture',
    'photo',
    'draw',
    'generate',
    'create',
    'show me'
  ],
  document: [
    'document',
    'pdf',
    'doc',
    'text',
    'file',
    'read'
  ],
  code: [
    'code',
    'program',
    'function',
    'script',
    'develop'
  ]
};

export function analyzePrompt(prompt: string): PromptType[] {
  const types: PromptType[] = ['general'];
  const lowercased = prompt.toLowerCase();

  Object.entries(promptPatterns).forEach(([type, patterns]) => {
    if (patterns.some(pattern => lowercased.includes(pattern))) {
      types.push(type as PromptType);
    }
  });

  return types;
}