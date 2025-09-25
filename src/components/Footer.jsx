import React from 'react'
import { Link } from 'react-router-dom'

export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>© {year} AIWebsite</span>
        <nav>
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
    </footer>
  )
}
