import React, { useEffect, useRef, useState } from 'react'

function Message({ role, text }) {
  return (
    <div className={`msg ${role}`} role="listitem">
      <span className="role" aria-hidden>
        {role === 'user' ? 'You' : 'Bot'}:
      </span>
      <span className="text">{text}</span>
    </div>
  )
}

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'bot', text: 'Hi! Ask me anything.' },
  ])
  const [input, setInput] = useState('')
  const listRef = useRef(null)

  useEffect(() => {
    // Scroll to bottom on new message
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [messages])

  const send = () => {
    const text = input.trim()
    if (!text) return

    const userMsg = { role: 'user', text }
    setMessages((prev) => [...prev, userMsg])
    setInput('')

    // Fake bot reply
    setTimeout(() => {
      const botMsg = {
        role: 'bot',
        text: `You said: "${text}"`,
      }
      setMessages((prev) => [...prev, botMsg])
    }, 300)
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <section aria-labelledby="chat-heading" className="section" data-section="chat">
      <h2 id="chat-heading">Chat</h2>
      <div className="chat-panel" role="group" aria-label="Chat panel">
        <div className="chat-list" ref={listRef} role="list" aria-live="polite">
          {messages.map((m, i) => (
            <Message key={i} role={m.role} text={m.text} />
          ))}
        </div>
        <div className="chat-input">
          <label htmlFor="chat-message" className="sr-only">Message</label>
          <textarea
            id="chat-message"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            placeholder="Type a message and press Enter"
          />
          <button onClick={send} className="send-btn" aria-label="Send message">Send</button>
        </div>
      </div>
    </section>
  )
}
