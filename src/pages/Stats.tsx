import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Match, Profile } from '../types'
import { Trophy, Swords, Shield, Zap } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

type MatchWithPlayers = Match & {
    home_player: Profile | null
    away_player: Profile | null
}

type PlayerStat = {
    id: string
    name: string
    goals_for: number
    goals_against: number
    wins: number
    draws: number
    losses: number
    played: number
    points: number
}

const COLORS = ['#C9992A', '#4ade80', '#f87171', '#60a5fa', '#a78bfa', '#fb923c']

export default function Stats() {
    const [matches, setMatches] = useState<MatchWithPlayers[]>([])
    const [players, setPlayers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function fetchData() {
            const { data: playersData } = await supabase
                .from('profiles')
                .select('*')
                .eq('role', 'player')

            const { data: matchesData } = await supabase
                .from('matches')
                .select('*')
                .eq('mode', '1v1')
                .eq('played', true)

            const playersList = playersData ?? []
            const matchesList = matchesData ?? []

            const enriched: MatchWithPlayers[] = matchesList.map(m => ({
                ...m,
                home_player: playersList.find(p => p.id === m.home_id) ?? null,
                away_player: playersList.find(p => p.id === m.away_id) ?? null,
            }))

            setPlayers(playersList)
            setMatches(enriched)
            setLoading(false)
        }

        fetchData()
    }, [])

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-white">Carregando...</p>
            </div>
        )
    }

    if (matches.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-white/40">Nenhuma partida jogada ainda.</p>
            </div>
        )
    }

    // Calcula stats por jogador
    const statsMap: Record<string, PlayerStat> = {}
    players.forEach(p => {
        statsMap[p.id] = {
            id: p.id,
            name: p.username ?? p.name ?? '?',
            goals_for: 0,
            goals_against: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            played: 0,
            points: 0,
        }
    })

    matches.forEach(m => {
        const hs = m.home_score ?? 0
        const as_ = m.away_score ?? 0
        const home = statsMap[m.home_id]
        const away = statsMap[m.away_id]
        if (!home || !away) return

        home.played++
        away.played++
        home.goals_for += hs
        home.goals_against += as_
        away.goals_for += as_
        away.goals_against += hs

        if (hs > as_) {
            home.wins++; home.points += 3; away.losses++
        } else if (as_ > hs) {
            away.wins++; away.points += 3; home.losses++
        } else {
            home.draws++; away.draws++
            home.points++; away.points++
        }
    })

    const playerStats = Object.values(statsMap)
        .filter(s => s.played > 0)
        .sort((a, b) => b.points - a.points)

    // Maior goleada
    const biggestWin = matches.reduce((best, m) => {
        const diff = Math.abs((m.home_score ?? 0) - (m.away_score ?? 0))
        const bestDiff = Math.abs((best.home_score ?? 0) - (best.away_score ?? 0))
        return diff > bestDiff ? m : best
    }, matches[0])

    const bwHome = biggestWin.home_score ?? 0
    const bwAway = biggestWin.away_score ?? 0
    const biggestWinData = bwHome > bwAway
        ? { winner: biggestWin.home_player, loser: biggestWin.away_player, ws: bwHome, ls: bwAway }
        : { winner: biggestWin.away_player, loser: biggestWin.home_player, ws: bwAway, ls: bwHome }

    // Jogo mais emocionante
    const closestGame = matches
        .filter(m => (m.home_score ?? 0) !== (m.away_score ?? 0))
        .reduce((best, m) => {
            const diff = Math.abs((m.home_score ?? 0) - (m.away_score ?? 0))
            const bestDiff = Math.abs((best.home_score ?? 0) - (best.away_score ?? 0))
            return diff < bestDiff ? m : best
        }, matches[0])

    // Mais gols em uma partida
    const highestScoring = matches.reduce((best, m) => {
        const total = (m.home_score ?? 0) + (m.away_score ?? 0)
        const bestTotal = (best.home_score ?? 0) + (best.away_score ?? 0)
        return total > bestTotal ? m : best
    }, matches[0])

    const bestAttack = [...playerStats].sort((a, b) => b.goals_for - a.goals_for)[0]
    const bestDefense = [...playerStats].sort((a, b) => a.goals_against - b.goals_against)[0]

    function playerName(p: Profile | null) {
        return p?.username ?? p?.name ?? 'Desconhecido'
    }

    // Dados para gráficos
    const goalsChartData = playerStats.map(s => ({
        name: s.name.length > 8 ? s.name.slice(0, 8) + '.' : s.name,
        Marcados: s.goals_for,
        Sofridos: s.goals_against,
    }))

    const pointsChartData = playerStats.map(s => ({
        name: s.name.length > 8 ? s.name.slice(0, 8) + '.' : s.name,
        Pontos: s.points,
    }))

    const winRateData = playerStats.map(s => ({
        name: s.name.length > 8 ? s.name.slice(0, 8) + '.' : s.name,
        Aproveitamento: s.played > 0 ? Math.round((s.wins / s.played) * 100) : 0,
    }))

    const totalWins = playerStats.reduce((a, s) => a + s.wins, 0)
    const totalDraws = playerStats.reduce((a, s) => a + s.draws, 0) / 2
    const totalLosses = playerStats.reduce((a, s) => a + s.losses, 0)

    const resultsPieData = [
        { name: 'Vitórias', value: totalWins },
        { name: 'Empates', value: Math.round(totalDraws) },
        { name: 'Derrotas', value: totalLosses },
    ].filter(d => d.value > 0)

    const tooltipStyle = {
        backgroundColor: '#081f16',
        border: '1px solid rgba(255,255,255,0.1)',
        borderRadius: '8px',
        color: 'white',
    }

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-2xl mx-auto">

                <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-gold)' }}>
                    Estatísticas — 1v1
                </h1>

                {/* Cards de destaque */}
                <div className="flex flex-col gap-4 mb-8">

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Trophy size={14} style={{ color: 'var(--color-gold)' }} />
                            <p className="text-white/40 text-xs uppercase tracking-wider">Maior Goleada</p>
                        </div>
                        <p className="text-white font-bold">
                            {playerName(biggestWinData.winner)} {biggestWinData.ws} × {biggestWinData.ls} {playerName(biggestWinData.loser)}
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Zap size={14} style={{ color: 'var(--color-gold)' }} />
                            <p className="text-white/40 text-xs uppercase tracking-wider">Jogo Mais Emocionante</p>
                        </div>
                        <p className="text-white font-bold">
                            {playerName(closestGame.home_player)} {closestGame.home_score} × {closestGame.away_score} {playerName(closestGame.away_player)}
                        </p>
                    </div>

                    <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                        <div className="flex items-center gap-2 mb-2">
                            <Swords size={14} style={{ color: 'var(--color-gold)' }} />
                            <p className="text-white/40 text-xs uppercase tracking-wider">Mais Gols em uma Partida</p>
                        </div>
                        <p className="text-white font-bold">
                            {playerName(highestScoring.home_player)} {highestScoring.home_score} × {highestScoring.away_score} {playerName(highestScoring.away_player)}
                        </p>
                        <p className="text-white/40 text-xs mt-1">
                            {(highestScoring.home_score ?? 0) + (highestScoring.away_score ?? 0)} gols no total
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        {bestAttack && (
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Swords size={14} style={{ color: 'var(--color-gold)' }} />
                                    <p className="text-white/40 text-xs uppercase tracking-wider">Melhor Ataque</p>
                                </div>
                                <p className="text-white font-bold truncate">{bestAttack.name}</p>
                                <p className="text-white/40 text-xs">{bestAttack.goals_for} gols</p>
                            </div>
                        )}
                        {bestDefense && (
                            <div className="p-4 rounded-xl bg-white/5 border border-white/10">
                                <div className="flex items-center gap-2 mb-2">
                                    <Shield size={14} style={{ color: 'var(--color-gold)' }} />
                                    <p className="text-white/40 text-xs uppercase tracking-wider">Melhor Defesa</p>
                                </div>
                                <p className="text-white font-bold truncate">{bestDefense.name}</p>
                                <p className="text-white/40 text-xs">{bestDefense.goals_against} sofridos</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Gráfico: Gols marcados vs sofridos */}
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-6">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Gols Marcados vs Sofridos</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={goalsChartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                            <XAxis dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                            <YAxis tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                            <Bar dataKey="Marcados" fill="#C9992A" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="Sofridos" fill="rgba(248,113,113,0.7)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Gráfico: Pontos */}
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-6">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Pontos por Jogador</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={pointsChartData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                            <XAxis type="number" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                            <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} width={60} />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Bar dataKey="Pontos" fill="#C9992A" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Gráfico: Aproveitamento */}
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-6">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Aproveitamento (%)</p>
                    <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={winRateData} layout="vertical" margin={{ top: 0, right: 20, left: 10, bottom: 0 }}>
                            <XAxis type="number" domain={[0, 100]} tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} />
                            <YAxis type="category" dataKey="name" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 11 }} width={60} />
                            <Tooltip contentStyle={tooltipStyle} formatter={(v) => `${v}%`} />
                            <Bar dataKey="Aproveitamento" fill="#4ade80" radius={[0, 4, 4, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Gráfico: Pizza de resultados */}
                <div className="rounded-xl bg-white/5 border border-white/10 p-4 mb-6">
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-4">Distribuição de Resultados</p>
                    <ResponsiveContainer width="100%" height={220}>
                        <PieChart>
                            <Pie
                                data={resultsPieData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={90}
                                paddingAngle={3}
                                dataKey="value"
                            >
                                {resultsPieData.map((_, index) => (
                                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={tooltipStyle} />
                            <Legend wrapperStyle={{ color: 'rgba(255,255,255,0.4)', fontSize: 12 }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>

                {/* Tabela completa */}
                <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                    <div className="px-4 py-3 border-b border-white/10" style={{ backgroundColor: 'rgba(201,153,42,0.1)' }}>
                        <p className="font-bold text-sm" style={{ color: 'var(--color-gold)' }}>Tabela Completa</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-xs">
                            <thead>
                                <tr className="text-white/40 border-b border-white/10">
                                    <th className="text-left py-2 pl-4">Jogador</th>
                                    <th className="text-center py-2">J</th>
                                    <th className="text-center py-2">V</th>
                                    <th className="text-center py-2">E</th>
                                    <th className="text-center py-2">D</th>
                                    <th className="text-center py-2">GM</th>
                                    <th className="text-center py-2">GS</th>
                                    <th className="text-center py-2 pr-4">Pts</th>
                                </tr>
                            </thead>
                            <tbody>
                                {playerStats.map((s, i) => (
                                    <tr key={s.id} className="border-t border-white/5">
                                        <td className="py-2 pl-4 text-white font-medium">{i + 1}. {s.name}</td>
                                        <td className="text-center py-2 text-white/50">{s.played}</td>
                                        <td className="text-center py-2 text-green-400 font-medium">{s.wins}</td>
                                        <td className="text-center py-2 text-white/50">{s.draws}</td>
                                        <td className="text-center py-2 text-red-400 font-medium">{s.losses}</td>
                                        <td className="text-center py-2 text-white/50">{s.goals_for}</td>
                                        <td className="text-center py-2 text-white/50">{s.goals_against}</td>
                                        <td className="text-center py-2 pr-4 font-bold" style={{ color: 'var(--color-gold)' }}>{s.points}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

            </div>
        </div>
    )
}
