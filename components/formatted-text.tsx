"use client"

interface FormattedTextProps {
  text: string
  className?: string
}

export function FormattedText({ text, className = "" }: FormattedTextProps) {
  // Функция для парсинга markdown-ссылок
  const parseLinks = (text: string) => {
    const linkRegex = /\[([^\]]+)\]$$([^)]+)$$/g
    const parts = []
    let lastIndex = 0
    let match

    while ((match = linkRegex.exec(text)) !== null) {
      // Добавляем текст до ссылки
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.slice(lastIndex, match.index),
        })
      }

      // Добавляем ссылку
      parts.push({
        type: "link",
        content: match[1], // текст ссылки
        url: match[2], // URL
      })

      lastIndex = match.index + match[0].length
    }

    // Добавляем оставшийся текст
    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.slice(lastIndex),
      })
    }

    return parts
  }

  const parts = parseLinks(text)

  return (
    <div className={className}>
      {parts.map((part, index) => {
        if (part.type === "link") {
          return (
            <a
              key={index}
              href={part.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-400 hover:text-blue-300 underline decoration-blue-400/50 hover:decoration-blue-300 transition-colors"
            >
              {part.content}
            </a>
          )
        }
        return (
          <span key={index} className="whitespace-pre-wrap">
            {part.content}
          </span>
        )
      })}
    </div>
  )
}
