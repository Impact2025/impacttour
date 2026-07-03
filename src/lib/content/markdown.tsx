import type { ReactNode } from 'react'

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/** Parseert **bold**, *italic*, `code` en [tekst](url) binnen één regel. */
function renderInline(text: string, keyPrefix: string): ReactNode[] {
  const tokenRe = /(\*\*.+?\*\*|\*.+?\*|`.+?`|\[.+?\]\(.+?\))/g
  const parts = text.split(tokenRe).filter((p) => p !== '')
  return parts.map((part, i) => {
    const key = `${keyPrefix}-${i}`
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={key}>{part.slice(2, -2)}</strong>
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={key} className="px-1.5 py-0.5 rounded bg-[#F1F5F9] text-[#0F172A] text-[0.9em]">
          {part.slice(1, -1)}
        </code>
      )
    }
    const linkMatch = /^\[(.+?)\]\((.+?)\)$/.exec(part)
    if (linkMatch) {
      const [, label, href] = linkMatch
      const isExternal = /^https?:\/\//.test(href)
      return (
        <a
          key={key}
          href={href}
          className="text-[#00A84A] font-medium underline underline-offset-2 hover:text-[#00C853]"
          {...(isExternal ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
        >
          {label}
        </a>
      )
    }
    if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
      return <em key={key}>{part.slice(1, -1)}</em>
    }
    return part
  })
}

interface Block {
  kind: 'h2' | 'h3' | 'p' | 'ul' | 'ol' | 'quote' | 'table' | 'callout'
  lines: string[]
}

function splitIntoBlocks(md: string): Block[] {
  const rawLines = md.trim().split('\n')
  const blocks: Block[] = []
  let i = 0

  while (i < rawLines.length) {
    const line = rawLines[i]

    if (line.trim() === '') {
      i++
      continue
    }

    if (line.startsWith('### ')) {
      blocks.push({ kind: 'h3', lines: [line.slice(4)] })
      i++
      continue
    }
    if (line.startsWith('## ')) {
      blocks.push({ kind: 'h2', lines: [line.slice(3)] })
      i++
      continue
    }
    if (line.startsWith('::: callout')) {
      const calloutLines: string[] = []
      i++
      while (i < rawLines.length && rawLines[i].trim() !== ':::') {
        calloutLines.push(rawLines[i])
        i++
      }
      i++ // skip closing :::
      blocks.push({ kind: 'callout', lines: calloutLines })
      continue
    }
    if (line.startsWith('> ')) {
      const quoteLines: string[] = []
      while (i < rawLines.length && rawLines[i].startsWith('> ')) {
        quoteLines.push(rawLines[i].slice(2))
        i++
      }
      blocks.push({ kind: 'quote', lines: quoteLines })
      continue
    }
    if (line.startsWith('|')) {
      const tableLines: string[] = []
      while (i < rawLines.length && rawLines[i].startsWith('|')) {
        tableLines.push(rawLines[i])
        i++
      }
      blocks.push({ kind: 'table', lines: tableLines })
      continue
    }
    if (/^[-*]\s/.test(line)) {
      const listLines: string[] = []
      while (i < rawLines.length && /^[-*]\s/.test(rawLines[i])) {
        listLines.push(rawLines[i].replace(/^[-*]\s/, ''))
        i++
      }
      blocks.push({ kind: 'ul', lines: listLines })
      continue
    }
    if (/^\d+\.\s/.test(line)) {
      const listLines: string[] = []
      while (i < rawLines.length && /^\d+\.\s/.test(rawLines[i])) {
        listLines.push(rawLines[i].replace(/^\d+\.\s/, ''))
        i++
      }
      blocks.push({ kind: 'ol', lines: listLines })
      continue
    }

    // paragraph — accumulate until blank line or new block marker
    const paraLines: string[] = []
    while (
      i < rawLines.length &&
      rawLines[i].trim() !== '' &&
      !rawLines[i].startsWith('#') &&
      !rawLines[i].startsWith('> ') &&
      !rawLines[i].startsWith('|') &&
      !rawLines[i].startsWith('::: callout') &&
      !/^[-*]\s/.test(rawLines[i]) &&
      !/^\d+\.\s/.test(rawLines[i])
    ) {
      paraLines.push(rawLines[i])
      i++
    }
    blocks.push({ kind: 'p', lines: [paraLines.join(' ')] })
  }

  return blocks
}

