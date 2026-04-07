import { Link } from 'react-router-dom'
import type { Match, Profile } from '../types'
import { Pencil, Plus, Trophy } from 'lucide-react'

type Props = {
    matches: Match[]
    players: Profile[]
    isAdmin: boolean
    onSelectMatch: (match: Match) => void
}

type SlotProps = {
    playerId: string | null
    label: string
    players: Profile[]
    winner?: boolean
}

function PlayerSlot({ playerId, label, players, winner }: SlotProps) {
    const player = playerId ? players.find(p => p.id === playerId) : null

    if (!player) {
        return (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg border border-white/10 bg-white/5">
                <span className="text-white/25 text-xs italic">{label}</span>
            </div>
        )
    }

    return (
        <Link
            to={`/player/${player.id}`}
            className="flex items-center gap-2 px-3 py-2.5 rounded-lg border transition"
            style={winner
                ? { backgroundColor: 'rgba(201,153,42,0.15)', borderColor: 'var(--color-gold)' }
                : { backgroundColor: 'rgba(255,255,255,0.08)', borderColor: 'rgba(255,255,255,0.15)' }
            }
        >
            <div className="w-6 h-6 rounded-full overflow-hidden bg-white/10 flex-shrink-0 flex items-center justify-center text-xs font-bold border border-white/20">
                {player.avatar_url
                    ? <img src={player.avatar_url} alt="" className="w-full h-full object-cover" />
                    : <span className="text-white/50">{player.username?.charAt(0) ?? player.name?.charAt(0)}</span>
                }
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-white text-xs font-semibold truncate">
                    {player.username ?? player.name}
                </p>
                {player.team_name && (
                    <p className="text-xs truncate" style={{ color: 'var(--color-gold)' }}>{player.team_name}</p>
                )}
            </div>
            {winner && <Trophy size={12} style={{ color: 'var(--color-gold)' }} className="flex-shrink-0" />}
        </Link>
    )
}

type MatchCardProps = {
    match: Match | undefined
    homeLabel: string
    awayLabel: string
    players: Profile[]
    isAdmin: boolean
    onSelectMatch: (match: Match) => void
}

function MatchCard({ match, homeLabel, awayLabel, players, isAdmin, onSelectMatch }: MatchCardProps) {
    const homeWon = match?.played && match.home_score !== null && match.away_score !== null && match.home_score > match.away_score
    const awayWon = match?.played && match.home_score !== null && match.away_score !== null && match.away_score > match.home_score

    return (
        <div className="rounded-xl overflow-hidden border border-white/10">
            <PlayerSlot
                playerId={match?.home_id ?? null}
                label={homeLabel}
                players={players}
                winner={homeWon}
            />
            <div
                className="flex items-center justify-between px-3 py-1.5 border-y border-white/10"
                style={{ backgroundColor: 'rgba(0,0,0,0.2)' }}
            >
                {match?.played ? (
                    <span className="text-white font-bold text-sm w-full text-center">
                        {match.home_score} × {match.away_score}
                    </span>
                ) : (
                    <span className="text-white/20 text-xs w-full text-center">vs</span>
                )}
                {isAdmin && match && (
                    <button
                        onClick={() => onSelectMatch(match)}
                        className="text-white/40 hover:text-white transition flex-shrink-0"
                    >
                        {match.played ? <Pencil size={12} /> : <Plus size={12} />}
                    </button>
                )}
            </div>
            <PlayerSlot
                playerId={match?.away_id ?? null}
                label={awayLabel}
                players={players}
                winner={awayWon}
            />
        </div>
    )
}

export default function KnockoutBracket({ matches, players, isAdmin, onSelectMatch }: Props) {
    const quarters = matches
        .filter(m => m.stage === 'quarters')
        .sort((a, b) => (a.match_order ?? 0) - (b.match_order ?? 0))

    const semis = matches
        .filter(m => m.stage === 'semis')
        .sort((a, b) => (a.match_order ?? 0) - (b.match_order ?? 0))

    const final = matches.find(m => m.stage === 'final')

    const quarterLabels = [
        ['1º Grupo A', '2º Grupo B'],
        ['1º Grupo C', '2º Grupo D'],
        ['1º Grupo B', '2º Grupo A'],
        ['1º Grupo D', '2º Grupo C'],
    ]

    return (
        <div className="flex flex-col items-center gap-8 w-full">

            {/* Quartas */}
            <div className="w-full">
                <p className="text-white/40 text-xs uppercase tracking-widest mb-4 text-center">
                    Quartas de Final
                </p>
                <div className="grid grid-cols-2 gap-3">
                    {quarterLabels.map(([homeLabel, awayLabel], i) => (
                        <MatchCard
                            key={i}
                            match={quarters[i]}
                            homeLabel={homeLabel}
                            awayLabel={awayLabel}
                            players={players}
                            isAdmin={isAdmin}
                            onSelectMatch={onSelectMatch}
                        />
                    ))}
                </div>
            </div>

            {/* Divisor */}
            <div className="w-full flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/20 text-xs uppercase tracking-widest">Semifinais</span>
                <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Semifinais */}
            <div className="w-full max-w-lg">
                <div className="grid grid-cols-2 gap-3">
                    {[0, 1].map(i => (
                        <MatchCard
                            key={i}
                            match={semis[i]}
                            homeLabel={`Vencedor Q${i * 2 + 1}`}
                            awayLabel={`Vencedor Q${i * 2 + 2}`}
                            players={players}
                            isAdmin={isAdmin}
                            onSelectMatch={onSelectMatch}
                        />
                    ))}
                </div>
            </div>

            {/* Divisor */}
            <div className="w-full flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-white/20 text-xs uppercase tracking-widest flex items-center gap-1">
                    <Trophy size={12} style={{ color: 'var(--color-gold)' }} />
                    Final
                </span>
                <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Final */}
            <div className="w-full max-w-xs">
                <MatchCard
                    match={final}
                    homeLabel="Vencedor Semi 1"
                    awayLabel="Vencedor Semi 2"
                    players={players}
                    isAdmin={isAdmin}
                    onSelectMatch={onSelectMatch}
                />
            </div>

        </div>
    )
}
