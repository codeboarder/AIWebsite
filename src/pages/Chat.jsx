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
  const STORAGE_KEY_SINGLE = 'chat_history_v1' // legacy single conversation
  const SESSIONS_KEY = 'chat_sessions_v1'
  const DEBUG = import.meta.env.VITE_CHAT_DEBUG === '1'
  // Helper to safely parse stored history
  function loadStored(reasonCtx) {
    try {
      if (typeof window === 'undefined' || !window.localStorage) {
        if (DEBUG) console.log('[chat] localStorage unavailable', reasonCtx)
        return null
      }
      const raw = window.localStorage.getItem(STORAGE_KEY_SINGLE)
      if (!raw) {
        if (DEBUG) console.log('[chat] No stored history', reasonCtx)
        return null
      }
      const parsed = JSON.parse(raw)
      if (!Array.isArray(parsed)) {
        if (DEBUG) console.warn('[chat] Stored value not array', { parsed, reasonCtx })
        return null
      }
      // Filter out any malformed entries instead of rejecting entire history
      const cleaned = parsed.filter(m => m && typeof m.role === 'string' && typeof m.content === 'string')
      if (!cleaned.length) {
        if (DEBUG) console.warn('[chat] Stored array contained no valid messages', { parsed, reasonCtx })
        return null
      }
      if (DEBUG) console.log('[chat] Loaded history', { cleaned, reasonCtx })
      return cleaned
    } catch (e) {
      if (DEBUG) console.warn('[chat] Failed to parse stored history', { error: e, reasonCtx })
      return null
    }
  }

  const defaultGreeting = { role: 'assistant', content: "Hi, I'm your smart chat assistant. How can I help?" }

  // Session model: [{id, title, messages:[{role,content}]}]
  function loadSessions() {
    try {
      const raw = localStorage.getItem(SESSIONS_KEY)
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) {
          // basic validation
            return parsed.filter(s => s && s.id && Array.isArray(s.messages))
        }
      }
    } catch (e) {
      if (DEBUG) console.warn('[chat] Failed to load sessions', e)
    }
    // migrate from single history if present
    const single = loadStored('migrate-single')
    if (single) {
      const migrated = [{ id: generateId(), title: deriveTitle(single) || 'Conversation', messages: single }]
      if (DEBUG) console.log('[chat] Migrated single history to sessions')
      return migrated
    }
    // default initial session
    return [{ id: generateId(), title: 'New Chat', messages: [defaultGreeting] }]
  }

  function generateId() { return Date.now().toString(36) + Math.random().toString(36).slice(2,8) }
  function deriveTitle(msgs) {
    const firstUser = msgs.find(m => m.role === 'user')
    if (!firstUser) return null
    return (firstUser.content || '').replace(/\s+/g,' ').trim().slice(0,40) || 'Conversation'
  }

  const [sessions, setSessions] = useState(loadSessions)
  const [currentSessionId, setCurrentSessionId] = useState(() => sessions[0]?.id)
  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0]
  const [messages, setMessages] = useState(currentSession?.messages || [defaultGreeting])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [showTyping, setShowTyping] = useState(false)
  // Abort controller removed along with Stop functionality
  const endRef = useRef(null)
  const typingTimerRef = useRef(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Secondary rehydration pass (in case an extension / CSP delayed storage availability or Fast Refresh reset state)
  useEffect(() => {
    // Keep messages in sync if session changes (in dev hot reload scenarios)
    setMessages(currentSession.messages)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSessionId])

  // When messages change, update current session + persist sessions
  useEffect(() => {
    setSessions(prev => {
      const next = prev.map(s => s.id === currentSessionId ? { ...s, messages } : s)
      // update title if first user message just arrived and title is generic
      const target = next.find(s => s.id === currentSessionId)
      if (target) {
        if ((!target.title || target.title === 'New Chat' || target.title === 'Conversation') ) {
          const newTitle = deriveTitle(target.messages)
          if (newTitle) target.title = newTitle
        }
      }
      try {
        localStorage.setItem(SESSIONS_KEY, JSON.stringify(next))
        if (DEBUG) console.log('[chat] Persisted sessions', next)
      } catch (e) { if (DEBUG) console.warn('[chat] Persist sessions failed', e) }
      return next
    })
  }, [messages, currentSessionId])

  // Ensure sessions persisted if sessions array itself changes for other reasons
  useEffect(() => {
    try { localStorage.setItem(SESSIONS_KEY, JSON.stringify(sessions)) } catch(_) {}
  }, [sessions])

  const send = async () => {
    const text = input.trim()
    if (!text || sending) return
  setSending(true)
  setShowTyping(true)
  setMessages((prev) => [...prev, { role: 'user', content: text }])
    setInput('')

    // Non-streaming backend call
    try {
      const apiBase = import.meta.env.VITE_API_BASE_URL || ''
      const url = `${apiBase}/api/chat`
      if (DEBUG) console.log('[chat] Sending request', { url })
      const resp = await fetch(url, {
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
      if (DEBUG) console.log('[chat] Received response length', fullText.length)
    } catch (err) {
      if (err?.name === 'AbortError') {
        // (Should not occur now; abort removed)
      } else {
        if (DEBUG) console.warn('[chat] Request failed, using heuristic reply', err)
        const reply = assistantReply(text)
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      }
    } finally {
      setSending(false)
      setShowTyping(false)
    }
  }

  const handleReset = () => {
    // Clear the current session back to greeting only
    setSessions(prev => prev.map(s => s.id === currentSessionId ? { ...s, messages: [defaultGreeting] } : s))
    setMessages([defaultGreeting])
    setInput('')
    setSending(false)
    setShowTyping(false)
    if (typingTimerRef.current) { clearTimeout(typingTimerRef.current); typingTimerRef.current = null }
    if (DEBUG) console.log('[chat] Cleared current session')
  }

  const handleSelectSession = (id) => {
    if (id === currentSessionId) return
    setCurrentSessionId(id)
  }

  const handleDeleteSession = (e, id) => {
    e.stopPropagation()
    setSessions(prev => {
      const filtered = prev.filter(s => s.id !== id)
      if (filtered.length === 0) {
        const fresh = { id: generateId(), title: 'New Chat', messages: [defaultGreeting] }
        setCurrentSessionId(fresh.id)
        setMessages(fresh.messages)
        return [fresh]
      }
      if (id === currentSessionId) {
        setCurrentSessionId(filtered[0].id)
        setMessages(filtered[0].messages)
      }
      return filtered
    })
  }

  const handleRenameSession = (e, id) => {
    e.stopPropagation()
    const newTitle = prompt('Rename conversation:')
    if (!newTitle) return
    setSessions(prev => prev.map(s => s.id === id ? { ...s, title: newTitle.slice(0,60) } : s))
  }

  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  return (
    <div className="content">
      <div className="chat chat-with-sidebar">
        <aside className="chat-sessions" aria-label="Chat history">
          <div className="sessions-header">
            <span>History</span>
          </div>
          <ul className="sessions-list">
            {(() => {
              const visible = sessions.filter(s => s.messages.some(m => m.role === 'user'))
              if (visible.length === 0) {
                return <li style={{padding:'.5rem .6rem', fontSize:'.75rem', opacity:.6}}>No conversations yet</li>
              }
              return visible.map(s => (
                <li key={s.id} className={s.id === currentSessionId ? 'active' : ''} onClick={() => handleSelectSession(s.id)}>
                  <div className="session-row">
                    <button type="button" className="session-title" title={s.title || 'Conversation'}>{s.title || 'Conversation'}</button>
                    <div className="session-actions">
                      <button type="button" className="icon" onClick={(e)=>handleRenameSession(e,s.id)} title="Rename">✎</button>
                      <button type="button" className="icon" onClick={(e)=>handleDeleteSession(e,s.id)} title="Delete">✕</button>
                    </div>
                  </div>
                </li>
              ))
            })()}
          </ul>
        </aside>
        <div className="chat-main">
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
            <button type="button" onClick={handleReset} disabled={sending} style={{ marginRight: '.5rem', background: '#223455' }} title="Clear current chat">
              Clear Chat
            </button>
            <button onClick={send} disabled={!input.trim() || sending}>
              {sending ? 'Sending…' : 'Send'}
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  )
}