export interface TocEntry {
  id: string
  text: string
  level: 2 | 3
}

export function extractToc(md: string): TocEntry[] {
  return splitIntoBlocks(md)
    .filter((b) => b.kind === 'h2' || b.kind === 'h3')
    .map((b) => ({
      id: slugify(b.lines[0]),
      text: b.lines[0],
      level: b.kind === 'h2' ? 2 : 3,
    }))
}

export function renderMarkdown(md: string): ReactNode[] {
  const blocks = splitIntoBlocks(md)

  return blocks.map((block, bi) => {
    const key = `block-${bi}`

    switch (block.kind) {
      case 'h2': {
        const text = block.lines[0]
        return (
          <h2
            key={key}
            id={slugify(text)}
            className="text-2xl md:text-3xl font-black text-[#0F172A] mt-12 mb-4 scroll-mt-24"
            style={{ fontFamily: 'var(--font-display, "Barlow Condensed", sans-serif)' }}
          >
            {renderInline(text, key)}
          </h2>
        )
      }
      case 'h3': {
        const text = block.lines[0]
        return (
          <h3
            key={key}
            id={slugify(text)}
            className="text-xl font-bold text-[#0F172A] mt-8 mb-3 scroll-mt-24"
          >
            {renderInline(text, key)}
          </h3>
        )
      }
      case 'p':
        return (
          <p key={key} className="text-[#334155] text-base leading-relaxed mb-5">
            {renderInline(block.lines[0], key)}
          </p>
        )
      case 'ul':
        return (
          <ul key={key} className="space-y-2.5 mb-6 pl-1">
            {block.lines.map((item, li) => (
              <li key={`${key}-${li}`} className="flex gap-3 text-[#334155] text-base leading-relaxed">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00A84A] shrink-0 mt-2.5" />
                <span>{renderInline(item, `${key}-${li}`)}</span>
              </li>
            ))}
          </ul>
        )
      case 'ol':
        return (
          <ol key={key} className="space-y-2.5 mb-6 pl-1 list-none counter-reset-none">
            {block.lines.map((item, li) => (
              <li key={`${key}-${li}`} className="flex gap-3 text-[#334155] text-base leading-relaxed">
                <span className="font-black text-[#00A84A] shrink-0 tabular-nums">{li + 1}.</span>
                <span>{renderInline(item, `${key}-${li}`)}</span>
              </li>
            ))}
          </ol>
        )
      case 'quote':
        return (
          <blockquote
            key={key}
            className="border-l-3 border-[#00A84A] pl-5 py-1 my-7 text-[#0F172A] text-lg font-medium italic leading-relaxed"
          >
            {block.lines.map((l, li) => (
              <p key={`${key}-${li}`}>{renderInline(l, `${key}-${li}`)}</p>
            ))}
          </blockquote>
        )
      case 'callout':
        return (
          <div key={key} className="my-7 rounded-2xl border border-[#DCFCE7] bg-[#F0FDF4] p-5 md:p-6">
            {block.lines
              .filter((l) => l.trim() !== '')
              .map((l, li) => (
                <p key={`${key}-${li}`} className="text-[#15803D] text-sm leading-relaxed mb-0 last:mb-0">
                  {renderInline(l, `${key}-${li}`)}
                </p>
              ))}
          </div>
        )
      case 'table': {
        const rows = block.lines
          .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()))
          .filter((cells) => !cells.every((c) => /^:?-+:?$/.test(c)))
        const [head, ...body] = rows
        return (
          <div key={key} className="my-7 overflow-x-auto rounded-xl border border-[#E2E8F0]">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC]">
                  {head.map((h, hi) => (
                    <th key={hi} className="text-left font-bold text-[#0F172A] px-4 py-3 border-b border-[#E2E8F0]">
                      {renderInline(h, `${key}-h-${hi}`)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, ri) => (
                  <tr key={ri} className="border-b border-[#F1F5F9] last:border-0">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-4 py-3 text-[#334155] tabular-nums">
                        {renderInline(cell, `${key}-${ri}-${ci}`)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      }
    }
  })
}
