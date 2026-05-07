import { useEffect, useState } from 'react'
import api from '../services/api'
import { Badge, Avatar, Spinner, ErrorMsg } from '../components/ui'

const fmt = v => '$' + Number(v || 0).toLocaleString()
const roleColor = { admin: '#a78bfa', agent: '#60a5fa', viewer: '#4ade80' }

const STAGES = [
  { key: 'lead',     label: 'Lead',     color: '#60a5fa', dim: 'rgba(96,165,250,0.1)' },
  { key: 'active',   label: 'Active',   color: '#4ade80', dim: 'rgba(74,222,128,0.1)' },
  { key: 'inactive', label: 'Inactive', color: '#fbbf24', dim: 'rgba(251,191,36,0.1)' },
  { key: 'closed',   label: 'Closed',   color: '#71717a', dim: 'rgba(113,113,122,0.1)' },
]

export default function PipelinePage() {
  const [clients, setClients] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    api.get('/clients', { params: { limit: 100 } })
      .then(r => setClients(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (error)   return <ErrorMsg message={error} />

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Pipeline</h1>
        <p>Visual overview of all clients across deal stages.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
        {STAGES.map(stage => {
          const col = clients.filter(c => c.status === stage.key)
          const total = col.reduce((s, c) => s + (c.value || 0), 0)
          return (
            <div key={stage.key}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '10px 14px', marginBottom: 10,
                background: stage.dim, borderRadius: 6,
              }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: stage.color }}>{stage.label}</span>
                <span style={{ marginLeft: 'auto', fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
                  {col.length}
                </span>
              </div>

              <div style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)', marginBottom: 10, paddingLeft: 2 }}>
                {fmt(total)} total
              </div>

              {col.map(c => (
                <div key={c._id} style={{
                  background: 'var(--surface)', border: '1px solid var(--border)',
                  borderRadius: 6, padding: 12, marginBottom: 8,
                  transition: 'all 0.15s', cursor: 'default',
                }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border2)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}
                >
                  <div style={{ fontWeight: 500, fontSize: 13, marginBottom: 2 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)', marginBottom: 10 }}>{c.company || '—'}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: stage.color }}>{fmt(c.value)}</span>
                    {c.assignedTo && (
                      <Avatar name={c.assignedTo.name} color={roleColor[c.assignedTo.role] || '#60a5fa'} size={20} />
                    )}
                  </div>
                </div>
              ))}

              {col.length === 0 && (
                <div style={{
                  border: '1px dashed var(--border)', borderRadius: 6,
                  padding: '24px 12px', textAlign: 'center',
                  color: 'var(--muted)', fontSize: 12, fontFamily: 'var(--mono)',
                }}>Empty</div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
