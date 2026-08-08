'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────

interface CourseBlock {
  id: string
  courseId: string
  name: string
  professor: string
  room: string
  day: 1 | 2 | 3 | 4 | 5
  startTime: string
  endTime: string
  colors: { bg: string; border: string; text: string }
}

interface Task {
  id: string
  courseId: string
  content: string
  isCompleted: boolean
}

// ─────────────────────────────────────────────────────────────
// Grid constants
// ─────────────────────────────────────────────────────────────

const TIMETABLE_W = 1080
const TIME_COL_W  = 130
const HEADER_H    = 60
const HOUR_H      = 56
const START_HOUR  = 9
const HOUR_LABELS = [9, 10, 11, 12, 13, 14, 15, 16, 17, 18]
const BODY_H      = HOUR_LABELS.length * HOUR_H  // 560

// ─────────────────────────────────────────────────────────────
// Data
// ─────────────────────────────────────────────────────────────

const TASK_STORAGE_KEY = 'thejeewon_school_tasks'

const DAY_EN = ['MON', 'TUE', 'WED', 'THU', 'FRI'] as const
const DAY_KO = ['월요일', '화요일', '수요일', '목요일', '금요일']

const COURSES_26_1: CourseBlock[] = [
  {
    id: 'philosophy', courseId: 'philosophy',
    name: '철학의세계', professor: '김은미', room: '303관 404호',
    day: 1, startTime: '09:00', endTime: '12:00',
    colors: { bg: 'rgba(var(--color-primary-rgb), 0.95)', border: 'none', text: '#F8F9FA' },
  },
  {
    id: 'startup', courseId: 'startup',
    name: '창업투자와 M&A(종합설계)', professor: '최용석', room: '310관 721호',
    day: 2, startTime: '12:00', endTime: '15:00',
    colors: { bg: 'rgba(var(--color-primary-rgb), 0.95)', border: 'none', text: '#F8F9FA' },
  },
  {
    id: 'bizsoft', courseId: 'bizsoft',
    name: '경영경제 소프트웨어 프로그래밍', professor: '박철우', room: '310관 809호',
    day: 2, startTime: '15:00', endTime: '18:00',
    colors: { bg: 'rgba(var(--color-primary-rgb), 0.95)', border: 'none', text: '#F8F9FA' },
  },
  {
    id: 'venture', courseId: 'venture',
    name: '벤처창업 경영론', professor: '최용석', room: '310관 801호',
    day: 1, startTime: '15:00', endTime: '18:00',
    colors: { bg: 'rgba(var(--color-primary-rgb), 0.95)', border: 'none', text: '#F8F9FA' },
  },
  {
    id: 'basic-cs', courseId: 'basic-cs',
    name: '기초컴퓨터프로그래밍', professor: '배주화', room: '310관 B311호',
    day: 3, startTime: '15:00', endTime: '18:00',
    colors: { bg: 'rgba(var(--color-primary-rgb), 0.95)', border: 'none', text: '#F8F9FA' },
  },
  {
    id: 'strategy', courseId: 'strategy',
    name: '경영전략(캡스톤디자인)', professor: '위정현', room: '310관 926호',
    day: 5, startTime: '09:00', endTime: '12:00',
    colors: { bg: 'rgba(var(--color-primary-rgb), 0.95)', border: 'none', text: '#F8F9FA' },
  },
  {
    id: 'swproj', courseId: 'swproj',
    name: '소프트웨어프로젝트', professor: '김기락', room: '310관 B210호',
    day: 5, startTime: '15:00', endTime: '18:00',
    colors: { bg: 'rgba(var(--color-primary-rgb), 0.95)', border: 'none', text: '#F8F9FA' },
  },
]

const COURSES_26_2: CourseBlock[] = [
  {
    id: 'oop', courseId: 'oop',
    name: '객체지향프로그래밍(영어A강의)', professor: '손봉수', room: '310관 727호',
    day: 5, startTime: '12:00', endTime: '15:00',
    colors: { bg: 'rgba(var(--color-primary-rgb), 0.95)', border: 'none', text: '#F8F9FA' },
  },
]

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────

function parseHour(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h + m / 60
}

function timeToBodyY(time: string): number {
  return (parseHour(time) - START_HOUR) * HOUR_H
}

function blockHeight(start: string, end: string): number {
  return (parseHour(end) - parseHour(start)) * HOUR_H
}

function getTodayWeekday(): number {
  return new Date().getDay()
}

