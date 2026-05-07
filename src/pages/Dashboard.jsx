import { useEffect, useState } from 'react'
import { Line, Doughnut } from 'react-chartjs-2'
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, ArcElement, Tooltip, Legend, Filler,
} from 'chart.js'
import api from '../services/api'
import { useAuth } from '../context/AuthContext'
import { Avatar, Spinner, ErrorMsg } from '../components/ui'
import { Badge } from '../components/ui'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Tooltip, Legend, Filler)

const fmt = (v) => '$' + Number(v || 0).toLocaleString()

export default function Dashboard() {
  const { user }            = useAuth()
  const [stats, setStats]   = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]   = useState('')

  useEffect(() => {
    api.get('/stats/overview')
      .then(r => setStats(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load stats'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <Spinner />
  if (error)   return <ErrorMsg message={error} />

  const lineData = {
    labels: ['Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [{
      data: [42000, 58000, 51000, 74000, 68000, stats.totalValue],
      borderColor: '#60a5fa',
      backgroundColor: 'rgba(96,165,250,0.08)',
      tension: 0.4, fill: true, pointRadius: 3,
      pointBackgroundColor: '#60a5fa',
    }],
  }

  const donutData = {
    labels: ['Lead', 'Active', 'Inactive', 'Closed'],
    datasets: [{
      data: [stats.leads, stats.active, stats.inactive, stats.closed],
      backgroundColor: ['#60a5fa', '#4ade80', '#fbbf24', '#3f3f46'],
      borderWidth: 0, hoverOffset: 4,
    }],
  }

  const chartOpts = {
    responsive: true,
    plugins: { legend: { display: false } },
    scales: {
      x: { grid: { color: '#27272a' }, ticks: { color: '#71717a', font: { family: 'DM Mono', size: 10 } } },
      y: { grid: { color: '#27272a' }, ticks: { color: '#71717a', font: { family: 'DM Mono', size: 10 }, callback: v => '$' + v.toLocaleString() } },
    },
  }

  const donutOpts = {
    responsive: true, cutout: '68%',
    plugins: {
      legend: { position: 'bottom', labels: { color: '#a1a1aa', font: { family: 'DM Mono', size: 10 }, boxWidth: 10, padding: 14 } },
    },
  }

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1>Good morning, {user?.name?.split(' ')[0]} 👋</h1>
        <p>Here's what's happening across your pipeline today.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14, marginBottom: 24 }}>
        <StatCard label="Total Revenue" value={fmt(stats.totalValue)} sub="Active clients only" color="green" icon="💰" />
        <StatCard label="Active Clients" value={stats.active} sub="+3 new this week" color="blue" icon="👥" />
        <StatCard label="Open Leads" value={stats.leads} sub="Awaiting conversion" color="amber" icon="📋" />
        <StatCard label="Closed Deals" value={stats.closed} sub="8% close rate" color="purple" icon="✅" />
      </div>

      {/* Charts */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14, marginBottom: 24 }}>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Revenue Overview</span>
            <span className="card-meta">Last 6 months</span>
          </div>
          <Line data={lineData} options={chartOpts} height={90} />
        </div>
        <div className="card">
          <div className="card-header">
            <span className="card-title">Pipeline Status</span>
            <span className="card-meta">All time</span>
          </div>
          <Doughnut data={donutData} options={donutOpts} />
        </div>
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 14 }}>
        {/* Recent clients */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Recent Clients</span>
          </div>
          {stats.recentClients?.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>No clients yet.</p>
            : stats.recentClients?.map(c => (
              <div key={c._id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <Avatar name={c.name} color="#60a5fa" size={32} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{c.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{c.company}</div>
                </div>
                <Badge status={c.status} />
                <span className="value-cell">{fmt(c.value)}</span>
              </div>
            ))}
        </div>

        {/* Top agents */}
        <div className="card">
          <div className="card-header">
            <span className="card-title">Top Agents</span>
          </div>
          {stats.topAgents?.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>No data yet.</p>
            : stats.topAgents?.map((a, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                <Avatar name={a.agent?.name} color="#a78bfa" size={28} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 12, fontWeight: 500 }}>{a.agent?.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--muted)' }}>{a.clientCount} clients</div>
                </div>
                <span className="value-cell">{fmt(a.totalValue)}</span>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

function StatCard({ label, value, sub, color, icon }) {
  const colors = {
    green:  { bar: '#4ade80', bg: 'rgba(74,222,128,0.1)' },
    blue:   { bar: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
    amber:  { bar: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
    purple: { bar: '#a78bfa', bg: 'rgba(167,139,250,0.1)' },
  }
  const c = colors[color]
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius)', padding: 20, position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: c.bar }} />
      <div style={{
        position: 'absolute', top: 16, right: 16,
        width: 32, height: 32, borderRadius: 6,
        background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 14,
      }}>{icon}</div>
      <div style={{ fontSize: 11, fontFamily: 'var(--mono)', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 6 }}>{value}</div>
      <div style={{ fontSize: 11, color: 'var(--muted)' }}>{sub}</div>
    </div>
  )
}
