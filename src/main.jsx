import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import LanguagePage from './LanguagePage.jsx'

const basename = '/top-1000-words'
const redirect = sessionStorage.getItem('redirect')
if (redirect) {
  sessionStorage.removeItem('redirect')
  if (redirect !== '/') {
    window.history.replaceState(null, '', `${basename}${redirect}`)
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename={basename}>
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/language/:languageCode" element={<LanguagePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
