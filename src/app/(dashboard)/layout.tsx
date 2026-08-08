import { Gnb } from '@/components/Gnb'
import { AuthGuard } from '@/components/AuthGuard'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div
        className="flex min-h-screen"
        style={{ backgroundColor: 'var(--color-bg)' }}
      >
        <Gnb />
        <main
          className="flex-1 min-w-0"
          style={{
            paddingLeft: 'var(--layout-content-left)',
            paddingTop: 'var(--layout-content-top)',
          }}
        >
          {children}
        </main>
      </div>
    </AuthGuard>
  )
}
