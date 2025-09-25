import React from 'react'

export default function Contact() {
  return (
    <div className="content">
      <h2>Contact</h2>
      <div className="contact-card" role="contentinfo" aria-label="Contact information">
        <div className="contact-name">Rick Weyenberg</div>
        <div className="contact-item">
          <span className="label">Phone:</span>
          <a href="tel:+16125551212" aria-label="Call Rick Weyenberg">612-555-1212</a>
        </div>
        <div className="contact-item">
          <span className="label">Email:</span>
          <a href="mailto:rick@weyenberg.com" aria-label="Email Rick Weyenberg">rick@weyenberg.com</a>
        </div>
      </div>
    </div>
  )
}
