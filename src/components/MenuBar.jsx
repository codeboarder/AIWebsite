import React from 'react'
import { Link } from 'react-router-dom'

export default function MenuBar({ items = [] }) {
  return (
    <nav className="menu-bar">
      <div className="menu-brand">AIWebsite</div>
      <ul>
        {items.map((item) => (
          <li key={item.label}>
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
