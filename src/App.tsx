import React from 'react';
import { ChatInterface } from './components/Chat/ChatInterface';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './utils/errorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen">
        <ChatInterface />
        <Footer />
      </div>
    </ErrorBoundary>
  );
}

export default App;