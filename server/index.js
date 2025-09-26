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
    res.status(500).type('text/plain').send(
      'Azure OpenAI not configured. Set AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY, and AZURE_OPENAI_DEPLOYMENT.'
    )
    return
  }

  try {
    const azureMessages = messages.map(m => ({ role: m.role, content: m.content }))
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
      }),
    })

    if (!aoaiResp.ok) {
      const errText = await aoaiResp.text().catch(() => '')
      console.error(`[api/chat] Azure error ${aoaiResp.status}: ${errText}`)
      res.status(aoaiResp.status).type('text/plain').send(`Azure OpenAI error: ${errText}`)
      return
    }

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
