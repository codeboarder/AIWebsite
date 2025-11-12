import React from 'react'

export default function Home() {
  return (
    <section aria-labelledby="home-heading" className="section" data-section="home">
      <h2 id="home-heading">Welcome</h2>
      <p>
        This is the Home section of the AI Website V2 demo. Use the navigation above to switch
        to the Chat section and interact with the simple in-browser chat interface.
      </p>
      <ul className="feature-list">
        <li>Single-page view switching without a router</li>
        <li>Accessible semantic landmarks and headings</li>
        <li>Lightweight React functional components</li>
      </ul>
    </section>
  )
}