function taskSortWeight(content: string): number {
  const ch = content.trimStart()[0] ?? ''
  if (/[A-Za-z]/.test(ch)) return 1
  if (/[\uAC00-\uD7A3\u3131-\u314E\u314F-\u3163]/.test(ch)) return 2
  if (/[0-9]/.test(ch)) return 3
  return 4
}

function compareTaskContent(ca: string, cb: string): number {
  const numA = parseInt(ca.match(/^(\d+)/)?.[1] ?? '', 10)
  const numB = parseInt(cb.match(/^(\d+)/)?.[1] ?? '', 10)
  if (!isNaN(numA) && !isNaN(numB)) {
    if (numA !== numB) return numA - numB
    // same leading number: plain "6차시" before range "6-7차시"
    const aIsRange = ca.charAt(String(numA).length) === '-'
    const bIsRange = cb.charAt(String(numB).length) === '-'
    if (aIsRange !== bIsRange) return aIsRange ? 1 : -1
  }
  return ca.localeCompare(cb, undefined, { sensitivity: 'base', numeric: true })
}

function compareTasks(a: Task, b: Task): number {
  const wa = taskSortWeight(a.content)
  const wb = taskSortWeight(b.content)
  if (wa !== wb) return wa - wb
  return compareTaskContent(a.content, b.content)
}

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────

