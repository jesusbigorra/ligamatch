import { neonAuth } from "@/lib/auth/server";

export type Me = { id: string; name: string; email: string; image: string | null; verified: boolean };

/** Usuario con sesión (o null). Las páginas que lo usan deben ser dinámicas. */
export async function me(): Promise<Me | null> {
  const { data: session } = await neonAuth.getSession();
  const u = session?.user;
  if (!u) return null;
  const first = (u.name ?? u.email.split("@")[0]).split(" ")[0];
  return { id: u.id, name: first, email: u.email.toLowerCase(), image: u.image ?? null, verified: !!u.emailVerified };
}

/** Correo verificado del usuario con sesión, o null. */
export async function verifiedEmail(): Promise<string | null> {
  const u = await me();
  return u && u.verified ? u.email : null;
}

/** Administrador = correo verificado que aparece en ADMIN_EMAILS. */
export async function isAdmin(): Promise<boolean> {
  const email = await verifiedEmail();
  if (!email) return false;
  const admins = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  return admins.includes(email);
}
