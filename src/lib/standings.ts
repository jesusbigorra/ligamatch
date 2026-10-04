export type Match = {
  id: number;
  round: number;
  venue_id: string;
  play_date: string;
  play_time: string;
  home: string;
  away: string;
  home_goals: number | null;
  away_goals: number | null;
};

export type Row = { team: string; pj: number; g: number; e: number; p: number; gf: number; gc: number; dg: number; pts: number };

/** Victoria 3 puntos, empate 1. Desempata por diferencia de goles y goles a favor. */
export function standings(matches: Match[]): Row[] {
  const rows = new Map<string, Row>();
  const get = (team: string) => {
    if (!rows.has(team)) rows.set(team, { team, pj: 0, g: 0, e: 0, p: 0, gf: 0, gc: 0, dg: 0, pts: 0 });
    return rows.get(team)!;
  };
  for (const m of matches) {
    const h = get(m.home);
    const a = get(m.away);
    if (m.home_goals === null || m.away_goals === null) continue;
    h.pj++; a.pj++;
    h.gf += m.home_goals; h.gc += m.away_goals;
    a.gf += m.away_goals; a.gc += m.home_goals;
    if (m.home_goals > m.away_goals) { h.g++; a.p++; }
    else if (m.home_goals < m.away_goals) { a.g++; h.p++; }
    else { h.e++; a.e++; }
  }
  return [...rows.values()]
    .map((r) => ({ ...r, dg: r.gf - r.gc, pts: r.g * 3 + r.e }))
    .sort((x, y) => y.pts - x.pts || y.dg - x.dg || y.gf - x.gf || x.team.localeCompare(y.team));
}
