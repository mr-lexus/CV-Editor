import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { useMemo } from 'react'

interface MarkdownContentProps {
  content: string
  className?: string
  mode?: 'preview' | 'print'
}

marked.setOptions({
  breaks: true,
  gfm: true,
})

const CHECKED_SVG = '<svg aria-hidden="true" class="task-list-checkbox" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="14" height="14"><rect width="16" height="16" rx="3" fill="#2563eb" /><polyline points="13 5 6.5 11.5 3 8" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" /></svg>'
const UNCHECKED_SVG = '<svg aria-hidden="true" class="task-list-checkbox" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="14" height="14"><rect x="1" y="1" width="14" height="14" rx="3" fill="white" stroke="#d1d5db" stroke-width="2" /></svg>'

function getDirectCheckbox(li: HTMLLIElement): HTMLInputElement | null {
  for (const node of Array.from(li.childNodes)) {
    if (node.nodeType === Node.TEXT_NODE && !node.textContent?.trim()) {
      continue
    }

    if (
      node.nodeType === Node.ELEMENT_NODE &&
      node instanceof HTMLInputElement &&
      node.type === 'checkbox'
    ) {
      return node
    }

    break
  }

  return null
}

function normalizeTaskLists(html: string): string {
  const parser = new DOMParser()
  const doc = parser.parseFromString(`<div id="markdown-root">${html}</div>`, 'text/html')
  const root = doc.getElementById('markdown-root')

  if (!root) {
    return html
  }

  const items = Array.from(root.querySelectorAll('li'))

  items.forEach((li) => {
    const checkbox = getDirectCheckbox(li)

    if (!checkbox && !li.classList.contains('task-list-item')) {
      return
    }

    const checked = Boolean(checkbox?.checked)
    checkbox?.remove()

    while (li.firstChild?.nodeType === Node.TEXT_NODE && !li.firstChild.textContent?.trim()) {
      li.removeChild(li.firstChild)
    }

    const marker = doc.createElement('span')
    marker.className = 'task-list-marker'
    marker.setAttribute('aria-hidden', 'true')
    marker.innerHTML = checked ? CHECKED_SVG : UNCHECKED_SVG

    const content = doc.createElement('span')
    content.className = 'task-list-text'

    while (li.firstChild) {
      content.appendChild(li.firstChild)
    }

    li.classList.add('task-list-item')
    li.closest('ul, ol')?.classList.add('contains-task-list')
    li.innerHTML = ''
    li.appendChild(marker)
    li.appendChild(content)
  })

  return root.innerHTML
}

function parseMarkdown(raw: string): string {
  if (!raw) return ''

  const html = marked.parse(raw) as string
  const normalizedHtml = normalizeTaskLists(html)

  return DOMPurify.sanitize(normalizedHtml, {
    ALLOWED_TAGS: [
      'div',
      'p', 'br', 'strong', 'em', 'u', 's', 'del',
      'h1', 'h2', 'h3',
      'ul', 'ol', 'li',
      'a', 'code', 'pre',
      'span',
      'blockquote',
      'hr',
      'svg', 'rect', 'polyline', 'path', 'circle',
    ],
    ALLOWED_ATTR: [
      'href', 'target', 'rel',
      'class', 'style',
      'xmlns', 'viewBox', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin',
      'points', 'width', 'height', 'x', 'y', 'rx', 'cx', 'cy', 'r', 'd', 'aria-hidden',
    ],
  })
}

export const MarkdownContent = ({ content, className = '' }: MarkdownContentProps) => {
  const html = useMemo(() => parseMarkdown(content), [content])

  if (!html) return null

  return (
    <div
      className={`markdown-content ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}

export { parseMarkdown }
