'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { X } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface WorkoutRecord {
  id: string
  date: string      // YYYY-MM-DD
  startTime: string // HH:mm
  duration: number  // minutes
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'thejeewon_workout_records'
const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

// ─── Helpers ─────────────────────────────────────────────────────────────────

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function formatMonthDay(mmdd: string): string {
  const [m, d] = mmdd.split('/').map(Number)
  return `${MONTH_SHORT[m - 1]} ${d}`
}

function getTodayKST(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date())
}

function toDisplayDate(d: string) {
  return d.replace(/-/g, '.')
}

/** Returns Mon-Sun ISO dates for the week offset weeks from current week (0=this, -1=last) */
function getWeekDates(offset = 0): string[] {
  const [y, m, d] = getTodayKST().split('-').map(Number)
  const today = new Date(y, m - 1, d)
  const dayOfWeek = today.getDay() // 0=Sun … 6=Sat
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7) + offset * 7)
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday)
    dt.setDate(monday.getDate() + i)
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(dt)
  })
}

function calcEndTime(startTime: string, duration: number): string {
  const [h, m] = startTime.split(':').map(Number)
  const totalMin = h * 60 + m + duration
  const endH = Math.floor(totalMin / 60) % 24
  const endM = totalMin % 60
  return `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`
}

// ─── StatBox ─────────────────────────────────────────────────────────────────

interface StatBoxProps {
  label: string
  value: string
  unit?: string
  subText: string
  valueColor?: string
  subTextColor?: string
}

function StatBox({
  label,
  value,
  unit = '',
  subText,
  valueColor = 'var(--color-primary)',
  subTextColor = 'var(--color-light-gray)',
}: StatBoxProps) {
  return (
    <div
      className="border rounded-card shrink-0"
      style={{
        width: 'var(--size-stat-w)',
        padding: 'var(--space-22) var(--space-24)',
        backgroundColor: 'var(--color-off-white)',
        borderColor: 'var(--color-stroke)',
      }}
    >
      <p
        style={{
          fontSize: 'var(--text-16)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--color-light-gray)',
          marginBottom: 'var(--space-5)',
        }}
      >
        {label}
      </p>

      <div className="flex items-end" style={{ gap: 'var(--space-7)' }}>
        <span
          style={{
            fontSize: 'var(--text-42)',
            fontWeight: 'var(--weight-bold)',
            color: value === '—' ? 'var(--color-gray)' : valueColor,
            lineHeight: 1,
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            style={{
              fontSize: 'var(--text-26)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-gray)',
              lineHeight: 1.2,
            }}
          >
            {unit}
          </span>
        )}
      </div>

      <p
        style={{
          fontSize: 'var(--text-15)',
          color: subTextColor,
          marginTop: 'var(--space-5)',
        }}
      >
        {subText}
      </p>
    </div>
  )
}

// ─── WorkoutPage ──────────────────────────────────────────────────────────────

