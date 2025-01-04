import { fetchWithTimeout } from '../../utils/fetchUtils';

export class ArxivAPI {
  private baseUrl = 'http://export.arxiv.org/api/query';

  async search(query: string) {
    try {
      const response = await fetchWithTimeout(
        `${this.baseUrl}?search_query=${encodeURIComponent(query)}&max_results=10`
      );
      return await response.text();
    } catch (error) {
      console.error('ArXiv search failed:', error);
      return null;
    }
  }
}