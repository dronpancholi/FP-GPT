import { searchKnowledge } from './knowledgeService';

export async function getKnowledge(query: string): Promise<string> {
  try {
    const knowledge = await searchKnowledge(query);
    return knowledge.length > 300 ? 
      knowledge.substring(0, 300) + '...' : 
      knowledge;
  } catch (error) {
    console.error('Knowledge fetch failed:', error);
    return "I'm having trouble accessing that information right now.";
  }
}