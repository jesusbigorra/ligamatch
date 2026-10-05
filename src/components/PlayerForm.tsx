"use client";

import { useActionState, useEffect, useState } from "react";
import PhotoField from "./PhotoField";
import type { FormState } from "@/app/admin/actions";

export type PlayerValues = {
  id?: number;
  full_name?: string;
  age?: number;
  cedula?: string;
  phone?: string;
  zone?: string;
  email?: string;
  photo_url?: string | null;
};

/** Formulario de jugador para el admin: sirve para crear (sin id) y para editar (con id). */
export default function PlayerForm({
  action,
  zones,
  values = {},
  submitLabel,
}: {
  action: (prev: FormState, fd: FormData) => Promise<FormState>;
  zones: string[];
  values?: PlayerValues;
  submitLabel: string;
}) {
  const [state, run, pending] = useActionState<FormState, FormData>(action, {});
  const [n, setN] = useState(0);
  // Tras inscribir a alguien nuevo se limpia el formulario.
  useEffect(() => {
    if (state.ok && values.id === undefined) setN((x) => x + 1);
  }, [state, values.id]);
  const all = values.zone && !zones.includes(values.zone) ? [...zones, values.zone] : zones;

  return (
    <form className="gate" action={run} key={n}>
      {values.id !== undefined && <input type="hidden" name="id" value={values.id} />}
      <PhotoField name="photo" initial={values.photo_url ?? null} initialsFrom={values.full_name ?? ""} hint="Opcional. Sin foto se muestran las iniciales." />
      <label>
        Nombre completo
        <input name="name" required maxLength={60} defaultValue={values.full_name} placeholder="Nombre y apellido" />
      </label>
      <div className="row">
        <label>
          Edad
          <input name="age" type="number" min={16} max={70} required defaultValue={values.age} placeholder="Años" />
        </label>
        <label>
          Cédula
          <input name="cedula" required pattern="[VvEe]-?[0-9]{6,9}" maxLength={12} defaultValue={values.cedula} placeholder="V-12345678" />
        </label>
      </div>
      <div className="row">
        <label>
          Teléfono
          <input name="phone" type="tel" required minLength={10} maxLength={16} inputMode="tel" defaultValue={values.phone} placeholder="0414-1234567" />
        </label>
        <label>
          Correo (opcional)
          <input name="email" type="email" defaultValue={values.email} placeholder="correo@ejemplo.com" />
        </label>
      </div>
      <label>
        Zona
        <select name="zone" defaultValue={values.zone ?? all[0]}>
          {all.map((z) => (
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
      {state.ok && <p className="note">Guardado.</p>}
      <div>
        <button className="btn" type="submit" disabled={pending}>
          {pending ? "Guardando..." : submitLabel}
        </button>
      </div>
    </form>
  );
}
