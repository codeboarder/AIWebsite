// Minimal markdown to HTML converter for assistant messages.
// Escapes HTML, supports headings, bold, italics, inline code, fenced code blocks, links, unordered/ordered lists, paragraphs.
// Keeps implementation lightweight; not full CommonMark.

export function renderMarkdown(raw) {
  if (!raw) return ''
  // Normalize line endings
  let md = raw.replace(/\r\n?/g, '\n')

  const escapeHtml = (s) => s.replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]))

  // Fenced code blocks
  const codeBlocks = []
  md = md.replace(/```(\w+)?\n([\s\S]*?)```/g, (m, lang, code) => {
    const idx = codeBlocks.length
    codeBlocks.push({ lang: lang || '', code: escapeHtml(code) })
    return `@@CODE_${idx}@@`
  })

  // Escape remaining inline HTML angle brackets early for safety
  md = md.split('@@CODE_').map((segment, i) => {
    if (i === 0) return escapeHtml(segment)
    const parts = segment.split('@@')
    parts[1] = escapeHtml(parts[1] || '')
    return parts.join('@@')
  }).join('@@CODE_')

  // Headings
  md = md.replace(/^###### (.*)$/gm, '<h6>$1</h6>')
         .replace(/^##### (.*)$/gm, '<h5>$1</h5>')
         .replace(/^#### (.*)$/gm, '<h4>$1</h4>')
         .replace(/^### (.*)$/gm, '<h3>$1</h3>')
         .replace(/^## (.*)$/gm, '<h2>$1</h2>')
         .replace(/^# (.*)$/gm, '<h1>$1</h1>')

  // Bold / italic (simple, non-nested)
  md = md.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
         .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*/g, '<em>$1</em>')

  // Inline code
  md = md.replace(/`([^`]+?)`/g, (m, c) => `<code>${escapeHtml(c)}</code>`)

  // Links [text](url)
  md = md.replace(/\[([^\]]+)]\((https?:[^)\s]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')

  // Lists (unordered + ordered)
  // Process blocks of consecutive list items
  md = md.replace(/(^|\n)(?:\s*[-*+] .+(?:\n|$))+?/g, (block, lead) => {
    const items = block.trim().split(/\n/).map(l=>l.replace(/^[-*+]\s+/,''))
    return `${lead}<ul>${items.map(i=>`<li>${i}</li>`).join('')}</ul>`
  })
  md = md.replace(/(^|\n)(?:\s*\d+\. .+(?:\n|$))+?/g, (block, lead) => {
    const items = block.trim().split(/\n/).map(l=>l.replace(/^\d+\.\s+/,''))
    return `${lead}<ol>${items.map(i=>`<li>${i}</li>`).join('')}</ol>`
  })

  // Paragraph wrap (lines not already inside tags)
  md = md.replace(/^(?!<h\d|<ul>|<ol>|<pre|<blockquote|<p>|<\/)([^\n]+)$/gm, '<p>$1</p>')

  // Restore code blocks
  md = md.replace(/@@CODE_(\d+)@@/g, (m, i) => {
    const { lang, code } = codeBlocks[+i]
    return `<pre class="chat-code"><code class="language-${lang}">${code}</code></pre>`
  })

  return md
}
