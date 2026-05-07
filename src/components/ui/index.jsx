// Badge
export function Badge({ status }) {
  const map = {
    lead:     'badge-lead',
    active:   'badge-active',
    inactive: 'badge-inactive',
    closed:   'badge-closed',
    high:     'badge-high',
    medium:   'badge-medium',
    low:      'badge-low',
    admin:    'badge-admin',
    agent:    'badge-agent',
    viewer:   'badge-viewer',
  }
  return <span className={`badge ${map[status] || 'badge-closed'}`}>{status}</span>
}

// Avatar
export function Avatar({ name = '', color = '#60a5fa', size = 30 }) {
  const initials = name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color, color: '#09090b',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.35, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
}

// Spinner
export function Spinner() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px 0' }}>
      <div style={{
        width: 24, height: 24, border: '2px solid var(--border)',
        borderTop: '2px solid var(--blue)', borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// Empty state
export function Empty({ message = 'No data found' }) {
  return (
    <div style={{
      textAlign: 'center', padding: '60px 0',
      color: 'var(--muted)', fontFamily: 'var(--mono)', fontSize: '13px',
    }}>
      {message}
    </div>
  )
}

// Error state
export function ErrorMsg({ message }) {
  return (
    <div style={{
      background: 'var(--red-dim)', border: '1px solid var(--red)',
      borderRadius: 'var(--radius)', padding: '12px 16px',
      color: 'var(--red)', fontFamily: 'var(--mono)', fontSize: '12px',
      marginBottom: 16,
    }}>
      {message}
    </div>
  )
}

// Toast hook
import { useState, useCallback } from 'react'

export function useToast() {
  const [toast, setToast] = useState(null)

  const show = useCallback((msg, ok = true) => {
    setToast({ msg, ok })
    setTimeout(() => setToast(null), 2800)
  }, [])

  const ToastEl = toast ? (
    <div style={{
      position: 'fixed', bottom: 24, right: 24, zIndex: 300,
      background: 'var(--surface)', border: `1px solid ${toast.ok ? 'var(--green)' : 'var(--red)'}`,
      borderRadius: 8, padding: '12px 18px',
      display: 'flex', alignItems: 'center', gap: 10,
      fontSize: 13, boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
      animation: 'slideUp 0.3s ease',
    }}>
      <span style={{ color: toast.ok ? 'var(--green)' : 'var(--red)' }}>{toast.ok ? '✓' : '✕'}</span>
      {toast.msg}
    </div>
  ) : null

  return { show, ToastEl }
}
