import { useEffect, useState, useCallback } from 'react'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Badge, Avatar, Spinner, ErrorMsg, useToast } from '../components/ui'

const roleColor = { admin: '#a78bfa', agent: '#60a5fa', viewer: '#4ade80' }
const fmt = v => '$' + Number(v || 0).toLocaleString()

const EMPTY_FORM = {
  name: '', email: '', company: '', phone: '',
  value: '', status: 'lead', priority: 'medium', source: 'referral',
}

export default function ClientsPage() {
  const { user }               = useAuth()
  const { show, ToastEl }      = useToast()
  const [clients, setClients]  = useState([])
  const [total, setTotal]      = useState(0)
  const [loading, setLoading]  = useState(true)
  const [error, setError]      = useState('')
  const [filter, setFilter]    = useState('all')
  const [search, setSearch]    = useState('')
  const [showModal, setShowModal] = useState(false)
  const [form, setForm]        = useState(EMPTY_FORM)
  const [saving, setSaving]    = useState(false)

  const fetchClients = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = {}
      if (filter !== 'all') params.status = filter
      if (search) params.search = search
      const { data } = await api.get('/clients', { params })
      setClients(data.data)
      setTotal(data.total)
    } catch (e) {
      setError(e.response?.data?.message || 'Failed to load clients')
    } finally {
      setLoading(false)
    }
  }, [filter, search])

  useEffect(() => {
    const t = setTimeout(fetchClients, search ? 350 : 0)
    return () => clearTimeout(t)
  }, [fetchClients])

  const handleAdd = async () => {
    if (!form.name) { show('Name is required', false); return }
    setSaving(true)
    try {
      await api.post('/clients', { ...form, value: Number(form.value) || 0 })
      show(`${form.name} added successfully`)
      setShowModal(false)
      setForm(EMPTY_FORM)
      fetchClients()
    } catch (e) {
      show(e.response?.data?.message || 'Failed to add client', false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete ${name}?`)) return
    try {
      await api.delete(`/clients/${id}`)
      show(`${name} deleted`)
      fetchClients()
    } catch (e) {
      show(e.response?.data?.message || 'Failed to delete', false)
    }
  }

  const FILTERS = ['all', 'lead', 'active', 'inactive', 'closed']

  return (
    <div className="fade-in">
      {ToastEl}
      <div className="page-header">
        <h1>Clients</h1>
        <p>Manage and track all client relationships in one place. {total > 0 && `${total} total.`}</p>
      </div>

      {error && <ErrorMsg message={error} />}

      {/* Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        {FILTERS.map(f => (
          <button
            key={f} onClick={() => setFilter(f)}
            className={`btn-ghost ${filter === f ? 'active' : ''}`}
            style={{ textTransform: 'capitalize' }}
          >{f}</button>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: 'var(--surface2)', border: '1px solid var(--border)',
            borderRadius: 6, padding: '6px 12px',
          }}>
            <svg width="12" height="12" viewBox="0 0 16 16" fill="var(--muted)"><path d="M11.742 10.344a6.5 6.5 0 10-1.397 1.398l3.85 3.85a1 1 0 001.415-1.415l-3.868-3.833zM12 6.5a5.5 5.5 0 11-11 0 5.5 5.5 0 0111 0z"/></svg>
            <input
              value={search} onChange={e => setSearch(e.target.value)}
              placeholder="Search clients..."
              style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text)', fontSize: 12, width: 160 }}
            />
          </div>
          {user?.role !== 'viewer' && (
            <button className="btn-primary" onClick={() => setShowModal(true)}>+ Add Client</button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? <Spinner /> : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Client</th>
                <th>Status</th>
                <th>Priority</th>
                <th>Value</th>
                <th>Assigned To</th>
                <th>Source</th>
                {user?.role !== 'viewer' && <th></th>}
              </tr>
            </thead>
            <tbody>
              {clients.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', color: 'var(--muted)', padding: 40, fontFamily: 'var(--mono)', fontSize: 12 }}>No clients found</td></tr>
              ) : clients.map(c => (
                <tr key={c._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <Avatar name={c.name} color={roleColor[c.assignedTo?.role] || '#60a5fa'} size={28} />
                      <div>
                        <div style={{ fontWeight: 500 }}>{c.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.company || c.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge status={c.status} /></td>
                  <td><Badge status={c.priority} /></td>
                  <td className="value-cell">{fmt(c.value)}</td>
                  <td>
                    {c.assignedTo ? (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <Avatar name={c.assignedTo.name} color={roleColor[c.assignedTo.role] || '#60a5fa'} size={20} />
                        <span style={{ fontSize: 12, color: 'var(--muted2)' }}>{c.assignedTo.name}</span>
                      </div>
                    ) : <span style={{ color: 'var(--muted)', fontSize: 12 }}>Unassigned</span>}
                  </td>
                  <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted2)' }}>{c.source}</td>
                  {user?.role !== 'viewer' && (
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        {user?.role === 'admin' && (
                          <button className="row-action danger" onClick={() => handleDelete(c._id, c.name)}>Del</button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowModal(false)}>
          <div className="modal">
            <div className="modal-header">
              <h3>Add New Client</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <div className="modal-grid">
              {[
                { key: 'name',    label: 'FULL NAME',       full: true,  placeholder: 'Sarah Johnson' },
                { key: 'email',   label: 'EMAIL',           full: false, placeholder: 'sarah@company.com' },
                { key: 'company', label: 'COMPANY',         full: false, placeholder: 'Acme Corp' },
                { key: 'value',   label: 'DEAL VALUE (USD)',full: false, placeholder: '5000', type: 'number' },
                { key: 'phone',   label: 'PHONE',           full: false, placeholder: '+1 555 000 0000' },
              ].map(f => (
                <div key={f.key} className={`modal-field ${f.full ? 'full' : ''}`}>
                  <label>{f.label}</label>
                  <input
                    type={f.type || 'text'}
                    value={form[f.key]}
                    onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                  />
                </div>
              ))}
              {[
                { key: 'status',   label: 'STATUS',   opts: ['lead','active','inactive','closed'] },
                { key: 'priority', label: 'PRIORITY', opts: ['low','medium','high'] },
                { key: 'source',   label: 'SOURCE',   opts: ['referral','website','cold-outreach','social','other'] },
              ].map(f => (
                <div key={f.key} className="modal-field">
                  <label>{f.label}</label>
                  <select value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}>
                    {f.opts.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                </div>
              ))}
            </div>
            <div className="modal-footer">
              <button className="btn-cancel" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-confirm" onClick={handleAdd} disabled={saving}>
                {saving ? 'Adding...' : 'Add Client'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
