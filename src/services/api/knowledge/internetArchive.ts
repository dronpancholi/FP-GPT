interface ArchiveItem {
    identifier: string;
    title: string;
    description?: string;
    creator?: string[];
    date?: string;
    mediatype?: string;
    downloads?: number;
}

export class InternetArchiveService {
    private static readonly BASE_URL = 'https://archive.org/advancedsearch.php';
    private static readonly CACHE_DURATION = 60 * 60 * 1000; // 1 hour
    private static cache = new Map<string, { data: string; timestamp: number }>();

    static async search(query: string): Promise<string | null> {
        try {
            const cachedResult = this.getFromCache(query);
            if (cachedResult) return cachedResult;

            const params = new URLSearchParams({
                q: query,
                output: 'json',
                rows: '5',
                page: '1',
                fl: ['identifier', 'title', 'description', 'creator', 'date', 'mediatype', 'downloads'].join(',')
            });

            const response = await fetch(`${this.BASE_URL}?${params}`);
            if (!response.ok) throw new Error('Internet Archive API failed');

            const data = await response.json();
            if (!data.response?.docs?.length) return null;

            const formattedContent = this.formatResults(data.response.docs);
            this.addToCache(query, formattedContent);
            
            return formattedContent;
        } catch (error) {
            console.error('Internet Archive search failed:', error);
            return null;
        }
    }

    private static formatResults(items: ArchiveItem[]): string {
        return items
            .map(item => {
                const parts = [
                    `📚 ${item.title}`,
                    item.creator?.length ? `👤 By: ${item.creator.join(', ')}` : null,
                    item.description ? `📝 ${this.truncateText(item.description, 200)}` : null,
                    item.date ? `📅 Date: ${item.date}` : null,
                    item.mediatype ? `📀 Type: ${item.mediatype}` : null,
                    item.downloads ? `⬇️ Downloads: ${item.downloads.toLocaleString()}` : null,
                    `🔗 Link: https://archive.org/details/${item.identifier}`
                ].filter(Boolean);

                return parts.join('\n');
            })
            .join('\n\n---\n\n');
    }

    private static truncateText(text: string, maxLength: number): string {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
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

        if (this.cache.size > 100) {
            const oldestKey = Array.from(this.cache.entries())
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
            this.cache.delete(oldestKey);
        }
    }
} 