export default function SchoolPage() {
  const [semester, setSemester]               = useState<'26-1' | '26-2'>('26-2')
  const [tasks, setTasks]                     = useState<Task[]>([])
  const [selectedCourse, setSelectedCourse]   = useState<CourseBlock | null>(null)
  const [drawerOpen, setDrawerOpen]           = useState(false)
  const [newTaskContent, setNewTaskContent]   = useState('')
  const [showAddInput, setShowAddInput]       = useState(false)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [addBtnHover, setAddBtnHover]         = useState(false)
  const [hoveredBlock, setHoveredBlock]       = useState<string | null>(null)

  const drawerRef   = useRef<HTMLDivElement>(null)
  const addInputRef = useRef<HTMLDivElement>(null)

  const todayDay = getTodayWeekday()

  useEffect(() => {
    const raw = localStorage.getItem(TASK_STORAGE_KEY)
    if (raw) { try { setTasks(JSON.parse(raw)) } catch { /* noop */ } }
  }, [])

  const courses = semester === '26-1' ? COURSES_26_1 : COURSES_26_2

  const courseTasks = useMemo(
    () => tasks
      .filter(t => selectedCourse && t.courseId === selectedCourse.courseId)
      .sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) return a.isCompleted ? 1 : -1
        return compareTasks(a, b)
      }),
    [tasks, selectedCourse],
  )

  function openDrawer(course: CourseBlock) {
    setSelectedCourse(course)
    setShowAddInput(false)
    setNewTaskContent('')
    setDeleteConfirmId(null)
    // small delay so the drawer mounts first, then animates in
    requestAnimationFrame(() => setDrawerOpen(true))
  }

  function closeDrawer() {
    setDrawerOpen(false)
    setTimeout(() => {
      setSelectedCourse(null)
      setShowAddInput(false)
      setNewTaskContent('')
      setDeleteConfirmId(null)
    }, 300)
  }

  function addTask() {
    const content = newTaskContent.trim()
    if (!content || !selectedCourse) return
    const updated = [...tasks, {
      id: Date.now().toString(),
      courseId: selectedCourse.courseId,
      content,
      isCompleted: false,
    }]
    setTasks(updated)
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(updated))
    setNewTaskContent('')
    setShowAddInput(false)
  }

  function toggleTask(id: string) {
    const updated = tasks.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t)
    setTasks(updated)
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(updated))
  }

  function deleteTask() {
    if (!deleteConfirmId) return
    const updated = tasks.filter(t => t.id !== deleteConfirmId)
    setTasks(updated)
    localStorage.setItem(TASK_STORAGE_KEY, JSON.stringify(updated))
    setDeleteConfirmId(null)
  }

  // Click-outside to cancel add-input
  function handleDrawerClick(e: React.MouseEvent) {
    if (showAddInput && addInputRef.current && !addInputRef.current.contains(e.target as Node)) {
      setShowAddInput(false)
      setNewTaskContent('')
    }
  }

  // ─────────────────────────────────────────────────────────────
  // Render
  // ─────────────────────────────────────────────────────────────

  return (
    <>
      <div className="w-full" style={{ maxWidth: 'var(--size-page-w)', paddingBottom: 'var(--space-40)' }}>

      {/* ── Page header ── */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'var(--space-20)',
      }}>
        <div className="flex flex-col" style={{ gap: 'var(--space-5)' }}>
          <h1 style={{ fontSize: 'var(--text-26)', fontWeight: 'var(--weight-bold)', color: 'var(--color-black)' }}>
            School Dashboard
          </h1>
          <p style={{ fontSize: 'var(--text-15)', color: 'var(--color-gray)' }}>
            Last one, best one.
          </p>
        </div>

        {/* Semester tabs */}
        <div style={{ display: 'flex', gap: 9 }}>
          {(['26-1', '26-2'] as const).map(sem => {
            const active = semester === sem
            return (
              <button key={sem} onClick={() => setSemester(sem)} style={{
                width: 64, height: 29, borderRadius: 4, fontSize: 12,
                fontWeight: active ? 600 : 400,
                color: active ? 'var(--color-primary)' : 'var(--color-gray)',
                background: active ? 'var(--color-primary-bg)' : 'var(--color-off-white)',
                border: active ? 'none' : '1px solid var(--color-stroke)',
                cursor: 'pointer', transition: 'var(--transition-colors)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {sem}
              </button>
            )
          })}
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          Timetable
         ══════════════════════════════════════════════════════ */}
      <div style={{
        width: TIMETABLE_W,
        background: '#fff',
        borderRadius: 12,
        border: '1px solid var(--color-stroke)',
        overflow: 'hidden',
        paddingLeft: 28,
        paddingRight: 28,
        paddingTop: 32,
        paddingBottom: 32,
      }}>

        <>
            {/* ── Header row ── */}
            <div style={{
              display: 'flex',
              height: HEADER_H,
              borderBottom: '1px solid var(--color-stroke)',
              alignItems: 'center',
            }}>
              <div style={{
                width: TIME_COL_W, flexShrink: 0,
                textAlign: 'left',
                paddingLeft: 44,
                fontSize: 11, fontWeight: 400,
                color: 'var(--color-light-gray)',
              }}>
                TIME
              </div>
              {DAY_EN.map((label, i) => {
                const isToday = todayDay === i + 1
                return (
                  <div key={label} style={{
                    flex: 1,
                    borderLeft: '1px solid var(--color-stroke)',
                    height: '100%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 600,
                    color: isToday ? 'var(--color-primary)' : 'var(--color-light-gray)',
                  }}>
                    {label}
                  </div>
                )
              })}
            </div>

            {/* ── Body ── */}
            <div style={{ display: 'flex', height: BODY_H, position: 'relative' }}>

              {/* Full-width dashed hour lines */}
              {HOUR_LABELS.map((_, i) => (
                <div key={i} style={{
                  position: 'absolute',
                  top: i * HOUR_H,
                  left: 0, right: 0,
                  borderTop: i === 0 ? 'none' : '1px dashed var(--color-stroke)',
                  pointerEvents: 'none',
                  zIndex: 0,
                }} />
              ))}

              {/* ── Time label column ── */}
              <div style={{ width: TIME_COL_W, flexShrink: 0, position: 'relative', zIndex: 1 }}>
                <svg width={TIME_COL_W} height={BODY_H} style={{ display: 'block' }}>
                  {HOUR_LABELS.map((h, i) => (
                    <text
                      key={h}
                      x={44}
                      y={i * HOUR_H + HOUR_H / 2}
                      dominantBaseline="central"
                      textAnchor="start"
                      fontSize="11"
                      fontWeight="400"
                      fill="#9B9BA5"
                      fontFamily="Pretendard, -apple-system, sans-serif"
                    >
                      {h}:00
                    </text>
                  ))}
                </svg>
              </div>

              {/* ── Day columns ── */}
              {([1, 2, 3, 4, 5] as const).map(day => (
                <div key={day} style={{
                  flex: 1,
                  borderLeft: '1px solid var(--color-stroke)',
                  position: 'relative',
                  zIndex: 1,
                }}>
                  {courses.filter(c => c.day === day).map(course => {
                    const top    = timeToBodyY(course.startTime) + 5
                    const height = blockHeight(course.startTime, course.endTime) - 10
                    return (
                      <button
                        key={course.id}
                        onClick={() => openDrawer(course)}
                        onMouseEnter={() => setHoveredBlock(course.id)}
                        onMouseLeave={() => setHoveredBlock(null)}
                        style={{
                          position: 'absolute',
                          top, left: 6, right: 6, height,
                          background: course.colors.bg,
                          border: course.colors.border === 'none' ? 'none' : `1.5px solid ${course.colors.border}`,
                          borderRadius: 4,
                          cursor: 'pointer',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'flex-start', justifyContent: 'flex-start',
                          padding: '10px 10px',
                          textAlign: 'left', overflow: 'hidden',
                          zIndex: hoveredBlock === course.id ? 3 : 2,
                          transition: 'transform 300ms ease-in-out, box-shadow 300ms ease-in-out, filter 300ms ease-in-out',
                          transform: hoveredBlock === course.id ? 'scale(1.01) translateY(-2px)' : 'scale(1) translateY(0)',
                          boxShadow: hoveredBlock === course.id ? '0 4px 12px rgba(0,0,0,0.10)' : '0 1px 2px rgba(0,0,0,0.04)',
                          filter: hoveredBlock === course.id ? 'brightness(1.05)' : 'brightness(1)',
                        }}
                      >
                        <span style={{
                          fontSize: 11, fontWeight: 600,
                          color: course.colors.text,
                          lineHeight: 1.4,
                          marginBottom: 5,
                          display: '-webkit-box', width: '100%',
                          overflow: 'hidden', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical',
                          whiteSpace: 'normal', wordBreak: 'break-word',
                          fontFamily: 'Pretendard, -apple-system, sans-serif',
                        }}>
                          {course.name}
                        </span>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                          <span style={{ fontSize: 9, color: course.colors.text, lineHeight: 1, fontFamily: 'Pretendard, -apple-system, sans-serif' }}>
                            {course.professor}
                          </span>
                          <span style={{ fontSize: 9, color: course.colors.text, lineHeight: 1, fontFamily: 'Pretendard, -apple-system, sans-serif' }}>
                            {course.room}
                          </span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ))}
            </div>
        </>
      </div>
      {/* ════════════════════════════════════════════════════════ */}

      {/* ── Dim backdrop ── */}
      {selectedCourse && (
        <div
          style={{
            position: 'fixed', inset: 0,
            background: 'rgba(22,22,22,0.8)',
            zIndex: 100,
            opacity: drawerOpen ? 1 : 0,
            transition: 'opacity 300ms ease',
          }}
          onClick={closeDrawer}
        />
      )}

      {/* ── Task Drawer (slide-in from right) ── */}
      {selectedCourse && (
        <div
          ref={drawerRef}
          onClick={handleDrawerClick}
          style={{
            position: 'fixed', top: 0, right: 0, bottom: 0,
            width: 790, background: '#fff', zIndex: 101,
            overflowY: 'auto', padding: '43px 23px',
            transform: drawerOpen ? 'translateX(0)' : 'translateX(100%)',
            transition: 'transform 300ms cubic-bezier(0.32, 0.72, 0, 1)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 26, width: 677, margin: '0 auto' }}>

            {/* Course info card */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              <div style={{
                background: '#fff', border: '1px solid var(--color-stroke)',
                borderRadius: 12, height: 144,
                display: 'flex', alignItems: 'center', gap: 40, overflow: 'hidden',
              }}>
                {/* Left accent bar */}
                <div style={{
                  width: 11, alignSelf: 'stretch', flexShrink: 0,
                  background: selectedCourse.colors.bg,
                }} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1, paddingRight: 24 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-black)', lineHeight: 'normal' }}>
                      {selectedCourse.name}
                    </h2>
                    <div style={{ height: 1, background: 'var(--color-stroke)' }} />
                  </div>
                  <div style={{ display: 'flex', gap: 112, alignItems: 'center' }}>
                    {[
                      { label: '교수',   value: selectedCourse.professor },
                      { label: '강의실', value: selectedCourse.room },
                      { label: '시간',   value: `${DAY_KO[selectedCourse.day - 1]} ${selectedCourse.startTime} - ${selectedCourse.endTime}` },
                    ].map(({ label, value }) => (
                      <div key={label} style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                        <span style={{ fontSize: 11, color: 'var(--color-gray)', lineHeight: 'normal' }}>{label}</span>
                        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-black)', lineHeight: 'normal' }}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div style={{ height: 1, background: 'var(--color-stroke)' }} />
            </div>

            {/* Tasks section */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--color-black)' }}>Tasks</span>
                <span style={{ fontSize: 12, color: 'var(--color-light-gray)' }}>{courseTasks.length} items</span>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {courseTasks.filter(t => !t.isCompleted).map(task => (
                  <TaskRow key={task.id} task={task} deleteConfirmId={deleteConfirmId}
                    onToggle={() => toggleTask(task.id)}
                    onDeleteRequest={() => setDeleteConfirmId(task.id)}
                    onDeleteConfirm={deleteTask}
                    onDeleteCancel={() => setDeleteConfirmId(null)} />
                ))}
                {courseTasks.filter(t => t.isCompleted).map(task => (
                  <TaskRow key={task.id} task={task} deleteConfirmId={deleteConfirmId}
                    onToggle={() => toggleTask(task.id)}
                    onDeleteRequest={() => setDeleteConfirmId(task.id)}
                    onDeleteConfirm={deleteTask}
                    onDeleteCancel={() => setDeleteConfirmId(null)} />
                ))}

                {/* Add input */}
                {showAddInput && (
                  <div
                    ref={addInputRef}
                    style={{
                      background: 'var(--color-white)', border: '1px solid var(--color-primary)',
                      borderRadius: 12, height: 64,
                      display: 'flex', alignItems: 'center', padding: '0 16px', gap: 12,
                    }}
                  >
                    <input
                      autoFocus type="text" value={newTaskContent}
                      onChange={e => setNewTaskContent(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') addTask()
                        if (e.key === 'Escape') { setShowAddInput(false); setNewTaskContent('') }
                      }}
                      placeholder="New task..."
                      style={{
                        flex: 1, border: 'none', outline: 'none',
                        background: 'transparent', fontSize: 14, color: 'var(--color-black)',
                      }}
                    />
                    <button
                      onClick={addTask}
                      style={{
                        fontSize: 11, fontWeight: 600, color: 'var(--color-primary)',
                        background: 'none', border: 'none', cursor: 'pointer',
                      }}
                    >
                      Add
                    </button>
                  </div>
                )}

                {/* + Add New Task button */}
                <button
                  onClick={() => setShowAddInput(true)}
                  onMouseEnter={() => setAddBtnHover(true)}
                  onMouseLeave={() => setAddBtnHover(false)}
                  style={{
                    width: '100%', height: 64, borderRadius: 12,
                    border: addBtnHover ? '1.5px dashed var(--color-primary)' : '1.5px dashed var(--color-stroke)',
                    background: addBtnHover ? 'var(--color-primary-bg)' : 'transparent',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 600,
                    color: addBtnHover ? 'var(--color-primary)' : 'var(--color-light-gray)',
                    transition: 'background 150ms ease, border-color 150ms ease, color 150ms ease',
                  }}
                >
                  + Add New Task
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
    </>
  )
}

// ─────────────────────────────────────────────────────────────
// TaskRow sub-component
// ─────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: Task
  deleteConfirmId: string | null
  onToggle: () => void
  onDeleteRequest: () => void
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
}

function TaskRow({ task, deleteConfirmId, onToggle, onDeleteRequest, onDeleteConfirm, onDeleteCancel }: TaskRowProps) {
  const confirming = deleteConfirmId === task.id
  return (
    <div style={{
      background: task.isCompleted ? 'var(--color-bg)' : 'var(--color-white)',
      border: task.isCompleted ? 'none' : '1px solid var(--color-stroke)',
      borderRadius: 12, minHeight: 64,
      display: 'flex', alignItems: 'center',
      padding: task.isCompleted ? '18px 16px' : '15px 16px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 12 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flex: 1, minWidth: 0 }}>
          <button onClick={onToggle} style={{
            width: 22, height: 22, borderRadius: 4, flexShrink: 0, cursor: 'pointer',
            border: task.isCompleted ? '1.5px solid var(--color-primary)' : '1.5px solid var(--color-stroke)',
            background: task.isCompleted ? 'var(--color-primary)' : 'transparent',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            transition: 'var(--transition-colors)',
          }}>
            {task.isCompleted && (
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                <path d="M1 4.5L4.5 8L11 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
          <span style={{
            fontSize: 14, fontWeight: task.isCompleted ? 400 : 600,
            color: task.isCompleted ? 'var(--color-light-gray)' : 'var(--color-black)',
            textDecoration: task.isCompleted ? 'line-through' : 'none',
            transition: 'var(--transition-colors)',
          }}>
            {task.content}
          </span>
        </div>
        {confirming ? (
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 11, color: 'var(--color-gray)', whiteSpace: 'nowrap' }}>
              Are you sure you want to delete this record?
            </span>
            <button onClick={onDeleteConfirm} style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-red)', background: 'none', border: 'none', cursor: 'pointer' }}>Delete</button>
            <button onClick={onDeleteCancel}  style={{ fontSize: 11, color: 'var(--color-gray)', background: 'none', border: 'none', cursor: 'pointer' }}>Cancel</button>
          </div>
        ) : (
          <button onClick={onDeleteRequest} style={{ width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-light-gray)', fontSize: 14, flexShrink: 0 }}>
            ✕
          </button>
        )}
      </div>
    </div>
  )
}
