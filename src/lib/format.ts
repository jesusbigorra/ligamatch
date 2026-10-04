export const money = (n: number) => "$" + Number(n).toLocaleString("en-US");

export function fmtDate(d: string, t?: string) {
  const x = new Date(d + "T12:00:00");
  const day = x
    .toLocaleDateString("es-VE", { weekday: "short", day: "numeric", month: "short" })
    .replace(".", "");
  return t ? `${day} · ${t}` : day;
}

export const initials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
