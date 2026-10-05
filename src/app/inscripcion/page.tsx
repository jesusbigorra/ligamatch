import { db } from "@/lib/db";
import { initials } from "@/lib/format";
import { me } from "@/lib/auth";
import PhotoEditor from "@/components/PhotoEditor";

export const dynamic = "force-dynamic";

type PublicPlayer = { id: number; full_name: string; age: number; zone: string; photo_url: string | null; status: string };

export default async function Inscripcion() {
  const sql = db();
  const user = await me();

  // Lista pública: nunca incluye teléfono, cédula ni correo.
  const players = (await sql`
    select id, full_name, age, zone, photo_url, status from players order by created_at desc`) as PublicPlayer[];

  // Solo el organizador inscribe jugadores. Quien ya tiene perfil puede cambiar su foto.
  let left;
  const mine = user
    ? ((await sql`select status, full_name, photo_url from players where auth_user_id = ${user.id}`) as {
        status: string;
        full_name: string;
        photo_url: string | null;
      }[])
    : [];
  if (mine.length > 0) {
    left = (
      <div className="card gate">
        <h3>Tu perfil</h3>
        <p style={{ margin: 0 }}>
          Estado:{" "}
          <span className={`tag ${mine[0].status === "Verificado" ? "ok" : "warn"}`}>{mine[0].status}</span>
        </p>
        <PhotoEditor initial={mine[0].photo_url} name={mine[0].full_name} />
      </div>
    );
  } else {
    left = (
      <div className="card gate">
        <h3>Inscripciones con el organizador</h3>
        <p className="muted" style={{ margin: 0 }}>
          Los jugadores los inscribe el organizador, que verifica la cédula antes de entregar cualquier premio.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="head">
        <h2>Inscripción de jugadores</h2>
      </div>
      <div className="two">
        {left}
        <div style={{ display: "grid", gap: 10, alignContent: "start", minWidth: 0 }}>
          <h3>Inscritos ({players.length})</h3>
          <p className="note" style={{ margin: 0 }}>
            Teléfono y cédula solo los ve el organizador.
          </p>
          {players.length === 0 && <p className="muted">Aún no hay jugadores inscritos. El primero aparece aquí.</p>}
          {players.map((p) => (
            <div className="card player" key={p.id}>
              <div className="avatar">
                {p.photo_url ? <img src={p.photo_url} alt={`Foto de ${p.full_name}`} /> : initials(p.full_name)}
              </div>
              <div>
                <b>{p.full_name}</b>
                <span className="muted">
                  {p.age} años · {p.zone}
                </span>
                <br />
                <span className={`tag ${p.status === "Verificado" ? "ok" : "warn"}`}>{p.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
