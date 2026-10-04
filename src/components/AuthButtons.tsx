"use client";

import { authClient } from "@/lib/auth/client";

export function SignInButton({ label = "Continuar con Google", small = false }: { label?: string; small?: boolean }) {
  return (
    <button
      className={`btn${small ? " sm" : ""}`}
      onClick={() => authClient.signIn.social({ provider: "google", callbackURL: window.location.pathname })}
    >
      {label}
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      className="btn sm alt"
      onClick={async () => {
        await authClient.signOut();
        window.location.reload();
      }}
    >
      Salir
    </button>
  );
}
