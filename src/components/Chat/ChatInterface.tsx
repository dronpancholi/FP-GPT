import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, Bot, Brain } from 'lucide-react';
import { Message } from '../../types';
import { ChatInput } from './ChatInput';
import { MessageList } from './MessageList';
import { useChat } from '../../hooks/useChat';
import { AI_IDENTITY } from '../../config/aiConfig';

export function ChatInterface() {
  const { messages, isProcessing, addMessage } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4">
        <div className="max-w-3xl mx-auto flex items-center gap-2">
          <Brain className="w-8 h-8" />
          <div>
            <h1 className="text-xl font-bold">{AI_IDENTITY.name} {AI_IDENTITY.version}</h1>
            <p className="text-sm text-gray-400">Developed by {AI_IDENTITY.developer}</p>
          </div>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-3xl mx-auto py-8 px-4">
          <MessageList messages={messages} />
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="border-t bg-white">
        <div className="max-w-3xl mx-auto p-4">
          <ChatInput onSend={addMessage} isProcessing={isProcessing} />
        </div>
      </div>
    </div>
  );
}