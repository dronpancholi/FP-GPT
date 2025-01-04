import React, { useState } from 'react';
import { Image, Loader } from 'lucide-react';
import { generateImage } from '../services/api';

export function ImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const url = await generateImage(prompt);
      setImageUrl(url);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Describe the image you want to generate..."
          className="flex-1 px-4 py-2 border rounded-lg"
        />
        <button
          onClick={handleGenerate}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50"
        >
          {loading ? <Loader className="animate-spin" /> : <Image size={20} />}
        </button>
      </div>
      {imageUrl && (
        <img src={imageUrl} alt="Generated" className="w-full rounded-lg shadow-lg" />
      )}
    </div>
  );
}