"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { me } from "@/lib/auth";
import { readPlayer, normCedula, type FormState } from "@/lib/player";

const refresh = () => {
  revalidatePath("/inscripcion");
  revalidatePath("/admin");
};

/** Autoinscripción: requiere sesión de Google; el perfil queda ligado a esa cuenta. */
export async function register(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await me();
  if (!user) return { error: "Entra con Google para inscribirte." };
  if (!user.verified) return { error: "Tu cuenta de Google no tiene un correo verificado." };
  const r = readPlayer(fd);
  if ("error" in r) return { error: r.error };
  const p = r.data;

  const sql = db();
  try {
    await sql`
      insert into players (auth_user_id, email, full_name, age, phone, cedula, cedula_norm, zone, photo_url)
      values (${user.id}, ${user.email}, ${p.name}, ${p.age}, ${p.phone}, ${p.cedula}, ${normCedula(p.cedula)}, ${p.zone}, ${p.photo})`;
  } catch (e) {
    const err = e as { code?: string; message?: string };
    if (err.code === "23505") {
      return {
        error: String(err.message).includes("cedula_norm") ? "Esa cédula ya está inscrita." : "Ya tienes un perfil inscrito.",
      };
    }
    throw e;
  }
  refresh();
  return { ok: true };
}

/** El jugador edita su propio perfil. Si cambia la cédula, vuelve a Pendiente para que se verifique de nuevo. */
export async function updateOwn(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await me();
  if (!user) return { error: "Entra con Google." };
  const r = readPlayer(fd);
  if ("error" in r) return { error: r.error };
  const p = r.data;
  const norm = normCedula(p.cedula);

  const sql = db();
  try {
    await sql`
      update players set full_name = ${p.name}, age = ${p.age}, phone = ${p.phone}, zone = ${p.zone},
        photo_url = ${p.photo}, cedula = ${p.cedula},
        status = case when cedula_norm = ${norm} then status else 'Pendiente' end,
        cedula_norm = ${norm}
      where auth_user_id = ${user.id}`;
  } catch (e) {
    if ((e as { code?: string }).code === "23505") return { error: "Esa cédula ya está inscrita." };
    throw e;
  }
  refresh();
  return { ok: true };
}
