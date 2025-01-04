export class SentimentAnalyzer {
    private static readonly POSITIVE_WORDS = new Set([
        'good', 'great', 'excellent', 'amazing', 'wonderful', 'positive', 'success',
        'happy', 'best', 'innovative', 'beneficial', 'recommended', 'proven'
    ]);

    private static readonly NEGATIVE_WORDS = new Set([
        'bad', 'poor', 'terrible', 'awful', 'negative', 'failure', 'worst',
        'harmful', 'dangerous', 'controversial', 'incorrect', 'false'
    ]);

    static analyzeSentiment(text: string): {
        sentiment: 'positive' | 'negative' | 'neutral';
        confidence: number;
    } {
        const words = text.toLowerCase().match(/\b\w+\b/g) || [];
        let positive = 0;
        let negative = 0;

        words.forEach(word => {
            if (this.POSITIVE_WORDS.has(word)) positive++;
            if (this.NEGATIVE_WORDS.has(word)) negative++;
        });

        const total = positive + negative;
        if (total === 0) return { sentiment: 'neutral', confidence: 0.5 };

        const score = (positive - negative) / total;
        const confidence = Math.abs(score);

        if (score > 0.1) return { sentiment: 'positive', confidence };
        if (score < -0.1) return { sentiment: 'negative', confidence };
        return { sentiment: 'neutral', confidence: confidence };
    }
} 