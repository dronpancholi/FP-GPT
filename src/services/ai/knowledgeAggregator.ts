import { gemini } from './gemini';
import { PERSONALITY } from '../../config/aiConfig';

type SourceType = 'academic' | 'encyclopedia' | 'structured' | 'web' | 'social' | 'media';

interface KnowledgeSource {
    type: SourceType;
    content: string;
    priority: number;
    timestamp: number;
    accuracy: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
}

interface ApiCall {
    name: string;
    type: SourceType;
    priority: number;
    fn: (query: string) => Promise<string | null>;
}

export class KnowledgeAggregator {
    static async getSystemPrompt(history: any[]) {
        const lastMessage = history[history.length - 1];
        const lastMessageContent = lastMessage.parts[0].text;

        const contextPrompt = `You are ${PERSONALITY.responses.identity}. ${PERSONALITY.responses.purpose}.
You were developed by ${PERSONALITY.responses.developer}.
Your personality is ${Object.keys(PERSONALITY.traits).join(', ')}.

The user said: "${lastMessageContent}"

Based on this, answer the following:
1.  What is the user's intent? (e.g., asking a question, seeking advice, casual conversation)
2.  What is the emotional tone of the user's message? (e.g., curious, happy, frustrated)
3.  Does the user's message require factual information or a creative response?

Generate a concise response that incorporates your personality and addresses the user's needs.`;

        const result = await gemini.generateContent(contextPrompt);
        const response = await result.response;
        const text = response.text();

        return text;
    }
}