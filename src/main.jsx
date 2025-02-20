import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Unregister any existing service workers
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((registrations) => {
    registrations.forEach((registration) => {
      registration.unregister();
      console.log('ServiceWorker unregistered');
    });
  });
}

// Ensure React is available globally
window.React = React;

const renderApp = () => {
  const root = document.getElementById('root');
  
  if (!root) {
    throw new Error('Root element not found');
  }

  const app = ReactDOM.createRoot(root);
  
  app.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
};

// Initial render
renderApp();

// Enable HMR in development
if (import.meta.hot) {
  import.meta.hot.accept();
}
