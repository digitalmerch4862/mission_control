import { Shell } from "@/components/shell";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

type Task = { title: string; status: "backlog" | "doing" | "review" | "done" };

export default async function TaskBoardPage() {
  let tasks: Task[] = [];
  let activity: string[] = [];

  try {
    const supabase = getSupabaseAdmin();
    const [{ data: t }, { data: a }] = await Promise.all([
      supabase.from("mc_tasks").select("title,status").order("created_at", { ascending: false }).limit(50),
      supabase.from("mc_activity").select("message").order("created_at", { ascending: false }).limit(8),
    ]);
    tasks = (t as Task[]) || [];
    activity = (a || []).map((x: { message: string }) => x.message);
  } catch {
    tasks = [
      { title: "Autopilot sync: CSV → slugs → product pages", status: "doing" },
      { title: "Gate downloads behind payment portal verification", status: "doing" },
      { title: "Landing page QA + Rad Approval tab live review", status: "review" },
      { title: "Sync downloads exports (PDF/HTML/CSV) + cron reports", status: "backlog" },
    ];
    activity = [
      "237-row CSV seed mapped to rad approval logs",
      "Mission Control rebuild in progress with Rad Approval tab",
      "ClawX repo prepared for next automation step",
    ];
  }

  const columns = {
    backlog: tasks.filter((t) => t.status === "backlog"),
    doing: tasks.filter((t) => t.status === "doing"),
    review: tasks.filter((t) => t.status === "review"),
    done: tasks.filter((t) => t.status === "done"),
  };

  return (
    <Shell>
      <h2 className="text-2xl font-semibold">Task Board</h2>
      <p className="mt-2 text-sm text-white/60">Kanban + autonomous activity feed (heartbeat-aware).</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {Object.entries(columns).map(([name, items]) => (
            <section key={name} className="card">
              <h3 className="text-sm font-semibold capitalize text-white/80">{name}</h3>
              <ul className="mt-3 space-y-2">
                {items.map((item) => (
                  <li key={item.title} className="rounded-lg border border-cyan-400/20 bg-black/20 p-2 text-sm text-white/80">
                    {item.title}
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>

        <aside className="card">
          <h3 className="text-sm font-semibold text-white/80">Live Activity</h3>
          <ul className="mt-3 space-y-2 text-sm text-white/70">
            {activity.map((a) => (
              <li key={a} className="rounded-lg border border-fuchsia-400/20 bg-black/20 p-2">
                {a}
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </Shell>
  );
}
