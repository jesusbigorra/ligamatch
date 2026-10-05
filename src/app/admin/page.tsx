import { db } from "@/lib/db";
import { me, isAdmin } from "@/lib/auth";
import { SignInButton } from "@/components/AuthButtons";
import { initials } from "@/lib/format";
import { setPlayerStatus, createPlayer, updatePlayer } from "./actions";
import PlayerForm from "@/components/PlayerForm";

export const dynamic = "force-dynamic";

type AdminPlayer = {
  id: number;
  full_name: string;
  age: number;
  zone: string;
  phone: string;
  cedula: string;
  email: string;
  photo_url: string | null;
  status: string;
};

function StatusButton({ id, status, label, alt }: { id: number; status: string; label: string; alt?: boolean }) {
  return (
    <form action={setPlayerStatus}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button className={`btn sm${alt ? " alt" : ""}`} type="submit">
        {label}
      </button>
    </form>
  );
}

export default async function Admin() {
  const user = await me();

  if (!user) {
    return (
      <>
        <div className="head">
          <h2>Administración</h2>
        </div>
        <div className="card gate login">
          <p style={{ margin: 0 }}>Entra con la cuenta de Google del administrador.</p>
          <div>
            <SignInButton />
          </div>
        </div>
      </>
    );
  }

  if (!(await isAdmin())) {
    return (
      <>
        <div className="head">
          <h2>Administración</h2>
        </div>
        <div className="card gate login">
          <h3>Acceso restringido</h3>
          <p className="muted" style={{ margin: 0 }}>
            Esta cuenta no tiene permisos de administrador.
          </p>
        </div>
      </>
    );
  }

  const sql = db();
  const players = (await sql`
    select id, full_name, age, zone, phone, cedula, email, photo_url, status
    from players order by (status = 'Pendiente') desc, created_at desc`) as AdminPlayer[];
  const zones = ((await sql`select zone from venues order by sort`) as { zone: string }[]).map((v) => v.zone);
  const pending = players.filter((p) => p.status === "Pendiente").length;

  return (
    <>
      <div className="head">
        <h2>Administración</h2>
      </div>
      <div className="kpis">
        <div>
          <b>{players.length}</b>
          <span>Jugadores inscritos</span>
        </div>
        <div>
          <b>{pending}</b>
          <span>Pendientes de verificar</span>
        </div>
      </div>
      <section style={{ marginBottom: 24 }}>
        <h3 style={{ marginBottom: 8 }}>Inscribir jugador</h3>
        <div className="card" style={{ maxWidth: 560 }}>
          <PlayerForm action={createPlayer} zones={zones} submitLabel="Inscribir" />
        </div>
      </section>
      <section>
        <h3 style={{ marginBottom: 4 }}>Jugadores inscritos</h3>
        <p className="note" style={{ margin: "0 0 10px" }}>
          Coteja la cédula con la foto antes de verificar. Un premio solo se entrega a un perfil verificado.
        </p>
        <div className="grid">
          {players.length === 0 && <p className="muted">Aún no hay inscripciones.</p>}
          {players.map((p) => (
            <div className="card req" key={p.id}>
              <div className="player">
                <div className="avatar">
                  {p.photo_url ? <img src={p.photo_url} alt={`Foto de ${p.full_name}`} /> : initials(p.full_name)}
                </div>
                <div>
                  <b>{p.full_name}</b>{" "}
                  <span className={`tag ${p.status === "Verificado" ? "ok" : "warn"}`}>{p.status}</span>
                  <br />
                  <span className="muted">
                    {p.age} años · {p.zone}
                  </span>
                </div>
              </div>
              <div className="muted">
                Cédula {p.cedula} · {p.phone}
              </div>
              <div className="muted">{p.email}</div>
              <details>
                <summary className="btn alt sm" style={{ listStyle: "none" }}>
                  Editar datos y foto
                </summary>
                <div style={{ marginTop: 10 }}>
                  <PlayerForm action={updatePlayer} zones={zones} values={p} submitLabel="Guardar cambios" />
                </div>
              </details>
              <div className="actions">
                {p.status !== "Verificado" && <StatusButton id={p.id} status="Verificado" label="Verificar" />}
                {p.status !== "Rechazado" && <StatusButton id={p.id} status="Rechazado" label="Rechazar" alt />}
                {p.status !== "Pendiente" && <StatusButton id={p.id} status="Pendiente" label="Dejar pendiente" alt />}
              </div>
            </div>
          ))}
        </div>
      </section>
      <p className="note">
        La gestión de espacios publicitarios, solicitudes y partidos pasa a esta pantalla en la siguiente fase.
      </p>
    </>
  );
}
