
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Ensure React is available globally in development
if (process.env.NODE_ENV === 'development') {
  window.React = React;
}

// Wait for DOM to be ready
const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found. Make sure there is a <div id="root"></div> in your HTML');
}

// Create root with strict mode
const app = ReactDOM.createRoot(root);

// Render with error boundary
app.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
