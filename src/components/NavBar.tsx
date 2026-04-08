import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Settings, User, Home, Users } from 'lucide-react'
import Sidebar from './Sidebar'

export default function Navbar() {
  const { profile } = useAuth()
  const location = useLocation()

  return (
    <nav
      className="w-full border-b border-white/10 px-4 py-3 flex items-center justify-between"
      style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
    >
      {/* Logo */}
      <Link to="/" className="flex items-center gap-2">
        <img src="/logo.png" alt="FifaCup Santana" className="h-10 w-10 object-contain" />
        <span className="font-bold text-sm hidden sm:inline" style={{ color: 'var(--color-gold)' }}>
          FifaCup <span className="text-white">Santana</span>
        </span>
      </Link>

      {/* Direita — desktop mostra tudo, mobile só o menu */}
      <div className="flex items-center gap-1">

        {/* Home — só desktop */}
        <Link
          to="/"
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${location.pathname === '/'
              ? ''
              : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
          style={
            location.pathname === '/'
              ? { backgroundColor: 'var(--color-gold)', color: 'var(--color-green)' }
              : {}
          }
        >
          <Home size={14} />
          Home
        </Link>

        {/* Jogadores — só desktop */}
        <Link
          to="/players"
          className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${location.pathname === '/players'
              ? ''
              : 'text-white/50 hover:text-white hover:bg-white/10'
            }`}
          style={
            location.pathname === '/players'
              ? { backgroundColor: 'var(--color-gold)', color: 'var(--color-green)' }
              : {}
          }
        >
          <Users size={14} />
          Jogadores
        </Link>

        {/* Perfil — só desktop */}
        {profile && (
          <Link
            to={profile.role === 'admin' ? '/admin' : '/profile'}
            className={`hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${['/admin', '/profile'].includes(location.pathname)
                ? ''
                : 'text-white/50 hover:text-white hover:bg-white/10'
              }`}
            style={
              ['/admin', '/profile'].includes(location.pathname)
                ? { backgroundColor: 'var(--color-gold)', color: 'var(--color-green)' }
                : {}
            }
          >
            {profile.role === 'admin' ? <Settings size={14} /> : <User size={14} />}
            {profile.role === 'admin'
              ? 'Admin'
              : `@${profile.username ?? profile.name?.split(' ')[0]}`
            }
          </Link>
        )}

        {/* Menu — sempre visível */}
        <Sidebar />
      </div>
    </nav>
  )
}
