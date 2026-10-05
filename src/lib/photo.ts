/**
 * Foto del jugador: JPEG reducido en el cliente (data URL) o una URL https ya guardada.
 * Vacío o inválido = sin foto.
 */
const MAX_DATA = 120_000;
const MAX_URL = 600;

export function cleanPhoto(raw: FormDataEntryValue | null): string | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  if (s.startsWith("data:image/jpeg;base64,")) return s.length <= MAX_DATA ? s : null;
  if (s.startsWith("https://")) return s.length <= MAX_URL ? s : null;
  return null;
}
