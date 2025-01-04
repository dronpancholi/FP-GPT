import { BaseApiService } from '../base/BaseApiService';

interface DDGResult {
    Abstract: string;
    AbstractText: string;
    AbstractSource: string;
    AbstractURL: string;
    RelatedTopics: Array<{
        Text?: string;
        FirstURL?: string;
    }>;
}

export class DuckDuckGoService extends BaseApiService {
    private static readonly BASE_URL = 'https://api.duckduckgo.com/';
    private static readonly CACHE_DURATION = 15 * 60 * 1000; // 15 minutes

    static async search(query: string): Promise<string | null> {
        try {
            const cachedResult = this.getFromCache(query);
            if (cachedResult) return cachedResult;

            const params = new URLSearchParams({
                q: query,
                format: 'json',
                no_html: '1',
                skip_disambig: '1'
            });

            const response = await this.fetchWithTimeout(`${this.BASE_URL}?${params}`);
            if (!response.ok) throw new Error('DuckDuckGo API failed');

            const data = await response.json() as DDGResult;
            if (!data.AbstractText && !data.RelatedTopics.length) return null;

            const formattedContent = this.formatResult(data);
            this.addToCache(query, formattedContent);
            
            return formattedContent;
        } catch (error) {
            console.error('DuckDuckGo search failed:', error);
            return null;
        }
    }

    private static formatResult(data: DDGResult): string {
        const parts = [];

        if (data.AbstractText) {
            parts.push(`📝 ${data.AbstractText}`);
            parts.push(`🔗 Source: ${data.AbstractSource} (${data.AbstractURL})`);
        }

        if (data.RelatedTopics.length) {
            parts.push('\n📌 Related Topics:');
            data.RelatedTopics.slice(0, 3).forEach(topic => {
                if (topic.Text) {
                    parts.push(`• ${this.truncateText(topic.Text, 150)}`);
                    if (topic.FirstURL) parts.push(`  🔗 ${topic.FirstURL}`);
                }
            });
        }

        return parts.join('\n');
    }
} 