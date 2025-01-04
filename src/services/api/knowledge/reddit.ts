import { BaseApiService } from '../base/BaseApiService';

interface RedditPost {
    title: string;
    selftext: string;
    score: number;
    num_comments: number;
    subreddit: string;
    permalink: string;
    created_utc: number;
}

export class RedditService extends BaseApiService {
    private static readonly BASE_URL = 'https://www.reddit.com';
    private static readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    static async search(query: string): Promise<string | null> {
        try {
            const cachedResult = this.getFromCache(query);
            if (cachedResult) return cachedResult;

            const params = new URLSearchParams({
                q: query,
                sort: 'relevance',
                limit: '5',
                raw_json: '1'
            });

            const response = await this.fetchWithTimeout(
                `${this.BASE_URL}/search.json?${params}`,
                {
                    headers: {
                        'User-Agent': 'FP-GPT/0.3 (by /u/fp-gpt)'
                    }
                }
            );

            if (!response.ok) throw new Error('Reddit API failed');

            const data = await response.json();
            if (!data.data?.children?.length) return null;

            const posts = data.data.children
                .map((child: any) => child.data as RedditPost)
                .filter((post: RedditPost) => post.selftext && post.score > 0);

            if (!posts.length) return null;

            const formattedContent = this.formatResults(posts);
            this.addToCache(query, formattedContent);
            
            return formattedContent;
        } catch (error) {
            console.error('Reddit search failed:', error);
            return null;
        }
    }

    private static formatResults(posts: RedditPost[]): string {
        return posts
            .map(post => {
                const parts = [
                    `📱 r/${post.subreddit}: ${post.title}`,
                    `📝 ${this.truncateText(post.selftext, 300)}`,
                    `👍 Score: ${post.score} | 💬 Comments: ${post.num_comments}`,
                    `🕒 Posted: ${new Date(post.created_utc * 1000).toLocaleDateString()}`,
                    `🔗 https://reddit.com${post.permalink}`
                ];

                return parts.join('\n');
            })
            .join('\n\n---\n\n');
    }
} 