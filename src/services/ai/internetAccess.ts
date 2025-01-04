import { fetchWithTimeout } from '../utils/fetchUtils';

export async function searchInternet(query: string): Promise<string> {
  try {
    // Using DuckDuckGo API for free, no-key-required searches
    const response = await fetchWithTimeout(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`
    );
    const data = await response.json();
    return data.AbstractText || data.RelatedTopics?.[0]?.Text || 
           "I couldn't find specific information about that.";
  } catch (error) {
    console.error('Internet search failed:', error);
    return "I'm having trouble accessing external information right now.";
  }
}