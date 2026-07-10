import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

// Der Service Worker wird von vite-plugin-pwa generiert und registriert; autoUpdate
// aktiviert neue Builds selbst und wirft veraltete Caches raus. Nur in Production.
if (import.meta.env.PROD) {
  registerSW({ immediate: true })
}
