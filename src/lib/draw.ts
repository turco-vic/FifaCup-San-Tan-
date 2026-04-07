import type { Profile, Duo } from '../types'

// Embaralha array aleatoriamente (Fisher-Yates)
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
      ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

// Sorteia grupos 1v1
export function drawGroups(players: Profile[], groupCount = 4): Profile[][] {
  const shuffled = shuffle(players)
  const groups: Profile[][] = Array.from({ length: groupCount }, () => [])

  shuffled.forEach((player, index) => {
    groups[index % groupCount].push(player)
  })

  return groups
}

// Sorteia duplas 2v2
export function drawDuos(players: Profile[]): [Profile, Profile][] {
  const shuffled = shuffle(players)
  const duos: [Profile, Profile][] = []

  for (let i = 0; i < shuffled.length - 1; i += 2) {
    duos.push([shuffled[i], shuffled[i + 1]])
  }

  return duos
}

// Gera partidas de um grupo (todos contra todos)
export function generateGroupMatches(
  groupIndex: number,
  players: Profile[]
): { home_id: string; away_id: string; group_index: number }[] {
  const matches: { home_id: string; away_id: string; group_index: number }[] = []

  for (let i = 0; i < players.length; i++) {
    for (let j = i + 1; j < players.length; j++) {
      matches.push({
        home_id: players[i].id,
        away_id: players[j].id,
        group_index: groupIndex,
      })
    }
  }

  return matches
}

// Gera partidas da liga 2v2 (todos contra todos)
export function generateLeagueMatches(
  duos: Duo[]
): { home_id: string; away_id: string }[] {
  const matches: { home_id: string; away_id: string }[] = []

  for (let i = 0; i < duos.length; i++) {
    for (let j = i + 1; j < duos.length; j++) {
      matches.push({
        home_id: duos[i].id,
        away_id: duos[j].id,
      })
    }
  }

  return matches
}

// Gera confrontos das quartas de final
// Cruzamento: 1ºA vs 2ºB, 1ºC vs 2ºD, 1ºB vs 2ºA, 1ºD vs 2ºC
export function generateKnockoutMatches(
  groupStandings: { groupIndex: number; standings: { id: string }[] }[]
): { home_id: string; away_id: string; stage: string; match_order: number }[] {
  const matches: { home_id: string; away_id: string; stage: string; match_order: number }[] = []

  const pairs = [
    [0, 1], // 1ºA vs 2ºB
    [2, 3], // 1ºC vs 2ºD
    [1, 0], // 1ºB vs 2ºA
    [3, 2], // 1ºD vs 2ºC
  ]

  pairs.forEach(([gi, gi2], idx) => {
    const first = groupStandings[gi]?.standings[0]
    const second = groupStandings[gi2]?.standings[1]
    if (first && second) {
      matches.push({
        home_id: first.id,
        away_id: second.id,
        stage: 'quarters',
        match_order: idx,
      })
    }
  })

  return matches
}

// Gera a final do 2v2 com os 2 primeiros da tabela
export function generate2v2Final(
  firstId: string,
  secondId: string
): { home_id: string; away_id: string; stage: string; match_order: number } {
  return {
    home_id: firstId,
    away_id: secondId,
    stage: 'final',
    match_order: 0,
  }
}
