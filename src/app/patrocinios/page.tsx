import { db } from "@/lib/db";
import { fmtDate, money } from "@/lib/format";

export const dynamic = "force-dynamic";

// Solo columnas públicas: el estado de pago nunca sale de aquí.
type Slot = {
  id: number;
  name: string;
  type: "Digital" | "Físico";
  price_usd: number;
  per: string;
  descr: string | null;
  priority: string;
  venue_name: string | null;
  sponsor: string | null;
  until: string | null;
};

function SlotCard({ s }: { s: Slot }) {
  return (
    <div className="card slot" style={{ display: "grid", gap: 8, alignContent: "start" }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "start" }}>
        <h3>{s.name}</h3>
        <span className={`tag ${s.sponsor ? "warn" : "ok"}`}>{s.sponsor ? "Ocupado" : "Disponible"}</span>
      </div>
      <div className="muted">{s.descr}</div>
      <div className="price">
        {money(s.price_usd)}{" "}
        <span className="muted" style={{ font: "500 12px var(--mono)" }}>
          / {s.per}
        </span>
      </div>
      <div className="meta" style={{ margin: 0 }}>
        <span>{s.venue_name ?? "Todas las sedes"}</span>
        {s.priority === "Alta" && <span>Destacado</span>}
      </div>
      {s.sponsor && <div className="note">{s.until ? `Ocupado hasta ${fmtDate(s.until)}` : "Ocupado por ahora"}</div>}
    </div>
  );
}

export default async function Patrocinios() {
  const sql = db();
  const slots = (await sql`
    select s.id, s.name, s.type, s.price_usd, s.per, s.descr, s.priority,
           v.name as venue_name, s.sponsor, to_char(s.until, 'YYYY-MM-DD') as until
    from ad_slots s
    left join venues v on v.id = s.venue_id
    order by s.sort, s.id`) as Slot[];
  const allies = [...new Set(slots.filter((s) => s.sponsor).map((s) => s.sponsor as string))];

  return (
    <>
      <div className="head">
        <h2>Anuncia en LigaMatch</h2>
        <span className="note">Tarifas en USD</span>
      </div>
      <p className="muted" style={{ margin: 0, maxWidth: "62ch" }}>
        Tu marca llega a jugadores y público de las cuatro sedes, en la web y en los partidos. El equipo comercial
        confirma disponibilidad y condiciones. El pago se coordina directamente con ellos, fuera de la plataforma.
      </p>
      {allies.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span className="sub-label">Aliados actuales</span>
          {allies.map((a) => (
            <span className="tag" key={a}>
              {a}
            </span>
          ))}
        </div>
      )}
      <section>
        <h3 style={{ marginBottom: 10 }}>Publicidad digital</h3>
        <div className="grid">
          {slots.filter((s) => s.type === "Digital").map((s) => (
            <SlotCard key={s.id} s={s} />
          ))}
        </div>
      </section>
      <section>
        <h3 style={{ marginBottom: 10 }}>Presencia en los encuentros</h3>
        <div className="grid">
          {slots.filter((s) => s.type === "Físico").map((s) => (
            <SlotCard key={s.id} s={s} />
          ))}
        </div>
      </section>
    </>
  );
}
