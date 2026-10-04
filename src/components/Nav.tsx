"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const publicTabs: [string, string][] = [
  ["/", "Jornadas"],
  ["/sedes", "Sedes"],
  ["/inscripcion", "Inscripción"],
  ["/premios", "Premios"],
  ["/patrocinios", "Patrocinios"],
];

export default function Nav({ admin = false }: { admin?: boolean }) {
  const path = usePathname();
  const tabs = admin ? [...publicTabs, ["/admin", "Admin"] as [string, string]] : publicTabs;
  return (
    <nav aria-label="Secciones">
      {tabs.map(([href, label]) => {
        const active = href === "/" ? path === "/" : path.startsWith(href);
        return (
          <Link key={href} href={href} aria-current={active ? "page" : undefined}>
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
