import type { Metadata } from "next";
import Header from "@/components/Header";
import "./globals.css";

export const metadata: Metadata = {
  title: "LigaMatch",
  description: "Plataforma integral de fútbol amateur",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
        <head>
          <link rel="preconnect" href="https://fonts.googleapis.com" />
          <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
          <link
            rel="stylesheet"
            href="https://fonts.googleapis.com/css2?family=Big+Shoulders+Display:wght@700;800;900&family=Figtree:wght@400;500;600;700&family=IBM+Plex+Mono:wght@400;500&display=swap"
          />
        </head>
        <body>
          <div className="wrap">
            <div className="wm" aria-hidden="true">
              <img src="/shield.png" alt="" />
            </div>
            <Header />
            <main>{children}</main>
          </div>
        </body>
      </html>
  );
}
