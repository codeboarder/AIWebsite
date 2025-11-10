import React from 'react'

/**
 * Home page
 * Minimal landing content and a link to the GitHub repo.
 */
export default function Home() {
  return (
    <div className="content">
      <section>
        <h2>Welcome</h2>
        <p>This site demonstrates a simple React + Vite setup with a chat interface and Azure OpenAI backend service created entirely with GitHub Copilot.</p>
        <p>
          View the project repository on GitHub:{' '}
          <a href="https://github.com/codeboarder/AIWebsite" target="_blank" rel="noopener noreferrer">
            github.com/codeboarder/AIWebsite
          </a>
        </p>
        <p>Use the navigation above to explore the Chat and Contact pages.</p>
      </section>
    </div>
  )
}
