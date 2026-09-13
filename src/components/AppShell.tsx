import {
  Activity,
  ClipboardCheck,
  FileArchive,
  Gauge,
  Home,
  LogOut,
  Scale,
  ShieldCheck,
  UploadCloud,
  UserCircle,
} from 'lucide-react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/authState'

const navigation = [
  { to: '/', label: 'Dashboard', icon: Home },
  { to: '/instruments', label: 'Instruments', icon: Scale },
  { to: '/tests', label: 'Tests', icon: ClipboardCheck },
  { to: '/reports', label: 'Reports', icon: FileArchive },
  { to: '/evidence', label: 'Evidence', icon: UploadCloud },
  { to: '/audit', label: 'Audit Trail', icon: Activity },
  { to: '/profile', label: 'Profile', icon: UserCircle },
]

export function AppShell() {
  const { logout, user, firebaseEnabled } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Gauge size={24} />
          </div>
          <div>
            <strong>MetriWeigh</strong>
            <span>OIML R-76 NAWI workflow</span>
          </div>
        </div>
        <nav className="primary-nav" aria-label="Primary">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'}>
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="security-chip">
            <ShieldCheck size={16} />
            <span>{firebaseEnabled ? 'Firebase active' : 'Demo data mode'}</span>
          </div>
          <button type="button" className="ghost-button" onClick={handleLogout}>
            <LogOut size={17} />
            <span>Logout</span>
          </button>
        </div>
      </aside>
      <div className="workspace">
        <header className="topbar">
          <div>
            <span className="eyebrow">Legal metrology laboratory</span>
            <h1>NAWI test management</h1>
          </div>
          <div className="user-pill">
            <UserCircle size={20} />
            <div>
              <strong>{user?.displayName}</strong>
              <span>{user?.role}</span>
            </div>
          </div>
        </header>
        <main>
          <Outlet />
        </main>
      </div>
    </div>
  )
}
