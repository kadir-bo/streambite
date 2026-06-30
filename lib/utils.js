export function cn(...classes) {
  return classes.filter(Boolean).join(' ')
}

export function formatTime(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  return date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
}

export function formatDate(timestamp) {
  if (!timestamp) return ''
  const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
  const now = new Date()
  const diff = now - date

  if (diff < 86400000 && now.getDate() === date.getDate()) return 'Heute'
  if (diff < 172800000) return 'Gestern'

  return date.toLocaleDateString('de-DE', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  })
}

export function generateTag() {
  return String(Math.floor(Math.random() * 9000) + 1000)
}

export function isValidUsername(username) {
  return /^[a-zA-Z0-9_]{3,20}$/.test(username ?? '')
}

export function generateInviteCode(length = 8) {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

export function getInitials(name = '') {
  return name
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

export function shouldGroupMessages(prev, next) {
  if (!prev || !next) return false
  if (next.type === 'reply') return false
  if (prev.authorId !== next.authorId) return false
  const prevTime = prev.createdAt?.toDate?.() ?? new Date(prev.createdAt)
  const nextTime = next.createdAt?.toDate?.() ?? new Date(next.createdAt)
  return nextTime - prevTime < 7 * 60 * 1000
}

export function groupMessages(messages) {
  return messages.reduce((groups, msg, i) => {
    const prev = messages[i - 1]
    if (shouldGroupMessages(prev, msg)) {
      groups[groups.length - 1].messages.push(msg)
    } else {
      groups.push({ id: msg.id, authorId: msg.authorId, messages: [msg] })
    }
    return groups
  }, [])
}

export function parseMarkdown(text) {
  if (!text) return []

  const rules = [
    { pattern: /\*\*(.+?)\*\*/s, type: 'bold' },
    { pattern: /\*(.+?)\*/s, type: 'italic' },
    { pattern: /`([^`]+)`/, type: 'code' },
    { pattern: /~~(.+?)~~/, type: 'strike' },
    { pattern: /@(\w+)/, type: 'mention' },
  ]

  const tokens = []
  let remaining = text

  while (remaining.length > 0) {
    let earliest = null
    let matchedRule = null

    for (const rule of rules) {
      const match = rule.pattern.exec(remaining)
      if (match && (earliest === null || match.index < earliest.index)) {
        earliest = match
        matchedRule = rule
      }
    }

    if (!earliest) {
      tokens.push({ type: 'text', content: remaining })
      break
    }

    if (earliest.index > 0) {
      tokens.push({ type: 'text', content: remaining.slice(0, earliest.index) })
    }

    tokens.push({ type: matchedRule.type, content: earliest[1] })
    remaining = remaining.slice(earliest.index + earliest[0].length)
  }

  return tokens
}

export function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
