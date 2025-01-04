export class VoiceService {
  private recognition: SpeechRecognition | null = null;
  private synthesis: SpeechSynthesisUtterance | null = null;

  constructor() {
    if ('webkitSpeechRecognition' in window) {
      this.recognition = new (window.webkitSpeechRecognition as any)();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
    }
    
    if ('speechSynthesis' in window) {
      this.synthesis = new SpeechSynthesisUtterance();
    }
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