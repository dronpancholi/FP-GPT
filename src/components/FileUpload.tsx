import React from 'react';
import { Upload } from 'lucide-react';

export function FileUpload() {
  return (
    <div className="relative">
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={(e) => {
          // Handle file upload logic here
          console.log(e.target.files);
        }}
        multiple
      />
      <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50">
        <Upload size={16} />
        <span>Upload Files</span>
      </div>
    </div>
  );
}