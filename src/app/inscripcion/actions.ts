"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { me, isAdmin } from "@/lib/auth";
import { cleanPhoto } from "@/lib/photo";

/** Cambia o quita la foto. Lo puede hacer el dueño del perfil o un admin. */
export async function updatePhoto(fd: FormData) {
  const user = await me();
  if (!user) throw new Error("No autorizado");
  const photo = cleanPhoto(fd.get("photo"));
  const sql = db();
  const id = Number(fd.get("id"));
  if ((await isAdmin()) && Number.isInteger(id)) {
    await sql`update players set photo_url = ${photo} where id = ${id}`;
  } else {
    await sql`update players set photo_url = ${photo} where auth_user_id = ${user.id}`;
  }
  revalidatePath("/inscripcion");
  revalidatePath("/admin");
}
