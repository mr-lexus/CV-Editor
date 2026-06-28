import { useState, useRef, useCallback, useEffect, KeyboardEvent } from 'react'
import {
  Bold, Italic, Underline, Strikethrough, List, ListOrdered,
  Heading2, Heading3, Link2, HelpCircle, Eye, Code,
  Quote, Minus, ListChecks,
} from 'lucide-react'
import { parseMarkdown } from './MarkdownContent'

// ---------- Types ----------
export interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  minHeight?: number
  id?: string
}

type EditorMode = 'markdown' | 'wysiwyg'

// ---------- Hotkeys reference ----------
const HOTKEYS = [
  { keys: 'Ctrl + B', label: 'Bold' },
  { keys: 'Ctrl + I', label: 'Italic' },
  { keys: 'Ctrl + U', label: 'Underline' },
  { keys: 'Ctrl + Shift + S', label: 'Strikethrough' },
  { keys: 'Ctrl + Shift + H', label: 'Heading H2' },
  { keys: 'Ctrl + Shift + 3', label: 'Heading H3' },
  { keys: 'Ctrl + Shift + L', label: 'Bullet List' },
  { keys: 'Ctrl + Shift + O', label: 'Numbered List' },
  { keys: 'Ctrl + Shift + T', label: 'Task List' },
  { keys: 'Ctrl + Shift + Q', label: 'Blockquote' },
  { keys: 'Ctrl + K', label: 'Insert Link' },
  { keys: 'Ctrl + `', label: 'Code' },
  { keys: 'Tab', label: 'Indent (in list)' },
  { keys: 'Ctrl + M', label: 'Toggle Mode' },
]

// ---------- Markdown smart-toggle helpers ----------

/**
 * Toggle inline wrapping (e.g. **bold**).
 * If the selection is already wrapped — unwrap it.
 * If nothing is selected — insert empty markers and place cursor inside.
 */
function toggleWrap(
  textarea: HTMLTextAreaElement,
  prefix: string,
  suffix: string,
  onChange: (v: string) => void
) {
  const { selectionStart: start, selectionEnd: end, value } = textarea
  const selected = value.slice(start, end)

  const pLen = prefix.length
  const sLen = suffix.length

  // Case 1: the selection itself is wrapped → unwrap
  if (selected.startsWith(prefix) && selected.endsWith(suffix) && selected.length >= pLen + sLen) {
    const inner = selected.slice(pLen, selected.length - sLen)
    const newValue = value.slice(0, start) + inner + value.slice(end)
    onChange(newValue)
    requestAnimationFrame(() => {
      textarea.setSelectionRange(start, start + inner.length)
      textarea.focus()
    })
    return
  }

  // Case 2: the selection is surrounded by markers outside → unwrap
  const before = value.slice(start - pLen, start)
  const after = value.slice(end, end + sLen)
  if (before === prefix && after === suffix) {
    const newValue =
      value.slice(0, start - pLen) + selected + value.slice(end + sLen)
    onChange(newValue)
    requestAnimationFrame(() => {
      textarea.setSelectionRange(start - pLen, start - pLen + selected.length)
      textarea.focus()
    })
    return
  }

  // Case 3: wrap — no text selected, insert markers and place cursor inside
  if (selected.length === 0) {
    const newValue = value.slice(0, start) + prefix + suffix + value.slice(end)
    onChange(newValue)
    requestAnimationFrame(() => {
      textarea.setSelectionRange(start + pLen, start + pLen)
      textarea.focus()
    })
    return
  }

  // Case 4: wrap the selected text
  const newValue = value.slice(0, start) + prefix + selected + suffix + value.slice(end)
  onChange(newValue)
  requestAnimationFrame(() => {
    textarea.setSelectionRange(start + pLen, start + pLen + selected.length)
    textarea.focus()
  })
}

/**
 * Toggle line prefix (e.g. "## ", "- ", "1. ").
 * If the line already starts with the prefix — remove it.
 * Works with multiline selection too.
 */
