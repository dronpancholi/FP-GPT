import { AI_IDENTITY, PERSONALITY } from '../../config/aiConfig';
import { Message } from '../../types';
import { searchWeb } from '../knowledge/searchService';
import { ContextManager } from './contextManager';

const contextManager = new ContextManager();

export async function generateEnhancedResponse(prompt: string, messages: Message[]): Promise<string> {
  // Update context
  messages.forEach(msg => contextManager.addMessage(msg));

  // Check for identity/developer questions
  if (isIdentityQuestion(prompt)) {
    return handleIdentityQuestion(prompt);
  }

  // Check for follow-up questions
  if (isFollowUpQuestion(prompt)) {
    return handleFollowUpQuestion(prompt);
  }

  // Get web information for knowledge-based questions
  try {
    const webInfo = await searchWeb(prompt);
    if (webInfo) {
      return formatResponse(webInfo);
    }
  } catch (error) {
    console.error('Web search failed:', error);
  }

  // Fallback to default response
  return "I understand your question. Let me help you with that...";
}

function isIdentityQuestion(prompt: string): boolean {
  const identityKeywords = [
    'who made you', 'who created you', 'who is your developer',
    'who developed you', 'what are you', 'who are you'
  ];
  return identityKeywords.some(keyword => 
    prompt.toLowerCase().includes(keyword)
  );
}

function handleIdentityQuestion(prompt: string): string {
  if (prompt.toLowerCase().includes('developer') || 
      prompt.toLowerCase().includes('created') || 
      prompt.toLowerCase().includes('made')) {
    return PERSONALITY.responses.developer;
  }
  return PERSONALITY.responses.identity;
}

function isFollowUpQuestion(prompt: string): boolean {
  const followUpIndicators = [
    'what about', 'and then', 'what else', 'tell me more',
    'can you explain', 'why is that', 'how does that'
  ];
  return followUpIndicators.some(indicator => 
    prompt.toLowerCase().includes(indicator)
  );
}

function handleFollowUpQuestion(prompt: string): string {
  const relevantContext = contextManager.getRelevantContext(prompt);
  if (relevantContext.length > 0) {
    // Use the context to generate a more relevant response
    return `Based on our previous conversation about ${relevantContext[0].content}, I can tell you that...`;
  }
  return "Could you provide more context about what you'd like to know?";
}

function formatResponse(text: string): string {
  return text
    .trim()
    .replace(/\n+/g, ' ')
    .substring(0, 500) + (text.length > 500 ? '...' : '');
}