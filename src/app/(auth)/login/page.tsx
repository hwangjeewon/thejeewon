'use client'

import { useState, FormEvent } from 'react'
import { useRouter } from 'next/navigation'

const VALID_ID = 'jeewonhwang'
const VALID_PW = 'jeewonhwang'

export default function LoginPage() {
  const router = useRouter()
  const [id, setId] = useState('')
  const [password, setPassword] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const hasError = errorMessage.length > 0

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (id === VALID_ID && password === VALID_PW) {
      localStorage.setItem('isAuthenticated', 'true')
      router.push('/weight')
    } else {
      setErrorMessage('Invalid ID or password.')
    }
  }

  function handleChange() {
    if (hasError) setErrorMessage('')
  }

  const inputBase =
    'w-full outline-none transition-colors duration-200 ' +
    'bg-off-white text-black placeholder:text-light-gray ' +
    'border rounded-sm text-14 '

  const inputBorder = hasError
    ? 'border-[var(--color-red)] focus:border-[var(--color-red)]'
    : 'border-stroke focus:border-primary'

  return (
    <main
      className="min-h-screen w-full flex flex-col items-center justify-center gap-6"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      {/* ── Login Card ── */}
      <div
        className="flex items-center justify-center rounded-card border border-stroke"
        style={{
          width: 'var(--size-login-card-w)',
          minHeight: 'var(--size-login-card-h)',
          backgroundColor: 'var(--color-off-white)',
          padding: 'var(--space-28) var(--space-40)',
        }}
      >
        <form
          onSubmit={handleSubmit}
          className="flex flex-col"
          style={{ width: 'var(--size-login-inner-w)' }}
        >
          {/* ── Logo section ── */}
          <div className="flex flex-col items-center" style={{ gap: 'var(--space-10)' }}>
            <span
              className="font-bold underline text-center"
              style={{ fontSize: 'var(--text-32)', color: 'var(--color-primary)' }}
            >
              @thejeewon
            </span>
            <span
              className="text-center"
              style={{ fontSize: 'var(--text-14)', color: 'var(--color-gray)' }}
            >
              Dear diary, I love my life
            </span>
          </div>

          {/* ── Input fields — 30px below header, 10px between ID and Password ── */}
          <div className="flex flex-col" style={{ marginTop: '30px', gap: '10px' }}>
            {/* ID */}
            <div className="flex flex-col" style={{ gap: 'var(--space-7)' }}>
              <label
                htmlFor="login-id"
                style={{
                  fontSize: 'var(--text-13)',
                  color: 'var(--color-black)',
                  fontWeight: 'var(--weight-regular)',
                }}
              >
                ID
              </label>
              <input
                id="login-id"
                type="text"
                value={id}
                placeholder="Enter your ID"
                autoComplete="username"
                onChange={(e) => { setId(e.target.value); handleChange() }}
                className={`${inputBase} ${inputBorder}`}
                style={{
                  height: 'var(--size-input-h)',
                  paddingInline: 'var(--space-20)',
                  paddingBlock: 'var(--space-15)',
                }}
              />
            </div>

            {/* Password */}
            <div className="flex flex-col" style={{ gap: 'var(--space-7)' }}>
              <label
                htmlFor="login-pw"
                style={{
                  fontSize: 'var(--text-13)',
                  color: 'var(--color-black)',
                  fontWeight: 'var(--weight-regular)',
                }}
              >
                Password
              </label>
              <input
                id="login-pw"
                type="password"
                value={password}
                placeholder="Enter your password"
                autoComplete="current-password"
                onChange={(e) => { setPassword(e.target.value); handleChange() }}
                className={`${inputBase} ${inputBorder}`}
                style={{
                  height: 'var(--size-input-h)',
                  paddingInline: 'var(--space-20)',
                  paddingBlock: 'var(--space-15)',
                }}
              />
            </div>
          </div>

          {/* Error message */}
          {hasError && (
            <p
              className="leading-tight"
              style={{ fontSize: 'var(--text-12)', color: 'var(--color-red)', marginTop: '8px' }}
            >
              {errorMessage}
            </p>
          )}

          {/* Log In button — 30px below the input block */}
          <button
            type="submit"
            className="w-full font-semibold rounded-sm transition-all duration-200 hover:opacity-90 active:opacity-80"
            style={{
              marginTop: '30px',
              height: 'var(--size-btn-h)',
              backgroundColor: 'var(--color-primary)',
              fontSize: 'var(--text-15)',
              color: 'var(--color-white)',
            }}
          >
            Log In
          </button>
        </form>
      </div>

      {/* ── Footer ── */}
      <footer>
        <p
          className="text-center"
          style={{ fontSize: 'var(--text-10)', color: 'var(--color-gray)' }}
        >
          Copyright © 황지원. All rights reserved.
        </p>
      </footer>
    </main>
  )
}
