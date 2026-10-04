"use client";

import { useActionState } from "react";
import { register, type FormState } from "./actions";

export default function RegisterForm({ zones, photo, email }: { zones: string[]; photo: string; email: string }) {
  const [state, action, pending] = useActionState<FormState, FormData>(register, {});

  return (
    <form className="card gate" action={action}>
      <p className="muted" style={{ margin: 0 }}>
        Cuenta de Google: <b>{email}</b>
      </p>
      <div className="photo-pick">
        <div className="avatar">{photo ? <img src={photo} alt="Tu foto de Google" /> : "+"}</div>
        <p className="note" style={{ margin: 0, flex: 1 }}>
          Por ahora usamos la foto de tu cuenta de Google.
        </p>
      </div>
      <label>
        Nombre completo
        <input name="name" required maxLength={60} placeholder="Nombre y apellido" autoComplete="name" />
      </label>
      <div className="row">
        <label>
          Edad
          <input name="age" type="number" min={16} max={70} required placeholder="Años" />
        </label>
        <label>
          Cédula
          <input name="cedula" required pattern="[VvEe]-?[0-9]{6,9}" maxLength={12} placeholder="V-12345678" />
        </label>
      </div>
      <label>
        Teléfono
        <input name="phone" type="tel" required minLength={10} maxLength={16} inputMode="tel" placeholder="0414-1234567" autoComplete="tel" />
      </label>
      <label>
        Zona
        <select name="zone" defaultValue={zones[0]}>
          {zones.map((z) => (
            <option key={z}>{z}</option>
          ))}
          <option>Otra zona</option>
        </select>
      </label>
      {state.error && (
        <p className="err" role="alert">
          {state.error}
        </p>
      )}
      <button className="btn" type="submit" disabled={pending}>
        {pending ? "Enviando..." : "Inscribirme"}
      </button>
    </form>
  );
}
