import React from 'react'
import { Link } from 'react-router-dom'

/**
 * Footer
 * Site footer with current year and quick links.
 * Privacy/Terms are placeholder anchors; Contact routes to internal page.
 */
export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer-inner">
        <span>© {year} AI Website</span>
        <nav>
          {/* Placeholder anchors; replace with routed pages if needed */}
          <a href="#privacy">Privacy</a>
          <a href="#terms">Terms</a>
          {/* Client-side route to Contact page */}
          <Link to="/contact">Contact</Link>
        </nav>
      </div>
    </footer>
  )
}
