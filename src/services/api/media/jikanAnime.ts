interface AnimeResult {
    mal_id: number;
    title: string;
    synopsis?: string;
    score?: number;
    episodes?: number;
    status?: string;
    aired?: {
        string?: string;
    };
    genres?: Array<{ name: string }>;
}

export class JikanAnimeService {
    private static readonly BASE_URL = 'https://api.jikan.moe/v4';
    private static readonly CACHE_DURATION = 6 * 60 * 60 * 1000; // 6 hours
    private static readonly RATE_LIMIT = 1000; // 1 request per second
    private static cache = new Map<string, { data: string; timestamp: number }>();
    private static lastRequest = 0;

    static async search(query: string): Promise<string | null> {
        try {
            const cachedResult = this.getFromCache(query);
            if (cachedResult) return cachedResult;

            // Rate limiting
            const now = Date.now();
            const timeSinceLastRequest = now - this.lastRequest;
            if (timeSinceLastRequest < this.RATE_LIMIT) {
                await new Promise(resolve => setTimeout(resolve, this.RATE_LIMIT - timeSinceLastRequest));
            }
            this.lastRequest = now;

            const params = new URLSearchParams({
                q: query,
                limit: '5',
                sfw: 'true'
            });

            const response = await fetch(`${this.BASE_URL}/anime?${params}`);
            if (!response.ok) throw new Error('Jikan API failed');

            const data = await response.json();
            if (!data.data?.length) return null;

            const formattedContent = this.formatResults(data.data);
            this.addToCache(query, formattedContent);
            
            return formattedContent;
        } catch (error) {
            console.error('Jikan search failed:', error);
            return null;
        }
    }

    private static formatResults(animes: AnimeResult[]): string {
        return animes
            .map(anime => {
                const parts = [
                    `🎬 ${anime.title}`,
                    anime.synopsis ? `📝 ${this.truncateText(anime.synopsis, 200)}` : null,
                    anime.score ? `⭐ Score: ${anime.score}` : null,
                    anime.episodes ? `📺 Episodes: ${anime.episodes}` : null,
                    anime.status ? `📊 Status: ${anime.status}` : null,
                    anime.aired?.string ? `📅 Aired: ${anime.aired.string}` : null,
                    anime.genres?.length ? `🏷️ Genres: ${anime.genres.map(g => g.name).join(', ')}` : null,
                    `🔗 Link: https://myanimelist.net/anime/${anime.mal_id}`
                ].filter(Boolean);

                return parts.join('\n');
            })
            .join('\n\n---\n\n');
    }

    private static truncateText(text: string, maxLength: number): string {
        if (!text || text.length <= maxLength) return text;
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