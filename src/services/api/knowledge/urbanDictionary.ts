interface UrbanDictionaryDefinition {
    definition: string;
    permalink: string;
    thumbs_up: number;
    thumbs_down: number;
    example: string;
    word: string;
}

export class UrbanDictionaryService {
    private static readonly BASE_URL = 'https://api.urbandictionary.com/v0';
    private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
    private static cache = new Map<string, { data: string; timestamp: number }>();

    static async search(term: string): Promise<string | null> {
        try {
            // Check cache first
            const cachedResult = this.getFromCache(term);
            if (cachedResult) return cachedResult;

            const response = await fetch(`${this.BASE_URL}/define?term=${encodeURIComponent(term)}`);
            if (!response.ok) throw new Error('Urban Dictionary API failed');

            const data = await response.json();
            if (!data.list?.length) return null;

            const formattedContent = this.formatDefinitions(data.list);
            this.addToCache(term, formattedContent);
            
            return formattedContent;
        } catch (error) {
            console.error('Urban Dictionary search failed:', error);
            return null;
        }
    }

    private static formatDefinitions(definitions: UrbanDictionaryDefinition[]): string {
        return definitions
            .slice(0, 3) // Get top 3 definitions
            .map(def => {
                const parts = [
                    `🔤 ${def.word}`,
                    `📝 ${def.definition.replace(/[\[\]]/g, '')}`, // Remove UD's brackets
                    def.example ? `💭 Example: ${def.example.replace(/[\[\]]/g, '')}` : null,
                    `👍 ${def.thumbs_up} | 👎 ${def.thumbs_down}`
                ].filter(Boolean);

                return parts.join('\n');
            })
            .join('\n\n---\n\n');
    }

    private static getFromCache(term: string): string | null {
        const cached = this.cache.get(term);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.data;
        }
        return null;
    }

    private static addToCache(term: string, data: string): void {
        this.cache.set(term, {
            data,
            timestamp: Date.now()
        });

        // Clean old cache entries
        if (this.cache.size > 100) {
            const oldestKey = Array.from(this.cache.entries())
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
            this.cache.delete(oldestKey);
        }
    }
} 