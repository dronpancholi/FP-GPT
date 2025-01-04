import { useState, useCallback } from 'react';
import { Message } from '../types';
import { generateText } from '../services/ai/textGeneration';
import { LocalStorageService } from '../services/storage/localStorage';
import { withRetry } from '../utils/retry';

const storage = new LocalStorageService();

export function useChat() {
  const [messages, setMessages] = useState<Message[]>(() => {
    return storage.get('chat_messages') || [];
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const addMessage = useCallback(async (content: string) => {
    if (!content?.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      content,
      role: 'user',
      timestamp: new Date()
    };

    setMessages(prev => {
      const newMessages = [...prev, userMessage];
      storage.set('chat_messages', newMessages);
      return newMessages;
    });

    setIsProcessing(true);

    try {
      // Pass current messages for context-aware responses
      const response = await withRetry(
        () => generateText(content, messages),
        3,
        1000
      );

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: response,
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => {
        const newMessages = [...prev, assistantMessage];
        storage.set('chat_messages', newMessages);
        return newMessages;
      });
    } catch (error) {
      console.error('Failed to generate response:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: "I apologize, but I'm having trouble responding right now. Please try again in a moment.",
        role: 'assistant',
        timestamp: new Date()
      };

      setMessages(prev => {
        const newMessages = [...prev, errorMessage];
        storage.set('chat_messages', newMessages);
        return newMessages;
      });
    } finally {
      setIsProcessing(false);
    }
  }, [messages]);

  return {
    messages,
    isProcessing,
    addMessage
  };
}