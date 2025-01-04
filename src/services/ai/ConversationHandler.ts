type ConversationType = 'factual' | 'opinion' | 'emotional' | 'creative' | 'casual';

interface ConversationContext {
    type: ConversationType;
    requiresSearch: boolean;
    confidence: number;
    previousContext?: string;
}

export class ConversationHandler {
    private static readonly SEARCH_TRIGGERS = [
        'search for',
        'look up',
        'find information',
        'what is',
        'who is',
        'when did',
        'where is',
        'tell me about'
    ];

    private static readonly OPINION_TRIGGERS = [
        'what do you think',
        'how do you feel',
        'your opinion',
        'do you believe',
        'would you say'
    ];

    private static readonly EMOTIONAL_TRIGGERS = [
        'i feel',
        'i am sad',
        'i am happy',
        'i need help',
        'i\'m worried'
    ];

    static analyzeQuery(query: string, previousContext?: string): ConversationContext {
        const lowerQuery = query.toLowerCase();
        
        // Force search if explicit triggers are present
        if (this.SEARCH_TRIGGERS.some(trigger => lowerQuery.includes(trigger))) {
            return {
                type: 'factual',
                requiresSearch: true,
                confidence: 1,
                previousContext
            };
        }

        // Check for opinion-based queries
        if (this.OPINION_TRIGGERS.some(trigger => lowerQuery.includes(trigger))) {
            return {
                type: 'opinion',
                requiresSearch: false,
                confidence: 0.8,
                previousContext
            };
        }

        // Check for emotional support queries
        if (this.EMOTIONAL_TRIGGERS.some(trigger => lowerQuery.includes(trigger))) {
            return {
                type: 'emotional',
                requiresSearch: false,
                confidence: 0.9,
                previousContext
            };
        }

        // Analyze query characteristics
        const characteristics = this.analyzeQueryCharacteristics(query);
        return {
            type: characteristics.type,
            requiresSearch: characteristics.requiresSearch,
            confidence: characteristics.confidence,
            previousContext
        };
    }

    private static analyzeQueryCharacteristics(query: string): {
        type: ConversationType;
        requiresSearch: boolean;
        confidence: number;
    } {
        const hasNumbers = /\d+/.test(query);
        const hasProperNouns = /[A-Z][a-z]+/g.test(query);
        const isQuestionFormat = /^(who|what|where|when|why|how)/i.test(query);
        const isShortQuery = query.split(' ').length <= 3;
        
        if (hasNumbers || (hasProperNouns && isQuestionFormat)) {
            return {
                type: 'factual',
                requiresSearch: true,
                confidence: 0.7
            };
        }

        if (isQuestionFormat && !isShortQuery) {
            return {
                type: 'factual',
                requiresSearch: true,
                confidence: 0.6
            };
        }

        return {
            type: 'casual',
            requiresSearch: false,
            confidence: 0.5
        };
    }

    static generateConversationalResponse(context: ConversationContext): string {
        switch (context.type) {
            case 'opinion':
                return this.generateOpinionResponse(context);
            case 'emotional':
                return this.generateEmpatheticResponse(context);
            case 'creative':
                return this.generateCreativeResponse(context);
            case 'casual':
                return this.generateCasualResponse(context);
            default:
                return "I should look that up to give you accurate information.";
        }
    }

    private static generateOpinionResponse(context: ConversationContext): string {
        // Implement opinion-based response generation
        return "Based on my understanding, I think...";
    }

    private static generateEmpatheticResponse(context: ConversationContext): string {
        // Implement empathetic response generation
        return "I understand how you feel...";
    }

    private static generateCreativeResponse(context: ConversationContext): string {
        // Implement creative response generation
        return "Let me share an interesting perspective...";
    }

    private static generateCasualResponse(context: ConversationContext): string {
        // Implement casual conversation response
        return "That's an interesting point...";
    }
} 