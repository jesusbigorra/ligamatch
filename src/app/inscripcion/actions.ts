"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { me } from "@/lib/auth";

export type FormState = { error?: string };

const normCedula = (s: string) => s.replace(/-/g, "").toUpperCase();

export async function register(_prev: FormState, fd: FormData): Promise<FormState> {
  const user = await me();
  if (!user) return { error: "Entra con Google para inscribirte." };
  const email = user.verified ? user.email : null;
  if (!email) return { error: "Tu cuenta de Google no tiene un correo verificado." };

  const name = String(fd.get("name") ?? "").trim();
  const age = Number(fd.get("age"));
  const phone = String(fd.get("phone") ?? "").trim();
  const cedula = String(fd.get("cedula") ?? "").trim().toUpperCase();
  const zone = String(fd.get("zone") ?? "").trim();

  if (name.length < 3 || name.length > 60) return { error: "Escribe tu nombre completo." };
  if (!Number.isInteger(age) || age < 16 || age > 70) return { error: "La edad debe estar entre 16 y 70 años." };
  if (!/^\+?[0-9][0-9\s-]{8,15}$/.test(phone)) return { error: "Escribe un teléfono válido." };
  if (!/^[VE]-?[0-9]{6,9}$/.test(cedula)) return { error: "La cédula debe tener formato V-12345678." };
  if (!zone) return { error: "Elige tu zona." };

  // Foto inicial: la de la cuenta de Google. La subida de foto propia llega en otra fase.
  const photo = user.image;

  const sql = db();
  try {
    await sql`
      insert into players (auth_user_id, email, full_name, age, phone, cedula, cedula_norm, zone, photo_url)
      values (${user.id}, ${email}, ${name}, ${age}, ${phone}, ${cedula}, ${normCedula(cedula)}, ${zone}, ${photo})`;
  } catch (e) {
    const err = e as { code?: string; message?: string };
    if (err.code === "23505") {
      return {
        error: String(err.message).includes("cedula_norm")
          ? "Esa cédula ya está inscrita."
          : "Ya tienes un perfil inscrito.",
      };
    }
    throw e;
  }

  revalidatePath("/inscripcion");
  revalidatePath("/admin");
  return {};
}
