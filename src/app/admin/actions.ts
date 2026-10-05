"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { readPlayer, normCedula } from "@/lib/player";

const STATUSES = ["Pendiente", "Verificado", "Rechazado"];

export async function setPlayerStatus(fd: FormData) {
  // Se vuelve a comprobar en el servidor: ocultar el botón no basta.
  if (!(await isAdmin())) throw new Error("No autorizado");
  const id = Number(fd.get("id"));
  const status = String(fd.get("status"));
  if (!Number.isInteger(id) || !STATUSES.includes(status)) throw new Error("Datos inválidos");

  const sql = db();
  await sql`update players set status = ${status} where id = ${id}`;
  revalidatePath("/admin");
  revalidatePath("/inscripcion");
}

export type FormState = { error?: string; ok?: boolean };

const dupMessage = (e: unknown) => {
  const err = e as { code?: string };
  return err.code === "23505" ? "Esa cédula ya está inscrita." : null;
};

/** Solo el admin inscribe jugadores. Quedan verificados: el admin conoce a quien inscribe. */
export async function createPlayer(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!(await isAdmin())) return { error: "No autorizado." };
  const r = readPlayer(fd);
  if ("error" in r) return { error: r.error };
  const p = r.data;
  const sql = db();
  try {
    await sql`
      insert into players (auth_user_id, email, full_name, age, phone, cedula, cedula_norm, zone, photo_url, status)
      values (${"manual-" + crypto.randomUUID()}, ${p.email}, ${p.name}, ${p.age}, ${p.phone}, ${p.cedula},
              ${normCedula(p.cedula)}, ${p.zone}, ${p.photo}, 'Verificado')`;
  } catch (e) {
    const m = dupMessage(e);
    if (m) return { error: m };
    throw e;
  }
  revalidatePath("/admin");
  revalidatePath("/inscripcion");
  return { ok: true };
}

/** Edita cualquier dato de un jugador (incluida la foto). */
export async function updatePlayer(_prev: FormState, fd: FormData): Promise<FormState> {
  if (!(await isAdmin())) return { error: "No autorizado." };
  const id = Number(fd.get("id"));
  if (!Number.isInteger(id)) return { error: "Jugador inválido." };
  const r = readPlayer(fd);
  if ("error" in r) return { error: r.error };
  const p = r.data;
  const sql = db();
  try {
    await sql`
      update players set full_name = ${p.name}, age = ${p.age}, phone = ${p.phone}, cedula = ${p.cedula},
        cedula_norm = ${normCedula(p.cedula)}, zone = ${p.zone}, email = ${p.email}, photo_url = ${p.photo}
      where id = ${id}`;
  } catch (e) {
    const m = dupMessage(e);
    if (m) return { error: m };
    throw e;
  }
  revalidatePath("/admin");
  revalidatePath("/inscripcion");
  return { ok: true };
}
