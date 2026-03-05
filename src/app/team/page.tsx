import { Shell } from "@/components/shell";
import { frequentFocus, missionStatement, toolsToBuildNext } from "@/lib/data";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type Agent = { name: string; role: string; status: string };
type Task = { title: string; status: "backlog" | "doing" | "review" | "done"; owner: string | null };
type LiveOps = { progress: number; task: string; completed: string[] };

const fallbackAgents: Agent[] = [
  { name: "Jonah", role: "Chief AI Advisor", status: "Busy" },
  { name: "Luffy", role: "Intake Captain", status: "Busy" },
  { name: "Zoro", role: "Build Combatant", status: "Busy" },
  { name: "Nami", role: "Planning Navigator", status: "Busy" },
  { name: "Sanji", role: "QA & Delivery", status: "Busy" },
];

const fallbackLiveOps: Record<string, LiveOps> = {
  Jonah: { progress: 78, task: "Mission Control orchestration + deployment checks", completed: ["Configured daily EOD report"] },
  Luffy: { progress: 66, task: "Requirements intake and priority routing", completed: ["Collected project requirements"] },
  Zoro: { progress: 72, task: "Core build stream for product and dashboard modules", completed: ["Built core module updates"] },
  Nami: { progress: 64, task: "Sprint planning, milestones, and timing control", completed: ["Updated sprint timeline"] },
  Sanji: { progress: 58, task: "QA passes, release polish, and issue triage", completed: ["Completed latest QA pass"] },
};

function resolveOwnerCandidates(name: string) {
  const n = name.toLowerCase();
  if (n === "jonah") return ["Jonah"];
  if (n === "luffy") return ["Luffy", "Luffy1018"];
  if (n === "zoro") return ["Zoro", "Zoro1018"];
  if (n === "nami") return ["Nami", "Nami1018"];
  if (n === "sanji") return ["Sanji", "Sanji1018"];
  return [name];
}

function computeLiveOps(agents: Agent[], tasks: Task[]) {
  const byOwner = new Map<string, Task[]>();
  for (const t of tasks) {
    const owner = (t.owner || "").trim();
    if (!owner) continue;
    const list = byOwner.get(owner) || [];
    list.push(t);
    byOwner.set(owner, list);
  }

  const pickCurrentTask = (items: Task[]) => {
    const doing = items.find((t) => t.status === "doing");
    if (doing) return doing.title;
    const review = items.find((t) => t.status === "review");
    if (review) return review.title;
    const backlog = items.find((t) => t.status === "backlog");
    if (backlog) return backlog.title;
    return items[0]?.title || "Waiting for new assigned tasks";
  };

  const result: Record<string, LiveOps> = {};

  for (const agent of agents) {
    const keys = resolveOwnerCandidates(agent.name);
    const owned = keys.flatMap((k) => byOwner.get(k) || []);

    if (!owned.length) {
      result[agent.name] = fallbackLiveOps[agent.name] || { progress: 50, task: "Executing assigned queue", completed: [] };
      continue;
    }

    const doneTasks = owned.filter((t) => t.status === "done");
    const done = doneTasks.length;
    const progress = Math.max(8, Math.min(98, Math.round((done / owned.length) * 100)));
    result[agent.name] = {
      progress,
      task: pickCurrentTask(owned),
      completed: doneTasks.slice(0, 8).map((t) => t.title),
    };
  }

  return result;
}

export default async function TeamPage() {
  let agents: Agent[] = fallbackAgents;
  let liveOps = fallbackLiveOps;

  try {
    const supabase = getSupabaseAdmin();
    const [{ data: a }, { data: t }] = await Promise.all([
      supabase.from("mc_agents").select("name,role,status").order("name", { ascending: true }),
      supabase.from("mc_tasks").select("title,status,owner").order("created_at", { ascending: false }).limit(300),
    ]);

    if (a && a.length) agents = a as Agent[];
    if (t && t.length) liveOps = computeLiveOps(agents, t as Task[]);
  } catch {
    // fallback
  }

  return (
    <Shell>
      <h2 className="text-2xl font-semibold">Team</h2>
      <p className="mt-2 text-sm text-white/60">Org chart, mission statement, and personalized roadmap.</p>

      <section className="mt-6 card border-cyan-400/30">
        <h3 className="text-sm font-semibold text-white/70">Mission Statement</h3>
        <p className="mt-2 text-white/90">{missionStatement}</p>
      </section>

      <section className="mt-4 card">
        <h3 className="text-sm font-semibold text-white/70">Agent Progress & Current Work (Auto-updating)</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {agents.map((a) => {
            const live = liveOps[a.name] ?? { progress: 50, task: "Executing assigned queue", completed: [] };
            return (
              <article key={a.name} className="rounded-lg border border-fuchsia-400/20 bg-black/20 p-3">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-medium">{a.name}</h4>
                  <span className="rounded-md bg-white/10 px-2 py-1 text-xs">{a.status}</span>
                </div>
                <p className="text-sm text-white/60">{a.role}</p>

                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <div className="h-2 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-400" style={{ width: `${live.progress}%` }} />
                </div>
                <p className="mt-1 text-xs text-cyan-200">Progress: {live.progress}%</p>

                <p className="mt-2 text-xs text-white/70">
                  <span className="text-white/50">Now doing:</span> {live.task}
                </p>

                <details className="mt-3 rounded-lg border border-white/10 bg-black/25 p-2">
                  <summary className="cursor-pointer text-xs text-cyan-200">View completed logs</summary>
                  {live.completed.length ? (
                    <ul className="mt-2 list-disc space-y-1 pl-4 text-xs text-white/75">
                      {live.completed.map((log) => (
                        <li key={log}>{log}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-2 text-xs text-white/50">No completed logs yet.</p>
                  )}
                </details>
              </article>
            );
          })}
        </div>
      </section>

      <section className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="card">
          <h3 className="text-sm font-semibold text-white/70">What Boss Rad usually optimizes</h3>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-white/80">
            {frequentFocus.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
        </div>
        <div className="card">
          <h3 className="text-sm font-semibold text-white/70">Reverse-prompted tools to build next</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/80">
            {toolsToBuildNext.map((t) => (
              <li key={t.name} className="rounded-lg border border-white/10 bg-black/20 p-2">
                <strong>{t.name}</strong>
                <p className="text-white/60">{t.why}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </Shell>
  );
}
