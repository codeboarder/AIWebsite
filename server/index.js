import 'dotenv/config'
import express from 'express'
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import fetch from 'node-fetch'

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

app.post('/api/chat', async (req, res) => {
  const endpoint = process.env.AZURE_OPENAI_ENDPOINT
  const apiKey = process.env.AZURE_OPENAI_API_KEY
  const deployment = process.env.AZURE_OPENAI_DEPLOYMENT
  const apiVersion = process.env.AZURE_OPENAI_API_VERSION || '2024-06-01'

  const { messages = [] } = req.body || {}

  if (!endpoint || !apiKey || !deployment) {
    console.warn('[api/chat] Azure OpenAI not configured (missing env)')
    res.set('Content-Type', 'text/plain; charset=utf-8')
    res.write(
      'Azure OpenAI not configured. Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT.'
    )
    return res.end()
  }

  try {
    // Map client messages 1:1; roles should be 'system' | 'user' | 'assistant'
    const azureMessages = messages.map((m) => ({ role: m.role, content: m.content }))

    const url = `${endpoint}/openai/deployments/${deployment}/chat/completions?api-version=${apiVersion}`

    console.log(`[api/chat] -> ${url} messages=${azureMessages.length}`)

    const aoaiResp = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify({
        messages: azureMessages,
        stream: false,
      }),
    })

    if (!aoaiResp.ok) {
      const errText = await aoaiResp.text()
      console.error(`[api/chat] Azure error ${aoaiResp.status}: ${errText}`)
      res.status(aoaiResp.status)
      res.set('Content-Type', 'text/plain; charset=utf-8')
      res.write(`Azure OpenAI error: ${errText}`)
      return res.end()
    }

    const data = await aoaiResp.json()
    const content = data?.choices?.[0]?.message?.content ?? '(no content)'

    // Return as plain text; client reads as a stream
    res.set('Content-Type', 'text/plain; charset=utf-8')
    res.write(content)
    res.end()
  } catch (e) {
    console.error('[api/chat] Server error:', e)
    res.status(500)
    res.set('Content-Type', 'text/plain; charset=utf-8')
    res.write(`Server error: ${e.message}`)
    res.end()
  }
})

const port = process.env.PORT || 3000
app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`)
})
