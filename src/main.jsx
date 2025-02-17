
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { Toaster } from 'sonner';

// Ensure React is available globally
if (typeof window !== 'undefined') {
  window.React = React;
}

// Create root immediately if DOM is ready, otherwise wait
const renderApp = () => {
  const rootElement = document.getElementById('root') || (() => {
    const element = document.createElement('div');
    element.id = 'root';
    document.body.appendChild(element);
    return element;
  })();

  const root = ReactDOM.createRoot(rootElement);
  
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
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderApp);
} else {
  renderApp();
}
