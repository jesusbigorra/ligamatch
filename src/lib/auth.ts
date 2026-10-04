import { auth, currentUser } from "@clerk/nextjs/server";

export type Me = { id: string; name: string; email: string; image: string | null; verified: boolean };

/** Usuario con sesión (o null). Las páginas que lo usan deben ser dinámicas. */
export async function me(): Promise<Me | null> {
  const { userId } = await auth();
  if (!userId) return null;
  const u = await currentUser();
  if (!u) return null;
  const email = u.emailAddresses[0]?.emailAddress ?? "";
  const fullName = [u.firstName, u.lastName].filter(Boolean).join(" ") || email.split("@")[0];
  const first = fullName.split(" ")[0];
  const verified = u.emailAddresses[0]?.verification?.status === "verified";
  return { id: u.id, name: first, email: email.toLowerCase(), image: u.imageUrl ?? null, verified };
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
