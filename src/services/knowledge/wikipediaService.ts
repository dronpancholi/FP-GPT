const WIKIPEDIA_API = 'https://en.wikipedia.org/w/api.php';

export async function searchWikipedia(query: string): Promise<string> {
  const params = new URLSearchParams({
    action: 'query',
    format: 'json',
    prop: 'extracts',
    exintro: '1',
    explaintext: '1',
    generator: 'search',
    gsrlimit: '1',
    gsrsearch: query,
    origin: '*'
  });

  try {
    const response = await fetch(`${WIKIPEDIA_API}?${params}`);
    const data = await response.json();
    
    if (data.query && data.query.pages) {
      const pages = Object.values(data.query.pages);
      if (pages.length > 0) {
        return pages[0].extract || '';
      }
    }
    return '';
  } catch (error) {
    console.error('Wikipedia search failed:', error);
    return '';
  }
}