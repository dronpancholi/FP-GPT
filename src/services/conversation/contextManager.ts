import { LocalStorageService } from '../storage/localStorage';

export class ConversationContext {
  private storage: LocalStorageService;
  private readonly MAX_CONTEXT = 20;

  constructor() {
    this.storage = new LocalStorageService('conversation_');
  }

  addToContext(message: { role: string; content: string; timestamp: Date }) {
    const context = this.getContext();
    context.push(message);
    
    // Keep context size manageable
    if (context.length > this.MAX_CONTEXT) {
      context.shift();
    }
    
    this.storage.set('history', context);
  }

  getContext() {
    return this.storage.get('history') || [];
  }

  findRelevantContext(topic: string): string[] {
    const context = this.getContext();
    return context
      .filter(msg => msg.content.toLowerCase().includes(topic.toLowerCase()))
      .map(msg => msg.content);
  }

  clearContext() {
    this.storage.remove('history');
  }
}