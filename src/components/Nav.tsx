"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs: [string, string][] = [
  ["/", "Jornadas"],
  ["/sedes", "Sedes"],
  ["/inscripcion", "Inscripción"],
  ["/premios", "Premios"],
  ["/patrocinios", "Patrocinios"],
  ["/admin", "Admin"],
];

export default function Nav() {
  const path = usePathname();
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
