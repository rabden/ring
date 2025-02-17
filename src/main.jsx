
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from 'sonner';

// Ensure React is available globally and properly initialized
if (!window.React) {
  window.React = React;
}

// Make sure we have a root element
const rootElement = document.getElementById('root');
if (!rootElement) {
  const root = document.createElement('div');
  root.id = 'root';
  document.body.appendChild(root);
}

// Create root with error handling
try {
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
