import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'
import { ArrowLeft } from 'lucide-react'
import { Skeleton } from '../components/Skeleton'

export default function PlayerProfile() {
    const { id } = useParams()
    const navigate = useNavigate()
    const [player, setPlayer] = useState<Profile | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchPlayer() {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', id)
                .single()

            setPlayer(data)
            setLoading(false)
        }

        if (id) fetchPlayer()
    }, [id])

    if (loading) {
        return (
            <div className="min-h-screen p-6">
                <div className="max-w-sm mx-auto">
                    <Skeleton className="h-9 w-20 mb-6" />
                    <div className="flex flex-col items-center">
                        <Skeleton className="w-28 h-28 rounded-full mb-4" />
                        <Skeleton className="h-6 w-40 mb-2" />
                        <Skeleton className="h-4 w-24 mb-4" />
                        <Skeleton className="h-9 w-32 rounded-full" />
                    </div>
                </div>
            </div>
        )
    }

    if (!player) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-white/40">Jogador não encontrado.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-sm mx-auto">

                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-white/40 hover:text-white transition mb-6 text-sm"
                >
                    <ArrowLeft size={16} />
                    Voltar
                </button>

                <div className="flex flex-col items-center text-center">

                    {/* Avatar */}
                    <div
                        className="w-28 h-28 rounded-full overflow-hidden bg-white/10 border-2 mb-4"
                        style={{ borderColor: 'var(--color-gold)' }}
                    >
                        {player.avatar_url ? (
                            <img src={player.avatar_url} alt={player.name ?? ''} className="w-full h-full object-cover" />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-4xl font-bold text-white/20">
                                {player.name?.charAt(0) ?? '?'}
                            </div>
                        )}
                    </div>

                    {/* Nome real */}
                    <h1 className="text-white font-bold text-xl mb-1">
                        {player.name ?? 'Sem nome'}
                    </h1>

                    {/* Username */}
                    {player.username && (
                        <p className="text-white/40 text-sm mb-4">@{player.username}</p>
                    )}

                    {/* Time */}
                    {player.team_name && (
                        <div
                            className="px-4 py-2 rounded-full font-bold text-sm"
                            style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-green)' }}
                        >
                            ⚽ {player.team_name}
                        </div>
                    )}

                </div>
            </div>
        </div>
    )
}
