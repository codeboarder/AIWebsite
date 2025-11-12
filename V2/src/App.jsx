import React, { useState } from 'react'
import Home from './components/Home.jsx'
import Chat from './components/Chat.jsx'
import './styles.css'

// App component: manages simple view switching between Home and Chat sections
export default function App() {
  const [view, setView] = useState('home')

  return (
    <div className="app-container">
      <header className="app-header" role="banner">
        <h1 className="app-title">AI Website V2</h1>
        <nav aria-label="Primary" className="app-nav">
          <button
            className={view === 'home' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setView('home')}
            aria-pressed={view === 'home'}
          >
            Home
          </button>
          <button
            className={view === 'chat' ? 'nav-btn active' : 'nav-btn'}
            onClick={() => setView('chat')}
            aria-pressed={view === 'chat'}
          >
            Chat
          </button>
        </nav>
      </header>
      <main className="main" role="main">
        {view === 'home' && <Home />}
        {view === 'chat' && <Chat />}
      </main>
      <footer className="app-footer" role="contentinfo">
        <small>&copy; {new Date().getFullYear()} AI Website V2</small>
      </footer>
    </div>
  )
}
