export async function generateImage(prompt: string): Promise<string> {
  // Use Unsplash API as a fallback for image generation
  const query = encodeURIComponent(prompt);
  const width = 800;
  const height = 600;
  
  return `https://source.unsplash.com/random/${width}x${height}?${query}`;
}