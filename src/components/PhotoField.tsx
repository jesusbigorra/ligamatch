"use client";

import { useRef, useState } from "react";
import { initials } from "@/lib/format";

const SIZE = 256;

/** Reduce la imagen a un cuadrado de 256px (JPEG) para guardarla ligera. */
async function shrink(file: File): Promise<string> {
  const bitmap = await createImageBitmap(file);
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas");
  ctx.drawImage(bitmap, (bitmap.width - side) / 2, (bitmap.height - side) / 2, side, side, 0, 0, SIZE, SIZE);
  return canvas.toDataURL("image/jpeg", 0.8);
}

/**
 * Selector de foto. Deja el resultado en un input oculto `photo`:
 * vacío = sin foto; "data:image/..." = foto nueva.
 */
export default function PhotoField({
  name,
  initial,
  initialsFrom,
  hint,
}: {
  name: string;
  initial: string | null;
  initialsFrom: string;
  hint?: string;
}) {
  const [value, setValue] = useState<string>(initial ?? "");
  const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setErr("");
    try {
      setValue(await shrink(f));
    } catch {
      setErr("No se pudo leer esa imagen. Prueba con otra.");
    }
    e.target.value = "";
  }

  return (
    <div className="photo-pick">
      <div className="avatar">
        {value ? <img src={value} alt="Foto del jugador" /> : initialsFrom ? initials(initialsFrom) : "+"}
      </div>
      <div style={{ flex: 1, display: "grid", gap: 6 }}>
        <input type="hidden" name={name} value={value} />
        <input ref={input} type="file" accept="image/*" onChange={onFile} hidden />
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <button type="button" className="btn alt sm" onClick={() => input.current?.click()}>
            {value ? "Cambiar foto" : "Subir foto"}
          </button>
          {value && (
            <button type="button" className="btn alt sm" onClick={() => setValue("")}>
              Quitar
            </button>
          )}
        </div>
        <p className="note" style={{ margin: 0 }}>
          {err || hint || "Opcional."}
        </p>
      </div>
    </div>
  );
}
