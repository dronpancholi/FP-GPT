interface OpenLibraryBook {
    title: string;
    author_name?: string[];
    first_publish_year?: number;
    number_of_pages_median?: number;
    subject?: string[];
    isbn?: string[];
}

export class OpenLibraryService {
    private static readonly BASE_URL = 'https://openlibrary.org';
    private static readonly CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    private static cache = new Map<string, { data: string; timestamp: number }>();

    static async search(query: string): Promise<string | null> {
        try {
            // Check cache first
            const cachedResult = this.getFromCache(query);
            if (cachedResult) return cachedResult;

            const params = new URLSearchParams({
                q: query,
                limit: '5',
                fields: 'title,author_name,first_publish_year,number_of_pages_median,subject,isbn'
            });

            const response = await fetch(`${this.BASE_URL}/search.json?${params}`);
            if (!response.ok) throw new Error('Open Library API failed');

            const data = await response.json();
            if (!data.docs?.length) return null;

            const formattedContent = this.formatResults(data.docs);
            this.addToCache(query, formattedContent);
            
            return formattedContent;
        } catch (error) {
            console.error('Open Library search failed:', error);
            return null;
        }
    }

    private static formatResults(books: OpenLibraryBook[]): string {
        return books
            .map(book => {
                const parts = [
                    `📚 ${book.title}`,
                    book.author_name?.length ? `✍️ By: ${book.author_name.join(', ')}` : null,
                    book.first_publish_year ? `📅 Published: ${book.first_publish_year}` : null,
                    book.number_of_pages_median ? `📖 Pages: ${book.number_of_pages_median}` : null,
                    book.subject?.length ? `🏷️ Subjects: ${book.subject.slice(0, 3).join(', ')}` : null,
                    book.isbn?.length ? `📇 ISBN: ${book.isbn[0]}` : null
                ].filter(Boolean);

                return parts.join('\n');
            })
            .join('\n\n---\n\n');
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