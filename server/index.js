import 'dotenv/config'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import fetch from 'node-fetch'

/**
 * Server bootstrap and configuration
 *
 * - Loads environment variables from root .env by default (dotenv/config above)
 * - Falls back to server/.env if root .env is missing Azure variables
 * - Exposes a minimal /api/chat endpoint that proxies to Azure OpenAI Chat Completions
 * - Returns plain text (non-streaming) assistant content for simplicity
 */
// If root .env didn't set the variables, also try server/.env as a fallback
if (!process.env.AZURE_OPENAI_ENDPOINT) {
  const serverEnv = path.resolve(process.cwd(), 'server/.env')
  if (fs.existsSync(serverEnv)) {
    dotenv.config({ path: serverEnv })
  }
}

// Minimal Express server exposing /api/chat
// Expects environment variables:
// - AZURE_OPENAI_ENDPOINT (e.g., https://<your-resource>.openai.azure.com)
// - AZURE_OPENAI_API_KEY
// - AZURE_OPENAI_DEPLOYMENT (your chat model deployment name)
// Optional:
// - AZURE_OPENAI_API_VERSION (default 2024-06-01)

const app = express()
app.use(express.json())

// Utility to log once per request
function logDebug(...args) {
  if (process.env.CHAT_DEBUG === '1') {
    console.log('[api]', ...args)
  }
}

// Build generation options from environment variables, including only those explicitly set
function buildGenOptions() {
  const opts = {}
  const mct = process.env.AZURE_OPENAI_MAX_COMPLETION_TOKENS ?? process.env.AZURE_OPENAI_MAX_TOKENS
  if (mct !== undefined && mct !== '') {
    const v = Number(mct)
    if (!Number.isNaN(v)) opts.max_completion_tokens = v
  }
  const t = process.env.AZURE_OPENAI_TEMPERATURE
  if (t !== undefined && t !== '') {
    const v = Number(t)
    if (!Number.isNaN(v)) opts.temperature = v
  }
  const tp = process.env.AZURE_OPENAI_TOP_P
  if (tp !== undefined && tp !== '') {
    const v = Number(tp)
    if (!Number.isNaN(v)) opts.top_p = v
  }
  const pp = process.env.AZURE_OPENAI_PRESENCE_PENALTY
  if (pp !== undefined && pp !== '') {
    const v = Number(pp)
    if (!Number.isNaN(v)) opts.presence_penalty = v
  }
  const fp = process.env.AZURE_OPENAI_FREQUENCY_PENALTY
  if (fp !== undefined && fp !== '') {
    const v = Number(fp)
    if (!Number.isNaN(v)) opts.frequency_penalty = v
  }
  return opts
}

// Normalize and enhance messages before sending to Azure
function buildAzureMessages(inputMessages = []) {
  const systemPrompt = process.env.AZURE_OPENAI_SYSTEM_PROMPT ||
    'You are a helpful, concise assistant. Avoid repeating yourself. Answer directly and clearly. '
    + 'If you are unsure, say so briefly.'

  const msgs = (Array.isArray(inputMessages) ? inputMessages : [])
    .map(m => ({ role: m?.role, content: (m?.content ?? '').toString().trim() }))
    .filter(m => m.role && m.content)

  const hasSystem = msgs.some(m => m.role === 'system')
  if (!hasSystem) {
    msgs.unshift({ role: 'system', content: systemPrompt })
  }
  return msgs
}

// POST /api/chat
// Body: { messages: [{ role: 'user'|'assistant'|'system', content: string }, ...] }
// Behavior: forwards messages to Azure OpenAI Chat Completions (stream=false) and returns the assistant text.
app.post('/api/chat', async (req, res) => {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-06-01'

  const { messages = [] } = req.body || {}

  if (!endpoint || !apiKey || !deployment) {
    console.warn('[api/chat] Azure OpenAI not configured (missing env)')
    res.status(500).type('text/plain').send(
      'Azure OpenAI not configured. Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT.'
    )
    return
  }

  try {
  const azureMessages = buildAzureMessages(messages)
    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`
    console.log(`[api/chat] (non-stream) -> ${url} messages=${azureMessages.length}`)

    const aoaiResp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: azureMessages,
        stream: false,
        ...buildGenOptions(),
      }),
    })

    if (!aoaiResp.ok) {
      const errText = await aoaiResp.text().catch(() => '')
      console.error(`[api/chat] Azure error ${aoaiResp.status}: ${errText}`)
      res.status(aoaiResp.status).type('text/plain').send(`Azure OpenAI error: ${errText}`)
      return
    }

    // Example Azure response shape: { choices: [{ message: { role, content } }], ... }
    const json = await aoaiResp.json()
    const content = json?.choices?.[0]?.message?.content || ''
    res.type('text/plain').send(content)
  } catch (e) {
    console.error('[api/chat] Server error:', e)
    res.status(500).type('text/plain').send(`Server error: ${e.message}`)
  }
})


const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})
