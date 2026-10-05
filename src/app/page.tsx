import Link from "next/link";
import { db } from "@/lib/db";
import { standings, type Match } from "@/lib/standings";
import { fmtDate, money } from "@/lib/format";
import { me } from "@/lib/auth";

export const dynamic = "force-dynamic";

type Tournament = {
  id: number;
  name: string;
  venue_id: string;
  play_date: string;
  format: string;
  teams_count: number;
  prize_usd: number;
  status: string;
  venue_name: string;
};

export default async function Jornadas() {
  const sql = db();
  const user = await me();

  let playerStatus: string | null = null;
  if (user) {
    const rows = (await sql`select status from players where auth_user_id = ${user.id}`) as { status: string }[];
    playerStatus = rows.length > 0 ? rows[0].status : null;
  }

  const venues = (await sql`select id, name from venues order by sort`) as { id: string; name: string }[];
  const venueName = Object.fromEntries(venues.map((v) => [v.id, v.name]));

  // Torneos con nombre de sede
  const tournaments = (await sql`
    select t.id, t.name, t.venue_id,
           to_char(t.play_date, 'YYYY-MM-DD') as play_date,
           t.format, t.teams_count, t.prize_usd, t.status,
           coalesce(v.name, '') as venue_name
    from tournaments t
    left join venues v on v.id = t.venue_id
    order by t.play_date desc`) as Tournament[];

  // Partidos del torneo activo o más reciente
  const active = tournaments.find((t) => t.status === "En curso") ?? tournaments[0];

  const matches = active
    ? ((await sql`
        select id, round, venue_id,
               to_char(play_date, 'YYYY-MM-DD') as play_date,
               to_char(play_time, 'HH24:MI') as play_time,
               home, away, home_goals, away_goals,
               phase, group_label
        from matches
        where tournament_id = ${active.id}
        order by
          case phase when 'grupos' then 1 when 'semifinal' then 2 when 'final' then 3 end,
          play_date, play_time`) as (Match & { phase: string; group_label: string | null })[])
    : [];

  // Agrupar partidos por fase
  const phases = new Map<string, (Match & { phase: string; group_label: string | null })[]>();
  for (const m of matches) {
    const key = m.phase ?? "grupos";
    phases.set(key, [...(phases.get(key) ?? []), m]);
  }

  // Tablas por grupo (solo fase de grupos)
  const grupoMatches = matches.filter((m) => m.phase === "grupos");
  const groups = new Map<string, Match[]>();
  for (const m of grupoMatches) {
    const g = m.group_label ?? "Grupo A";
    groups.set(g, [...(groups.get(g) ?? []), m]);
  }

  // Próximas jornadas
  const upcoming = tournaments.filter((t) => t.status === "Próxima").sort((a, b) => a.play_date.localeCompare(b.play_date));

  const phaseLabel: Record<string, string> = {
    grupos: "Fase de Grupos",
    semifinal: "Semifinales",
    final: "Final",
  };

  return (
    <>
      <div className="head">
        <h2>Jornadas</h2>
      </div>

      {user && playerStatus === null && (
        <div className="card" style={{ borderLeft: "6px solid var(--pitch)" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", alignItems: "center", justifyContent: "space-between" }}>
            <span><b>¡Bienvenido, {user.name}!</b> Completa tu inscripción para participar.</span>
            <Link href="/inscripcion" className="btn sm">Inscribirme</Link>
          </div>
        </div>
      )}

      {user && playerStatus === "Pendiente" && (
        <div className="card" style={{ borderLeft: "6px solid var(--warn)" }}>
          <span>Tu perfil está <span className="tag warn">Pendiente</span> de verificación por el organizador.</span>
        </div>
      )}

      {user && playerStatus === "Verificado" && (
        <div className="card" style={{ borderLeft: "6px solid var(--ok)" }}>
          <span>Estás <span className="tag ok">Verificado</span>. Listo para competir.</span>
        </div>
      )}

      {/* Torneo activo */}
      {active && (
        <>
          <div className="card" style={{ borderLeft: "6px solid var(--pitch)", display: "grid", gap: 12 }}>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px 16px", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ fontSize: 24 }}>{active.name}</h2>
              <span className={`tag ${active.status === "En curso" ? "ok" : "warn"}`}>{active.status}</span>
            </div>
            <div className="meta" style={{ margin: 0 }}>
              <span>Fecha: {fmtDate(active.play_date)}</span>
              <span>Sede: {active.venue_name}</span>
              <span>Equipos: {active.teams_count}</span>
              <span>Formato: {active.format}</span>
            </div>
            {active.prize_usd > 0 && (
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <span style={{ fontSize: 18 }}>🏆</span>
                <span style={{ font: "800 18px var(--display)", textTransform: "uppercase", letterSpacing: ".02em" }}>
                  Premio: {money(active.prize_usd)} al campeón
                </span>
              </div>
            )}
          </div>

          <div className="two">
            {/* Partidos por fase */}
            <div style={{ display: "grid", gap: 24, minWidth: 0 }}>
              {matches.length === 0 && <p className="muted">Todavía no hay partidos programados para esta jornada.</p>}
              {[...phases.entries()].map(([phase, ms]) => (
                <section className="jor" key={phase}>
                  <h3>
                    {phaseLabel[phase] ?? phase}{" "}
                    <span>
                      {ms.every((m) => m.home_goals !== null) ? "Jugada" : "Pendientes"} · {ms.length} partidos
                    </span>
                  </h3>
                  <div className="grid">
                    {ms.map((m) => (
                      <div className="card" key={m.id}>
                        <div className="meta">
                          <span>{fmtDate(m.play_date, m.play_time)}</span>
                          <span>{m.group_label ?? phaseLabel[m.phase] ?? ""}</span>
                        </div>
                        <div className="match">
                          <div className="t">{m.home}</div>
                          {m.home_goals !== null ? (
                            <div className="score">
                              {m.home_goals} - {m.away_goals}
                            </div>
                          ) : (
                            <div className="vs">VS</div>
                          )}
                          <div className="t">{m.away}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Sidebar: tablas de grupo */}
            <div style={{ display: "grid", gap: 16, alignContent: "start", minWidth: 0 }}>
              {[...groups.entries()].map(([groupName, groupMs]) => {
                const table = standings(groupMs);
                return (
                  <section key={groupName}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <h3>{groupName}</h3>
                      {groupMs.every((m) => m.home_goals !== null) && <span className="tag ok">Jugado</span>}
                      {groupMs.some((m) => m.home_goals !== null) && !groupMs.every((m) => m.home_goals !== null) && (
                        <span className="tag warn">En juego</span>
                      )}
                    </div>
                    <div className="card tablewrap" style={{ padding: "4px 8px" }}>
                      <table>
                        <thead>
                          <tr>
                            <th>Equipo</th>
                            <th>PJ</th>
                            <th>DG</th>
                            <th>Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {table.map((r, i) => (
                            <tr key={r.team} className={i === 0 ? "lead" : ""}>
                              <td className="team">{r.team}</td>
                              <td>{r.pj}</td>
                              <td>{r.dg > 0 ? `+${r.dg}` : r.dg}</td>
                              <td className="pts">{r.pts}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                );
              })}
              <p className="note" style={{ marginTop: 4 }}>
                Victoria 3 pts, empate 1 pt. 1° y 2° de cada grupo avanzan a semifinal.
              </p>
            </div>
          </div>
        </>
      )}

      {/* Próximas jornadas */}
      {upcoming.length > 0 && (
        <section>
          <div className="head" style={{ marginBottom: 12 }}>
            <h2>Próximas Jornadas</h2>
            <span className="note">Inscripciones abiertas</span>
          </div>
          <div className="grid">
            {upcoming.map((t) => (
              <div className="card" key={t.id} style={{ display: "grid", gap: 10 }}>
                <div className="meta" style={{ margin: 0 }}>
                  <span>{fmtDate(t.play_date)}</span>
                </div>
                <h3>{t.name}</h3>
                <div className="muted">
                  {t.venue_name} · {t.teams_count} equipos · {t.format}
                </div>
                {t.prize_usd > 0 && (
                  <div style={{ font: "700 15px var(--display)", color: "var(--prize)" }}>
                    🏆 {money(t.prize_usd)} al campeón
                  </div>
                )}
                <Link href="/inscripcion" className="btn" style={{ textAlign: "center" }}>
                  Inscribir equipo
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      {!active && upcoming.length === 0 && (
        <p className="muted">No hay jornadas programadas. Pronto anunciaremos la siguiente.</p>
      )}
    </>
  );
}
