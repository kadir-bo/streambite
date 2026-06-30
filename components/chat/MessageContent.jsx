'use client'
import MarkdownText from '@/components/chat/MarkdownText'

export default function MessageContent({ content }) {
  const lines = (content ?? '').split('\n')
  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          <MarkdownText content={line} />
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  )
}
