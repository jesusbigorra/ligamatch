"use client";

import PhotoField from "./PhotoField";
import { updatePhoto } from "@/app/inscripcion/actions";

/** Cambiar o quitar la foto de un jugador ya inscrito. */
export default function PhotoEditor({ id, initial, name }: { id?: number; initial: string | null; name: string }) {
  return (
    <form action={updatePhoto} style={{ display: "grid", gap: 8 }}>
      {id !== undefined && <input type="hidden" name="id" value={id} />}
      <PhotoField name="photo" initial={initial} initialsFrom={name} hint="Cambia o quita la foto y guarda." />
      <div>
        <button type="submit" className="btn sm">
          Guardar foto
        </button>
      </div>
    </form>
  );
}
