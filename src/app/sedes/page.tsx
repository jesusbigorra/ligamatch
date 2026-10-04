import { db } from "@/lib/db";
import { money } from "@/lib/format";

export const dynamic = "force-dynamic";

type Venue = {
  id: string;
  name: string;
  zone: string;
  surface: string | null;
  price_usd: number | null;
  notes: string | null;
  photo_url: string | null;
  matches: number;
};

export default async function Sedes() {
  const sql = db();
  const venues = (await sql`
    select v.id, v.name, v.zone, v.surface, v.price_usd, v.notes, v.photo_url,
           (select count(*)::int from matches m where m.venue_id = v.id) as matches
    from venues v
    order by v.sort`) as Venue[];

  return (
    <>
      <div className="head">
        <h2>Sedes</h2>
        <span className="note">Sedes fijas de la plataforma.</span>
      </div>
      <div className="grid">
        {venues.map((v) => {
          const details = [v.surface, v.notes].filter(Boolean).join(" · ") || "Superficie y servicios por definir";
          return (
            <div className="card" key={v.id} style={{ display: "grid", gap: 8, overflow: "hidden" }}>
              {v.photo_url && (
                <img
                  src={v.photo_url}
                  alt={v.name}
                  style={{ height: 180, objectFit: "cover", borderRadius: "8px 8px 0 0", margin: "-16px -16px 0", width: "calc(100% + 32px)" }}
                />
              )}
              <div className="zone">{v.zone}</div>
              <h3>{v.name}</h3>
              <div className="muted">{details}</div>
              <div className="meta" style={{ margin: 0 }}>
                <span>{v.price_usd === null ? "Alquiler por definir" : `Alquiler ${money(v.price_usd)} / hora`}</span>
                <span>{v.matches} partidos</span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
