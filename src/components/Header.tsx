import Link from "next/link";
import { me, isAdmin } from "@/lib/auth";
import { SignInButton, SignOutButton } from "./AuthButtons";
import Nav from "./Nav";

export default async function Header() {
  const user = await me();
  const admin = user ? await isAdmin() : false;
  return (
    <>
      <header>
        <Link href="/" className="lockup">
          <img className="logo" src="/shield.png" alt="Escudo LigaMatch" />
          <div>
            <div className="brand">LigaMatch</div>
            <div className="sub">Plataforma integral de fútbol amateur</div>
          </div>
        </Link>
        <div className="who">
          {user ? (
            <>
              <span className="greeting">Hola, {user.name}</span>
              <SignOutButton />
            </>
          ) : (
            <SignInButton label="Entrar con Google" small />
          )}
        </div>
      </header>
      <Nav admin={admin} />
    </>
  );
}
