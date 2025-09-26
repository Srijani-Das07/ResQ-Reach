import React, { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Setup from './pages/Setup'
import NotFound from './pages/NotFound'
import { initWebSocket } from './services/websocket'

function App() {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    initWebSocket((msg) => {
      setNotifications((prev) => [...prev, msg])
    })
  }, [])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/setup" element={<Setup />} />
        <Route path="*" element={<NotFound />} />
      </Routes>

      <aside style={{ position: 'fixed', bottom: 10, right: 10, background: '#eee', padding: '10px' }}>
        {/* <h3>Notifications</h3> */}
        <ul>
          {notifications.map((n, i) => (
            <li key={i}>{n.message || JSON.stringify(n)}</li>
          ))}
        </ul>
      </aside>
    </BrowserRouter>
  )
}

export default App