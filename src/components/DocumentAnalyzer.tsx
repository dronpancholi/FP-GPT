import React, { useState } from 'react';
import { FileText, Upload } from 'lucide-react';
import { analyzeDocument } from '../services/api';

export function DocumentAnalyzer() {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const result = await analyzeDocument(file);
      setAnalysis(result);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="file"
          onChange={handleFileUpload}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          accept=".pdf,.doc,.docx,.txt"
        />
        <div className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50">
          <Upload size={20} />
          <span>Upload Document for Analysis</span>
        </div>
      </div>
      {loading && <div className="text-center">Analyzing document...</div>}
      {analysis && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={20} />
            <h3 className="font-semibold">Analysis Result</h3>
          </div>
          <p>{analysis}</p>
        </div>
      )}
    </div>
  );
}