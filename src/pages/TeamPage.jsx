import { useEffect, useState } from 'react'
import api from '../services/api'
import { Badge, Avatar, Spinner, ErrorMsg, useToast } from '../components/ui'

const roleColor = { admin: '#a78bfa', agent: '#60a5fa', viewer: '#4ade80' }

export default function TeamPage() {
  const { show, ToastEl } = useToast()
  const [users, setUsers]   = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    api.get('/users')
      .then(r => setUsers(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load team'))
      .finally(() => setLoading(false))
  }, [])

  const updateRole = async (id, role, name) => {
    try {
      await api.patch(`/users/${id}/role`, { role })
      setUsers(prev => prev.map(u => u._id === id ? { ...u, role } : u))
      show(`${name}'s role updated to ${role}`)
    } catch (e) {
      show(e.response?.data?.message || 'Failed to update role', false)
    }
  }

  if (loading) return <Spinner />
  if (error)   return <ErrorMsg message={error} />

  return (
    <div className="fade-in">
      {ToastEl}
      <div className="page-header">
        <h1>Team</h1>
        <p>Manage team members and their access roles.</p>
      </div>

      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Member</th>
              <th>Role</th>
              <th>Email</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u._id}>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Avatar name={u.name} color={roleColor[u.role] || '#60a5fa'} size={30} />
                    <div>
                      <div style={{ fontWeight: 500 }}>{u.name}</div>
                      <div style={{ fontSize: 11, color: u.isActive ? 'var(--green)' : 'var(--muted)' }}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </div>
                  </div>
                </td>
                <td><Badge status={u.role} /></td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 12, color: 'var(--muted2)' }}>{u.email}</td>
                <td style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--muted)' }}>
                  {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString() : 'Never'}
                </td>
                <td>
                  <select
                    value={u.role}
                    onChange={e => updateRole(u._id, e.target.value, u.name)}
                    style={{
                      background: 'var(--surface2)', border: '1px solid var(--border)',
                      borderRadius: 4, color: 'var(--text)', padding: '4px 8px',
                      fontSize: 12, fontFamily: 'var(--mono)', outline: 'none',
                    }}
                  >
                    <option value="admin">admin</option>
                    <option value="agent">agent</option>
                    <option value="viewer">viewer</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
