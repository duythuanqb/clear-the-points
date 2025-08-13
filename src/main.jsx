import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter, Routes, Route } from 'react-router-dom'
import './index.css'
import Game from './Game/Game'

function App() {
  return (
    <Routes>
      <Route path="/game" element={<Game />} />
      <Route path="/" element={<h1>Trang chủ</h1>} />
    </Routes>
  )
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
