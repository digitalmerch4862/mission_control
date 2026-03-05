"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ReactNode } from "react";

const nav = [
  ["Task Board", "/task-board"],
  ["Calendar", "/calendar"],
  ["Projects", "/projects"],
  ["Memory", "/memory"],
  ["Docs", "/docs"],
  ["Downloads", "/downloads"],
  ["Team", "/team"],
  ["Office", "/office"],
] as const;

export function Shell({ children }: { children: ReactNode }) {
  const path = usePathname();

  return (
    <div className="min-h-screen text-[#e6eaf2]">
      <div className="mx-auto grid max-w-[1500px] grid-cols-1 md:grid-cols-[300px_1fr]">
        <aside className="border-r border-cyan-400/20 bg-[#090f1d]/80 p-6 backdrop-blur md:min-h-screen">
          <h1 className="bg-gradient-to-r from-cyan-300 to-fuchsia-300 bg-clip-text text-xl font-bold tracking-wide text-transparent">
            Mission Control
          </h1>
          <nav className="mt-8 space-y-2">
            {nav.map(([label, href]) => {
              const active = path === href;
              return (
                <Link
                  key={href}
                  href={href}
                  className={`block rounded-xl px-4 py-3 text-base transition ${
                    active
                      ? "border border-fuchsia-400/40 bg-fuchsia-500/10 text-white shadow-[0_0_20px_rgba(232,121,249,.2)]"
                      : "text-white/75 hover:border hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:text-white"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <main className="p-6 md:p-8">{children}</main>
      </div>
    </div>
  );
}
