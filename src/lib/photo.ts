/** Acepta solo fotos JPEG ya reducidas desde el cliente (data URL). Vacío o inválido = sin foto. */
const MAX_LEN = 120_000;

export function cleanPhoto(raw: FormDataEntryValue | null): string | null {
  const s = String(raw ?? "").trim();
  if (!s) return null;
  if (!s.startsWith("data:image/jpeg;base64,") || s.length > MAX_LEN) return null;
  return s;
}
