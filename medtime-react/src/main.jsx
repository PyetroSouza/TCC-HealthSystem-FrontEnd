
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <GoogleOAuthProvider
      clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}
    >
      <App />
    </GoogleOAuthProvider>
  </StrictMode>
)

console.log('Google Client ID configurado:', {
  existe: Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID),
  formatoValido: import.meta.env.VITE_GOOGLE_CLIENT_ID
    ?.endsWith('.apps.googleusercontent.com')
})