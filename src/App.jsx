import React from 'react'
import { Routes, Route } from 'react-router-dom'
import MenuBar from './components/MenuBar.jsx'
import TitleBar from './components/TitleBar.jsx'
import Footer from './components/Footer.jsx'
import Contact from './pages/Contact.jsx'
import Chat from './pages/Chat.jsx'
import Home from './pages/Home.jsx'

/**
 * App root layout
 * - TitleBar with logo
 * - MenuBar for navigation
 * - Footer with quick links
 * - Routes for Home, Contact, Chat
 */
export default function App() {
  return (
    <div className="app-container">
      <TitleBar title="AI Website" subtitle="Website created entirely with Github Copilot" logoSrc="/logo.png" />
      <MenuBar
        items={[
          { label: 'Home', href: '/' },
          { label: 'Chat', href: '/chat' },
          { label: 'Contact', href: '/contact' },
        ]}
      />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/chat" element={<Chat />} />
        </Routes>
      </main>
      <Footer />
    </div>
  )
}
