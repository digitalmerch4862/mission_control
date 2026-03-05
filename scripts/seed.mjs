import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Missing Supabase env vars");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

async function upsert(table, rows, onConflict) {
  const { error } = await supabase.from(table).upsert(rows, { onConflict });
  if (error) throw error;
}

async function main() {
  await upsert("mc_agents", [
    { name: "Jonah", role: "Captain/Strategist", status: "online", theme: "one-piece-cyberpunk" },
    { name: "Luffy", role: "Intake Captain", status: "online", theme: "one-piece-cyberpunk" },
    { name: "Zoro", role: "Build Combatant", status: "busy", theme: "one-piece-cyberpunk" },
    { name: "Nami", role: "Planning Navigator", status: "online", theme: "one-piece-cyberpunk" },
    { name: "Sanji", role: "QA & Delivery", status: "online", theme: "one-piece-cyberpunk" },
  ], "name");

  await supabase.from("mc_projects").insert([
    { name: "Mission Control", focus: "Live Supabase wiring", progress: 72 },
    { name: "Attendance SaaS", focus: "Members + attendance core", progress: 46 },
  ]);

  await supabase.from("mc_tasks").insert([
    { title: "Finalize schema + RLS", status: "doing", owner: "Zoro", priority: "high" },
    { title: "Connect docs search to Supabase", status: "backlog", owner: "Jonah", priority: "medium" },
    { title: "QA all 7 screens", status: "review", owner: "Sanji", priority: "high" },
  ]);

  await supabase.from("mc_activity").insert([
    { message: "Mission Control moved to Supabase live mode", actor: "Jonah" },
    { message: "Zoro picked up schema work", actor: "Zoro" },
  ]);

  console.log("Seed done");
}

main().catch((e) => {
  console.error(e.message || e);
  process.exit(1);
});
