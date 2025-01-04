import { BaseApiService } from '../base/BaseApiService';

interface MovieResult {
    title: string;
    overview: string;
    release_date: string;
    vote_average: number;
    id: string;
}

export class MovieDatabaseService extends BaseApiService {
    private static readonly BASE_URL = 'https://api.themoviedb.org/3';
    private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours

    static async search(query: string): Promise<string | null> {
        try {
            const cachedResult = this.getFromCache(query);
            if (cachedResult) return cachedResult;

            const response = await this.fetchWithTimeout(
                `${this.BASE_URL}/search/movie?query=${encodeURIComponent(query)}&language=en-US&page=1`,
                {
                    headers: {
                        'Authorization': 'Bearer YOUR_TMDB_API_KEY'
                    }
                }
            );

            if (!response.ok) throw new Error('Movie Database API failed');

            const data = await response.json();
            if (!data.results?.length) return null;

            const formattedContent = this.formatResults(data.results.slice(0, 5));
            this.addToCache(query, formattedContent);
            
            return formattedContent;
        } catch (error) {
            console.error('Movie search failed:', error);
            return null;
        }
    }

    private static formatResults(movies: MovieResult[]): string {
        return movies
            .map(movie => {
                const parts = [
                    `🎬 ${movie.title}`,
                    `📝 ${this.truncateText(movie.overview, 200)}`,
                    `⭐ Rating: ${movie.vote_average}/10`,
                    `📅 Released: ${movie.release_date}`,
                    `🔗 https://www.themoviedb.org/movie/${movie.id}`
                ].filter(Boolean);

                return parts.join('\n');
            })
            .join('\n\n---\n\n');
    }
} 