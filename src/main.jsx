import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import LanguagePage from './LanguagePage.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter basename="/top-1000-words">
      <Routes>
        <Route path="/" element={<App />} />
        <Route path="/language/:languageCode" element={<LanguagePage />} />
      </Routes>
    </BrowserRouter>
  </StrictMode>,
)
