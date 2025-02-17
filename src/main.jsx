
import React from 'react';
import * as ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Ensure React is properly initialized
window.React = React;

const container = document.getElementById('root');
if (!container) {
  throw new Error('Failed to find the root element');
}

const root = ReactDOM.createRoot(container);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
