import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useMatches } from '../hooks/useMatches'
import { useStandings } from '../hooks/useStandings'
import GroupTable from '../components/GroupTable'
import ScoreModal from '../components/ScoreModal'
import KnockoutBracket from '../components/KnockoutBracket'
import Confetti from '../components/Confetti'
import type { Profile, Match } from '../types'
import { Pencil, Plus, Trophy } from 'lucide-react'
import { Skeleton, SkeletonTable, SkeletonMatch } from '../components/Skeleton'

type GroupData = {
    id: string
    name: string
    players: Profile[]
}

function GroupSection({
    group,
    matches,
    isAdmin,
    onSelectMatch,
}: {
    group: GroupData
    matches: Match[]
    isAdmin: boolean
    onSelectMatch: (match: Match) => void
}) {
    const groupMatches = matches.filter(
        m =>
            m.stage === 'groups' &&
            group.players.map(p => p.id).includes(m.home_id) &&
            group.players.map(p => p.id).includes(m.away_id)
    )
    const standings = useStandings(group.players, groupMatches)

    function getPlayerName(id: string) {
        const p = group.players.find(p => p.id === id)
        return p?.username ?? p?.name ?? 'Sem nome'
    }

    return (
        <div className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
            <div
                className="px-4 py-3 border-b border-white/10"
                style={{ backgroundColor: 'rgba(201,153,42,0.1)' }}
            >
                <h2 className="font-bold" style={{ color: 'var(--color-gold)' }}>
                    {group.name}
                </h2>
            </div>

            <div className="px-2 py-2">
                <GroupTable standings={standings} qualifiers={2} />
            </div>

            <div className="border-t border-white/10 px-4 py-3">
                <p className="text-white/40 text-xs mb-3 uppercase tracking-wider">Partidas</p>
                <div className="flex flex-col gap-2">
                    {groupMatches.map(match => (
                        <div
                            key={match.id}
                            className="flex items-center gap-2 py-2 border-b border-white/5 last:border-0"
                        >
                            <span className="flex-1 text-right text-sm text-white truncate">
                                {getPlayerName(match.home_id)}
                            </span>
                            <div className="flex items-center gap-1 flex-shrink-0">
                                {match.played ? (
                                    <span className="font-bold text-white px-2">
                                        {match.home_score} × {match.away_score}
                                    </span>
                                ) : (
                                    <span className="text-white/30 px-2 text-sm">vs</span>
                                )}
                            </div>
                            <span className="flex-1 text-left text-sm text-white truncate">
                                {getPlayerName(match.away_id)}
                            </span>
                            {isAdmin && (
                                <button
                                    onClick={() => onSelectMatch(match)}
                                    className="p-1.5 rounded border border-white/20 text-white/50 hover:text-white hover:border-white/40 transition flex-shrink-0"
                                >
                                    {match.played ? <Pencil size={12} /> : <Plus size={12} />}
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}

export default function Bracket1v1() {
    const { profile } = useAuth()
    const { matches, loading: matchesLoading } = useMatches('1v1')
    const [groups, setGroups] = useState<GroupData[]>([])
    const [players, setPlayers] = useState<Profile[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedMatch, setSelectedMatch] = useState<Match | null>(null)
    const [tab, setTab] = useState<'grupos' | 'matamata'>('grupos')
    const [generatingQuarters, setGeneratingQuarters] = useState(false)
    const [message, setMessage] = useState('')
    const [showConfetti, setShowConfetti] = useState(false)

    useEffect(() => {
        async function fetchGroups() {
            const { data: groupsData } = await supabase
                .from('groups')
                .select('id, name')
                .order('name')

            if (!groupsData || groupsData.length === 0) {
                setLoading(false)
                return
            }

            const { data: members } = await supabase
                .from('group_members')
                .select('group_id, profile:player_id(id, name, username, avatar_url, team_name, role, created_at)')

            const grouped: GroupData[] = groupsData.map(g => ({
                id: g.id,
                name: g.name,
                players: (members ?? [])
                    .filter(m => m.group_id === g.id)
                    .map(m => m.profile as unknown as Profile),
            }))

            setPlayers(grouped.flatMap(g => g.players))
            setGroups(grouped)
            setLoading(false)
        }

        fetchGroups()
    }, [])

    // Detectar campeão 1v1
    const finalMatch = matches.find(m => m.stage === 'final' && m.mode === '1v1')
    const hasChampion =
        !!finalMatch &&
        finalMatch.played &&
        finalMatch.home_score !== null &&
        finalMatch.away_score !== null &&
        finalMatch.home_score !== finalMatch.away_score

    useEffect(() => {
        if (hasChampion) {
            setShowConfetti(true)
            const t = setTimeout(() => setShowConfetti(false), 7000)
            return () => clearTimeout(t)
        }
    }, [hasChampion])

    function getGroupStandings(group: GroupData) {
        const groupMatches = matches.filter(
            m =>
                m.stage === 'groups' &&
                group.players.map(p => p.id).includes(m.home_id) &&
                group.players.map(p => p.id).includes(m.away_id)
        )

        const standings: Record<string, { id: string; points: number; gd: number; gf: number }> = {}
        group.players.forEach(p => {
            standings[p.id] = { id: p.id, points: 0, gd: 0, gf: 0 }
        })

        groupMatches.filter(m => m.played).forEach(m => {
            const hs = m.home_score ?? 0
            const as_ = m.away_score ?? 0
            standings[m.home_id].gf += hs
            standings[m.home_id].gd += hs - as_
            standings[m.away_id].gf += as_
            standings[m.away_id].gd += as_ - hs
            if (hs > as_) { standings[m.home_id].points += 3 }
            else if (as_ > hs) { standings[m.away_id].points += 3 }
            else { standings[m.home_id].points += 1; standings[m.away_id].points += 1 }
        })

        return Object.values(standings).sort(
            (a, b) => b.points - a.points || b.gd - a.gd || b.gf - a.gf
        )
    }

    async function handleGenerateQuarters() {
        setGeneratingQuarters(true)
        setMessage('')

        const groupStandings = groups.map((g, i) => ({
            groupIndex: i,
            standings: getGroupStandings(g),
        }))

        const pairs = [
            [0, 1],
            [2, 3],
            [1, 0],
            [3, 2],
        ]

        const quarterMatches = pairs.map(([gi, gi2], idx) => ({
            mode: '1v1',
            stage: 'quarters',
            home_id: groupStandings[gi].standings[0].id,
            away_id: groupStandings[gi2].standings[1].id,
            match_order: idx,
            played: false,
        }))

        await supabase.from('matches').delete().eq('mode', '1v1').eq('stage', 'quarters')
        await supabase.from('matches').delete().eq('mode', '1v1').eq('stage', 'semis')
        await supabase.from('matches').delete().eq('mode', '1v1').eq('stage', 'final')
        await supabase.from('matches').insert(quarterMatches)

        setMessage('Quartas de final geradas!')
        setGeneratingQuarters(false)
        setTab('matamata')
    }

    function getPlayerName(id: string) {
        const p = players.find(p => p.id === id)
        return p?.username ?? p?.name ?? 'Desconhecido'
    }

    function handleSelectMatch(match: Match) {
        setSelectedMatch(match)
    }

    function handleCloseModal() {
        setSelectedMatch(null)
    }

    if (loading || matchesLoading) {
        return (
            <div className="min-h-screen p-6">
                <div className="max-w-2xl mx-auto">
                    <Skeleton className="h-8 w-16 mb-6" />
                    <div className="flex gap-2 mb-6">
                        <Skeleton className="h-9 w-32" />
                        <Skeleton className="h-9 w-32" />
                    </div>
                    <div className="flex flex-col gap-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                                <div className="px-4 py-3 border-b border-white/10">
                                    <Skeleton className="h-5 w-24" />
                                </div>
                                <div className="px-2 py-2">
                                    <SkeletonTable />
                                </div>
                                <div className="border-t border-white/10 px-4 py-3">
                                    <Skeleton className="h-3 w-16 mb-3" />
                                    <div className="flex flex-col gap-2">
                                        {[...Array(3)].map((_, j) => <SkeletonMatch key={j} />)}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        )
    }

    if (groups.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-white/40">O sorteio dos grupos ainda não foi realizado.</p>
            </div>
        )
    }

    const isAdmin = profile?.role === 'admin'
    const groupMatches = matches.filter(m => m.stage === 'groups')
    const allGroupsPlayed = groupMatches.length > 0 && groupMatches.every(m => m.played)
    const quartersExist = matches.some(m => m.stage === 'quarters')
    const knockoutMatches = matches.filter(m => m.stage !== 'groups')

    const championName = hasChampion
        ? finalMatch!.home_score! > finalMatch!.away_score!
            ? getPlayerName(finalMatch!.home_id)
            : getPlayerName(finalMatch!.away_id)
        : null

    return (
        <div className="min-h-screen p-6">
            <Confetti active={showConfetti} duration={5000} />

            <div className="max-w-2xl mx-auto">

                <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-gold)' }}>
                    1v1
                </h1>

                {/* Banner campeão */}
                {hasChampion && championName && (
                    <div
                        className="mb-6 px-4 py-4 rounded-xl text-center border"
                        style={{
                            borderColor: 'var(--color-gold)',
                            backgroundColor: 'rgba(201,153,42,0.1)',
                        }}
                    >
                        <p className="text-white/50 text-xs mb-1">🏆 Campeão FifaCup 1v1</p>
                        <p className="font-bold text-xl" style={{ color: 'var(--color-gold)' }}>
                            {championName}
                        </p>
                        <button
                            onClick={() => setShowConfetti(true)}
                            className="mt-2 text-xs px-3 py-1 rounded-full border border-white/20 text-white/40 hover:text-white hover:border-white/40 transition"
                        >
                            🎊 Celebrar novamente
                        </button>
                    </div>
                )}

                <div className="flex gap-2 mb-6">
                    {(['grupos', 'matamata'] as const).map(t => (
                        <button
                            key={t}
                            onClick={() => setTab(t)}
                            className="px-5 py-2 rounded-lg font-bold text-sm transition"
                            style={tab === t
                                ? { backgroundColor: 'var(--color-gold)', color: 'var(--color-green)' }
                                : { backgroundColor: 'rgba(255,255,255,0.1)', color: 'white' }
                            }
                        >
                            {t === 'grupos' ? 'Fase de Grupos' : 'Mata-mata'}
                        </button>
                    ))}
                </div>

                {tab === 'grupos' && (
                    <div className="flex flex-col gap-6">
                        {groups.map(group => (
                            <GroupSection
                                key={group.id}
                                group={group}
                                matches={matches}
                                isAdmin={isAdmin}
                                onSelectMatch={handleSelectMatch}
                            />
                        ))}

                        {isAdmin && allGroupsPlayed && (
                            <button
                                onClick={handleGenerateQuarters}
                                disabled={generatingQuarters}
                                className="w-full py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                                style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-green)' }}
                            >
                                <Trophy size={16} />
                                {generatingQuarters ? 'Gerando...' : quartersExist ? 'Regerar Quartas de Final' : 'Gerar Quartas de Final'}
                            </button>
                        )}

                        {message && (
                            <p className="text-green-400 text-sm text-center">{message}</p>
                        )}
                    </div>
                )}

                {tab === 'matamata' && (
                    <KnockoutBracket
                        matches={knockoutMatches}
                        players={players}
                        isAdmin={isAdmin}
                        onSelectMatch={(match) => {
                            handleSelectMatch(match)
                        }}
                    />
                )}

            </div>

            {selectedMatch && (
                <ScoreModal
                    match={selectedMatch}
                    homeName={getPlayerName(selectedMatch.home_id)}
                    awayName={getPlayerName(selectedMatch.away_id)}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    )
}
