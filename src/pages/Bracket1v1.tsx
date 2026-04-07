import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useMatches } from '../hooks/useMatches'
import { useStandings } from '../hooks/useStandings'
import GroupTable from '../components/GroupTable'
import ScoreModal from '../components/ScoreModal'
import KnockoutBracket from '../components/KnockoutBracket'
import type { Profile, Match } from '../types'
import { Pencil, Plus } from 'lucide-react'

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

    function getPlayerName(id: string) {
        const p = players.find(p => p.id === id)
        return p?.username ?? p?.name ?? 'Desconhecido'
    }

    if (loading || matchesLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p className="text-white">Carregando...</p>
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
    const knockoutMatches = matches.filter(m => m.stage !== 'groups')

    return (
        <div className="min-h-screen p-6">
            <div className="max-w-2xl mx-auto">

                <h1 className="text-2xl font-bold mb-6" style={{ color: 'var(--color-gold)' }}>
                    1v1
                </h1>

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
                                onSelectMatch={setSelectedMatch}
                            />
                        ))}
                    </div>
                )}

                {tab === 'matamata' && (
                    <KnockoutBracket
                        matches={knockoutMatches}
                        players={players}
                        isAdmin={isAdmin}
                        onSelectMatch={setSelectedMatch}
                    />
                )}

            </div>

            {selectedMatch && (
                <ScoreModal
                    match={selectedMatch}
                    homeName={getPlayerName(selectedMatch.home_id)}
                    awayName={getPlayerName(selectedMatch.away_id)}
                    onClose={() => setSelectedMatch(null)}
                />
            )}
        </div>
    )
}
