import Link from "next/link";
import { Shell } from "@/components/shell";
import { getSupabaseAdmin } from "@/lib/supabase-admin";

export const dynamic = "force-dynamic";

const screens = [
  ["Task Board", "/task-board", "Kanban + live activity"],
  ["Calendar", "/calendar", "Cron and proactive schedule"],
  ["Projects", "/projects", "Major initiatives hub"],
  ["Memory", "/memory", "Journalized conversation memory"],
  ["Docs", "/docs", "Searchable knowledge center"],
  ["Team", "/team", "Org chart + mission statement"],
  ["Office", "/office", "2D pixel office view"],
] as const;

type Activity = { message: string; created_at?: string };

async function getEodItems(): Promise<Activity[]> {
  try {
    const supabase = getSupabaseAdmin();
    const { data } = await supabase
      .from("mc_activity")
      .select("message,created_at")
      .ilike("message", "EOD%")
      .order("created_at", { ascending: false })
      .limit(6);
    return (data as Activity[]) || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const eodItems = await getEodItems();

  return (
    <Shell>
      <section>
        <h2 className="text-2xl font-semibold">Mission Control Dashboard</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/60">
          Built in Next.js with a clean Linear-style interface. Choose a screen below.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="kpi border-cyan-400/30">
          <p className="text-xs uppercase tracking-wide text-white/50">Mission Control</p>
          <p className="mt-1 text-2xl font-semibold text-cyan-300">92%</p>
          <p className="mt-1 text-xs text-white/60">Core 7 screens complete</p>
        </div>
        <div className="kpi border-fuchsia-400/30">
          <p className="text-xs uppercase tracking-wide text-white/50">Portal UX Upgrade</p>
          <p className="mt-1 text-2xl font-semibold text-fuchsia-300">35%</p>
          <p className="mt-1 text-xs text-white/60">Cyberpunk interactive spec in progress</p>
        </div>
        <div className="kpi border-white/20">
          <p className="text-xs uppercase tracking-wide text-white/50">Employee Distribution</p>
          <p className="mt-1 text-2xl font-semibold text-cyan-300">In Progress</p>
          <p className="mt-1 text-xs text-white/60">4 agent tokens received (Luffy, Zoro, Sanji, Nami)</p>
        </div>
      </section>

      <section className="mt-4 card border-cyan-400/30">
        <h3 className="text-sm font-semibold text-white/80">Daily EOD Report (Cron 21:00)</h3>
        {eodItems.length ? (
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-white/80">
            {eodItems.map((item, idx) => (
              <li key={idx}>{item.message}</li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-sm text-white/60">No EOD entries yet. Cron will post tonight at 21:00.</p>
        )}
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {screens.map(([title, href, subtitle]) => (
          <Link key={href} href={href} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 hover:bg-white/[0.06]">
            <h3 className="font-medium">{title}</h3>
            <p className="mt-1 text-sm text-white/60">{subtitle}</p>
          </Link>
        ))}
      </section>
    </Shell>
  );
}
