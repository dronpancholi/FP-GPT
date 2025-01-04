interface MovieResult {
    Title: string;
    Year: string;
    Plot: string;
    Director: string;
    Actors: string;
    imdbRating: string;
    Genre: string;
    Runtime: string;
    Type: string;
    imdbID: string;
}

export class OMDbService {
    private static readonly BASE_URL = 'https://www.omdbapi.com';
    private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
    private static cache = new Map<string, { data: string; timestamp: number }>();

    static async search(query: string): Promise<string | null> {
        try {
            const cachedResult = this.getFromCache(query);
            if (cachedResult) return cachedResult;

            const params = new URLSearchParams({
                s: query,
                type: 'movie',
                r: 'json'
            });

            const response = await fetch(`${this.BASE_URL}/?${params}`);
            if (!response.ok) throw new Error('OMDb API failed');

            const data = await response.json();
            if (!data.Search?.length) return null;

            // Get detailed info for each movie
            const detailedResults = await Promise.all(
                data.Search.slice(0, 5).map((movie: { imdbID: string }) => this.getMovieDetails(movie.imdbID))
            );

            const formattedContent = this.formatResults(detailedResults.filter(Boolean));
            this.addToCache(query, formattedContent);
            
            return formattedContent;
        } catch (error) {
            console.error('OMDb search failed:', error);
            return null;
        }
    }

    private static async getMovieDetails(imdbId: string): Promise<MovieResult | null> {
        try {
            const params = new URLSearchParams({
                i: imdbId,
                plot: 'short',
                r: 'json'
            });

            const response = await fetch(`${this.BASE_URL}/?${params}`);
            if (!response.ok) return null;

            const data = await response.json();
            return data.Response === 'True' ? data : null;
        } catch {
            return null;
        }
    }

    private static formatResults(movies: MovieResult[]): string {
        return movies
            .map(movie => {
                const parts = [
                    `🎬 ${movie.Title} (${movie.Year})`,
                    `📝 ${movie.Plot}`,
                    `🎭 Director: ${movie.Director}`,
                    `👥 Cast: ${movie.Actors}`,
                    `⭐ IMDb: ${movie.imdbRating}`,
                    `🎭 Genre: ${movie.Genre}`,
                    `⏱️ Runtime: ${movie.Runtime}`,
                    `🔗 https://www.imdb.com/title/${movie.imdbID}`
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

        if (this.cache.size > 100) {
            const oldestKey = Array.from(this.cache.entries())
                .sort(([, a], [, b]) => a.timestamp - b.timestamp)[0][0];
            this.cache.delete(oldestKey);
        }
    }
} 