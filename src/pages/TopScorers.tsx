import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import type { Profile } from '../types'
import { Trophy } from 'lucide-react'
import { Skeleton, SkeletonCard } from '../components/Skeleton'

type PlayerGoals = Profile & { total_goals: number }

export default function TopScorers() {
    const [players, setPlayers] = useState<PlayerGoals[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchGoals() {
            const { data: goalsData } = await supabase
                .from('goals')
                .select('player_id, quantity')

            const { data: playersData } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'player')

            if (!goalsData || !playersData) {
                setLoading(false)
                return
            }

            const goalMap: Record<string, number> = {}
            goalsData.forEach(g => {
                goalMap[g.player_id] = (goalMap[g.player_id] ?? 0) + g.quantity
            })

            const ranked = playersData
                .map(p => ({ ...p, total_goals: goalMap[p.id] ?? 0 }))
                .filter(p => p.total_goals > 0)
                .sort((a, b) => b.total_goals - a.total_goals)

            setPlayers(ranked)
            setLoading(false)
        }

        fetchGoals()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen p-6">
                <div className="max-w-2xl mx-auto">
                    <Skeleton className="h-8 w-40 mb-6" />
                    <div className="flex flex-col gap-2">
                        {[...Array(8)].map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-2xl mx-auto">

                <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-gold)' }}>
                    Top Scorers — 1v1
                </h1>

                {players.length === 0 ? (
                    <p className="text-white/40 text-center mt-12">
                        Nenhum gol registrado ainda.
                    </p>
                ) : (
                    <div className="flex flex-col gap-2">
                        {players.map((player, i) => (
                            <Link
                                key={player.id}
                                to={`/player/${player.id}`}
                                className="flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition"
                            >
                                <div className="w-8 text-center flex-shrink-0">
                                    {i === 0 ? (
                                        <Trophy size={20} style={{ color: 'var(--color-gold)' }} />
                                    ) : (
                                        <span className="text-white/40 font-bold text-sm">{i + 1}</span>
                                    )}
                                </div>

                                <div
                                    className="w-10 h-10 rounded-full overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center font-bold border"
                                    style={{ borderColor: i === 0 ? 'var(--color-gold)' : 'transparent' }}
                                >
                                    {player.avatar_url
                                        ? <img src={player.avatar_url} alt="" className="w-full h-full object-cover" />
                                        : <span className="text-white/40">{player.name?.charAt(0)}</span>
                                    }
                                </div>

                                <div className="flex-1 min-w-0">
                                    <p className="text-white font-bold truncate">
                                        {player.username ?? player.name}
                                    </p>
                                    {player.team_name && (
                                        <p className="text-white/40 text-xs truncate">{player.team_name}</p>
                                    )}
                                </div>

                                <div className="flex-shrink-0 text-right">
                                    <p className="text-2xl font-bold" style={{ color: 'var(--color-gold)' }}>
                                        {player.total_goals}
                                    </p>
                                    <p className="text-white/30 text-xs">
                                        {player.total_goals === 1 ? 'gol' : 'gols'}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

            </div>
        </div>
    )
}