function toggleLine(
  textarea: HTMLTextAreaElement,
  prefix: string,
  onChange: (v: string) => void
) {
  const { selectionStart, selectionEnd, value } = textarea

  // Find start of first selected line
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  // Find end of last selected line
  let lineEnd = value.indexOf('\n', selectionEnd)
  if (lineEnd === -1) lineEnd = value.length

  const linesBlock = value.slice(lineStart, lineEnd)
  const lines = linesBlock.split('\n')

  // Detect if ALL lines already have this prefix (consider numbered lists separately)
  const isNumbered = /^\d+\. $/.test(prefix)
  const allHavePrefix = lines.every((l) => {
    if (isNumbered) return /^\d+\. /.test(l)
    return l.startsWith(prefix)
  })

  let newBlock: string
  if (allHavePrefix) {
    // Remove prefix from every line
    newBlock = lines
      .map((l) => {
        if (isNumbered) return l.replace(/^\d+\. /, '')
        return l.startsWith(prefix) ? l.slice(prefix.length) : l
      })
      .join('\n')
  } else {
    // Add prefix, re-number if ordered list
    newBlock = lines
      .map((l, i) => {
        if (isNumbered) {
          // Remove any existing numbered prefix first
          const clean = l.replace(/^\d+\. /, '')
          return `${i + 1}. ${clean}`
        }
        // Remove the prefix if it exists already (avoid double)
        const clean = l.startsWith(prefix) ? l.slice(prefix.length) : l
        return prefix + clean
      })
      .join('\n')
  }

  const delta = newBlock.length - linesBlock.length
  const newValue = value.slice(0, lineStart) + newBlock + value.slice(lineEnd)
  onChange(newValue)

  requestAnimationFrame(() => {
    textarea.setSelectionRange(
      Math.max(lineStart, selectionStart + (allHavePrefix ? -prefix.length : prefix.length)),
      Math.max(lineStart, selectionEnd + delta)
    )
    textarea.focus()
  })
}

/**
 * Handle Tab / Shift+Tab in lists — indent/unindent.
 * Outside lists just insert 2 spaces.
 */
function handleTabKey(
  textarea: HTMLTextAreaElement,
  shift: boolean,
  onChange: (v: string) => void
) {
  const { selectionStart, selectionEnd, value } = textarea
  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const line = value.slice(lineStart, value.indexOf('\n', selectionStart) === -1 ? value.length : value.indexOf('\n', selectionStart))
  const isList = /^(\s*)([-*+]|\d+\.) /.test(line)

  if (isList) {
    const indent = '  '
    if (shift) {
      // Unindent — remove up to 2 leading spaces
      const newLine = line.replace(/^ {1,2}/, '')
      const removed = line.length - newLine.length
      if (removed > 0) {
        const lineEnd = lineStart + line.length
        const newValue = value.slice(0, lineStart) + newLine + value.slice(lineEnd)
        onChange(newValue)
        requestAnimationFrame(() => {
          textarea.setSelectionRange(
            Math.max(lineStart, selectionStart - removed),
            Math.max(lineStart, selectionEnd - removed)
          )
          textarea.focus()
        })
      }
    } else {
      const lineEnd = lineStart + line.length
      const newValue = value.slice(0, lineStart) + indent + line + value.slice(lineEnd)
      onChange(newValue)
      requestAnimationFrame(() => {
        textarea.setSelectionRange(selectionStart + indent.length, selectionEnd + indent.length)
        textarea.focus()
      })
    }
  } else {
    // Outside list — insert 2 spaces at cursor
    if (!shift) {
      const spaces = '  '
      const newValue = value.slice(0, selectionStart) + spaces + value.slice(selectionEnd)
      onChange(newValue)
      requestAnimationFrame(() => {
        textarea.setSelectionRange(selectionStart + spaces.length, selectionStart + spaces.length)
        textarea.focus()
      })
    }
  }
}

/**
 * Handle Enter — auto-continue list items.
 * If current line is an empty list item, exit the list.
 */
