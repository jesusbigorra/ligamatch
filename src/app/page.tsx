import { db } from "@/lib/db";
import { standings, type Match } from "@/lib/standings";
import { fmtDate } from "@/lib/format";

export const dynamic = "force-dynamic";

export default async function Jornadas() {
  const sql = db();
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
