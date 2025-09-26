import React, { useEffect, useRef, useState } from 'react'
import { renderMarkdown } from '../lib/markdown.js'

function assistantReply(userText) {
  const trimmed = userText.trim()
  if (!trimmed) return "I'm here. How can I help today?"
  // Tiny heuristic responses for a copilot feel
  if (/help|commands|what can you do/i.test(trimmed)) {
    return 'I can answer questions, outline plans, and help draft text. Try asking "Summarize X" or "Give me steps to Y".'
  }
  if (/hello|hi|hey/i.test(trimmed)) {
    return 'Hey there! What would you like to work on?'
  }
  return `You said: "${trimmed}". I don’t have a backend connected yet, but I can still help brainstorm or outline steps.`
}

export default function Chat() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi, I'm your smart chat assistant. How can I help?" },
  ])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showTyping, setShowTyping] = useState(false)
  // Abort controller removed along with Stop functionality
  const endRef = useRef(null)
  const typingTimerRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
  setSending(true)
  setShowTyping(true)
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')

    // Non-streaming backend call
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: text }] }),
      })
      if (!resp.ok) {
        throw new Error(`Bad response: ${resp.status}`)
      }
      const fullText = await resp.text()
      setShowTyping(false)
      setMessages((prev) => [...prev, { role: 'assistant', content: fullText }])
    } catch (err) {
      if (err?.name === 'AbortError') {
        // (Should not occur now; abort removed)
      } else {
        const reply = assistantReply(text)
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      }
    } finally {
      setSending(false)
      setShowTyping(false)
    }
  }

  const handleReset = () => {
    // Reset conversation
    setMessages([{ role: 'assistant', content: "Hi, I'm your smart chat assistant. How can I help?" }])
    setInput('')
    setSending(false)
    setShowTyping(false)
    if (typingTimerRef.current) {
      clearTimeout(typingTimerRef.current)
      typingTimerRef.current = null
    }
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="content">
      <div className="chat">
        {/* Removed status bar; typing indicator will appear inline below */}
        <div className="chat-window" aria-live="polite">
          {messages.map((m, idx) => {
            const isAssistant = m.role === 'assistant'
            const html = isAssistant ? renderMarkdown(m.content) : null
            return (
              <div key={idx} className={`message ${m.role}`}>
                <div className={"bubble" + (isAssistant ? ' chat-md' : '')}>
                  {isAssistant ? (
                    <div dangerouslySetInnerHTML={{ __html: html }} />
                  ) : (
                    m.content
                  )}
                </div>
              </div>
            )
          })}
          {showTyping && (
            <div className="message assistant" aria-live="polite" aria-label="Assistant is responding">
              <div className="bubble typing-indicator">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
              </div>
            </div>
          )}
          <div ref={endRef} />
        </div>
        <div className="chat-input">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything… (Shift+Enter for newline)"
            rows={3}
            disabled={sending}
          />
          <div className="chat-actions">
            <button type="button" onClick={handleReset} disabled={sending} style={{ marginRight: '.5rem', background: '#223455' }} title="Start a new chat">
              New Chat
            </button>
            <button onClick={send} disabled={!input.trim() || sending}>
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
