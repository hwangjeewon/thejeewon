'use client'

import { useState, useEffect } from 'react'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'
import { LinkifiedText } from '@/components/LinkifiedText'

// ─── Types ───────────────────────────────────────────────────────────────────

interface StockEntry {
  insight: string
  action: string
}

type StockData = Record<string, StockEntry>

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'stocks_data'

const DAY_LABELS = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTodayISO(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date())
}

function toISODate(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

function buildCalendarCells(year: number, month: number): (number | null)[] {
  const firstDay = new Date(year, month, 1).getDay() // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  return cells
}

// ─── StocksPage ───────────────────────────────────────────────────────────────

export default function StocksPage() {
  const today = getTodayISO()
  const [todayYear, todayMonth] = today.split('-').map(Number)

  const [stockData, setStockData] = useState<StockData>({})
  const [viewYear, setViewYear] = useState(todayYear)
  const [viewMonth, setViewMonth] = useState(todayMonth - 1) // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [isViewing, setIsViewing] = useState(false)
  const [insight, setInsight] = useState('')
  const [action, setAction] = useState('')

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        setStockData(JSON.parse(stored))
      } catch {
        setStockData({})
      }
    }
  }, [])

  function handlePrevMonth() {
    if (viewMonth === 0) { setViewMonth(11); setViewYear((y) => y - 1) }
    else setViewMonth((m) => m - 1)
  }

  function handleNextMonth() {
    if (viewMonth === 11) { setViewMonth(0); setViewYear((y) => y + 1) }
    else setViewMonth((m) => m + 1)
  }

  function handleDateClick(day: number) {
    const iso = toISODate(viewYear, viewMonth, day)
    setSelectedDate(iso)
    const existing = stockData[iso]
    setInsight(existing?.insight ?? '')
    setAction(existing?.action ?? '')
    setIsViewing(!!(existing?.insight || existing?.action))
  }

  function handleClose() {
    setSelectedDate(null)
    setInsight('')
    setAction('')
    setIsViewing(false)
  }

  function handleSave() {
    if (!selectedDate) return
    const updated: StockData = {
      ...stockData,
      [selectedDate]: { insight, action },
    }
    setStockData(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    handleClose()
  }

  function handleDelete() {
    if (!selectedDate) return
    if (!window.confirm('Are you sure you want to delete this record?')) return
    const updated = { ...stockData }
    delete updated[selectedDate]
    setStockData(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    handleClose()
  }

  const cells = buildCalendarCells(viewYear, viewMonth)

  const modalWidth = 660

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <>
      <div className="w-full" style={{ maxWidth: 'var(--size-page-w)' }}>

        {/* ── Page Header ── */}
        <div
          className="flex flex-col"
          style={{ gap: 'var(--space-5)', marginBottom: 'var(--space-20)' }}
        >
          <h1
            style={{
              fontSize: 'var(--text-26)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-black)',
            }}
          >
            Stocks Dashboard
          </h1>
          <p style={{ fontSize: 'var(--text-15)', color: 'var(--color-gray)' }}>
            Calculated moves only.
          </p>
        </div>

        {/* ── Calendar Card — School white block style ── */}
        <div
          className="flex flex-col"
          style={{
            width: '100%',
            height: 684,
            background: '#fff',
            borderRadius: 12,
            border: '1px solid var(--color-stroke)',
            overflow: 'hidden',
            paddingLeft: 28,
            paddingRight: 28,
            paddingTop: 32,
            paddingBottom: 32,
          }}
        >
          {/* Month navigation */}
          <div
            className="flex items-center justify-between"
            style={{ marginBottom: 28 }}
          >
            <button
              onClick={handlePrevMonth}
              className="flex items-center justify-center transition-opacity duration-200 hover:opacity-60"
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-stroke)',
                backgroundColor: 'var(--color-off-white)',
                color: 'var(--color-gray)',
                cursor: 'pointer',
              }}
            >
              <ChevronLeft size={16} />
            </button>

            <span
              style={{
                fontSize: 'var(--text-16)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-black)',
              }}
            >
              {MONTH_NAMES[viewMonth]} {viewYear}
            </span>

            <button
              onClick={handleNextMonth}
              className="flex items-center justify-center transition-opacity duration-200 hover:opacity-60"
              style={{
                width: 32,
                height: 32,
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--color-stroke)',
                backgroundColor: 'var(--color-off-white)',
                color: 'var(--color-gray)',
                cursor: 'pointer',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>

          {/* Day-of-week labels */}
          <div className="grid grid-cols-7" style={{ marginBottom: 8 }}>
            {DAY_LABELS.map((d) => (
              <div
                key={d}
                className="text-center"
                style={{
                  fontSize: 'var(--text-12)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-light-gray)',
                  paddingBottom: 8,
                }}
              >
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div className="grid grid-cols-7 flex-1" style={{ gap: 4, gridAutoRows: 'minmax(0, 1fr)' }}>
            {cells.map((day, idx) => {
              if (day === null) return <div key={`empty-${idx}`} />

              const iso = toISODate(viewYear, viewMonth, day)
              const isToday = iso === today
              const entry = stockData[iso]
              const hasRecord = !!(entry?.insight || entry?.action)

              return (
                <button
                  key={iso}
                  onClick={() => handleDateClick(day)}
                  className="flex flex-col items-center justify-center transition-colors duration-200"
                  style={{
                    height: '100%',
                    borderRadius: 8,
                    border: '1px solid transparent',
                    backgroundColor: isToday ? 'var(--color-primary-bg)' : 'transparent',
                    cursor: 'pointer',
                    gap: 4,
                  }}
                  onMouseEnter={(e) => {
                    if (!isToday)
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'var(--color-bg)'
                  }}
                  onMouseLeave={(e) => {
                    if (!isToday)
                      (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--text-14)',
                      fontWeight: isToday ? 'var(--weight-bold)' : 'var(--weight-regular)',
                      color: isToday ? 'var(--color-primary)' : 'var(--color-black)',
                      lineHeight: 1,
                    }}
                  >
                    {day}
                  </span>
                  {/* Reserve dot space so cells stay the same height */}
                  <span
                    style={{
                      width: 5,
                      height: 5,
                      borderRadius: '50%',
                      backgroundColor: hasRecord ? 'var(--color-primary)' : 'transparent',
                      flexShrink: 0,
                    }}
                  />
                </button>
              )
            })}
          </div>
        </div>

      </div>

      {/* ── Modal ── */}
      {selectedDate && (
        <div
          className="fixed inset-0 flex items-center justify-center z-50"
          style={{ backgroundColor: 'var(--color-dim)' }}
          onClick={handleClose}
        >
          <div
            className="rounded-modal flex flex-col"
            style={{
              backgroundColor: 'var(--color-off-white)',
              paddingTop: 'var(--space-34)',
              paddingInline: 'var(--space-37)',
              paddingBottom: 'var(--space-20)',
              width: modalWidth,
              boxShadow: 'var(--shadow-modal)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
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
                  {isViewing ? 'Stock Log' : 'Add New Stock Log'}
                </h2>
                <button
                  onClick={handleClose}
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

            {isViewing ? (
              <>
                {/* ── View Mode Body: 2-column split ── */}
                <div
                  className="grid grid-cols-2 w-full"
                  style={{ marginTop: 'var(--space-30)', gap: 'var(--space-20)', height: 400 }}
                >
                  {/* Left: BACKGROUND & INSIGHT */}
                  <div className="flex flex-col overflow-hidden" style={{ gap: 'var(--space-10)' }}>
                    <span
                      style={{
                        fontSize: 'var(--text-12)',
                        fontWeight: 'var(--weight-semibold)',
                        color: 'var(--color-gray)',
                      }}
                    >
                      BACKGROUND & INSIGHT
                    </span>
                    <div
                      className="overflow-y-auto custom-scrollbar"
                      style={{
                        flex: 1,
                        minHeight: 0,
                        paddingInline: 'var(--space-20)',
                        paddingBlock: 'var(--space-14)',
                        backgroundColor: 'var(--color-bg)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--text-14)',
                        color: insight ? 'var(--color-black)' : 'var(--color-light-gray)',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {insight ? <LinkifiedText text={insight} /> : '—'}
                    </div>
                  </div>

                  {/* Right: ACTION */}
                  <div className="flex flex-col overflow-hidden" style={{ gap: 'var(--space-10)' }}>
                    <span
                      style={{
                        fontSize: 'var(--text-12)',
                        fontWeight: 'var(--weight-semibold)',
                        color: 'var(--color-gray)',
                      }}
                    >
                      ACTION
                    </span>
                    <div
                      className="overflow-y-auto custom-scrollbar"
                      style={{
                        flex: 1,
                        minHeight: 0,
                        paddingInline: 'var(--space-20)',
                        paddingBlock: 'var(--space-14)',
                        backgroundColor: 'var(--color-bg)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: 'var(--text-14)',
                        color: action ? 'var(--color-black)' : 'var(--color-light-gray)',
                        lineHeight: 1.6,
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {action ? <LinkifiedText text={action} /> : '—'}
                    </div>
                  </div>
                </div>

                {/* ── View Mode Buttons: Delete / Edit ── */}
                <div
                  className="flex"
                  style={{ gap: 'var(--space-20)', marginTop: 'var(--space-20)' }}
                >
                  <button
                    onClick={handleDelete}
                    className="transition-colors duration-200 hover:opacity-80"
                    style={{
                      flex: 1,
                      height: 'var(--size-btn-h)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-14)',
                      fontWeight: 'var(--weight-regular)',
                      color: 'var(--color-red)',
                      backgroundColor: 'var(--color-off-white)',
                      border: '1px solid var(--color-stroke)',
                    }}
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setIsViewing(false)}
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
                    Edit
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* ── Edit Mode Body: textarea form ── */}
                <div
                  className="grid grid-cols-2 w-full"
                  style={{ marginTop: 'var(--space-30)', gap: 'var(--space-20)', height: 400 }}
                >
                  {/* BACKGROUND & INSIGHT */}
                  <div className="flex flex-col overflow-hidden" style={{ gap: 'var(--space-10)' }}>
                    <label
                      style={{
                        fontSize: 'var(--text-12)',
                        fontWeight: 'var(--weight-semibold)',
                        color: 'var(--color-gray)',
                      }}
                    >
                      BACKGROUND & INSIGHT
                    </label>
                    <textarea
                      value={insight}
                      onChange={(e) => setInsight(e.target.value)}
                      placeholder="Write market context, company news, or your analysis here..."
                      className="w-full outline-none border rounded-sm transition-colors duration-200 focus:border-primary resize-none overflow-y-auto placeholder:text-light-gray custom-scrollbar"
                      style={{
                        flex: 1,
                        minHeight: 0,
                        paddingInline: 'var(--space-20)',
                        paddingBlock: 'var(--space-14)',
                        backgroundColor: 'var(--color-off-white)',
                        borderColor: 'var(--color-stroke)',
                        fontSize: 'var(--text-14)',
                        color: 'var(--color-black)',
                        lineHeight: 1.6,
                      }}
                    />
                  </div>

                  {/* ACTION */}
                  <div className="flex flex-col overflow-hidden" style={{ gap: 'var(--space-10)' }}>
                    <label
                      style={{
                        fontSize: 'var(--text-12)',
                        fontWeight: 'var(--weight-semibold)',
                        color: 'var(--color-gray)',
                      }}
                    >
                      ACTION
                    </label>
                    <textarea
                      value={action}
                      onChange={(e) => setAction(e.target.value)}
                      placeholder="Write your trade execution, entry/exit strategy, or next steps here..."
                      className="w-full outline-none border rounded-sm transition-colors duration-200 focus:border-primary resize-none overflow-y-auto placeholder:text-light-gray custom-scrollbar"
                      style={{
                        flex: 1,
                        minHeight: 0,
                        paddingInline: 'var(--space-20)',
                        paddingBlock: 'var(--space-14)',
                        backgroundColor: 'var(--color-off-white)',
                        borderColor: 'var(--color-stroke)',
                        fontSize: 'var(--text-14)',
                        color: 'var(--color-black)',
                        lineHeight: 1.6,
                      }}
                    />
                  </div>
                </div>

                {/* ── Edit Mode Buttons: Cancel / Save ── */}
                <div
                  className="flex"
                  style={{ gap: 'var(--space-20)', marginTop: 'var(--space-20)' }}
                >
                  <button
                    onClick={handleClose}
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
                    onClick={handleSave}
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
                    Save Record
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

    </>
  )
}
