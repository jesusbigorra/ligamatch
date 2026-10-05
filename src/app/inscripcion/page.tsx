import { db } from "@/lib/db";
import { initials } from "@/lib/format";
import { me } from "@/lib/auth";
import { SignInButton } from "@/components/AuthButtons";
import PlayerForm from "@/components/PlayerForm";
import { register, updateOwn } from "./actions";

export const dynamic = "force-dynamic";

type PublicPlayer = { id: number; full_name: string; age: number; zone: string; photo_url: string | null; status: string };

export default async function Inscripcion() {
  const sql = db();
  const user = await me();

  // Lista pública: nunca incluye teléfono, cédula ni correo.
  const players = (await sql`
    select id, full_name, age, zone, photo_url, status from players order by created_at desc`) as PublicPlayer[];

  let left;
  if (!user) {
    left = (
      <div className="card gate">
        <h3>Entra para inscribirte</h3>
        <p className="muted" style={{ margin: 0 }}>
          Usamos tu cuenta de Google para confirmar que eres una persona real. No guardamos tu clave.
        </p>
        <div>
          <SignInButton />
        </div>
      </div>
    );
  } else {
    const mine = (await sql`
      select id, status, full_name, age, cedula, phone, zone, photo_url from players where auth_user_id = ${user.id}`) as {
      id: number;
      status: string;
      full_name: string;
      age: number;
      cedula: string;
      phone: string;
      zone: string;
      photo_url: string | null;
    }[];
    const zones = ((await sql`select zone from venues order by sort`) as { zone: string }[]).map((v) => v.zone);
    if (mine.length > 0) {
      left = (
        <div className="card gate">
          <h3>Tu perfil</h3>
          <p style={{ margin: 0 }}>
            Estado: <span className={`tag ${mine[0].status === "Verificado" ? "ok" : "warn"}`}>{mine[0].status}</span>
          </p>
          <PlayerForm action={updateOwn} zones={zones} values={mine[0]} submitLabel="Guardar cambios" showEmail={false} />
        </div>
      );
    } else {
      left = (
        <div className="card gate">
          <p className="muted" style={{ margin: 0 }}>
            Cuenta de Google: <b>{user.verified ? user.email : ""}</b>
          </p>
          <PlayerForm action={register} zones={zones} submitLabel="Inscribirme" showEmail={false} />
        </div>
      );
    }
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
