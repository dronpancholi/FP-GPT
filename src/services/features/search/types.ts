export interface SearchOptions {
  limit?: number;
  offset?: number;
  sort?: 'relevance' | 'date';
  filters?: Record<string, any>;
}

export interface SearchResult {
  id: string;
  title: string;
  content: string;
  score: number;
  source: string;
}