interface ArXivEntry {
    title: string;
    summary: string;
    authors: string[];
    published: string;
    link: string;
}

export class ArXivService {
    private static readonly BASE_URL = 'https://export.arxiv.org/api/query';
    private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    private static readonly MAX_RESULTS = 5;
    private static cache = new Map<string, { data: string; timestamp: number }>();

    static async search(query: string): Promise<string | null> {
        try {
            // Check cache first
            const cachedResult = this.getFromCache(query);
            if (cachedResult) return cachedResult;

            const params = new URLSearchParams({
                search_query: `all:${encodeURIComponent(query)}`,
                start: '0',
                max_results: this.MAX_RESULTS.toString(),
                sortBy: 'relevance',
                sortOrder: 'descending'
            });

            const response = await fetch(`${this.BASE_URL}?${params}`);
            if (!response.ok) {
                throw new Error(`arXiv API failed: ${response.status}`);
            }

            const xmlText = await response.text();
            const entries = this.parseXmlResponse(xmlText);
            
            if (entries.length === 0) return null;

            const formattedContent = this.formatEntries(entries);
            
            // Cache the result
            this.addToCache(query, formattedContent);
            
            return formattedContent;
        } catch (error) {
            console.error('arXiv search failed:', error);
            return null;
        }
    }

    private static parseXmlResponse(xmlText: string): ArXivEntry[] {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
        const entries = xmlDoc.getElementsByTagName('entry');

        return Array.from(entries).map(entry => ({
            title: this.getXmlContent(entry, 'title'),
            summary: this.getXmlContent(entry, 'summary'),
            authors: Array.from(entry.getElementsByTagName('author'))
                .map(author => this.getXmlContent(author, 'name')),
            published: this.getXmlContent(entry, 'published'),
            link: this.getXmlContent(entry, 'id')
        }));
    }

    private static getXmlContent(element: Element, tagName: string): string {
        const node = element.getElementsByTagName(tagName)[0];
        return node ? (node.textContent || '').trim() : '';
    }

    private static formatEntries(entries: ArXivEntry[]): string {
        return entries
            .map(entry => {
                const date = new Date(entry.published).toLocaleDateString();
                return [
                    `📄 ${this.cleanText(entry.title)}`,
                    `👥 Authors: ${entry.authors.join(', ')}`,
                    `📅 Published: ${date}`,
                    `🔗 ${entry.link}`,
                    '',
                    this.cleanText(entry.summary)
                ].join('\n');
            })
            .join('\n\n---\n\n');
    }

    private static cleanText(text: string): string {
        return text
            .replace(/\s+/g, ' ')  // Normalize whitespace
            .replace(/\n/g, ' ')   // Remove newlines
            .trim();
    }

    private static getFromCache(query: string): string | null {
        const cached = this.cache.get(query);
        if (cached && Date.now() - cached.timestamp < this.CACHE_DURATION) {
            return cached.data;
        }
        return null;
    }

    private static addToCache(query: string, data: string): void {
        this.cache.set(query, {
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