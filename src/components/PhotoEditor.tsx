"use client";

import PhotoField from "./PhotoField";
import { updatePhoto } from "@/app/inscripcion/actions";

/** El jugador cambia o quita su propia foto. */
export default function PhotoEditor({ initial, name }: { initial: string | null; name: string }) {
  return (
    <form action={updatePhoto} style={{ display: "grid", gap: 8 }}>
      <PhotoField name="photo" initial={initial} initialsFrom={name} hint="Cambia o quita tu foto y guarda." />
      <div>
        <button type="submit" className="btn sm">
          Guardar foto
        </button>
      </div>
    </form>
  );
}
