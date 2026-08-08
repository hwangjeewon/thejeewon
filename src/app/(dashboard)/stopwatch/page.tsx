'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// ─── Icons ────────────────────────────────────────────────────────────────────

function PlayIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5,3 19,12 5,21" />
    </svg>
  )
}

function PauseIcon() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}

function ResetIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  )
}

// ─── Constants ────────────────────────────────────────────────────────────────

const SVG_SZ    = 360
const CX        = SVG_SZ / 2   // 180
const CY        = SVG_SZ / 2   // 180
const R         = 138           // main ring radius
const TICKS     = 60

// Donut mask bounds for the beam layers
const MASK_IN   = R - 8         // 130
const MASK_IN2  = R - 4         // 134
const MASK_OUT  = R + 4         // 142
const MASK_OUT2 = R + 10        // 148

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatTime(ms: number): string {
  const totalCs = Math.floor(ms / 10)
  const cs      = totalCs % 100
  const totalSec = Math.floor(totalCs / 100)
  const sec     = totalSec % 60
  const min     = Math.floor(totalSec / 60)
  return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}.${String(cs).padStart(2, '0')}`
}

// ─── Tick marks (60 marks, major every 5) ────────────────────────────────────

function TickMarks({ glowing, atZero }: { glowing: boolean; atZero: boolean }) {
  return (
    <>
      {Array.from({ length: TICKS }).map((_, i) => {
        const angle   = (i / TICKS) * 2 * Math.PI - Math.PI / 2
        const isMajor = i % 5 === 0
        const outerR  = R + 14
        const innerR  = isMajor ? R + 6 : R + 8
        const cos = Math.cos(angle)
        const sin = Math.sin(angle)
        const stroke = glowing
          ? isMajor ? 'rgba(230,87,135,0.55)' : 'rgba(230,87,135,0.2)'
          : atZero
            ? isMajor ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.18)'
            : isMajor ? 'rgba(255,255,255,0.22)' : 'rgba(255,255,255,0.09)'
        return (
          <line
            key={i}
            x1={CX + outerR * cos} y1={CY + outerR * sin}
            x2={CX + innerR * cos} y2={CY + innerR * sin}
            style={{ stroke, transition: 'stroke 300ms ease' }}
            strokeWidth={isMajor ? 2 : 1}
            strokeLinecap="round"
          />
        )
      })}
    </>
  )
}

// ─── StopwatchPage ────────────────────────────────────────────────────────────

const STORAGE_KEY = 'thejeewon_stopwatch'

// Stored shape: { startMs: number, accumulated: number, wasRunning: boolean }
// startMs is the Date.now() anchor such that Date.now() - startMs = total elapsed
// (already folded in prior accumulated time, so accumulated is only used when paused)

export default function StopwatchPage() {
  const [elapsed, setElapsed] = useState(0)
  const [running, setRunning] = useState(false)

  const rafRef      = useRef<number | null>(null)
  // startMs: Date.now() - startMs = total elapsed at any moment while running
  const startMsRef  = useRef<number>(0)
  // accMs: frozen elapsed snapshot taken at pause time
  const accRef      = useRef<number>(0)

  const tick = useCallback(() => {
    setElapsed(Date.now() - startMsRef.current)
    rafRef.current = requestAnimationFrame(tick)
  }, [])

  // Restore from localStorage on mount
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return
    try {
      const { startMs, accumulated, wasRunning } = JSON.parse(raw) as {
        startMs: number; accumulated: number; wasRunning: boolean
      }
      if (wasRunning && typeof startMs === 'number') {
        // Timer was running when we left — resume immediately from correct position
        startMsRef.current = startMs          // absolute anchor is still valid
        setRunning(true)
      } else if (typeof accumulated === 'number' && accumulated > 0) {
        // Timer was paused — restore the frozen elapsed
        accRef.current = accumulated
        setElapsed(accumulated)
      }
    } catch { /* corrupt storage — ignore */ }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Start / stop the RAF loop when `running` changes
  useEffect(() => {
    if (running) {
      rafRef.current = requestAnimationFrame(tick)
    } else {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
        rafRef.current = null
      }
    }
    return () => { if (rafRef.current !== null) cancelAnimationFrame(rafRef.current) }
  }, [running, tick])

  function handleStart() {
    // Anchor: now minus already-accumulated so elapsed reads correctly from tick
    startMsRef.current = Date.now() - accRef.current
    setRunning(true)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      startMs: startMsRef.current,
      accumulated: 0,
      wasRunning: true,
    }))
  }

  function handlePause() {
    const frozen = Date.now() - startMsRef.current
    accRef.current = frozen
    setRunning(false)
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      startMs: 0,
      accumulated: frozen,
      wasRunning: false,
    }))
  }

  function handleReset() {
    setRunning(false)
    setElapsed(0)
    startMsRef.current = 0
    accRef.current = 0
    localStorage.removeItem(STORAGE_KEY)
  }

  const hasStopped = !running && elapsed > 0
  const atZero     = elapsed === 0
  const glowing    = !running && elapsed > 0  // glow only when paused with time on the clock

  // Beam: 1 full revolution per second
  const beamAngle = (elapsed / 1000) * 360

  const neonShadow =
    '0 0 8px rgba(var(--color-primary-rgb),0.95), 0 0 20px rgba(var(--color-primary-rgb),0.6), 0 0 45px rgba(var(--color-primary-rgb),0.3)'

  const btnGlowShadow =
    '0 0 16px rgba(var(--color-primary-rgb),0.8), 0 0 36px rgba(var(--color-primary-rgb),0.4)'

  const btnNormalShadow =
    '0 4px 18px rgba(var(--color-primary-rgb),0.35)'

  return (
    <>
      {/* Keyframes for neon idle pulse */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes swPulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.65; }
        }
        @keyframes swRingPulse {
          0%, 100% { opacity: 0.7; }
          50%       { opacity: 0.3; }
        }
      `}} />

      <div className="w-full" style={{ maxWidth: 'var(--size-page-w)', paddingBottom: 'var(--space-40)' }}>

        {/* ── Page Header ── */}
        <div className="flex flex-col" style={{ gap: 'var(--space-5)', marginBottom: 'var(--space-20)' }}>
          <h1 style={{ fontSize: 'var(--text-26)', fontWeight: 'var(--weight-bold)', color: 'var(--color-black)' }}>
            Stopwatch
          </h1>
          <p style={{ fontSize: 'var(--text-15)', color: 'var(--color-gray)' }}>
            Time to lock in.
          </p>
        </div>

        {/* ── Main Card ── */}
        <div style={{
          width: '100%',
          height: 580,
          background: 'var(--color-black)',
          borderRadius: 12,
          border: glowing
            ? '1px solid rgba(230,87,135,0.18)'
            : '1px solid rgba(255,255,255,0.07)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 36,
          transition: 'border-color 500ms ease',
          boxShadow: glowing
            ? 'inset 0 0 60px rgba(230,87,135,0.04)'
            : 'none',
        }}>

          {/* ── Circle + Time composite ── */}
          <div style={{ position: 'relative', width: SVG_SZ, height: SVG_SZ }}>

            {/* SVG base: ring + tick marks + neon glow ring */}
            <svg
              width={SVG_SZ} height={SVG_SZ}
              style={{ position: 'absolute', inset: 0, overflow: 'visible' }}
            >
              {/* Base ring */}
              <circle
                cx={CX} cy={CY} r={R}
                fill="none"
                strokeWidth="1.5"
                style={{
                  stroke: atZero ? 'rgba(255,255,255,0.35)' : 'rgba(255,255,255,0.06)',
                  transition: 'stroke 300ms ease',
                }}
              />

              {/* Tick marks */}
              <TickMarks glowing={glowing} atZero={atZero} />

              {/* Neon glow ring — idle / paused */}
              {glowing && (
                <>
                  {/* Wide blurred outer glow */}
                  <circle
                    cx={CX} cy={CY} r={R}
                    fill="none"
                    strokeWidth="10"
                    style={{
                      stroke: 'rgba(230,87,135,0.35)',
                      filter: 'blur(10px)',
                      animation: 'swRingPulse 2.2s ease-in-out infinite',
                    }}
                  />
                  {/* Crisp ring */}
                  <circle
                    cx={CX} cy={CY} r={R}
                    fill="none"
                    strokeWidth="1.5"
                    style={{
                      stroke: 'rgba(230,87,135,0.75)',
                      animation: 'swRingPulse 2.2s ease-in-out infinite',
                    }}
                  />
                </>
              )}
            </svg>

            {/* Running beam layers (conic gradient + donut mask) */}
            {running && (
              <>
                {/* Blurred glow halo */}
                <div style={{
                  position: 'absolute', inset: 0,
                  transform: `rotate(${beamAngle}deg)`,
                  background: `conic-gradient(
                    rgba(var(--color-primary-rgb), 1.0)  0deg,
                    rgba(var(--color-primary-rgb), 0.55) 22deg,
                    rgba(var(--color-primary-rgb), 0.15) 55deg,
                    rgba(var(--color-primary-rgb), 0)    85deg,
                    rgba(var(--color-primary-rgb), 0)   360deg
                  )`,
                  WebkitMaskImage: `radial-gradient(transparent ${MASK_IN}px, black ${MASK_IN2}px, black ${MASK_OUT}px, transparent ${MASK_OUT2}px)`,
                  maskImage:       `radial-gradient(transparent ${MASK_IN}px, black ${MASK_IN2}px, black ${MASK_OUT}px, transparent ${MASK_OUT2}px)`,
                  filter: 'blur(7px)',
                  opacity: 0.75,
                }} />

                {/* Sharp beam */}
                <div style={{
                  position: 'absolute', inset: 0,
                  transform: `rotate(${beamAngle}deg)`,
                  background: `conic-gradient(
                    rgba(var(--color-primary-rgb), 1.0)  0deg,
                    rgba(var(--color-primary-rgb), 0.7)  12deg,
                    rgba(var(--color-primary-rgb), 0.35) 35deg,
                    rgba(var(--color-primary-rgb), 0)    60deg,
                    rgba(var(--color-primary-rgb), 0)   360deg
                  )`,
                  WebkitMaskImage: `radial-gradient(transparent ${MASK_IN2}px, black ${MASK_IN2 + 2}px, black ${MASK_OUT - 2}px, transparent ${MASK_OUT}px)`,
                  maskImage:       `radial-gradient(transparent ${MASK_IN2}px, black ${MASK_IN2 + 2}px, black ${MASK_OUT - 2}px, transparent ${MASK_OUT}px)`,
                }} />

                {/* Bright head dot */}
                <div style={{
                  position: 'absolute', inset: 0,
                  transform: `rotate(${beamAngle}deg)`,
                  background: `conic-gradient(
                    rgba(var(--color-primary-rgb), 1.0) 0deg,
                    rgba(var(--color-primary-rgb), 0.9) 4deg,
                    rgba(var(--color-primary-rgb), 0)   8deg,
                    rgba(var(--color-primary-rgb), 0) 360deg
                  )`,
                  WebkitMaskImage: `radial-gradient(transparent ${MASK_IN2}px, black ${MASK_IN2 + 2}px, black ${MASK_OUT - 2}px, transparent ${MASK_OUT}px)`,
                  maskImage:       `radial-gradient(transparent ${MASK_IN2}px, black ${MASK_IN2 + 2}px, black ${MASK_OUT - 2}px, transparent ${MASK_OUT}px)`,
                  filter: 'blur(2px)',
                }} />
              </>
            )}

            {/* Time display — absolute centered over SVG */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                fontVariantNumeric: 'tabular-nums',
                fontSize: 54,
                fontWeight: 600,
                letterSpacing: '-0.025em',
                lineHeight: 1,
                userSelect: 'none',
                color: (running || atZero) ? '#ffffff' : 'var(--color-primary)',
                textShadow: glowing ? neonShadow : 'none',
                transition: 'color 300ms ease, text-shadow 300ms ease',
                animation: glowing ? 'swPulse 2.2s ease-in-out infinite' : 'none',
              }}>
                {formatTime(elapsed)}
              </span>
            </div>
          </div>

          {/* ── Controls ── */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            {!running && !hasStopped ? (

              /* Initial state: single Start */
              <button
                onClick={handleStart}
                className="transition-all duration-150 active:scale-95"
                style={{
                  width: 66, height: 66,
                  borderRadius: '50%',
                  background: 'var(--color-primary)',
                  border: 'none',
                  color: '#fff',
                  cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: glowing ? btnGlowShadow : btnNormalShadow,
                  transition: 'box-shadow 400ms ease',
                  animation: glowing ? 'swPulse 2.2s ease-in-out infinite' : 'none',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
              >
                <PlayIcon />
              </button>

            ) : (

              /* Running / paused: Reset + Pause/Resume */
              <>
                <button
                  onClick={handleReset}
                  className="transition-all duration-150 active:scale-95"
                  style={{
                    width: 52, height: 52,
                    borderRadius: '50%',
                    background: 'rgba(255,255,255,0.06)',
                    border: '1.5px solid rgba(255,255,255,0.14)',
                    color: 'rgba(255,255,255,0.65)',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: glowing ? '0 0 10px rgba(var(--color-primary-rgb),0.25)' : 'none',
                    transition: 'background 150ms ease, border-color 150ms ease, box-shadow 400ms ease',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.13)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.28)'
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    e.currentTarget.style.borderColor = 'rgba(255,255,255,0.14)'
                  }}
                >
                  <ResetIcon />
                </button>

                <button
                  onClick={running ? handlePause : handleStart}
                  className="transition-all duration-150 active:scale-95"
                  style={{
                    width: 66, height: 66,
                    borderRadius: '50%',
                    background: 'var(--color-primary)',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: glowing ? btnGlowShadow : btnNormalShadow,
                    transition: 'box-shadow 400ms ease',
                    animation: glowing ? 'swPulse 2.2s ease-in-out infinite' : 'none',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                  onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                >
                  {running ? <PauseIcon /> : <PlayIcon />}
                </button>
              </>
            )}
          </div>

        </div>
      </div>

    </>
  )
}
