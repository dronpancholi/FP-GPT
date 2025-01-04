import { SearchIndex } from './searchIndex';
import { RankingSystem } from './ranking';
import { SearchOptions } from './types';

export class AdvancedSearchEngine {
  private indices = {
    academic: new SearchIndex('academic'),
    technical: new SearchIndex('technical'),
    general: new SearchIndex('general')
  };

  private rankingSystem = new RankingSystem();

  async search(query: string, options: SearchOptions) {
    const results = await Promise.all([
      this.indices.academic.search(query),
      this.indices.technical.search(query),
      this.indices.general.search(query)
    ]);

    return this.rankingSystem.rankAndMerge(results, options);
  }
}