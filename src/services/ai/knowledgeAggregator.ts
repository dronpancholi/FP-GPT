import { WikipediaService } from '../api/knowledge/wikipedia';
import { DuckDuckGoService } from '../api/knowledge/duckduckgo';
import { RedditService } from '../api/knowledge/reddit';
import { WikidataService } from '../api/knowledge/wikidata';
import { ArXivService } from '../api/knowledge/arxiv';
import { OpenLibraryService } from '../api/knowledge/openLibrary';
import { UrbanDictionaryService } from '../api/knowledge/urbanDictionary';
import { InternetArchiveService } from '../api/knowledge/internetArchive';
import { DBpediaService } from '../api/knowledge/dbpedia';
import { JikanAnimeService } from '../api/media/jikanAnime';
import { MovieDatabaseService } from '../api/media/movieDatabase';
import { ConversationHandler } from './ConversationHandler';
import { SentimentAnalyzer } from '../utils/sentimentAnalyzer';

type SourceType = 'academic' | 'encyclopedia' | 'structured' | 'web' | 'social' | 'media';

interface KnowledgeSource {
    type: SourceType;
    content: string;
    priority: number;
    timestamp: number;
    accuracy: number;
    sentiment: 'positive' | 'negative' | 'neutral';
    confidence: number;
}

interface ApiCall {
    name: string;
    type: SourceType;
    priority: number;
    fn: (query: string) => Promise<string | null>;
}

export class KnowledgeAggregator {
    private static readonly THROTTLE_TIME = 100; // ms between requests
    private static readonly MAX_RETRIES = 2;
    private static readonly TIMEOUT = 10000; // 10 seconds
    private static readonly MAX_CONCURRENT_REQUESTS = 5;

    private static readonly API_CALLS: ApiCall[] = [
        {
            name: 'Wikipedia',
            type: 'encyclopedia',
            priority: 1,
            fn: (query: string) => WikipediaService.search(query)
        },
        {
            name: 'DBpedia',
            type: 'structured',
            priority: 2,
            fn: (query: string) => DBpediaService.search(query)
        },
        {
            name: 'DuckDuckGo',
            type: 'web',
            priority: 3,
            fn: (query: string) => DuckDuckGoService.search(query)
        },
        {
            name: 'Reddit',
            type: 'social',
            priority: 4,
            fn: (query: string) => RedditService.search(query)
        },
        {
            name: 'Wikidata',
            type: 'structured',
            priority: 2,
            fn: (query: string) => WikidataService.search(query)
        },
        {
            name: 'arXiv',
            type: 'academic',
            priority: 1,
            fn: (query: string) => ArXivService.search(query)
        },
        {
            name: 'Internet Archive',
            type: 'web',
            priority: 3,
            fn: (query: string) => InternetArchiveService.search(query)
        },
        {
            name: 'Open Library',
            type: 'encyclopedia',
            priority: 2,
            fn: (query: string) => OpenLibraryService.search(query)
        },
        {
            name: 'Urban Dictionary',
            type: 'social',
            priority: 5,
            fn: (query: string) => UrbanDictionaryService.search(query)
        },
        {
            name: 'Anime Database',
            type: 'media',
            priority: 4,
            fn: (query: string) => JikanAnimeService.search(query)
        },
        {
            name: 'Movie Database',
            type: 'media',
            priority: 4,
            fn: (query: string) => MovieDatabaseService.search(query)
        }
    ];

    static async processQuery(query: string, previousContext?: string): Promise<string> {
        const context = ConversationHandler.analyzeQuery(query, previousContext);
        
        // If search is not required and we have high confidence, use conversational response
        if (!context.requiresSearch && context.confidence > 0.7) {
            return ConversationHandler.generateConversationalResponse(context);
        }
        
        // Attempt search for factual queries or low confidence conversations
        try {
            const sources = await this.fetchFromAllSources(query);
            
            if (sources.size === 0) {
                // Fallback to conversational response if search yields no results
                return ConversationHandler.generateConversationalResponse({
                    ...context,
                    confidence: Math.max(0.5, context.confidence)
                });
            }

            return this.formatResponses(sources);
        } catch (error) {
            console.error('Knowledge aggregation failed:', error);
            // Fallback to conversational response on error
            return ConversationHandler.generateConversationalResponse({
                ...context,
                confidence: Math.max(0.4, context.confidence)
            });
        }
    }

