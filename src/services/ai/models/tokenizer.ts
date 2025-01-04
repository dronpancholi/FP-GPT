import { LocalStorageService } from '../../storage/localStorage';

const storage = new LocalStorageService('tokenizer_');

export class Tokenizer {
  private vocabulary: Map<string, number>;
  private reverseVocabulary: Map<number, string>;
  
  constructor() {
    this.vocabulary = new Map();
    this.reverseVocabulary = new Map();
    this.loadVocabulary();
  }

  private loadVocabulary() {
    const saved = storage.get('vocabulary');
    if (saved) {
      this.vocabulary = new Map(Object.entries(saved));
      this.reverseVocabulary = new Map(
        Array.from(this.vocabulary.entries()).map(([k, v]) => [v, k])
      );
    }
  }

  tokenize(text: string): number[] {
    const words = text.toLowerCase().match(/\b\w+\b/g) || [];
    return words.map(word => {
      if (!this.vocabulary.has(word)) {
        const id = this.vocabulary.size;
        this.vocabulary.set(word, id);
        this.reverseVocabulary.set(id, word);
        storage.set('vocabulary', Object.fromEntries(this.vocabulary));
      }
      return this.vocabulary.get(word)!;
    });
  }

  detokenize(tokens: number[]): string {
    return tokens
      .map(token => this.reverseVocabulary.get(token) || '')
      .join(' ');
  }
}