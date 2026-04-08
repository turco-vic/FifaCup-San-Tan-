export type Role = 'admin' | 'player'

export type Profile = {
    id: string
    name: string | null
    username: string | null
    avatar_url: string | null
    team_name: string | null
    role: Role
    created_at: string
}

export type Group = {
    id: string
    name: string
}

export type GroupMember = {
    id: string
    group_id: string
    player_id: string
    profile?: Profile
}

export type Duo = {
    id: string
    player1_id: string
    player2_id: string
    team_name: string | null
    duo_name: string | null
    duo_team: string | null
    created_at: string
}

export type MatchMode = '1v1' | '2v2'

export type MatchStage =
    | 'groups'
    | 'quarters'
    | 'semis'
    | 'final'
    | 'league'

export type Match = {
    id: string
    mode: MatchMode
    stage: MatchStage
    home_id: string
    away_id: string
    home_score: number | null
    away_score: number | null
    played: boolean
    match_order: number | null
    created_at: string
}

export type Standing = {
    id: string
    name: string
    played: number
    wins: number
    draws: number
    losses: number
    goals_for: number
    goals_against: number
    goal_diff: number
    points: number
}
