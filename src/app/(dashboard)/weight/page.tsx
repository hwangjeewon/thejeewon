'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { X } from 'lucide-react'

// ─── Types ───────────────────────────────────────────────────────────────────

interface WeightRecord {
  id: string
  date: string // YYYY-MM-DD
  weight: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = 'thejeewon_weight_records'


// ─── Helpers ─────────────────────────────────────────────────────────────────

function getTodayKST(): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(new Date())
}

function toDisplayDate(d: string) {
  return d.replace(/-/g, '.')
}

function toChartLabel(d: string) {
  const [, m, day] = d.split('-')
  return `${m}/${day}`
}

const MONTH_SHORT = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
function formatMonthDay(mmdd: string): string {
  const [m, d] = mmdd.split('/').map(Number)
  return `${MONTH_SHORT[m - 1]} ${d}`
}

function getRelativeDateLabel(dateISO: string): string {
  const today = getTodayKST()
  const [ty, tm, td] = today.split('-').map(Number)
  const yesterdayDt = new Date(ty, tm - 1, td)
  yesterdayDt.setDate(yesterdayDt.getDate() - 1)
  const yesterday = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(yesterdayDt)
  if (dateISO === today) return 'Today'
  if (dateISO === yesterday) return 'Yesterday'
  return toDisplayDate(dateISO)
}

function daysAgoISO(n: number) {
  const [y, m, d] = getTodayKST().split('-').map(Number)
  const dt = new Date(y, m - 1, d)
  dt.setDate(dt.getDate() - n)
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(dt)
}

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function getWeekDates(): string[] {
  const [y, m, d] = getTodayKST().split('-').map(Number)
  const today = new Date(y, m - 1, d)
  const dayOfWeek = today.getDay() // 0=Sun … 6=Sat
  const monday = new Date(today)
  monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7))
  return Array.from({ length: 7 }, (_, i) => {
    const dt = new Date(monday)
    dt.setDate(monday.getDate() + i)
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Seoul' }).format(dt)
  })
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

// ─── WeightPage ───────────────────────────────────────────────────────────────

