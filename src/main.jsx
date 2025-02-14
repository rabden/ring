import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { Toaster } from 'sonner'

ReactDOM.createRoot(document.getElementById('root')).render(
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
  </React.StrictMode>,
)