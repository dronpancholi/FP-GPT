import { Message } from '../../types';

export class ContextManager {
  private context: Message[] = [];
  private readonly maxContextSize = 10;

  addMessage(message: Message): void {
    this.context.push(message);
    if (this.context.length > this.maxContextSize) {
      this.context.shift();
    }
  }

  getRelevantContext(query: string): Message[] {
    return this.context.filter(msg => 
      msg.content.toLowerCase().includes(query.toLowerCase())
    );
  }

  getLastMessages(count: number = 5): Message[] {
    return this.context.slice(-count);
  }

  clearContext(): void {
    this.context = [];
  }
}