function handleEnterKey(
  textarea: HTMLTextAreaElement,
  onChange: (v: string) => void
): boolean {
  const { selectionStart, selectionEnd, value } = textarea
  if (selectionStart !== selectionEnd) return false // let default handle range selections

  const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1
  const lineEnd = value.indexOf('\n', selectionStart)
  const line = value.slice(lineStart, lineEnd === -1 ? value.length : lineEnd)

  // Match task list: "- [x] " or "- [ ] " etc.
  const taskMatch = line.match(/^(\s*)[-*+] \[([ xX])\] /)
  // Match bullet list: "  - " or "- " etc.
  const bulletMatch = !taskMatch ? line.match(/^(\s*)([-*+]) /) : null
  // Match ordered list: "  1. " etc.
  const orderedMatch = line.match(/^(\s*)(\d+)\. /)

  if (taskMatch) {
    const [full, indent] = taskMatch
    const content = line.slice(full.length)
    if (content.trim() === '') {
      // Empty task item → exit list (remove the marker)
      const newValue = value.slice(0, lineStart) + indent + value.slice(lineStart + full.length)
      onChange(newValue)
      requestAnimationFrame(() => {
        textarea.setSelectionRange(lineStart + indent.length, lineStart + indent.length)
        textarea.focus()
      })
      return true
    }
    // Continue task list with unchecked item
    const continuation = `\n${indent}- [ ] `
    const newValue = value.slice(0, selectionStart) + continuation + value.slice(selectionEnd)
    onChange(newValue)
    requestAnimationFrame(() => {
      textarea.setSelectionRange(selectionStart + continuation.length, selectionStart + continuation.length)
      textarea.focus()
    })
    return true
  }

  if (bulletMatch) {
    const [full, indent, marker] = bulletMatch
    const content = line.slice(full.length)
    if (content.trim() === '') {
      // Empty item → exit list (remove the marker)
      const newValue = value.slice(0, lineStart) + indent + value.slice(lineStart + full.length)
      onChange(newValue)
      requestAnimationFrame(() => {
        textarea.setSelectionRange(lineStart + indent.length, lineStart + indent.length)
        textarea.focus()
      })
      return true
    }
    // Continue list
    const continuation = `\n${indent}${marker} `
    const newValue = value.slice(0, selectionStart) + continuation + value.slice(selectionEnd)
    onChange(newValue)
    requestAnimationFrame(() => {
      textarea.setSelectionRange(selectionStart + continuation.length, selectionStart + continuation.length)
      textarea.focus()
    })
    return true
  }

  if (orderedMatch) {
    const [full, indent, numStr] = orderedMatch
    const content = line.slice(full.length)
    if (content.trim() === '') {
      // Empty item → exit list
      const newValue = value.slice(0, lineStart) + indent + value.slice(lineStart + full.length)
      onChange(newValue)
      requestAnimationFrame(() => {
        textarea.setSelectionRange(lineStart + indent.length, lineStart + indent.length)
        textarea.focus()
      })
      return true
    }
    const nextNum = parseInt(numStr, 10) + 1
    const continuation = `\n${indent}${nextNum}. `
    const newValue = value.slice(0, selectionStart) + continuation + value.slice(selectionEnd)
    onChange(newValue)
    requestAnimationFrame(() => {
      textarea.setSelectionRange(selectionStart + continuation.length, selectionStart + continuation.length)
      textarea.focus()
    })
    return true
  }

  return false
}

/**
 * Insert text at cursor position (used for horizontal rule).
 */
function insertAtCursor(
  textarea: HTMLTextAreaElement,
  text: string,
  onChange: (v: string) => void
) {
  const { selectionStart, selectionEnd, value } = textarea
  // Ensure we're on a new line
  const before = value.slice(0, selectionStart)
  const needsNewlineBefore = before.length > 0 && !before.endsWith('\n')
  const insert = (needsNewlineBefore ? '\n' : '') + text + '\n'
  const newValue = before + insert + value.slice(selectionEnd)
  onChange(newValue)
  requestAnimationFrame(() => {
    const pos = selectionStart + insert.length
    textarea.setSelectionRange(pos, pos)
    textarea.focus()
  })
}

// ---------- Toolbar Button ----------
interface ToolbarBtnProps {
  title: string
  onClick: () => void
  children: React.ReactNode
  active?: boolean
}

const ToolbarBtn = ({ title, onClick, children, active }: ToolbarBtnProps) => (
  <button
    type="button"
    title={title}
    onMouseDown={(e) => {
      e.preventDefault() // prevent losing focus from editor
      onClick()
    }}
    className={`p-1.5 rounded transition-colors text-gray-500 hover:text-gray-900 hover:bg-gray-100 ${active ? 'bg-gray-200 text-gray-900' : ''
      }`}
  >
    {children}
  </button>
)

// ---------- Help Popover ----------
const HelpPopover = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  useEffect(() => {
    if (!open) return
    const handler = () => onClose()
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="absolute right-0 top-8 z-50 bg-white border border-gray-200 rounded-xl shadow-2xl p-4 w-72 animate-in"
      onClick={(e) => e.stopPropagation()}
    >
      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
        Keyboard Shortcuts
      </p>
      <div className="space-y-1.5">
        {HOTKEYS.map(({ keys, label }) => (
          <div key={keys} className="flex items-center justify-between gap-2">
            <span className="text-xs text-gray-600">{label}</span>
            <kbd className="text-[10px] bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 font-mono text-gray-700 whitespace-nowrap">
              {keys}
            </kbd>
          </div>
        ))}
      </div>
      <p className="text-[10px] text-gray-400 mt-3 border-t border-gray-100 pt-2">
        Press again to remove formatting
      </p>
    </div>
  )
}

