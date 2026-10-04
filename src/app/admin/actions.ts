"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdmin } from "@/lib/auth";

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
