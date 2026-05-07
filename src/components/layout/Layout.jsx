import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import styles from './Layout.module.css'

function initials(name = '') {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
}

const roleColor = { admin: '#a78bfa', agent: '#60a5fa', viewer: '#4ade80' }

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => { logout(); navigate('/login') }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <div className={styles.logoMark}>N</div>
          <span className={styles.logoText}>Nexus</span>
          <span className={styles.logoBadge}>v2.1</span>
        </div>

        <nav className={styles.nav}>
          <p className={styles.navLabel}>Workspace</p>

          <NavLink to="/" end className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <IconGrid /> Dashboard
          </NavLink>

          <NavLink to="/pipeline" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <IconPipeline /> Pipeline
          </NavLink>

          <NavLink to="/clients" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
            <IconUsers /> Clients
          </NavLink>

          {user?.role === 'admin' && (
            <>
              <p className={styles.navLabel} style={{ marginTop: 12 }}>Admin</p>
              <NavLink to="/team" className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}>
                <IconTeam /> Team
              </NavLink>
            </>
          )}
        </nav>

        <div className={styles.footer}>
          <div className={styles.userCard}>
            <div
              className={styles.avatar}
              style={{ background: roleColor[user?.role] || '#60a5fa', color: '#09090b' }}
            >
              {initials(user?.name)}
            </div>
            <div className={styles.userInfo}>
              <div className={styles.userName}>{user?.name}</div>
              <div className={styles.userRole}>{user?.role}</div>
            </div>
            <button className={styles.logoutBtn} onClick={handleLogout} title="Logout">
              <IconLogout />
            </button>
          </div>
        </div>
      </aside>

      <div className={styles.main}>
        <div className={styles.topbar}>
          <div className={styles.topbarRight}>
            <div className={styles.availability}>
              <span className={styles.dot} />
              <span>Connected</span>
            </div>
          </div>
        </div>
        <main className={styles.content}>
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// Icons
const IconGrid     = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M2 2h5v5H2zm7 0h5v5H9zM2 9h5v5H2zm7 0h5v5H9z"/></svg>
const IconPipeline = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M1 4h14v2H1zm2 4h10v2H3zm2 4h6v2H5z"/></svg>
const IconUsers    = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M8 8a3 3 0 100-6 3 3 0 000 6zm-5 6a5 5 0 0110 0H3z"/></svg>
const IconTeam     = () => <svg width="15" height="15" viewBox="0 0 16 16" fill="currentColor"><path d="M3 14s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1H3zm5-6a3 3 0 100-6 3 3 0 000 6zM13 8a2 2 0 100-4 2 2 0 000 4zm1.5 5s.5 0 .5-.5c0-.828-.448-2.5-2-2.5"/></svg>
const IconLogout   = () => <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor"><path d="M6 2H2v12h4v-1H3V3h3V2zm4.5 3.5L14 8l-3.5 2.5V9H6V7h4.5V5.5z"/></svg>
