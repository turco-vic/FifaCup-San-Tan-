import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Home, Users, Swords, Handshake, User, Settings } from 'lucide-react'

export default function BottomNav() {
    const { profile } = useAuth()
    const location = useLocation()

    const navItems = [
        { path: '/', label: 'Home', icon: Home },
        { path: '/players', label: 'Jogadores', icon: Users },
        { path: '/1v1', label: '1v1', icon: Swords },
        { path: '/2v2', label: '2v2', icon: Handshake },
        {
            path: profile?.role === 'admin' ? '/admin' : '/profile',
            label: profile?.role === 'admin' ? 'Admin' : 'Perfil',
            icon: profile?.role === 'admin' ? Settings : User
        },
    ]

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-40 flex items-center justify-around px-2 py-2 border-t border-white/10 sm:hidden"
            style={{ backgroundColor: 'rgba(5,40,30,0.97)', backdropFilter: 'blur(10px)' }}
        >
            {navItems.map(({ path, label, icon: Icon }) => {
                const active = location.pathname === path
                return (
                    <Link
                        key={path}
                        to={path}
                        className="flex flex-col items-center gap-1 px-3 py-1 rounded-xl transition"
                    >
                        <Icon
                            size={22}
                            style={active ? { color: 'var(--color-gold)' } : { color: 'rgba(255,255,255,0.4)' }}
                        />
                        <span
                            className="text-xs font-medium"
                            style={active ? { color: 'var(--color-gold)' } : { color: 'rgba(255,255,255,0.4)' }}
                        >
                            {label}
                        </span>
                    </Link>
                )
            })}
        </nav>
    )
}
