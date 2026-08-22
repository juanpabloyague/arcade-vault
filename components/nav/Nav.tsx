"use client";

// Barra de navegación compartida, montada en app/layout.tsx.

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { MobileDrawer, type DrawerLink } from "@/components/nav/MobileDrawer";
import { useSession } from "@/lib/session";

export function Nav() {
  const pathname = usePathname();
  const { user, signOut } = useSession();
  const [open, setOpen] = useState(false);

  // "Biblioteca" queda activa también en el detalle y en el reproductor,
  // igual que en el prototipo.
  const libraryActive =
    pathname === "/" || pathname.startsWith("/juego/") || pathname.startsWith("/jugar/");
  const hallActive = pathname === "/salon";
  const accessActive = pathname === "/acceso";

  const drawerLinks: DrawerLink[] = [
    { href: "/", label: "Biblioteca", active: libraryActive },
    { href: "/salon", label: "Salón de la Fama", active: hallActive },
    { href: "/acceso", label: user ? "Cuenta" : "Iniciar Sesión", active: accessActive },
  ];

  return (
    <>
      <nav className="av-nav">
        <Link className="logo" href="/">
          <div className="logo-mark" />
          <div className="logo-text neon-cyan">
            ARCADE <span className="neon-magenta">VAULT</span>
          </div>
        </Link>

        <div className="links">
          <Link className={libraryActive ? "active" : undefined} href="/">
            Biblioteca
          </Link>
          <Link className={hallActive ? "active" : undefined} href="/salon">
            Salón de la Fama
          </Link>
        </div>

        <div className="spacer" />

        <div className="coin-counter">
          <span className="coin" />
          <span>CRÉDITOS · 03</span>
        </div>

        {user ? (
          <button type="button" className="btn ghost auth-btn" onClick={signOut}>
            {user.name} ▾
          </button>
        ) : (
          <Link className="btn auth-btn" href="/acceso">
            Iniciar Sesión
          </Link>
        )}

        <button
          type="button"
          className="btn ghost hamburger"
          onClick={() => setOpen(true)}
          aria-label="Menú"
          aria-expanded={open}
        >
          ≡
        </button>
      </nav>

      <MobileDrawer open={open} links={drawerLinks} onClose={() => setOpen(false)} />
    </>
  );
}
