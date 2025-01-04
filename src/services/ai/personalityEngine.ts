import { Message } from '../../types';

export class PersonalityEngine {
  private conversationStyle = {
    friendly: true,
    professional: true,
    empathetic: true
  };

  respond(prompt: string, history: Message[]): string {
    const lowercasePrompt = prompt.toLowerCase();
    
    // Handle greetings with personality
    if (this.isGreeting(lowercasePrompt)) {
      return this.generateGreeting(history);
    }
    
    // Handle personal questions
    if (this.isPersonalQuestion(lowercasePrompt)) {
      return this.generatePersonalResponse(prompt, history);
    }
    
    // Handle emotional content
    if (this.hasEmotionalContent(lowercasePrompt)) {
      return this.generateEmpatheticResponse(prompt);
    }
    
    return this.getDefaultResponse();
  }

  private isGreeting(prompt: string): boolean {
    const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening'];
    return greetings.some(greeting => prompt.includes(greeting));
  }

  private isPersonalQuestion(prompt: string): boolean {
    const personalIndicators = ['you', 'your', 'yourself', 'feel', 'think', 'opinion', 'like', 'favorite'];
    return personalIndicators.some(indicator => prompt.includes(indicator));
  }

  private hasEmotionalContent(prompt: string): boolean {
    const emotionalWords = ['happy', 'sad', 'angry', 'excited', 'worried', 'confused'];
    return emotionalWords.some(word => prompt.includes(word));
  }

  private generateGreeting(history: Message[]): string {
    const previousInteractions = history.length;
    const timeOfDay = new Date().getHours();
    let greeting = '';

    if (timeOfDay < 12) {
      greeting = 'Good morning';
    } else if (timeOfDay < 18) {
      greeting = 'Good afternoon';
    } else {
      greeting = 'Good evening';
    }
    
    if (previousInteractions === 0) {
      return `${greeting}! I'm your friendly AI assistant. How can I help you today?`;
    }
    
    return `${greeting} again! Always nice to chat with you. What's on your mind?`;
  }

  private generatePersonalResponse(prompt: string, history: Message[]): string {
    if (prompt.includes('how are you')) {
      return "I'm doing great, thanks for asking! I'm always excited to help and learn new things. How are you doing?";
    }
    
    if (prompt.includes('favorite')) {
      return "That's an interesting question! While I don't have favorites in the way humans do, I enjoy our conversations and helping people learn and solve problems. What about you?";
    }
    
    return "I appreciate your interest! I'm here to help and learn from our interactions. What would you like to know?";
  }

  private generateEmpatheticResponse(prompt: string): string {
    if (prompt.includes('happy') || prompt.includes('excited')) {
      return "That's wonderful to hear! Your positive energy is contagious. Tell me more!";
    }
    
    if (prompt.includes('sad') || prompt.includes('worried')) {
      return "I understand that can be difficult. While I'm here to listen, remember that it's okay to seek support from friends, family, or professionals when needed.";
    }
    
    if (prompt.includes('confused')) {
      return "Don't worry! Let's break this down together and figure it out step by step. What specifically is unclear?";
    }
    
    return "I'm here to listen and help however I can. Would you like to tell me more about what's on your mind?";
  }

  getDefaultResponse(): string {
    const responses = [
      "I'm here to help! What would you like to know?",
      "That's interesting! Could you tell me more?",
      "I'm curious to hear your thoughts on this. What's on your mind?",
      "Let's explore that together. What specifically interests you?"
    ];
    
    return responses[Math.floor(Math.random() * responses.length)];
  }
}