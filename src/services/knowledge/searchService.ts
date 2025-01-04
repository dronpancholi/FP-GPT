export async function searchWeb(query: string): Promise<string> {
  try {
    // Use DuckDuckGo as it doesn't require API key
    const response = await fetch(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&no_redirect=1&t=stackblitz`
    );
    const data = await response.json();
    return data.AbstractText || data.RelatedTopics?.[0]?.Text || '';
  } catch (error) {
    console.error('Web search failed:', error);
    return '';
  }
}