export default function WeightPage() {
  const [records, setRecords] = useState<WeightRecord[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [newDate, setNewDate] = useState('')
  const [newWeight, setNewWeight] = useState('')
  const [chartView, setChartView] = useState<'week' | 'month'>('week')
  // Read CSS variable after mount for recharts SVG attrs
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
        const parsed: WeightRecord[] = JSON.parse(stored)
        parsed.sort((a, b) => b.date.localeCompare(a.date))
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

  // Ascending (oldest → newest) for chart
  const sortedAsc = useMemo(
    () => [...records].sort((a, b) => a.date.localeCompare(b.date)),
    [records]
  )

  // Today's X-axis label for highlighting
  const todayLabel = useMemo(() => {
    const kst = getTodayKST()
    if (chartView === 'week') {
      const [y, m, d] = kst.split('-').map(Number)
      return DAY_NAMES[(new Date(y, m - 1, d).getDay() + 6) % 7]
    }
    return kst.slice(5).replace('-', '/')
  }, [chartView])

  // Filtered chart data
  const chartData = useMemo(() => {
    if (chartView === 'week') {
      const weekDates = getWeekDates()
      const recordMap = new Map(sortedAsc.map((r) => [r.date, r.weight]))
      return weekDates.map((date, i) => ({
        date: DAY_NAMES[i],
        weight: recordMap.get(date) ?? null,
      }))
    }
    const cutoff = daysAgoISO(30)
    const filtered = sortedAsc.filter((r) => r.date >= cutoff)
    const source = filtered.length >= 2 ? filtered : sortedAsc
    if (source.length === 0) return DAY_NAMES.map((d) => ({ date: d, weight: null }))
    return source.map((r) => ({ date: toChartLabel(r.date), weight: r.weight }))
  }, [sortedAsc, chartView])

  const isChartEmpty = useMemo(
    () => chartData.every((d) => d.weight === null),
    [chartData]
  )

  const displayChartData = useMemo(
    () => (isChartEmpty ? chartData.map((d) => ({ ...d, weight: 43 })) : chartData),
    [chartData, isChartEmpty]
  )

  // Derived stat values
  const latest = records[0] ?? null
  const currentWeight = latest?.weight ?? null

  // First recorded weight of the current week (Monday start)
  const weekStartingRecord = useMemo(() => {
    const monday = getWeekDates()[0] // 'YYYY-MM-DD' of this Monday
    const thisWeek = sortedAsc.filter((r) => r.date >= monday)
    return thisWeek[0] ?? null
  }, [sortedAsc])
  const prevRecord = records.length >= 2 ? records[1] : null
  const weightDelta =
    latest && prevRecord
      ? +(latest.weight - prevRecord.weight).toFixed(1)
      : null
  const recentDate = latest ? toDisplayDate(latest.date) : '—'

  const deltaPositive = weightDelta !== null && weightDelta > 0
  const deltaNegative = weightDelta !== null && weightDelta < 0
  const deltaColor = deltaPositive
    ? 'var(--color-red)'
    : deltaNegative
    ? 'var(--color-green)'
    : 'var(--color-gray)'
  const deltaArrow = deltaPositive ? '▲ ' : deltaNegative ? '▼ ' : ''

  // % change from previous record (for WEIGHT CHANGE sub-text)
  const prevPos = !!(latest && prevRecord && latest.weight > prevRecord.weight)
  const prevNeg = !!(latest && prevRecord && latest.weight < prevRecord.weight)
  const pctFromPrev =
    latest && prevRecord
      ? Math.abs(
          ((latest.weight - prevRecord.weight) / prevRecord.weight) * 100
        ).toFixed(1)
      : null
  const prevSubText =
    pctFromPrev !== null && prevRecord
      ? `${prevNeg ? '▼ Down' : prevPos ? '▲ Up' : ''} ${pctFromPrev}% from ${getRelativeDateLabel(prevRecord.date).toLowerCase()}`
      : 'Not enough data'
  const prevSubColor =
    pctFromPrev === null
      ? 'var(--color-light-gray)'
      : prevPos
      ? 'var(--color-red)'
      : prevNeg
      ? 'var(--color-green)'
      : 'var(--color-gray)'

  // Save handler
  function handleSave() {
    const w = parseFloat(newWeight)
    if (!newDate || !newWeight || isNaN(w) || w <= 0) return
    const record: WeightRecord = {
      id: String(Date.now()),
      date: newDate,
      weight: +w.toFixed(1),
    }
    const updated = [...records, record].sort((a, b) =>
      b.date.localeCompare(a.date)
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
    setNewWeight('')
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
          Weight Dashboard
        </h1>
        <p style={{ fontSize: 'var(--text-15)', color: 'var(--color-gray)' }}>
          You are what you eat
        </p>
      </div>

      {/* ── Stat Boxes ── */}
      <div
        className="flex justify-between w-full"
        style={{ marginBottom: 'var(--space-22)' }}
      >
        <StatBox
          label="CURRENT WEIGHT"
          value={currentWeight !== null ? currentWeight.toFixed(1) : '—'}
          unit="kg"
          subText={currentWeight !== null && latest ? `Last updated: ${getRelativeDateLabel(latest.date)}` : 'Not enough data'}
        />
        <StatBox
          label="WEIGHT CHANGE"
          value={weightDelta !== null ? String(Math.abs(weightDelta)) : '—'}
          unit="kg"
          subText={prevSubText}
          valueColor="var(--color-primary)"
          subTextColor={prevSubColor}
        />
        <StatBox
          label="STARTING WEIGHT"
          value={weekStartingRecord !== null ? weekStartingRecord.weight.toFixed(1) : '—'}
          unit="kg"
          subText={weekStartingRecord ? toDisplayDate(weekStartingRecord.date) : 'Not enough data'}
          valueColor="var(--color-gray)"
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
          {/* Card header */}
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
              Daily Weight Tracker
            </span>

            {/* Week / Month toggle */}
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

          {/* Recharts area chart */}
          <div
            ref={chartScrollRef}
            className="flex-1 overflow-x-auto overflow-y-hidden"
            style={{ msOverflowStyle: 'none', scrollbarWidth: 'none' } as React.CSSProperties}
          >
            <div style={{ minWidth: `max(100%, ${displayChartData.length * 45}px)`, height: '100%' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={displayChartData}
                margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
              >
                <defs>
                  <linearGradient id="wGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop
                      offset="5%"
                      stopColor={primaryColor}
                      stopOpacity={0.25}
                    />
                    <stop
                      offset="95%"
                      stopColor={primaryColor}
                      stopOpacity={0.03}
                    />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-stroke)" vertical={false} />
                <XAxis
                  dataKey="date"
                  type="category"
                  interval={0}
                  padding={{ left: 30, right: 30 }}
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
                  domain={[40, 47]}
                  ticks={[40, 41, 42, 43, 44, 45, 46, 47]}
                  allowDecimals={false}
                  width={55}
                />
                {!isChartEmpty && (
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--color-off-white)',
                      border: '1px solid var(--color-stroke)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '12px',
                      color: 'var(--color-black)',
                    }}
                    formatter={(v: number | undefined) => [`${v ?? ''} kg`, 'Weight']}
                  />
                )}
                <Area
                  type="monotone"
                  dataKey="weight"
                  stroke={isChartEmpty ? 'none' : primaryColor}
                  strokeWidth={isChartEmpty ? 0 : 2}
                  fill={isChartEmpty ? 'none' : 'url(#wGrad)'}
                  dot={isChartEmpty ? false : { fill: primaryColor, r: 4, strokeWidth: 0 }}
                  activeDot={isChartEmpty ? false : { r: 6, fill: primaryColor, strokeWidth: 0 }}
                  connectNulls={true}
                />
              </AreaChart>
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
            Recent Records
          </h2>

          <div className="flex-1 overflow-y-auto custom-scrollbar">
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
                DATE
              </span>
              <span
                className="text-center"
                style={{
                  fontSize: 'var(--text-12)',
                  fontWeight: 'var(--weight-semibold)',
                  color: 'var(--color-light-gray)',
                }}
              >
                WEIGHT
              </span>
            </div>

            {/* Data rows — right-click to delete, latest (index 0) gets primary color */}
            {records.map((r, i) => (
              <div
                key={r.id}
                className="grid grid-cols-2 transition-colors duration-200 cursor-context-menu"
                onContextMenu={(e) => {
                  e.preventDefault()
                  handleDelete(r.id)
                }}
                style={{
                  height: '40px',
                  paddingBlock: 'var(--space-10)',
                  borderRadius: 'var(--radius-row)',
                  backgroundColor:
                    i % 2 === 0
                      ? 'var(--color-off-white)'
                      : 'var(--color-bg)',
                }}
              >
                <span
                  className="text-center"
                  style={{
                    fontSize: 'var(--text-12)',
                    color: 'var(--color-black)',
                  }}
                >
                  {toDisplayDate(r.date)}
                </span>
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
                  {r.weight} kg
                </span>
              </div>
            ))}
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
        + Add New Weight Record
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
              /* inner width 323px + padding 37×2 = 397px */
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
                  Add New Weight Record
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
              <div
                className="flex flex-col"
                style={{ gap: 'var(--space-10)' }}
              >
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

              {/* WEIGHT */}
              <div
                className="flex flex-col"
                style={{ gap: 'var(--space-10)' }}
              >
                <label
                  style={{
                    fontSize: 'var(--text-12)',
                    fontWeight: 'var(--weight-semibold)',
                    color: 'var(--color-gray)',
                  }}
                >
                  WEIGHT
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    value={newWeight}
                    onChange={(e) => setNewWeight(e.target.value)}
                    placeholder="Enter weight"
                    className="w-full outline-none border rounded-sm transition-colors duration-200 focus:border-primary placeholder:text-light-gray"
                    style={{
                      height: 'var(--size-input-h)',
                      paddingInline: 'var(--space-20)',
                      paddingRight: '48px',
                      paddingBlock: 'var(--space-14)',
                      backgroundColor: 'var(--color-off-white)',
                      borderColor: 'var(--color-stroke)',
                      fontSize: 'var(--text-14)',
                      color: 'var(--color-black)',
                    }}
                  />
                  {/* kg unit indicator */}
                  <span
                    className="absolute right-0 top-0 flex items-center justify-center pointer-events-none"
                    style={{
                      width: '48px',
                      height: 'var(--size-input-h)',
                      fontSize: 'var(--text-14)',
                      color: 'var(--color-light-gray)',
                    }}
                  >
                    kg
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
