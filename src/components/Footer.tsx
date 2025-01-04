import React from 'react';
import { Github, Mail, Globe, Brain, MessageCircle } from 'lucide-react';
import { AI_IDENTITY } from '../config/aiConfig';

export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">About {AI_IDENTITY.name}</h3>
            <p className="text-gray-400">
              {AI_IDENTITY.name} ({AI_IDENTITY.version}) is an advanced AI chat application
              with knowledge integration and intelligent conversation capabilities.
              Developed by {AI_IDENTITY.developer}.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Developer</h3>
            <div className="space-y-2">
              <a href="mailto:dronpancholi@gmail.com" 
                 className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Mail size={16} />
                dronpancholi@gmail.com
              </a>
              <a href="https://github.com/dronpancholi" 
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Github size={16} />
                GitHub
              </a>
              <a href="https://dronpancholi.dev" 
                 target="_blank"
                 rel="noopener noreferrer"
                 className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors">
                <Globe size={16} />
                Portfolio
              </a>
            </div>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Features</h3>
            <ul className="text-gray-400 space-y-2">
              <li className="flex items-center gap-2">
                <Brain size={16} />
                Advanced Knowledge Integration
              </li>
              <li className="flex items-center gap-2">
                <MessageCircle size={16} />
                Natural Conversations
              </li>
              <li className="flex items-center gap-2">
                <Globe size={16} />
                Internet Access
              </li>
            </ul>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400">
          <p>© {new Date().getFullYear()} {AI_IDENTITY.name}. All rights reserved.</p>
          <p className="mt-2">Developed with ❤️ by {AI_IDENTITY.developer}</p>
        </div>
      </div>
    </footer>
  );
}