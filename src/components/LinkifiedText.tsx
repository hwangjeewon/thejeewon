import React from 'react'

// Matches http/https URLs and bare www. URLs
const URL_REGEX = /https?:\/\/[^\s<>"']+|www\.[^\s<>"']+/g

interface LinkifiedTextProps {
  text: string
}

export function LinkifiedText({ text }: LinkifiedTextProps) {
  const parts: React.ReactNode[] = []
  let lastIndex = 0

  URL_REGEX.lastIndex = 0
  let match: RegExpExecArray | null
  while ((match = URL_REGEX.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const url = match[0].replace(/[).,'"\];!]+$/, '')
    const href = url.startsWith('http') ? url : `https://${url}`
    parts.push(
      <a
        key={match.index}
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: 'var(--color-primary)' }}
        className="hover:underline"
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {url}
      </a>
    )
    lastIndex = match.index + url.length
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex))
  }

  return <>{parts}</>
}
