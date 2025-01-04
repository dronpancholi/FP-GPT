import { AI_MODELS } from '../../config/constants';

export class SpeechService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesisUtterance | null = null;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window.webkitSpeechRecognition as any)();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';
    }
    
    if ('speechSynthesis' in window) {
      this.synthesis = new SpeechSynthesisUtterance();
      this.synthesis.lang = 'en-US';
      this.synthesis.rate = 1;
      this.synthesis.pitch = 1;
    }
  }

  async transcribeAudio(audioBlob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('audio', audioBlob);
    formData.append('model', AI_MODELS.speech.whisper);

    const response = await fetch('https://api-inference.huggingface.co/models/openai/whisper-small', {
      method: 'POST',
      body: formData
    });

    const result = await response.json();
    return result.text;
  }

  startListening(onResult: (text: string) => void): void {
    if (!this.recognition) return;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map(result => result[0].transcript)
        .join('');
      onResult(transcript);
    };

    this.recognition.start();
  }

  stopListening(): void {
    this.recognition?.stop();
  }

  speak(text: string): void {
    if (!this.synthesis) return;
    
    this.synthesis.text = text;
    window.speechSynthesis.speak(this.synthesis);
  }
}