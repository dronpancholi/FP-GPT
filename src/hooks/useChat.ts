import { useState, useCallback } from 'react';
import { Message } from '../types';
import { gemini } from '../services/ai/gemini';
import { LocalStorageService } from '../services/storage/localStorage';
import { withRetry } from '../utils/retry';
import { KnowledgeAggregator } from '../services/ai/knowledgeAggregator';

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
      const history = messages.map(msg => ({
        role: msg.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: msg.content }],
      }));

      const systemPrompt = await KnowledgeAggregator.getSystemPrompt(history);
      const chat = gemini.startChat({
        history: [
            ...history,
            { role: 'model', parts: [{ text: systemPrompt }] }
        ],
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7,
          topP: 0.9,
          topK: 40,
        },
      });

      const result = await chat.sendMessage(content);
      const response = result.response;
      const text = response.text();

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: text,
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