export default function WorkoutPage() {
  const [records, setRecords] = useState<WorkoutRecord[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newStartTime, setNewStartTime] = useState('')
  const [newDuration, setNewDuration] = useState('')
  const [chartView, setChartView] = useState<'week' | 'month'>('week')
  const [primaryColor, setPrimaryColor] = useState('#E65787')
  const chartScrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const css = getComputedStyle(document.documentElement)
      .getPropertyValue('--color-primary')
      .trim()
    if (css) setPrimaryColor(css)

    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) {
      try {
        const parsed: WorkoutRecord[] = JSON.parse(stored)
        parsed.sort(
          (a, b) =>
            b.date.localeCompare(a.date) ||
            b.startTime.localeCompare(a.startTime)
        )
        setRecords(parsed)
      } catch {
        setRecords([])
      }
    }
  }, [])

  useEffect(() => {
    requestAnimationFrame(() => {
      if (chartScrollRef.current) {
        chartScrollRef.current.scrollLeft = chartScrollRef.current.scrollWidth
      }
    })
  }, [records, chartView])

  const sortedAsc = useMemo(
    () =>
      [...records].sort(
        (a, b) =>
          a.date.localeCompare(b.date) ||
          a.startTime.localeCompare(b.startTime)
      ),
    [records]
  )

  // Week date ranges (memoized once per session)
  const thisWeekDates = useMemo(() => getWeekDates(0), [])
  const lastWeekDates = useMemo(() => getWeekDates(-1), [])

  const thisWeekRecords = useMemo(
    () => records.filter((r) => thisWeekDates.includes(r.date)),
    [records, thisWeekDates]
  )
  const lastWeekRecords = useMemo(
    () => records.filter((r) => lastWeekDates.includes(r.date)),
    [records, lastWeekDates]
  )

  const totalThisWeek = useMemo(
    () => thisWeekRecords.reduce((sum, r) => sum + r.duration, 0),
    [thisWeekRecords]
  )
  const totalLastWeek = useMemo(
    () => lastWeekRecords.reduce((sum, r) => sum + r.duration, 0),
    [lastWeekRecords]
  )

  const hasWeekData = thisWeekRecords.length > 0 || lastWeekRecords.length > 0
  const weekDelta = hasWeekData ? totalThisWeek - totalLastWeek : null

  const weekDeltaText =
    weekDelta === null
      ? 'Not enough data'
      : weekDelta > 0
      ? `▲ ${weekDelta} min from last week`
      : weekDelta < 0
      ? `▼ ${Math.abs(weekDelta)} min from last week`
      : 'Same as last week'

  const weekDeltaColor =
    weekDelta === null
      ? 'var(--color-light-gray)'
      : weekDelta > 0
      ? 'var(--color-green)'
      : weekDelta < 0
      ? 'var(--color-red)'
      : 'var(--color-gray)'

  const latest = records[0] ?? null
  const avgDuration =
    thisWeekRecords.length > 0
      ? Math.round(totalThisWeek / thisWeekRecords.length)
      : null

  // Chart data
  const chartData = useMemo(() => {
    if (chartView === 'week') {
      const dayMap = new Map<string, number>()
      for (const r of records) {
        if (thisWeekDates.includes(r.date)) {
          dayMap.set(r.date, (dayMap.get(r.date) ?? 0) + r.duration)
        }
      }
      return thisWeekDates.map((date, i) => ({
        date: DAY_NAMES[i],
        duration: dayMap.get(date) ?? 0,
      }))
    }
    // Month view: full history, summed per date
    const dayMap = new Map<string, number>()
    for (const r of sortedAsc) {
      dayMap.set(r.date, (dayMap.get(r.date) ?? 0) + r.duration)
    }
    return Array.from(dayMap.entries()).map(([date, duration]) => ({
      date: date.slice(5).replace('-', '/'),
      duration,
    }))
  }, [sortedAsc, records, chartView, thisWeekDates])

  // Today's X-axis label for highlighting
  const todayLabel = useMemo(() => {
    const kst = getTodayKST()
    if (chartView === 'week') {
      const [y, m, d] = kst.split('-').map(Number)
      return DAY_NAMES[(new Date(y, m - 1, d).getDay() + 6) % 7]
    }
    return kst.slice(5).replace('-', '/')
  }, [chartView])

  // Y-axis ticks: 10-unit intervals up to max duration (min 60)
  const yTicks = useMemo(() => {
    const maxVal = Math.max(...chartData.map((d) => d.duration), 0)
    const maxTick = Math.max(Math.ceil(maxVal / 10) * 10, 60)
    return Array.from({ length: maxTick / 10 + 1 }, (_, i) => i * 10)
  }, [chartData])

  // ─── Handlers ─────────────────────────────────────────────────────────────

  function isValidTime(t: string): boolean {
    const match = t.match(/^(\d{2}):(\d{2})$/)
    if (!match) return false
    const h = parseInt(match[1], 10)
    const m = parseInt(match[2], 10)
    return h >= 0 && h <= 23 && m >= 0 && m <= 59
  }

  function handleStartTimeChange(val: string) {
    const prevDigits = newStartTime.replace(/\D/g, '')
    const digits = val.replace(/\D/g, '').slice(0, 4)

    let formatted = ''
    if (digits.length === 0) {
      formatted = ''
    } else if (digits.length <= 2) {
      // Auto-append colon when exactly 2nd digit is typed (not when deleting)
      if (digits.length === 2 && prevDigits.length < 2) {
        formatted = digits + ':'
      } else {
        formatted = digits
      }
    } else {
      formatted = `${digits.slice(0, 2)}:${digits.slice(2)}`
    }

    setNewStartTime(formatted)
  }

  function handleSave() {
    const dur = parseInt(newDuration, 10)
    if (!newDate || !newStartTime || !newDuration || isNaN(dur) || dur <= 0) return
    if (!isValidTime(newStartTime)) return
    const record: WorkoutRecord = {
      id: String(Date.now()),
      date: newDate,
      startTime: newStartTime,
      duration: dur,
    }
    const updated = [...records, record].sort(
      (a, b) =>
        b.date.localeCompare(a.date) ||
        b.startTime.localeCompare(a.startTime)
    )
    setRecords(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
    handleClose()
  }

  function handleDelete(id: string) {
    if (!window.confirm('Are you sure you want to delete this record?')) return
    const updated = records.filter((r) => r.id !== id)
    setRecords(updated)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  }

  function handleClose() {
    setIsModalOpen(false)
    setNewDate('')
    setNewStartTime('')
    setNewDuration('')
  }

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
          Workout Dashboard
        </h1>
        <p style={{ fontSize: 'var(--text-15)', color: 'var(--color-gray)' }}>
          Rizz through discipline.
        </p>
      </div>

      {/* ── Stat Boxes ── */}
      <div
        className="flex justify-between w-full"
        style={{ marginBottom: 'var(--space-22)' }}
      >
        <StatBox
          label="RECENT SESSION"
          value={latest ? String(latest.duration) : '—'}
          unit="min"
          subText={latest ? toDisplayDate(latest.date) : 'Not enough data'}
          subTextColor="var(--color-light-gray)"
        />
        <StatBox
          label="TOTAL WORKOUT TIME"
          value={String(totalThisWeek)}
          unit="min"
          subText={weekDeltaText}
          subTextColor={weekDeltaColor}
        />
        <StatBox
          label="AVERAGE DURATION"
          value={avgDuration !== null ? String(avgDuration) : '—'}
          unit="min"
          subText={avgDuration !== null ? 'Per session this week' : 'Not enough data'}
        />
      </div>

      {/* ── Chart + Table ── */}
      <div
        className="flex justify-between w-full"
        style={{ maxWidth: 'var(--size-page-w)', marginBottom: 'var(--space-22)' }}
      >
        {/* Chart Card */}
        <div
          className="border rounded-card shrink-0 flex flex-col"
          style={{
            width: 'var(--size-chart-w)',
            height: 'var(--size-chart-h)',
            backgroundColor: 'var(--color-off-white)',
            borderColor: 'var(--color-stroke)',
            padding: 'var(--space-16) var(--space-26)',
          }}
        >
          <div
            className="flex items-center justify-between shrink-0"
            style={{ marginBottom: 'var(--space-45)' }}
          >
            <span
              style={{
                fontSize: 'var(--text-16)',
                fontWeight: 'var(--weight-bold)',
                color: 'var(--color-black)',
              }}
            >
              Daily Workout Tracker
            </span>

            <div className="flex" style={{ gap: 'var(--space-9)' }}>
              {(['week', 'month'] as const).map((v) => {
                const active = chartView === v
                return (
                  <button
                    key={v}
                    onClick={() => setChartView(v)}
                    className="transition-colors duration-200"
                    style={{
                      width: 'var(--size-toggle-w)',
                      height: 'var(--size-toggle-h)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: 'var(--text-12)',
                      fontWeight: active
                        ? 'var(--weight-semibold)'
                        : 'var(--weight-regular)',
                      color: active
                        ? 'var(--color-primary)'
                        : 'var(--color-gray)',
                      backgroundColor: active
                        ? 'var(--color-primary-bg)'
                        : 'var(--color-off-white)',
                      border: active ? 'none' : '1px solid var(--color-stroke)',
                    }}
                  >
                    {v === 'week' ? 'Week' : 'Month'}
                  </button>
                )
              })}
            </div>
          </div>

          <div
            ref={chartScrollRef}
            className="flex-1 overflow-x-auto overflow-y-hidden"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' } as React.CSSProperties}
          >
            <div style={{ minWidth: `max(100%, ${chartData.length * 45}px)`, height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={chartData}
                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="workoutGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%"   stopColor={primaryColor} stopOpacity={0.9} />
                    <stop offset="100%" stopColor={primaryColor} stopOpacity={0.5} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stroke)" vertical={false} />
                <XAxis
                  dataKey="date"
                  interval={0}
                  tick={(tickProps: { x: string | number; y: string | number; payload: { value: string } }) => {
                    const { x, y, payload } = tickProps
                    const isToday = payload.value === todayLabel
                    const label = chartView === 'month' ? formatMonthDay(payload.value) : payload.value
                    return (
                      <text
                        x={x}
                        y={y}
                        dy={6}
                        textAnchor="middle"
                        fontSize={10}
                        fill={isToday ? primaryColor : '#9B9BA5'}
                        fontWeight={isToday ? 600 : 400}
                      >
                        {label}
                      </text>
                    )
                  }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: '#9B9BA5', fontSize: 10 }}
                  tickMargin={10}
                  axisLine={false}
                  tickLine={false}
                  domain={[0, yTicks[yTicks.length - 1]]}
                  ticks={yTicks}
                  allowDecimals={false}
                  width={55}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--color-off-white)',
                    border: '1px solid var(--color-stroke)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '12px',
                    color: 'var(--color-black)',
                  }}
                  formatter={(v: number | undefined) => [`${v ?? ''} min`, 'Duration']}
                />
                <Bar
                  dataKey="duration"
                  fill="url(#workoutGradient)"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Table Card */}
        <div
          className="border rounded-card shrink-0 flex flex-col"
          style={{
            width: 'var(--size-table-w)',
            height: 'var(--size-table-h)',
            backgroundColor: 'var(--color-off-white)',
            borderColor: 'var(--color-stroke)',
            padding: 'var(--space-16) var(--space-24)',
          }}
        >
          <h2
            className="shrink-0"
            style={{
              fontSize: 'var(--text-16)',
              fontWeight: 'var(--weight-bold)',
              color: 'var(--color-black)',
              marginBottom: 'var(--space-20)',
            }}
          >
            Recent Workouts
          </h2>

          <div className="flex-1 overflow-y-auto">
            {/* Header row */}
            <div
              className="grid grid-cols-2"
              style={{
                height: '40px',
                paddingBlock: 'var(--space-10)',
                borderRadius: 'var(--radius-row)',
                backgroundColor: 'var(--color-bg)',
              }}
            >
              <span
                className="text-center"
                style={{
                  fontSize: 'var(--text-12)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-light-gray)',
                }}
              >
                DATE & TIME
              </span>
              <span
                className="text-center"
                style={{
                  fontSize: 'var(--text-12)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-light-gray)',
                }}
              >
                DURATION
              </span>
            </div>

            {/* Data rows */}
            {records.map((r, i) => {
              const endTime = calcEndTime(r.startTime, r.duration)
              return (
                <div
                  key={r.id}
                  className="grid grid-cols-2 items-center transition-colors duration-200 cursor-context-menu"
                  onContextMenu={(e) => {
                    e.preventDefault()
                    handleDelete(r.id)
                  }}
                  style={{
                    minHeight: '50px',
                    paddingBlock: 'var(--space-8)',
                    borderRadius: 'var(--radius-row)',
                    backgroundColor:
                      i % 2 === 0
                        ? 'var(--color-off-white)'
                        : 'var(--color-bg)',
                  }}
                >
                  {/* DATE & TIME — two lines */}
                  <div className="flex flex-col items-center">
                    <span
                      style={{
                        fontSize: 'var(--text-12)',
                        color: 'var(--color-black)',
                      }}
                    >
                      {toDisplayDate(r.date)}
                    </span>
                    <span
                      style={{
                        fontSize: 'var(--text-10)',
                        color: 'var(--color-gray)',
                      }}
                    >
                      {r.startTime} - {endTime}
                    </span>
                  </div>

                  {/* DURATION */}
                  <span
                    className="text-center"
                    style={{
                      fontSize: 'var(--text-12)',
                      fontWeight: 'var(--weight-semibold)',
                      color:
                        i === 0
                          ? 'var(--color-primary)'
                          : 'var(--color-black)',
                    }}
                  >
                    {r.duration} min
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── CTA Button ── */}
      <button
        onClick={() => {
          setNewDate(getTodayKST())
          setIsModalOpen(true)
        }}
        className="w-full transition-all duration-200 hover:opacity-90 active:opacity-80"
        style={{
          height: 'var(--size-btn-h)',
          backgroundColor: 'var(--color-primary)',
          borderRadius: 'var(--radius-cta)',
          fontSize: 'var(--text-14)',
          fontWeight: 'var(--weight-semibold)',
          color: 'var(--color-off-white)',
        }}
      >
        + Add New Workout Session
      </button>

      {/* ── Modal ── */}
      {isModalOpen && (
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
              width: 'calc(var(--size-modal-inner-w) + var(--space-37) * 2)',
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
                  Add New Workout Session
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

            {/* Modal Fields */}
            <div
              className="flex flex-col"
              style={{ marginTop: 'var(--space-30)', gap: 'var(--space-19)' }}
            >
              {/* DATE */}
              <div className="flex flex-col" style={{ gap: 'var(--space-10)' }}>
                <label
                  style={{
                    fontSize: 'var(--text-12)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-gray)',
                  }}
                >
                  DATE
                </label>
                <input
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  className="w-full outline-none border rounded-sm transition-colors duration-200 focus:border-primary"
                  style={{
                    height: 'var(--size-input-h)',
                    paddingInline: 'var(--space-20)',
                    paddingBlock: 'var(--space-14)',
                    backgroundColor: 'var(--color-off-white)',
                    borderColor: 'var(--color-stroke)',
                    fontSize: 'var(--text-14)',
                    color: 'var(--color-black)',
                    accentColor: '#E65787',
                  }}
                />
              </div>

              {/* START TIME */}
              <div className="flex flex-col" style={{ gap: 'var(--space-10)' }}>
                <label
                  style={{
                    fontSize: 'var(--text-12)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-gray)',
                  }}
                >
                  START TIME
                </label>
                <input
                  type="text"
                  value={newStartTime}
                  onChange={(e) => handleStartTimeChange(e.target.value)}
                  placeholder="Enter start time"
                  className="w-full outline-none border rounded-sm transition-colors duration-200 focus:border-primary placeholder:text-light-gray"
                  style={{
                    height: 'var(--size-input-h)',
                    paddingInline: 'var(--space-20)',
                    paddingBlock: 'var(--space-14)',
                    backgroundColor: 'var(--color-off-white)',
                    borderColor: 'var(--color-stroke)',
                    fontSize: 'var(--text-14)',
                    color: 'var(--color-black)',
                  }}
                />
              </div>

              {/* DURATION */}
              <div className="flex flex-col" style={{ gap: 'var(--space-10)' }}>
                <label
                  style={{
                    fontSize: 'var(--text-12)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-gray)',
                  }}
                >
                  DURATION
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    value={newDuration}
                    onChange={(e) => setNewDuration(e.target.value)}
                    placeholder="Enter duration"
                    className="w-full outline-none border rounded-sm transition-colors duration-200 focus:border-primary placeholder:text-light-gray"
                    style={{
                      height: 'var(--size-input-h)',
                      paddingInline: 'var(--space-20)',
                      paddingRight: '52px',
                      paddingBlock: 'var(--space-14)',
                      backgroundColor: 'var(--color-off-white)',
                      borderColor: 'var(--color-stroke)',
                      fontSize: 'var(--text-14)',
                      color: 'var(--color-black)',
                    }}
                  />
                  <span
                    className="absolute right-0 top-0 flex items-center justify-center pointer-events-none"
                    style={{
                      width: '52px',
                      height: 'var(--size-input-h)',
                      fontSize: 'var(--text-14)',
                      color: 'var(--color-light-gray)',
                    }}
                  >
                    min
                  </span>
                </div>
              </div>

            </div>

            {/* Modal Buttons */}
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
          </div>
        </div>
      )}
      </div>
    </>
  )
}
