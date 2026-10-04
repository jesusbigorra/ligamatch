import Link from "next/link";
import { db } from "@/lib/db";
import { standings, type Match } from "@/lib/standings";
import { fmtDate } from "@/lib/format";
import { me } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function Jornadas() {
  const sql = db();
  const user = await me();

  // Comprobar si el usuario ya está inscrito
  let playerStatus: string | null = null;
  if (user) {
    const rows = (await sql`select status from players where auth_user_id = ${user.id}`) as { status: string }[];
    playerStatus = rows.length > 0 ? rows[0].status : null;
  }

  const venues = (await sql`select id, name from venues order by sort`) as { id: string; name: string }[];
  const matches = (await sql`
    select id, round, venue_id,
           to_char(play_date, 'YYYY-MM-DD') as play_date,
           to_char(play_time, 'HH24:MI') as play_time,
           home, away, home_goals, away_goals
    from matches
    order by round, play_date, play_time`) as Match[];

  const venueName = Object.fromEntries(venues.map((v) => [v.id, v.name]));
  const rounds = new Map<number, Match[]>();
  for (const m of matches) rounds.set(m.round, [...(rounds.get(m.round) ?? []), m]);
  const table = standings(matches);

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

      <div className="two">
        <div style={{ display: "grid", gap: 24, minWidth: 0 }}>
          {rounds.size === 0 && <p className="muted">Todavía no hay partidos programados.</p>}
          {[...rounds.entries()].map(([round, ms]) => (
            <section className="jor" key={round}>
              <h3>
                Jornada {round}{" "}
                <span>
                  {ms.every((m) => m.home_goals !== null) ? "Jugada" : "Por jugar"} · {fmtDate(ms[0].play_date)}
                </span>
              </h3>
              <div className="grid">
                {ms.map((m) => (
                  <div className="card" key={m.id}>
                    <div className="meta">
                      <span>{fmtDate(m.play_date, m.play_time)}</span>
                      <span>{venueName[m.venue_id] ?? ""}</span>
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
        <section style={{ minWidth: 0 }}>
          <h3 style={{ marginBottom: 10 }}>Tabla</h3>
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
          <p className="note" style={{ marginTop: 8 }}>
            Victoria 3 pts, empate 1 pt.
          </p>
        </section>
      </div>
    </>
  );
}
