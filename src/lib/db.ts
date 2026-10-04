import { neon } from "@neondatabase/serverless";

// Conexión perezosa: se crea al hacer la primera consulta, no al importar el módulo.
export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("Falta la variable DATABASE_URL");
  return neon(url);
}
