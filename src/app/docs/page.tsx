"use client";

import { Shell } from "@/components/shell";
import { getSupabaseClient } from "@/lib/supabase-client";
import { useEffect, useMemo, useState } from "react";

type DocItem = { title: string; category: string };

const fallbackDocs: DocItem[] = [
  { title: "Attendance SaaS MVP Plan", category: "Planning" },
  { title: "Bot Role Assignment Spec", category: "Operations" },
  { title: "Premium UI Direction", category: "Design" },
];

export default function DocsPage() {
  const [query, setQuery] = useState("");
  const [docs, setDocs] = useState<DocItem[]>(fallbackDocs);

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = getSupabaseClient();
        const { data } = await supabase.from("mc_docs").select("title,category").order("created_at", { ascending: false }).limit(100);
        if (data && data.length) setDocs(data as DocItem[]);
      } catch {
        // fallback silently
      }
    };
    run();
  }, []);

  const filtered = useMemo(
    () => docs.filter((d) => d.title.toLowerCase().includes(query.toLowerCase()) || d.category.toLowerCase().includes(query.toLowerCase())),
    [query, docs]
  );

  return (
    <Shell>
      <h2 className="text-2xl font-semibold">Docs Hub</h2>
      <p className="mt-2 text-sm text-white/60">Categorized, searchable storage for generated documents and plans.</p>

      <section className="mt-6 card">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search docs or category..."
          className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none ring-cyan-400 focus:ring-2"
        />
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {filtered.map((d) => (
            <article key={d.title} className="rounded-lg border border-white/10 bg-black/20 p-3">
              <h3 className="font-medium">{d.title}</h3>
              <p className="mt-1 text-xs text-white/50">{d.category}</p>
            </article>
          ))}
        </div>
      </section>
    </Shell>
  );
}
