import React, { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App'
import { BrowserRouter } from 'react-router-dom'

// DEBUG: Detect page unload/reload
window.addEventListener('beforeunload', (e) => {
  console.log('[DEBUG] Page is about to unload/reload!')
})

window.addEventListener('unload', () => {
  console.log('[DEBUG] Page unloaded!')
})

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
)
