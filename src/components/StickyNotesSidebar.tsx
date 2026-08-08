'use client'

import { useState, useEffect, useLayoutEffect, useRef } from 'react'
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion'
import { X } from 'lucide-react'
import { LinkifiedText } from '@/components/LinkifiedText'

// ─── Types ─────────────────────────────────────────────────────────────────

interface StickyNote {
  id: string
  text: string
  x: number
  y: number
}

// ─── Constants ─────────────────────────────────────────────────────────────

const NOTE_W = 118
const NOTE_H = 118
const NOTE_IDS = ['note-1', 'note-2', 'note-3'] as const
const ROTATIONS_DEG = [1, -1, 1] as const
const DRAG_THRESHOLD = 5 // px — below this, mouseup is treated as a click

const MODAL_SPRING = { type: 'spring' as const, stiffness: 320, damping: 32 }

function makeDefaultNotes(): StickyNote[] {
  const baseX = Math.max(window.innerWidth - NOTE_W - 16, 0)
  const gap = NOTE_H + 14
  return NOTE_IDS.map((id, i) => ({
    id,
    text: '',
    x: baseX,
    y: 80 + i * gap,
  }))
}

// ─── StickyNotesSidebar ─────────────────────────────────────────────────────

export function StickyNotesSidebar({ storageKey }: { storageKey: string }) {
  const [notes, setNotes] = useState<StickyNote[]>([])
  const [mounted, setMounted] = useState(false)
  // Which note is currently expanded into a modal
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null)
  // Isolated draft text — only committed to state on Save
  const [draftText, setDraftText] = useState('')

  const latestNotesRef = useRef<StickyNote[]>([])
  const modalTextareaRef = useRef<HTMLTextAreaElement>(null)
  // DOM refs for each note's outer wrapper — keyed by note id
  const noteElsRef = useRef<Map<string, HTMLDivElement>>(new Map())

  // Active drag session
  const dragRef = useRef<{
    id: string
    startMouseX: number
    startMouseY: number
    startNoteX: number
    startNoteY: number
    didDrag: boolean
    currentX: number  // tracks live position without touching React state
    currentY: number
  } | null>(null)

  // ── Hydrate on client ──────────────────────────────────────────────────
  useEffect(() => {
    const stored = localStorage.getItem(storageKey)
    if (stored) {
      try { setNotes(JSON.parse(stored)) }
      catch { setNotes(makeDefaultNotes()) }
    } else {
      setNotes(makeDefaultNotes())
    }
    setMounted(true)
  }, [storageKey])

  // Keep ref in sync with state
  useEffect(() => { latestNotesRef.current = notes }, [notes])

  // Resize after every render where draftText or activeNoteId changes.
  // useLayoutEffect fires synchronously after React commits the new value to the DOM,
  // so scrollHeight is always measured against the current content.
  useLayoutEffect(() => {
    const ta = modalTextareaRef.current
    if (!ta || !activeNoteId) return
    ta.style.height = 'auto'
    ta.style.height = `${ta.scrollHeight}px`
  }, [draftText, activeNoteId])

  // Focus textarea after modal animation starts
  useEffect(() => {
    if (!activeNoteId) return
    const t = setTimeout(() => modalTextareaRef.current?.focus(), 120)
    return () => clearTimeout(t)
  }, [activeNoteId])

  // Escape key closes modal (cancels)
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && activeNoteId) setActiveNoteId(null)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeNoteId])

  // ── Global pointer / touch handlers ──────────────────────────────────
  useEffect(() => {
    if (!mounted) return

    const onMouseMove = (e: MouseEvent) => {
      const d = dragRef.current
      if (!d) return
      const dx = e.clientX - d.startMouseX
      const dy = e.clientY - d.startMouseY
      if (!d.didDrag && (Math.abs(dx) > DRAG_THRESHOLD || Math.abs(dy) > DRAG_THRESHOLD)) {
        d.didDrag = true
        document.body.style.cursor = 'grabbing'
      }
      if (!d.didDrag) return
      const noteH = noteElsRef.current.get(d.id)?.offsetHeight ?? NOTE_H
      d.currentX = Math.max(0, Math.min(window.innerWidth  - NOTE_W, d.startNoteX + dx))
      d.currentY = Math.max(0, Math.min(window.innerHeight - noteH,  d.startNoteY + dy))
      // Mutate the DOM directly — zero React renders during drag
      const el = noteElsRef.current.get(d.id)
      if (el) { el.style.left = `${d.currentX}px`; el.style.top = `${d.currentY}px` }
    }

    const onMouseUp = () => {
      const d = dragRef.current
      if (!d) return
      dragRef.current = null
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
      if (!d.didDrag) {
        // Click — open modal
        const note = latestNotesRef.current.find(n => n.id === d.id)
        if (note) { setDraftText(note.text); setActiveNoteId(d.id) }
      } else {
        // Commit final position to React state + localStorage in one render
        setNotes(prev => {
          const next = prev.map(n => n.id === d.id ? { ...n, x: d.currentX, y: d.currentY } : n)
          localStorage.setItem(storageKey, JSON.stringify(next))
          return next
        })
      }
    }

    const onTouchMove = (e: TouchEvent) => {
      const d = dragRef.current
      if (!d) return
      e.preventDefault()
      d.didDrag = true
      const t = e.touches[0]
      const noteH = noteElsRef.current.get(d.id)?.offsetHeight ?? NOTE_H
      d.currentX = Math.max(0, Math.min(window.innerWidth  - NOTE_W, d.startNoteX + t.clientX - d.startMouseX))
      d.currentY = Math.max(0, Math.min(window.innerHeight - noteH,  d.startNoteY + t.clientY - d.startMouseY))
      // Mutate the DOM directly — zero React renders during drag
      const el = noteElsRef.current.get(d.id)
      if (el) { el.style.left = `${d.currentX}px`; el.style.top = `${d.currentY}px` }
    }

    const onTouchEnd = () => {
      const d = dragRef.current
      if (!d) return
      dragRef.current = null
      document.body.style.userSelect = ''
      if (d.didDrag) {
        // Commit final position to React state + localStorage in one render
        setNotes(prev => {
          const next = prev.map(n => n.id === d.id ? { ...n, x: d.currentX, y: d.currentY } : n)
          localStorage.setItem(storageKey, JSON.stringify(next))
          return next
        })
      } else {
        const note = latestNotesRef.current.find(n => n.id === d.id)
        if (note) { setDraftText(note.text); setActiveNoteId(d.id) }
      }
    }

    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup',   onMouseUp)
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('touchend',  onTouchEnd)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup',   onMouseUp)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('touchend',  onTouchEnd)
    }
  }, [mounted, storageKey])

  // ── Per-note handlers ─────────────────────────────────────────────────

  const handleMouseDown = (e: React.MouseEvent, id: string) => {
    e.preventDefault()
    const note = latestNotesRef.current.find(n => n.id === id)
    if (!note) return
    document.body.style.userSelect = 'none'
    dragRef.current = {
      id,
      startMouseX: e.clientX,
      startMouseY: e.clientY,
      startNoteX: note.x,
      startNoteY: note.y,
      didDrag: false,
      currentX: note.x,
      currentY: note.y,
    }
  }

  const handleTouchStart = (e: React.TouchEvent, id: string) => {
    const t = e.touches[0]
    const note = latestNotesRef.current.find(n => n.id === id)
    if (!note) return
    dragRef.current = {
      id,
      startMouseX: t.clientX,
      startMouseY: t.clientY,
      startNoteX: note.x,
      startNoteY: note.y,
      didDrag: false,
      currentX: note.x,
      currentY: note.y,
    }
  }

  // ── Modal handlers ────────────────────────────────────────────────────

  const handleModalSave = () => {
    if (!activeNoteId) return
    setNotes(prev => {
      const next = prev.map(n => n.id === activeNoteId ? { ...n, text: draftText } : n)
      localStorage.setItem(storageKey, JSON.stringify(next))
      return next
    })
    setActiveNoteId(null)
  }

  const handleModalCancel = () => setActiveNoteId(null)

  // ── Render ────────────────────────────────────────────────────────────

  if (!mounted) return null

  return (
    <LayoutGroup>
      {/* ── Dashboard sticky notes ─────────────────────────────────────── */}
      {notes.map((note, i) => {
        // Hide the note that is currently expanded into a modal;
        // framer-motion's layoutId will animate it to/from the modal position.
        if (note.id === activeNoteId) return null

        return (
          // Outer div owns the fixed position — no framer-motion tracking here,
          // so drag position updates are always instant.
          <div
            key={note.id}
            ref={(el) => {
              if (el) noteElsRef.current.set(note.id, el)
              else noteElsRef.current.delete(note.id)
            }}
            onMouseDown={(e) => handleMouseDown(e, note.id)}
            onTouchStart={(e) => handleTouchStart(e, note.id)}
            style={{
              position: 'fixed',
              left: note.x,
              top: note.y,
              zIndex: 40,
              cursor: 'grab',
            }}
          >
            {/* Inner motion.div owns layoutId — it's the "hero" element for the swoosh */}
            <motion.div
              layoutId={note.id}
              animate={{ rotate: ROTATIONS_DEG[i % ROTATIONS_DEG.length] }}
              transition={MODAL_SPRING}
              className="rounded-sm shadow-md"
              style={{
                width: NOTE_W,
                minHeight: NOTE_H,
                backgroundColor: 'rgba(var(--color-primary-rgb), 0.10)',
                borderTop: '4px solid rgba(var(--color-primary-rgb), 0.32)',
                padding: '8px',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-12)',
                  color: note.text
                    ? 'var(--color-black)'
                    : 'rgba(var(--color-primary-rgb), 0.40)',
                  fontFamily: 'inherit',
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  userSelect: 'none',
                  pointerEvents: 'auto',
                }}
              >
                {note.text ? <LinkifiedText text={note.text} /> : null}
              </div>
            </motion.div>
          </div>
        )
      })}

      {/* ── Expanded-note modal ────────────────────────────────────────── */}
      <AnimatePresence>
        {activeNoteId && (
          <>
            {/* Dimmed backdrop */}
            <motion.div
              key="note-overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.18 }}
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 50,
                backgroundColor: 'var(--color-dim)',
              }}
              onClick={handleModalCancel}
            />

            {/* Centering shell — pointer-events none so backdrop catches stray clicks */}
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 51,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
              }}
            >
              {/* Modal card — shares layoutId with the dashboard note, triggering the swoosh */}
              <motion.div
                layoutId={activeNoteId}
                animate={{ rotate: 0 }}
                transition={MODAL_SPRING}
                className="rounded-modal flex flex-col"
                style={{
                  backgroundColor: 'var(--color-off-white)',
                  paddingTop: 'var(--space-34)',
                  paddingInline: 'var(--space-37)',
                  paddingBottom: 'var(--space-20)',
                  width: 'calc(var(--size-modal-inner-w) + var(--space-37) * 2)',
                  boxShadow: 'var(--shadow-modal)',
                  pointerEvents: 'auto',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* ── Modal header ── */}
                <div>
                  <div
                    className="flex items-start justify-between"
                    style={{ marginBottom: 'var(--space-20)' }}
                  >
                    <h2
                      style={{
                        fontSize: 'var(--text-20)',
                        fontWeight: 'var(--weight-bold)',
                        color: 'var(--color-black)',
                      }}
                    >
                      Edit Note
                    </h2>
                    <button
                      onClick={handleModalCancel}
                      className="flex items-center justify-center transition-colors duration-200 hover:opacity-60 shrink-0"
                      style={{
                        width: 'var(--size-close-btn)',
                        height: 'var(--size-close-btn)',
                        color: 'var(--color-gray)',
                      }}
                    >
                      <X size={20} />
                    </button>
                  </div>
                  <hr style={{ borderColor: 'var(--color-stroke)' }} />
                </div>

                {/* ── Note textarea ── */}
                <div
                  className="flex flex-col"
                  style={{ marginTop: 'var(--space-30)', gap: 'var(--space-10)' }}
                >
                  <label
                    style={{
                      fontSize: 'var(--text-12)',
                      fontWeight: 'var(--weight-semibold)',
                      color: 'var(--color-gray)',
                    }}
                  >
                    NOTE
                  </label>
                  <textarea
                    ref={modalTextareaRef}
                    value={draftText}
                    onChange={(e) => setDraftText(e.target.value)}
                    placeholder="Write your note here…"
                    className="w-full resize-none outline-none border rounded-sm transition-colors duration-200 focus:border-primary placeholder:text-light-gray overflow-hidden"
                    style={{
                      minHeight: '160px',
                      paddingInline: 'var(--space-20)',
                      paddingBlock: 'var(--space-14)',
                      backgroundColor: 'var(--color-off-white)',
                      borderColor: 'var(--color-stroke)',
                      fontSize: 'var(--text-14)',
                      color: 'var(--color-black)',
                      fontFamily: 'inherit',
                      lineHeight: 1.6,
                    }}
                  />
                </div>

                {/* ── Action buttons ── */}
                <div
                  className="flex"
                  style={{ gap: 'var(--space-20)', marginTop: 'var(--space-20)' }}
                >
                  <button
                    onClick={handleModalCancel}
                    className="transition-colors duration-200 hover:opacity-80"
                    style={{
                      flex: 1,
                      height: 'var(--size-btn-h)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-14)',
                      fontWeight: 'var(--weight-regular)',
                      color: 'var(--color-gray)',
                      backgroundColor: 'var(--color-off-white)',
                      border: '1px solid var(--color-stroke)',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleModalSave}
                    className="transition-all duration-200 hover:opacity-90 active:opacity-80"
                    style={{
                      flex: 1,
                      height: 'var(--size-btn-h)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-14)',
                      fontWeight: 'var(--weight-semibold)',
                      color: 'var(--color-off-white)',
                      backgroundColor: 'var(--color-primary)',
                    }}
                  >
                    Save Note
                  </button>
                </div>
              </motion.div>
            </div>
          </>
        )}
      </AnimatePresence>
    </LayoutGroup>
  )
}
