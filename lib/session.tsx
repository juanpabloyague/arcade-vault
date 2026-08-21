"use client";

// Sesión falsa: estado compartido por React Context, persistido en localStorage
// bajo la clave "av_user". No hay backend ni autenticación real.
//
// La lectura de localStorage va por useSyncExternalStore en vez de por un
// useEffect con setState: el servidor no ve localStorage, así que
// getServerSnapshot devuelve null y React reconcilia tras la hidratación sin
// desajuste. Leer durante el render sí lo provocaría.

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from "react";

const USER_KEY = "av_user";

export type User = {
  /** Alias del jugador: mayúsculas, máximo 10 caracteres. */
  name: string;
};

type SessionValue = {
  user: User | null;
  /** false hasta que se ha leído localStorage en el cliente. */
  ready: boolean;
  /** null inicia sesión como invitado. */
  signIn: (user: User | null) => void;
  signOut: () => void;
};

const SessionContext = createContext<SessionValue | null>(null);

// ===== Store externo sobre localStorage =====

const listeners = new Set<() => void>();

// getSnapshot debe devolver una referencia estable mientras el dato no cambie,
// o React entra en un bucle de renders. Cacheamos por el texto crudo leído.
let cachedRaw: string | null = null;
let cachedUser: User | null = null;

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function emit(): void {
  for (const listener of listeners) listener();
}

function readRaw(): string | null {
  try {
    return window.localStorage.getItem(USER_KEY);
  } catch {
    // localStorage deshabilitado (modo privado): la app funciona sin persistir.
    return null;
  }
}

function getSnapshot(): User | null {
  const raw = readRaw();
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    try {
      cachedUser = raw ? (JSON.parse(raw) as User | null) : null;
    } catch {
      // Contenido corrupto: lo tratamos como sesión inexistente.
      cachedUser = null;
    }
  }
  return cachedUser;
}

function getServerSnapshot(): User | null {
  return null;
}

// Suscripción vacía: el valor nunca cambia, solo difiere entre servidor y cliente.
const alwaysReady = () => true;
const neverReadyOnServer = () => false;

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const user = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(subscribe, alwaysReady, neverReadyOnServer);

  const signIn = useCallback((next: User | null) => {
    try {
      window.localStorage.setItem(USER_KEY, JSON.stringify(next));
    } catch {
      // Sin almacenamiento no hay sesión que recordar.
    }
    emit();
  }, []);

  const signOut = useCallback(() => {
    try {
      window.localStorage.removeItem(USER_KEY);
    } catch {
      // Nada que limpiar si no hay almacenamiento.
    }
    emit();
  }, []);

  const value = useMemo<SessionValue>(
    () => ({ user, ready, signIn, signOut }),
    [user, ready, signIn, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error("useSession debe usarse dentro de <SessionProvider>.");
  }
  return value;
}
