
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from 'sonner';

// Make sure React is available globally
window.React = React;

// Wait for DOM to be ready
document.addEventListener('DOMContentLoaded', () => {
  try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      const root = document.createElement('div');
      root.id = 'root';
      document.body.appendChild(root);
    }

    const root = ReactDOM.createRoot(document.getElementById('root'));
    
    root.render(
      <React.StrictMode>
        <Toaster 
          theme="dark"
          position="top-center"
          closeButton
          richColors
          style={{
            background: "hsl(var(--background))",
            color: "hsl(var(--foreground))",
            border: "1px solid hsl(var(--border))"
          }}
        />
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('Failed to initialize React:', error);
  }
});
