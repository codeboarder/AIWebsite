import React from 'react'
import { Link } from 'react-router-dom'

/**
 * MenuBar
 * Simple site navigation component.
 *
 * Props:
 * - items: Array<{ label: string, href: string }>
 *   If href starts with "http", we render a plain anchor (external link).
 *   Otherwise, we render a <Link> for client-side navigation.
 */
export default function MenuBar({ items = [] }) {
  return (
    <nav className="menu-bar">
      <ul>
        {items.map((item) => (
          <li key={item.label}>
            {/* External vs internal link handling */}
            {item.href?.startsWith('http') ? (
              <a href={item.href}>{item.label}</a>
            ) : (
              <Link to={item.href}>{item.label}</Link>
            )}
          </li>
        ))}
      </ul>
    </nav>
  )
}
