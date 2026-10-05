import { cleanPhoto } from "./photo";

export type FormState = { error?: string; ok?: boolean };

export const normCedula = (s: string) => s.replace(/-/g, "").toUpperCase();

export type PlayerInput = {
  name: string;
  age: number;
  phone: string;
  cedula: string;
  zone: string;
  email: string;
  photo: string | null;
};

/** Lee y valida los datos de un jugador desde un formulario. */
export function readPlayer(fd: FormData): { error: string } | { data: PlayerInput } {
  const name = String(fd.get("name") ?? "").trim();
  const age = Number(fd.get("age"));
  const phone = String(fd.get("phone") ?? "").trim();
  const cedula = String(fd.get("cedula") ?? "").trim().toUpperCase();
  const zone = String(fd.get("zone") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();

  if (name.length < 3 || name.length > 60) return { error: "Escribe el nombre completo." };
  if (!Number.isInteger(age) || age < 16 || age > 70) return { error: "La edad debe estar entre 16 y 70 años." };
  if (!/^\+?[0-9][0-9\s-]{8,15}$/.test(phone)) return { error: "Escribe un teléfono válido." };
  if (!/^[VE]-?[0-9]{6,9}$/.test(cedula)) return { error: "La cédula debe tener formato V-12345678." };
  if (!zone) return { error: "Elige la zona." };
  if (email && !/^\S+@\S+\.\S+$/.test(email)) return { error: "El correo no es válido." };

  return { data: { name, age, phone, cedula, zone, email, photo: cleanPhoto(fd.get("photo")) } };
}
