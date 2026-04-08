import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { FaInstagram, FaLinkedin } from 'react-icons/fa'
import { Swords, Handshake, Trophy, Shuffle, X, Menu, Users, BarChart2 } from 'lucide-react'

export default function Sidebar() {
    const { profile } = useAuth()
    const location = useLocation()
    const [open, setOpen] = useState(false)

    const items = [
        { path: '/players', label: 'Jogadores', icon: Users },
        { path: '/top-scorers', label: 'Top Scorers', icon: Trophy },
        { path: '/stats', label: 'Estatísticas', icon: BarChart2 },
        ...(profile?.role === 'admin' ? [{ path: '/draw', label: 'Sorteio', icon: Shuffle }] : []),
        { path: '/1v1', label: '1v1 — Fase de Grupos', icon: Swords },
        { path: '/2v2', label: '2v2 — Pontos Corridos', icon: Handshake },
    ]

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="p-2 text-white/60 hover:text-white transition"
            >
                <Menu size={28} />
            </button>

            {open && (
                <div
                    className="fixed inset-0 z-50 bg-black/60"
                    onClick={() => setOpen(false)}
                />
            )}

            <div
                className={`fixed top-0 right-0 h-full z-50 w-72 flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : 'translate-x-full'}`}
                style={{ backgroundColor: '#081f16', borderLeft: '1px solid rgba(255,255,255,0.1)' }}
            >
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <div className="flex items-center gap-2">
                        <img src="/logo.png" alt="FifaCup" className="h-8 w-8 object-contain" />
                        <span className="font-bold text-sm" style={{ color: 'var(--color-gold)' }}>
                            FifaCup <span className="text-white">Santana</span>
                        </span>
                    </div>
                    <button
                        onClick={() => setOpen(false)}
                        className="text-white/40 hover:text-white transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                <div className="flex flex-col p-4 gap-1 flex-1">
                    {items.map(({ path, label, icon: Icon }) => (
                        <Link
                            key={path}
                            to={path}
                            onClick={() => setOpen(false)}
                            className="flex items-center gap-3 px-4 py-3 rounded-xl transition font-medium text-sm"
                            style={
                                location.pathname === path
                                    ? { backgroundColor: 'var(--color-gold)', color: 'var(--color-green)' }
                                    : { color: 'rgba(255,255,255,0.7)' }
                            }
                            onMouseEnter={e => {
                                if (location.pathname !== path)
                                    e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.05)'
                            }}
                            onMouseLeave={e => {
                                if (location.pathname !== path)
                                    e.currentTarget.style.backgroundColor = 'transparent'
                            }}
                        >
                            <Icon size={18} />
                            {label}
                        </Link>
                    ))}
                </div>

                <div className="px-5 py-4 border-t border-white/10 flex flex-col items-center gap-3">
                    <p className="text-white/30 text-xs">Desenvolvido por Turco</p>
                    <div className="flex items-center gap-4">
                        <a
                            href="https://www.instagram.com/turco.vic"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/30 hover:text-white transition"
                        >
                            <FaInstagram size={20} />
                        </a>
                        <a
                            href="https://www.linkedin.com/in/enzoturcovic/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-white/30 hover:text-white transition"
                        >
                            <FaLinkedin size={20} />
                        </a>
                    </div>
                </div>

            </div>
        </>
    )
}
