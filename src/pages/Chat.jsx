import React, { useEffect, useRef, useState } from 'react'

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
  const endRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
    setSending(true)
    setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')

    // Try calling backend api
    try {
      const resp = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, { role: 'user', content: text }] }),
      })

      if (!resp.ok || !resp.body) {
        throw new Error(`Bad response: ${resp.status}`)
      }

      const reader = resp.body.getReader()
      const decoder = new TextDecoder('utf-8')
      let assistantBuffer = ''
      
      setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value, { stream: true })
        assistantBuffer += chunk
        setMessages((prev) => {
          const copy = [...prev]
          // Update the last assistant message
          const lastIdx = copy.length - 1
          if (lastIdx >= 0 && copy[lastIdx].role === 'assistant') {
            copy[lastIdx] = { ...copy[lastIdx], content: assistantBuffer }
          }
          return copy
        })
      }
    } catch (err) {
      // Fallback to local assistant response
      const reply = assistantReply(text)
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
    } finally {
      setSending(false)
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
        {sending && (
          <div className="chat-progress" role="status" aria-live="polite" aria-label="Generating response">
            <div className="progress-track">
              <div className="progress-indeterminate" />
            </div>
          </div>
        )}
        <div className="chat-window" aria-live="polite">
          {messages.map((m, idx) => (
            <div key={idx} className={`message ${m.role}`}>
              <div className="bubble">
                {m.content}
              </div>
            </div>
          ))}
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
            <button onClick={send} disabled={!input.trim() || sending}>
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
