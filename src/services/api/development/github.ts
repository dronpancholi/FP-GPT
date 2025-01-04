export class GitHubAPI {
  private baseUrl = 'https://api.github.com';

  async searchRepositories(query: string) {
    try {
      const response = await fetch(
        `${this.baseUrl}/search/repositories?q=${encodeURIComponent(query)}`
      );
      return await response.json();
    } catch (error) {
      console.error('GitHub search failed:', error);
      return null;
    }
  }
}