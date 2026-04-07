import { useState } from 'react'
import { supabase } from '../lib/supabase'
import type { Match } from '../types'
import { X } from 'lucide-react'

type Props = {
    match: Match
    homeName: string
    awayName: string
    onClose: () => void
}

export default function ScoreModal({ match, homeName, awayName, onClose }: Props) {
    const [homeScore, setHomeScore] = useState(match.home_score?.toString() ?? '')
    const [awayScore, setAwayScore] = useState(match.away_score?.toString() ?? '')
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')

    async function handleSave() {
        const hs = parseInt(homeScore)
        const as_ = parseInt(awayScore)

        if (isNaN(hs) || isNaN(as_) || hs < 0 || as_ < 0) {
            setError('Placar inválido.')
            return
        }

        setSaving(true)
        const { error } = await supabase
            .from('matches')
            .update({ home_score: hs, away_score: as_, played: true })
            .eq('id', match.id)

        if (error) {
            setError('Erro ao salvar.')
            setSaving(false)
            return
        }

        onClose()
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">
            <div
                className="w-full max-w-sm rounded-2xl p-6 border border-white/10"
                style={{ backgroundColor: 'var(--color-green)' }}
            >
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-white font-bold text-lg">Lançar Resultado</h2>
                    <button
                        onClick={onClose}
                        className="text-white/40 hover:text-white transition"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Times */}
                <div className="flex flex-col gap-3 mb-6">
                    <div>
                        <p className="text-white/50 text-xs mb-1 truncate">{homeName}</p>
                        <input
                            type="number"
                            min="0"
                            value={homeScore}
                            onChange={e => setHomeScore(e.target.value)}
                            className="w-full text-center text-3xl font-bold bg-white/10 text-white rounded-xl py-3 border border-white/20 focus:outline-none focus:border-yellow-500"
                        />
                    </div>

                    <div className="text-center text-white/20 text-sm font-bold">×</div>

                    <div>
                        <p className="text-white/50 text-xs mb-1 truncate">{awayName}</p>
                        <input
                            type="number"
                            min="0"
                            value={awayScore}
                            onChange={e => setAwayScore(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && handleSave()}
                            className="w-full text-center text-3xl font-bold bg-white/10 text-white rounded-xl py-3 border border-white/20 focus:outline-none focus:border-yellow-500"
                        />
                    </div>
                </div>

                {error && <p className="text-red-400 text-sm text-center mb-4">{error}</p>}

                <div className="flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 rounded-xl text-white border border-white/20 hover:bg-white/10 transition font-medium"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex-1 py-3 rounded-xl font-bold transition"
                        style={{ backgroundColor: 'var(--color-gold)', color: 'var(--color-green)' }}
                    >
                        {saving ? 'Salvando...' : 'Salvar'}
                    </button>
                </div>

            </div>
        </div>
    )
}
