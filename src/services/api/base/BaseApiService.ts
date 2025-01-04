export abstract class BaseApiService {
    protected static readonly DEFAULT_CACHE_DURATION = 30 * 60 * 1000; // 30 minutes
    protected static readonly DEFAULT_TIMEOUT = 10000; // 10 seconds
    protected static readonly MAX_CACHE_SIZE = 100;

    protected static cache = new Map<string, { data: string; timestamp: number }>();

    protected static getFromCache(key: string, duration = this.DEFAULT_CACHE_DURATION): string | null {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < duration) {
            return cached.data;
        }
        return null;
    }

    protected static addToCache(key: string, data: string): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });

        this.cleanCache();
    }

    protected static cleanCache(): void {
        if (this.cache.size > this.MAX_CACHE_SIZE) {
            const oldestKey = Array.from(this.cache.entries())
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
            this.cache.delete(oldestKey);
        }
    }

    protected static async fetchWithTimeout(
        url: string,
        options: RequestInit = {}
    ): Promise<Response> {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.DEFAULT_TIMEOUT);

        try {
            const response = await fetch(url, {
                ...options,
                signal: controller.signal,
                headers: {
                    'Accept': 'application/json',
                    'User-Agent': 'FP-GPT/0.3',
                    ...options.headers
                }
            });
            clearTimeout(timeoutId);
            return response;
        } catch (error) {
            clearTimeout(timeoutId);
            throw error;
        }
    }

    protected static truncateText(text: string, maxLength: number): string {
        if (!text || text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }
} 