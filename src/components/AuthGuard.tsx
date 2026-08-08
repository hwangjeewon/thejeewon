'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [verified, setVerified] = useState(false)

  useEffect(() => {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
      router.replace('/login')
    } else {
      setVerified(true)
    }
  }, [router])

  if (!verified) return null

  return <>{children}</>
}