// ---------- Main Component ----------
export const RichTextEditor = ({
  value,
  onChange,
  placeholder = 'Enter text...',
  minHeight = 120,
  id,
}: RichTextEditorProps) => {
  const [mode, setMode] = useState<EditorMode>('markdown')
  const [showHelp, setShowHelp] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const wysiwygRef = useRef<HTMLDivElement>(null)
  const isInternalChange = useRef(false)

  // --- Auto-resize textarea ---
  useEffect(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = `${Math.max(minHeight, ta.scrollHeight)}px`
  }, [value, mode, minHeight])

  // --- Sync WYSIWYG → markdown ---
  const handleWysiwygInput = useCallback(() => {
    const div = wysiwygRef.current
    if (!div || isInternalChange.current) return
    onChange(div.innerHTML)
  }, [onChange])

  // --- Sync value → WYSIWYG div ---
  useEffect(() => {
    const div = wysiwygRef.current
    if (!div || mode !== 'wysiwyg') return
    const rendered = parseMarkdown(value) || value
    if (div.innerHTML !== rendered) {
      isInternalChange.current = true
      div.innerHTML = rendered
      isInternalChange.current = false
    }
  }, [mode, value])

  // --- Mode toggle ---
  const toggleMode = useCallback(() => {
    if (mode === 'wysiwyg') {
      setMode('markdown')
    } else {
      setMode('wysiwyg')
    }
    setShowPreview(false)
  }, [mode])

  // --- Markdown hotkeys ---
  const handleMarkdownKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      const ta = textareaRef.current
      if (!ta) return

      // Mode toggle
      if (e.key === 'm' && e.ctrlKey && !e.shiftKey) {
        e.preventDefault()
        toggleMode()
        return
      }

      // Tab / Shift+Tab
      if (e.key === 'Tab') {
        e.preventDefault()
        handleTabKey(ta, e.shiftKey, onChange)
        return
      }

      // Enter — auto-continue lists
      if (e.key === 'Enter' && !e.ctrlKey && !e.shiftKey && !e.altKey) {
        const handled = handleEnterKey(ta, onChange)
        if (handled) e.preventDefault()
        return
      }

      if (!e.ctrlKey) return

      switch (true) {
        case e.key === 'b':
          e.preventDefault()
          toggleWrap(ta, '**', '**', onChange)
          break
        case e.key === 'i':
          e.preventDefault()
          toggleWrap(ta, '_', '_', onChange)
          break
        case e.key === 'u':
          e.preventDefault()
          toggleWrap(ta, '<u>', '</u>', onChange)
          break
        case e.key === 'k':
          e.preventDefault()
          toggleWrap(ta, '[', '](url)', onChange)
          break
        case e.key === '`':
          e.preventDefault()
          toggleWrap(ta, '`', '`', onChange)
          break
        case (e.key === 'H' || e.key === 'h') && e.shiftKey:
          e.preventDefault()
          toggleLine(ta, '## ', onChange)
          break
        case (e.key === 'L' || e.key === 'l') && e.shiftKey:
          e.preventDefault()
          toggleLine(ta, '- ', onChange)
          break
        case (e.key === 'O' || e.key === 'o') && e.shiftKey:
          e.preventDefault()
          toggleLine(ta, '1. ', onChange)
          break
        case (e.key === 'S' || e.key === 's') && e.shiftKey:
          e.preventDefault()
          toggleWrap(ta, '~~', '~~', onChange)
          break
        case (e.key === 'T' || e.key === 't') && e.shiftKey:
          e.preventDefault()
          toggleLine(ta, '- [ ] ', onChange)
          break
        case (e.key === 'Q' || e.key === 'q') && e.shiftKey:
          e.preventDefault()
          toggleLine(ta, '> ', onChange)
          break
        case (e.key === '3' || e.key === '#') && e.shiftKey:
          e.preventDefault()
          toggleLine(ta, '### ', onChange)
          break
      }
    },
    [onChange, toggleMode]
  )

  // --- WYSIWYG hotkeys ---
  const handleWysiwygKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'm' && e.ctrlKey && !e.shiftKey) {
        e.preventDefault()
        toggleMode()
        return
      }

      if (!e.ctrlKey) return

      const exec = (cmd: string, val?: string) => {
        e.preventDefault()
        document.execCommand(cmd, false, val)
      }

      switch (true) {
        case e.key === 'b':
          exec('bold')
          break
        case e.key === 'i':
          exec('italic')
          break
        case e.key === 'u':
          exec('underline')
          break
        case (e.key === 'S' || e.key === 's') && e.shiftKey:
          exec('strikeThrough')
          break
        case (e.key === 'H' || e.key === 'h') && e.shiftKey:
          exec('formatBlock', 'h2')
          break
        case (e.key === 'L' || e.key === 'l') && e.shiftKey:
          exec('insertUnorderedList')
          break
        case (e.key === 'O' || e.key === 'o') && e.shiftKey:
          exec('insertOrderedList')
          break
        case e.key === 'k': {
          e.preventDefault()
          const url = window.prompt('Link URL:', 'https://')
          if (url) exec('createLink', url)
          break
        }
      }
    },
    [toggleMode]
  )

  // --- Toolbar actions ---
  const ta = () => textareaRef.current
  const toolbarActions = {
    bold: () => ta() && toggleWrap(ta()!, '**', '**', onChange),
    italic: () => ta() && toggleWrap(ta()!, '_', '_', onChange),
    underline: () => ta() && toggleWrap(ta()!, '<u>', '</u>', onChange),
    strike: () => ta() && toggleWrap(ta()!, '~~', '~~', onChange),
    code: () => ta() && toggleWrap(ta()!, '`', '`', onChange),
    h2: () => ta() && toggleLine(ta()!, '## ', onChange),
    h3: () => ta() && toggleLine(ta()!, '### ', onChange),
    ul: () => ta() && toggleLine(ta()!, '- ', onChange),
    ol: () => ta() && toggleLine(ta()!, '1. ', onChange),
    taskList: () => ta() && toggleLine(ta()!, '- [ ] ', onChange),
    blockquote: () => ta() && toggleLine(ta()!, '> ', onChange),
    hr: () => ta() && insertAtCursor(ta()!, '---', onChange),
    link: () => ta() && toggleWrap(ta()!, '[', '](url)', onChange),
  }

  // --- WYSIWYG toolbar actions ---
  const wysiwygActions = {
    bold: () => document.execCommand('bold'),
    italic: () => document.execCommand('italic'),
    underline: () => document.execCommand('underline'),
    strike: () => document.execCommand('strikeThrough'),
    code: () => document.execCommand('formatBlock', false, 'pre'),
    h2: () => document.execCommand('formatBlock', false, 'h2'),
    h3: () => document.execCommand('formatBlock', false, 'h3'),
    ul: () => document.execCommand('insertUnorderedList'),
    ol: () => document.execCommand('insertOrderedList'),
    taskList: () => document.execCommand('insertUnorderedList'), // fallback
    blockquote: () => document.execCommand('formatBlock', false, 'blockquote'),
    hr: () => document.execCommand('insertHorizontalRule'),
    link: () => {
      const url = window.prompt('Link URL:', 'https://')
      if (url) document.execCommand('createLink', false, url)
    },
  }

  const actions = mode === 'markdown' ? toolbarActions : wysiwygActions

  const iconSize = 'w-3.5 h-3.5'

  return (
    <div className="relative group">
      {/* Top bar */}
      <div className="flex items-start justify-between bg-gray-50 border border-gray-200 rounded-t-md px-2 py-1.5 gap-2">
        {/* Scrollable Toolbar area */}
        <div className="flex flex-wrap items-center gap-0.5 overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
          <ToolbarBtn title="Bold (Ctrl+B)" onClick={actions.bold}>
            <Bold className={iconSize} />
          </ToolbarBtn>
          <ToolbarBtn title="Italic (Ctrl+I)" onClick={actions.italic}>
            <Italic className={iconSize} />
          </ToolbarBtn>
          <ToolbarBtn title="Underline (Ctrl+U)" onClick={actions.underline}>
            <Underline className={iconSize} />
          </ToolbarBtn>
          <ToolbarBtn title="Strikethrough (Ctrl+Shift+S)" onClick={actions.strike}>
            <Strikethrough className={iconSize} />
          </ToolbarBtn>
          <ToolbarBtn title="Inline code (Ctrl+`)" onClick={actions.code}>
            <Code className={iconSize} />
          </ToolbarBtn>
          <span className="w-px h-4 bg-gray-200 mx-1" />
          <ToolbarBtn title="Heading H2 (Ctrl+Shift+H)" onClick={actions.h2}>
            <Heading2 className={iconSize} />
          </ToolbarBtn>
          <ToolbarBtn title="Bullet List (Ctrl+Shift+L)" onClick={actions.ul}>
            <List className={iconSize} />
          </ToolbarBtn>
          <ToolbarBtn title="Numbered List (Ctrl+Shift+O)" onClick={actions.ol}>
            <ListOrdered className={iconSize} />
          </ToolbarBtn>
          <ToolbarBtn title="Link (Ctrl+K)" onClick={actions.link}>
            <Link2 className={iconSize} />
          </ToolbarBtn>
          <span className="w-px h-4 bg-gray-200 mx-1" />
          <ToolbarBtn title="Task List (Ctrl+Shift+T)" onClick={actions.taskList}>
            <ListChecks className={iconSize} />
          </ToolbarBtn>
          <ToolbarBtn title="Blockquote (Ctrl+Shift+Q)" onClick={actions.blockquote}>
            <Quote className={iconSize} />
          </ToolbarBtn>
          <ToolbarBtn title="Heading H3 (Ctrl+Shift+3)" onClick={actions.h3}>
            <Heading3 className={iconSize} />
          </ToolbarBtn>
          <ToolbarBtn title="Horizontal Rule" onClick={actions.hr}>
            <Minus className={iconSize} />
          </ToolbarBtn>

          <span className="w-px h-4 bg-gray-200 mx-1 shrink-0" />

          {/* Preview toggle (markdown only) */}
          {mode === 'markdown' && (
            <ToolbarBtn
              title="Preview"
              onClick={() => setShowPreview((v) => !v)}
              active={showPreview}
            >
              <Eye className={iconSize} />
            </ToolbarBtn>
          )}

          {/* Mode toggle */}
          <button
            type="button"
            title={`Toggle mode (Ctrl+M) - current: ${mode === 'markdown' ? 'Markdown' : 'Visual'}`}
            onMouseDown={(e) => {
              e.preventDefault()
              toggleMode()
            }}
            className={`flex items-center gap-1 text-[10px] font-semibold px-2 py-1 rounded border transition-all shrink-0 ${mode === 'markdown'
              ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
              : 'bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100'
              }`}
          >
            {mode === 'markdown' ? (
              <>
                <Code className="w-3 h-3" /> MD
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" /> Visual
              </>
            )}
          </button>
        </div>

        {/* Help - always on the right */}
        <div className="flex items-center shrink-0">
          <div className="relative">
            <ToolbarBtn
              title="Keyboard Shortcuts"
              onClick={() => {
                setShowHelp((v) => !v)
              }}
              active={showHelp}
            >
              <HelpCircle className={iconSize} />
            </ToolbarBtn>
            <HelpPopover open={showHelp} onClose={() => setShowHelp(false)} />
          </div>
        </div>
      </div>

      {/* Editor area */}
      {mode === 'markdown' ? (
        showPreview ? (
          // Markdown preview pane
          <div
            className="w-full border border-t-0 border-gray-200 rounded-b-md bg-white px-3 py-2 text-sm text-gray-700 markdown-content"
            style={{ minHeight }}
            dangerouslySetInnerHTML={{
              __html: parseMarkdown(value) || `<span class="text-gray-400">${placeholder}</span>`,
            }}
          />
        ) : (
          // Markdown textarea
          <textarea
            ref={textareaRef}
            id={id}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleMarkdownKeyDown}
            placeholder={placeholder}
            className="flex w-full border border-t-0 border-gray-200 rounded-b-md bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-0 resize-none font-mono transition-all"
            style={{ minHeight }}
          />
        )
      ) : (
        // WYSIWYG contenteditable
        <div
          ref={wysiwygRef}
          contentEditable
          suppressContentEditableWarning
          onInput={handleWysiwygInput}
          onKeyDown={handleWysiwygKeyDown}
          data-placeholder={placeholder}
          className="w-full border border-t-0 border-gray-200 rounded-b-md bg-white px-3 py-2 text-sm text-gray-700 focus-visible:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-0 wysiwyg-editor markdown-content"
          style={{ minHeight }}
        />
      )}
    </div>
  )
}

