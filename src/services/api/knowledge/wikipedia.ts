import { BaseApiService } from '../base/BaseApiService';

interface WikipediaResult {
    title: string;
    extract: string;
    pageid: number;
}

export class WikipediaService extends BaseApiService {
    private static readonly BASE_URL = 'https://en.wikipedia.org/w/api.php';
    private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    static async search(query: string): Promise<string | null> {
        try {
            const cachedResult = this.getFromCache(query);
            if (cachedResult) return cachedResult;

            const params = new URLSearchParams({
                action: 'query',
                format: 'json',
                prop: 'extracts',
                exintro: '1',
                explaintext: '1',
                titles: query,
                redirects: '1',
                origin: '*'
            });

            const response = await this.fetchWithTimeout(`${this.BASE_URL}?${params}`);
            if (!response.ok) throw new Error('Wikipedia API failed');

            const data = await response.json();
            const pages = data.query?.pages;
            if (!pages) return null;

            const page = Object.values(pages)[0] as WikipediaResult;
            if (!page?.extract) return null;

            const formattedContent = this.formatResult(page);
            this.addToCache(query, formattedContent);
            
            return formattedContent;
        } catch (error) {
            console.error('Wikipedia search failed:', error);
            return null;
        }
    }

    private static formatResult(page: WikipediaResult): string {
        return [
            `📚 ${page.title}`,
            `\n${this.truncateText(page.extract, 500)}`,
            `\n🔗 https://en.wikipedia.org/?curid=${page.pageid}`
        ].join('\n');
    }
}