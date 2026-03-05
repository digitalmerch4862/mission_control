"use client";

import { Shell } from "@/components/shell";
import { useEffect, useMemo, useState } from "react";

type Project = {
  name: string;
  progress: number | null;
  focus: string | null;
  owner?: string;
  status?: string;
};

type LocalProjects = { generatedAt: string; projects: Project[] };
type LocalMemory = { generatedAt: string; entries: { entry_date: string; content: string }[] };

const fallbackProjects: Project[] = [
  { name: "Mission Control", progress: 88, focus: "Cyberpunk UI + auto-updating agent logs + EOD report visibility", owner: "Jonah", status: "In Progress" },
  { name: "Dmerch Homepage", progress: 84, focus: "Marketplace-style PWA + protected buy flow + product images", owner: "Zoro", status: "In Progress" },
  { name: "Dmerch V2", progress: 63, focus: "Techy Gumroad-like flow: product page, checkout route, buyer portal", owner: "Luffy", status: "Build Phase" },
  { name: "Attendance SaaS", progress: 46, focus: "Members + attendance core and branch-ready architecture", owner: "Nami", status: "Planning" },
];

const mappings: Record<string, { githubRepo?: string; vercelProject?: string; protected?: boolean }> = {
  "Mission Control": { githubRepo: "digitalmerch4862/mission-control", vercelProject: "mission-control", protected: true },
  "Dmerch Homepage": { githubRepo: "digitalmerch4862/dmerch-homepage", vercelProject: "dmerch-homepage" },
  "Dmerch V2": { githubRepo: "digitalmerch4862/dmerch-v2", vercelProject: "dmerch-v2" },
  "Attendance SaaS": { githubRepo: "digitalmerch4862/attendance-saas", vercelProject: "attendance-saas" },
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(fallbackProjects);
  const [logs, setLogs] = useState<string[]>([]);
  const [archived, setArchived] = useState<string[]>([]);
  const [hardTarget, setHardTarget] = useState<string>("");
  const [confirmText, setConfirmText] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const run = async () => {
      try {
        const [pRes, mRes] = await Promise.all([
          fetch("/projects-latest.json", { cache: "no-store" }),
          fetch("/memory-latest.json", { cache: "no-store" }),
        ]);
        if (pRes.ok) {
          const p = (await pRes.json()) as LocalProjects;
          if (p.projects?.length) setProjects(p.projects);
        }
        if (mRes.ok) {
          const m = (await mRes.json()) as LocalMemory;
          if (m.entries?.length) setLogs(m.entries.map((e) => e.content));
        }
      } catch {}
    };
    run();
  }, []);

  const groupedLogs = useMemo(() => {
    return {
      "Mission Control": logs.filter((l) => /mission control|agent|cron|eod|team|calendar/i.test(l)),
      "Dmerch Homepage": logs.filter((l) => /dmerch homepage|marketplace|pwa|product images|pricing/i.test(l)),
      "Dmerch V2": logs.filter((l) => /dmerch v2|gumroad|checkout|buyer portal/i.test(l)),
      "Attendance SaaS": logs.filter((l) => /attendance/i.test(l)),
    } as Record<string, string[]>;
  }, [logs]);

  const archiveProject = (name: string) => {
    setArchived((prev) => (prev.includes(name) ? prev : [...prev, name]));
    setProjects((prev) => prev.filter((p) => p.name !== name));
  };

  const openHardDelete = (name: string) => {
    setHardTarget(name);
    setConfirmText("");
  };

  const hardDelete = async () => {
    if (!hardTarget) return;
    const required = `DELETE ${hardTarget}`;
    if (confirmText !== required) {
      alert(`Type exactly: ${required}`);
      return;
    }

    const map = mappings[hardTarget] || {};
    if (map.protected) {
      alert("This project is protected from hard-delete.");
      return;
    }

    setBusy(true);
    try {
      const res = await fetch("/api/project-hard-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectName: hardTarget,
          githubRepo: map.githubRepo,
          vercelProject: map.vercelProject,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Delete failed");
      setProjects((prev) => prev.filter((p) => p.name !== hardTarget));
      setHardTarget("");
      setConfirmText("");
      alert("Hard delete chain executed. Check delete-audit.json for details.");
    } catch (e) {
      alert((e as Error).message || "Hard delete failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Shell>
      <h2 className="text-2xl font-semibold">Projects</h2>
      <p className="mt-2 text-sm text-white/60">Major project hub connecting tasks, memories, and docs.</p>

      <div className="mt-6 grid gap-4 xl:grid-cols-2">
        {projects.map((p) => {
          const plogs = groupedLogs[p.name] || logs;
          return (
            <section key={p.name} className="card">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-medium">{p.name}</h3>
                  <p className="mt-1 text-xs text-white/50">In-charge: {p.owner ?? "Unassigned"}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-white/10 px-2 py-1 text-xs text-cyan-200">{p.status ?? "In Progress"}</span>
                  <button onClick={() => archiveProject(p.name)} className="rounded-md border border-amber-400/40 bg-amber-500/10 px-2 py-1 text-xs text-amber-200">Archive</button>
                  <button onClick={() => openHardDelete(p.name)} className="rounded-md border border-red-400/40 bg-red-500/10 px-2 py-1 text-xs text-red-200">Hard Delete</button>
                </div>
              </div>

              <p className="mt-2 text-sm text-white/60">Current focus: {p.focus ?? "--"}</p>
              <div className="mt-4 h-2 rounded-full bg-white/10">
                <div className="h-2 rounded-full bg-fuchsia-400" style={{ width: `${p.progress ?? 0}%` }} />
              </div>
              <p className="mt-2 text-xs text-white/50">{p.progress ?? 0}% complete</p>

              <details className="mt-3 rounded-lg border border-white/10 bg-black/25 p-2">
                <summary className="cursor-pointer text-xs text-cyan-200">View completed logs</summary>
                {plogs.length ? (
                  <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-white/75">
                    {plogs.slice(0, 12).map((log) => (
                      <li key={log}>{log}</li>
                    ))}
                  </ul>
                ) : (
                  <p className="mt-2 text-xs text-white/50">No logs available yet.</p>
                )}
              </details>
            </section>
          );
        })}
      </div>

      {!!archived.length && (
        <section className="mt-4 card">
          <h3 className="text-sm font-semibold text-white/70">Archived (soft delete)</h3>
          <ul className="mt-2 list-disc pl-5 text-sm text-white/75">
            {archived.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        </section>
      )}

      {!!hardTarget && (
        <section className="mt-4 card border-red-400/30">
          <h3 className="text-sm font-semibold text-red-200">Confirm Hard Delete</h3>
          <p className="mt-2 text-xs text-white/70">This will attempt chain delete (dashboard + GitHub + Vercel) for: <b>{hardTarget}</b></p>
          <p className="mt-1 text-xs text-white/50">Type exactly: <b>DELETE {hardTarget}</b></p>
          <input value={confirmText} onChange={(e) => setConfirmText(e.target.value)} className="mt-2 w-full rounded-md border border-white/20 bg-black/30 px-3 py-2 text-sm" placeholder={`DELETE ${hardTarget}`} />
          <div className="mt-2 flex gap-2">
            <button disabled={busy} onClick={hardDelete} className="rounded-md border border-red-400/40 bg-red-500/10 px-3 py-2 text-sm text-red-200">{busy ? "Deleting..." : "Confirm Hard Delete"}</button>
            <button disabled={busy} onClick={() => setHardTarget("")} className="rounded-md border border-white/20 bg-white/5 px-3 py-2 text-sm">Cancel</button>
          </div>
        </section>
      )}
    </Shell>
  );
}
