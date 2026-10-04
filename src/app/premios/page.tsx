import { db } from "@/lib/db";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

type Prize = { id: number; title: string; value_usd: number; kind: string; sponsor: string };

export default async function Premios() {
  const sql = db();
  const prizes = (await sql`select id, title, value_usd, kind, sponsor from prizes order by sort, id`) as Prize[];
  const total = prizes.reduce((s, p) => s + p.value_usd, 0);

  return (
    <>
      <div className="head">
        <h2>Premios</h2>
        <div className="kpis">
          <div>
            <b>{money(total)}</b>
            <span>Bolsa de premios</span>
          </div>
        </div>
      </div>
      <p className="note" style={{ margin: 0 }}>
        Los premios se entregan en persona o por contacto directo del organizador, previa verificación de cédula. La
        plataforma no procesa pagos.
      </p>
      <div className="grid">
        {prizes.map((p) => (
          <div className="card prize" key={p.id} style={{ display: "grid", gap: 6 }}>
            <h3>{p.title}</h3>
            <div className="val">{money(p.value_usd)}</div>
            <div className="muted">{p.kind}</div>
            <div>
              <span className="tag">Aporta: {p.sponsor}</span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
