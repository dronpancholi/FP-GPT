import { fetchWithTimeout } from '../utils/fetchUtils';

export async function searchKnowledge(query: string): Promise<string> {
  try {
    const response = await fetchWithTimeout(
      `https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&no_redirect=1&t=ai-chat`,
      { timeout: 5000 }
    );

    const data = await response.json();
    return data.AbstractText || data.RelatedTopics?.[0]?.Text || 
           "I couldn't find specific information about that.";
  } catch (error) {
    console.error('Knowledge search failed:', error);
    return "I'm having trouble accessing external information right now.";
  }
}