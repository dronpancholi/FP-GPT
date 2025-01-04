import { SearchResult, SearchOptions } from './types';

export class RankingSystem {
  rankAndMerge(results: SearchResult[][], options: SearchOptions): SearchResult[] {
    try {
      // Flatten results
      const flatResults = results.flat();

      // Sort by score
      const sorted = flatResults.sort((a, b) => b.score - a.score);

      // Apply limit and offset
      const start = options.offset || 0;
      const end = options.limit ? start + options.limit : undefined;

      return sorted.slice(start, end);
    } catch (error) {
      console.error('Ranking failed:', error);
      return [];
    }
  }
}