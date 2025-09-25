import React from 'react'

export default function TitleBar({ title, subtitle, logoSrc, logoAlt }) {
  return (
    <header className="title-bar">
      <div className="title-brand">
        {logoSrc && (
          <img
            className="title-logo"
            src={logoSrc}
            alt={logoAlt || `${title} logo`}
            onError={(e) => {
              // Hide image gracefully if not found
              e.currentTarget.style.display = 'none'
            }}
          />
        )}
        <h1>{title}</h1>
      </div>
      {subtitle && <p className="subtitle">{subtitle}</p>}
    </header>
  )
}
