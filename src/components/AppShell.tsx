import {
  Activity,
  ClipboardCheck,
  FileArchive,
  Gauge,
  Home,
  LogOut,
  Menu,
  MoreHorizontal,
  Scale,
  ShieldCheck,
  UploadCloud,
  UserCircle,
  X,
} from 'lucide-react'
import { useEffect, useState } from 'react'
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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Close menu on Escape key press and lock background scroll when open
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
      }
    }

    if (mobileMenuOpen) {
      document.addEventListener('keydown', handleKeyDown)
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [mobileMenuOpen])

  const handleLogout = async () => {
    setMobileMenuOpen(false)
    await logout()
    navigate('/login')
  }

  return (
    <div className="app-shell">
      {/* Backdrop overlay for mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="sidebar-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside className={`sidebar ${mobileMenuOpen ? 'open' : ''}`} aria-label="Main Navigation">
        <div className="brand">
          <div className="brand-mark">
            <Gauge size={24} />
          </div>
          <div className="brand-info">
            <strong>MetriWeigh</strong>
            <span>OIML R-76 NAWI workflow</span>
          </div>
          <button
            type="button"
            className="sidebar-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="primary-nav" aria-label="Primary">
          {navigation.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setMobileMenuOpen(false)}
            >
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
          <div className="topbar-left">
            <button
              type="button"
              className="mobile-toggle-btn"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Toggle navigation menu"
              aria-expanded={mobileMenuOpen}
            >
              <Menu size={22} />
            </button>
            <div className="topbar-headings">
              <span className="eyebrow">Legal metrology laboratory</span>
              <h1>NAWI test management</h1>
            </div>
          </div>
          <div className="user-pill">
            <UserCircle size={20} />
            <div className="user-pill-details">
              <strong>{user?.displayName}</strong>
              <span>{user?.role}</span>
            </div>
          </div>
        </header>

        <main>
          <Outlet />
        </main>
      </div>

      {/* Mobile quick-nav bottom dock for <640px phones */}
      <nav className="mobile-bottom-nav" aria-label="Mobile quick navigation">
        <NavLink to="/" end className="bottom-nav-item">
          <Home size={20} />
          <span>Home</span>
        </NavLink>
        <NavLink to="/instruments" className="bottom-nav-item">
          <Scale size={20} />
          <span>Instruments</span>
        </NavLink>
        <NavLink to="/tests" className="bottom-nav-item">
          <ClipboardCheck size={20} />
          <span>Tests</span>
        </NavLink>
        <NavLink to="/reports" className="bottom-nav-item">
          <FileArchive size={20} />
          <span>Reports</span>
        </NavLink>
        <button
          type="button"
          className="bottom-nav-item"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="More navigation options"
        >
          <MoreHorizontal size={20} />
          <span>More</span>
        </button>
      </nav>
    </div>
  )
}
