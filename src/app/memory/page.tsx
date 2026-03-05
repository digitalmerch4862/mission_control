import { Shell } from "@/components/shell";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import { readFile } from "node:fs/promises";
import path from "node:path";

type Entry = { entry_date: string; content: string };

type LocalMemory = { generatedAt: string; entries: Entry[] };

const fallbackEntries: Entry[] = [
  { entry_date: "2026-03-03", content: "Built Mission Control with 7 core screens and deployed live." },
  { entry_date: "2026-03-03", content: "Assigned agent roles: Jonah, Luffy, Zoro, Nami, Sanji with progress tracking." },
  { entry_date: "2026-03-03", content: "Created separate Dmerch Homepage and switched to protected buy-to-unlock flow." },
];

async function getLocalMemory(): Promise<Entry[] | null> {
  try {
    const file = path.join(process.cwd(), "public", "memory-latest.json");
    const raw = await readFile(file, "utf8");
    const parsed = JSON.parse(raw) as LocalMemory;
    return parsed.entries || null;
  } catch {
    return null;
  }
}

export default async function MemoryPage() {
  let entries: Entry[] = [];
  const localEntries = await getLocalMemory();

  if (localEntries?.length) {
    entries = localEntries;
  } else {
    try {
      const supabase = getSupabaseAdmin();
      const { data } = await supabase
        .from("mc_memory_entries")
        .select("entry_date,content")
        .order("entry_date", { ascending: false });
      entries = data && data.length ? data : fallbackEntries;
    } catch {
      entries = fallbackEntries;
    }
  }

  const grouped = entries.reduce<Record<string, string[]>>((acc, e) => {
    acc[e.entry_date] = acc[e.entry_date] || [];
    acc[e.entry_date].push(e.content);
    return acc;
  }, {});

  return (
    <Shell>
      <h2 className="text-2xl font-semibold">Memory Journal</h2>
      <p className="mt-2 text-sm text-white/60">Conversation history organized by day, like a digital journal.</p>

      <div className="mt-6 space-y-4">
        {Object.entries(grouped).map(([date, items]) => (
          <section key={date} className="card">
            <h3 className="font-medium">{date}</h3>
            <ul className="mt-3 space-y-2 text-sm text-white/75">
              {items.map((e) => (
                <li key={e} className="rounded-lg border border-white/10 bg-black/20 p-2">
                  {e}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </Shell>
  );
}
