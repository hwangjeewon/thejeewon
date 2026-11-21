'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

// ─── Custom SVG Icons ─────────────────────────────────────────────────────────

function TargetIcon({ size = 24, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  )
}

function ActivityIcon({ size = 24, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
    </svg>
  )
}

function PencilIcon({ size = 24, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function StopwatchIcon({ size = 24, style }: { size?: number; style?: React.CSSProperties }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={style}>
      <circle cx="12" cy="13" r="8" />
      <path d="M12 9v4l2.5 2.5" />
      <path d="M9 2h6" />
      <path d="M12 2v3" />
    </svg>
  )
}

// ─── Nav Types ────────────────────────────────────────────────────────────────

type IconComponent = React.ComponentType<{ size?: number; style?: React.CSSProperties }>

type NavItem = {
  label: string
  href: string
  Icon: IconComponent
}

const TOP_NAV: NavItem[] = [
  { label: 'Weight',    href: '/weight',    Icon: TargetIcon },
  { label: 'Workout',   href: '/workout',   Icon: ActivityIcon },
  { label: 'School',    href: '/school',    Icon: PencilIcon },
  { label: 'Stopwatch', href: '/stopwatch', Icon: StopwatchIcon },
]

// ─── NavLink ──────────────────────────────────────────────────────────────────

function NavLink({ label, href, Icon }: NavItem) {
  const pathname = usePathname()
  const isActive = pathname === href || pathname.startsWith(href + '/')

  return (
    <Link
      href={href}
      className="relative flex items-center transition-colors duration-200"
      style={{
        height: 'var(--size-nav-h)',
        paddingInline: 'var(--space-20)',
        paddingBlock: 'var(--space-14)',
        gap: 'var(--space-12)',
        backgroundColor: isActive ? 'var(--color-primary-bg)' : 'transparent',
        borderRadius: isActive ? '0 var(--radius-nav-br) var(--radius-nav-br) 0' : '0',
      }}
    >
      {/* Active left bar */}
      {isActive && (
        <span
          className="absolute left-0 top-0"
          style={{
            width: 'var(--size-nav-bar-w)',
            height: 'var(--size-nav-h)',
            backgroundColor: 'var(--color-primary)',
            borderRadius: '0 2px 2px 0',
          }}
        />
      )}

      <Icon
        size={18}
        style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-gray)' }}
      />
      <span
        style={{
          fontSize: 'var(--text-14)',
          fontWeight: isActive ? 'var(--weight-semibold)' : 'var(--weight-medium)',
          color: isActive ? 'var(--color-primary)' : 'var(--color-gray)',
        }}
      >
        {label}
      </span>
    </Link>
  )
}

// ─── Gnb ─────────────────────────────────────────────────────────────────────

export function Gnb() {
  const router = useRouter()

  function handleLogout() {
    localStorage.removeItem('isAuthenticated')
    router.push('/login')
  }

  return (
    <aside
      className="fixed top-0 left-0 flex flex-col z-50"
      style={{
        width: 'var(--layout-gnb-w)',
        height: '100vh',
        backgroundColor: 'var(--color-black)',
      }}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center shrink-0 cursor-pointer hover:opacity-70 transition-opacity duration-200"
        onClick={handleLogout}
        style={{
          paddingLeft: 'var(--space-45)',
          paddingRight: 'var(--space-20)',
          paddingTop: 'var(--space-32)',
          paddingBottom: 'var(--space-12)',
        }}
      >
        <span
          className="font-bold underline"
          style={{ fontSize: 'var(--text-20)', color: 'var(--color-primary)' }}
        >
          @thejeewon
        </span>
      </div>

      {/* ── Top Nav — starts at 111px from top of sidebar ── */}
      <nav
        className="flex flex-col flex-1"
        style={{ marginTop: 'var(--space-47)' }}
      >
        <div className="flex flex-col">
          {TOP_NAV.map((item) => (
            <NavLink key={item.href} {...item} />
          ))}
        </div>
      </nav>
    </aside>
  )
}
