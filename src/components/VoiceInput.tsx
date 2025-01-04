import React, { useState } from 'react';
import { Mic, MicOff } from 'lucide-react';

export function VoiceInput() {
  const [isRecording, setIsRecording] = useState(false);

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    // Implement voice recording logic here
  };

  return (
    <button
      onClick={toggleRecording}
      className={`p-2 rounded-full transition-colors ${
        isRecording ? 'bg-red-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
      }`}
    >
      {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
    </button>
  );
}