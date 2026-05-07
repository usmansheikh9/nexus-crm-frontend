import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import styles from './LoginPage.module.css'

const DEMO = [
  { label: 'Admin',  email: 'admin@nexus.io',  pass: 'admin123' },
  { label: 'Agent',  email: 'agent@nexus.io',  pass: 'agent123' },
  { label: 'Viewer', email: 'viewer@nexus.io', pass: 'viewer123' },
]

export default function LoginPage() {
  const { login } = useAuth()
  const navigate  = useNavigate()

  const [email,    setEmail]    = useState('admin@nexus.io')
  const [password, setPassword] = useState('admin123')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(''); setLoading(true)
    try {
      await login(email, password)
      navigate('/')
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.screen}>
      <div className={styles.glow} />
      <div className={styles.card}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>N</div>
          <span>Nexus</span>
        </div>

        <h2 className={styles.heading}>Welcome back</h2>
        <p className={styles.sub}>Sign in to your workspace</p>

        <p className={styles.chipLabel}>Quick demo access ↓</p>
        <div className={styles.chips}>
          {DEMO.map(d => (
            <button
              key={d.label}
              className={styles.chip}
              onClick={() => { setEmail(d.email); setPassword(d.pass) }}
            >
              {d.label}
            </button>
          ))}
        </div>

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label>EMAIL</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@nexus.io"
              required
            />
          </div>
          <div className={styles.field}>
            <label>PASSWORD</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button className={styles.submit} type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in →'}
          </button>
        </form>
      </div>
    </div>
  )
}
