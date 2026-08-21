"use client";

// Cajón lateral que sustituye al Nav por debajo de 840px.
// Las clases .av-mobile-panel / .av-mobile-backdrop vienen del tema.

import Link from "next/link";

export type DrawerLink = {
  href: string;
  label: string;
  active: boolean;
};

type MobileDrawerProps = {
  open: boolean;
  links: DrawerLink[];
  onClose: () => void;
};

export function MobileDrawer({ open, links, onClose }: MobileDrawerProps) {
  return (
    <>
      <div
        className={open ? "av-mobile-backdrop open" : "av-mobile-backdrop"}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Cerrado, el panel sigue en el DOM para poder animarse: inert lo saca
          del orden de tabulación y del árbol de accesibilidad. */}
      <aside
        className={open ? "av-mobile-panel open" : "av-mobile-panel"}
        aria-label="Menú"
        inert={!open}
      >
        <div className="pixel neon-cyan drawer-title">MENÚ</div>
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={link.active ? "active" : undefined}
            onClick={onClose}
          >
            {link.label}
          </Link>
        ))}
        <div className="drawer-spacer" />
        <div className="pixel drawer-credits">CRÉDITOS · 03</div>
      </aside>
    </>
  );
}
