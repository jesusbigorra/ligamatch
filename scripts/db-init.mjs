// Crea las tablas en Neon. Con --seed carga además los datos de ejemplo.
import { readFileSync } from "node:fs";
import pg from "pg";

const url = process.env.DATABASE_URL;
if (!url) {
  console.error("Falta DATABASE_URL. Copia .env.example a .env.local y completa los valores.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: url });
await client.connect();
try {
  await client.query(readFileSync(new URL("../db/schema.sql", import.meta.url), "utf8"));
  console.log("Tablas listas");
  if (process.argv.includes("--seed")) {
    await client.query(readFileSync(new URL("../db/seed.sql", import.meta.url), "utf8"));
    console.log("Datos de ejemplo cargados");
  }
} finally {
  await client.end();
}
