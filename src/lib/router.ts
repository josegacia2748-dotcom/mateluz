import { useSyncExternalStore } from "react";

export type Route = {
  path: string;
  parts: string[];
  query: URLSearchParams;
  hash: string;
};

const read = (): Route => {
  const raw = window.location.hash.replace(/^#/, "") || "/";
  const [pathname, search = ""] = raw.split("?");
  const path = pathname || "/";
  return {
    path,
    parts: path.split("/").filter(Boolean),
    query: new URLSearchParams(search),
    hash: raw,
  };
};

const subscribe = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};

let cached = typeof window === "undefined" ? { path: "/", parts: [], query: new URLSearchParams(), hash: "/" } : read();
const getSnapshot = (): Route => {
  const next = read();
  if (next.hash !== cached.hash) cached = next;
  return cached;
};

export function useRoute(): Route {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function navigate(path: string) {
  const target = path.startsWith("#") ? path : `#${path}`;
  if (window.location.hash === target) return;
  window.location.hash = target;
  window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
}

export const href = (path: string) => `#${path}`;

export function match(route: Route, pattern: string): string[] | null {
  const pp = pattern.split("/").filter(Boolean);
  if (pp.length !== route.parts.length) return null;
  const out: string[] = [];
  for (let i = 0; i < pp.length; i++) {
    if (pp[i].startsWith(":")) out.push(decodeURIComponent(route.parts[i]));
    else if (pp[i] !== route.parts[i]) return null;
  }
  return out;
}