    private static async fetchFromAllSources(query: string): Promise<Map<string, KnowledgeSource>> {
        const sources = new Map<string, KnowledgeSource>();
        const chunks = this.chunkArray(this.API_CALLS, this.MAX_CONCURRENT_REQUESTS);

        for (const chunk of chunks) {
            const promises = chunk.map(async api => {
                try {
                    const content = await this.fetchWithRetry(api.fn, query);
                    if (content) {
                        const sentiment = SentimentAnalyzer.analyzeSentiment(content);
                        const accuracy = this.calculateAccuracy(content, api.type);
                        sources.set(api.name, {
                            type: api.type,
                            content,
                            priority: api.priority,
                            timestamp: Date.now(),
                            accuracy,
                            sentiment: sentiment.sentiment,
                            confidence: sentiment.confidence // Added confidence property
                        });
                    }
                } catch (error) {
                    console.error(`Failed to fetch from ${api.name}:`, error);
                }
                await this.delay(this.THROTTLE_TIME);
            });

            await Promise.all(promises);
        }

        return sources;
    }

    private static async fetchWithRetry(
        fn: (query: string) => Promise<string | null>,
        query: string,
        retries = 0
    ): Promise<string | null> {
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT);

            const result = await Promise.race([
                fn(query),
                new Promise((_, reject) => 
                    setTimeout(() => reject(new Error('Timeout')), this.TIMEOUT)
                )
            ]);
            clearTimeout(timeoutId);
            return result as string | null;
        } catch (error) {
            if (retries < this.MAX_RETRIES) {
                await this.delay(this.THROTTLE_TIME * (retries + 1));
                return this.fetchWithRetry(fn, query, retries + 1);
            }
            throw error;
        }
    }

    private static formatResponses(sources: Map<string, KnowledgeSource>): string {
        const responses: string[] = [];

        // Sort sources by priority and timestamp
        const sortedSources = Array.from(sources.entries())
            .sort(([, a], [, b]) => {
                if (a.priority === b.priority) {
                    return b.timestamp - a.timestamp;
                }
                return a.priority - b.priority;
            });

        sortedSources.forEach(([name, source], index) => {
            const cleanContent = this.cleanContent(source.content);
            if (cleanContent) {
                responses.push(this.formatResponse(index + 1, name, source.type, cleanContent));
            }
        });

        if (responses.length === 0) {
            return "I couldn't find any relevant information from the sources.";
        }

        return this.createFormattedOutput(responses);
    }

    private static cleanContent(content: string): string | null {
        if (!content?.trim()) return null;

        return content
            .replace(/\[.*?\]/g, '') // Remove square brackets and their contents
            .replace(/^(From|Source|r\/|Wikipedia:|Wikidata:)/gm, '') // Remove source prefixes
            .replace(/\n{3,}/g, '\n\n') // Normalize multiple newlines
            .replace(/(<([^>]+)>)/gi, '') // Remove HTML tags
            .trim();
    }

    private static formatResponse(index: number, source: string, type: SourceType, content: string): string {
        const typeEmoji = this.getTypeEmoji(type);
        const sentiment = SentimentAnalyzer.analyzeSentiment(content);
        const accuracyScore = this.calculateAccuracy(content, type);
        const sentimentEmoji = this.getSentimentEmoji(sentiment.sentiment);
        
        return [
            `Response ${index}:`,
            `${typeEmoji} [${source}]`,
            `📊 Accuracy: ${(accuracyScore * 100).toFixed(1)}% | ${sentimentEmoji} Sentiment: ${sentiment.sentiment}`,
            content
        ].join('\n');
    }

    private static calculateAccuracy(content: string, type: SourceType): number {
        // Base accuracy by source type
        const baseAccuracy = {
            academic: 0.9,
            encyclopedia: 0.85,
            structured: 0.8,
            web: 0.7,
            social: 0.5,
            media: 0.75
        }[type] || 0.6;

        // Adjust based on content characteristics
        let adjustments = 0;
        
        // Has citations or references
        if (/\[\d+\]|\(https?:\/\/[^\s]+\)/.test(content)) adjustments += 0.1;
        
        // Contains numbers/statistics
        if (/\d+%|\d+\.\d+/.test(content)) adjustments += 0.05;
        
        // Has balanced viewpoint markers
        if (/however|although|while|despite/.test(content)) adjustments += 0.05;
        
        return Math.min(1, baseAccuracy + adjustments);
    }

    private static getSentimentEmoji(sentiment: string): string {
        return {
            positive: '😊',
            negative: '😟',
            neutral: '😐'
        }[sentiment] || '😐';
    }

    private static getTypeEmoji(type: SourceType): string {
        const emojiMap: Record<SourceType, string> = {
            academic: '📚',
            encyclopedia: '📖',
            structured: '🔍',
            web: '🌐',
            social: '👥',
            media: '🎬'
        };
        return emojiMap[type] || '📌';
    }

    private static createFormattedOutput(responses: string[]): string {
        const header = `Found ${responses.length} relevant sources:\n\n`;
        return header + responses.join('\n\n');
    }

    private static chunkArray<T>(array: T[], size: number): T[][] {
        const chunks: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            chunks.push(array.slice(i, i + size));
        }
        return chunks;
    }

    private static delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}