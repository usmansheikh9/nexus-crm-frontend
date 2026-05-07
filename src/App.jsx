import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import Layout       from './components/layout/Layout'
import LoginPage    from './pages/LoginPage'
import Dashboard    from './pages/Dashboard'
import ClientsPage  from './pages/ClientsPage'
import PipelinePage from './pages/PipelinePage'
import TeamPage     from './pages/TeamPage'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading } = useAuth()
  if (loading) return <div style={{ display:'flex', alignItems:'center', justifyContent:'center', height:'100vh', color:'var(--muted)', fontFamily:'var(--mono)', fontSize:'13px' }}>Loading...</div>
  if (!user) return <Navigate to="/login" replace />
  if (adminOnly && user.role !== 'admin') return <Navigate to="/" replace />
  return children
}

function AppRoutes() {
  const { user } = useAuth()
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <LoginPage />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index        element={<Dashboard />} />
        <Route path="clients"  element={<ClientsPage />} />
        <Route path="pipeline" element={<PipelinePage />} />
        <Route path="team"     element={<ProtectedRoute adminOnly><TeamPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  )
}
