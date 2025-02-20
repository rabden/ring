
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Ensure React is available globally
window.React = React;

const root = document.getElementById('root');

if (!root) {
  throw new Error('Root element not found');
}

const app = ReactDOM.createRoot(root);

// Mount app with error boundary
app.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
