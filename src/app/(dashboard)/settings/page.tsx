export default function SettingsPage() {
  return (
    <>
      {/* ── Page header ── */}
      <div style={{ marginBottom: 'var(--space-20)' }}>
        <h1 style={{
          fontSize: 'var(--text-26)',
          fontWeight: 'var(--weight-bold)',
          color: 'var(--color-black)',
        }}>
          Settings
        </h1>
      </div>

      {/* ── Centered message ── */}
      <div style={{
        position: 'fixed',
        top: 0, bottom: 0,
        left: 'var(--layout-gnb-w)',
        right: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        pointerEvents: 'none',
      }}>
        <span style={{
          fontSize: 12,
          fontWeight: 400,
          color: '#9B9BA5',
          fontFamily: 'Pretendard, -apple-system, sans-serif',
        }}>
          Settings is currently unavailable.
        </span>
      </div>
    </>
  )
}
