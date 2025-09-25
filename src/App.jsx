import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MenuBar from './components/MenuBar.jsx'
import TitleBar from './components/TitleBar.jsx'
import Footer from './components/Footer.jsx'
import Contact from './pages/Contact.jsx'
import Chat from './pages/Chat.jsx'

export default function App() {
  return (
    <div className="app-container">
      <TitleBar title="AI Website" subtitle="Welcome to your React starter" logoSrc="/logo.png" />
      <MenuBar
        items={[
          { label: 'Home', href: '/' },
          { label: 'Chat', href: '/chat' },
          { label: 'Contact', href: '/contact' },
        ]}
      />
      <main>
        <Routes>
          <Route
            path="/"
            element={
              <div className="content">
                <section>
                  <h2>Getting Started</h2>
                  <p>
                    This starter includes a basic layout with a menu bar, title bar, and footer. Edit
                    <code> src/App.jsx</code> to customize this page.
                  </p>
                </section>
              </div>
            }
          />
          <Route path="/contact" element={<Contact />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
