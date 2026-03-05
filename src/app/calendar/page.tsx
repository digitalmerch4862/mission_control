"use client";

import { Shell } from "@/components/shell";
import { useMemo, useState } from "react";

type Job = {
  title: string;
  type: "daily" | "weekly" | "monthly";
  time: string;
  weekdays?: number[]; // 0-6 Sun-Sat
  monthDays?: number[]; // 1-31
};

const jobs: Job[] = [
  { title: "OpenClaw heartbeat poll", type: "daily", time: "Every 30m" },
  { title: "Morning project status", type: "daily", time: "08:30" },
  { title: "Midday progress sync", type: "daily", time: "13:00" },
  { title: "Afternoon project sync", type: "daily", time: "17:00" },
  { title: "Daily EOD report generation", type: "daily", time: "21:00" },
  { title: "Weekly strategy review", type: "weekly", time: "Mon 09:30", weekdays: [1] },
  { title: "Monthly KPI snapshot", type: "monthly", time: "1st 10:00", monthDays: [1] },
];

function occursOn(date: Date, job: Job) {
  if (job.type === "daily") return true;
  if (job.type === "weekly") return (job.weekdays || []).includes(date.getDay());
  if (job.type === "monthly") return (job.monthDays || []).includes(date.getDate());
  return false;
}

export default function CalendarPage() {
  const now = new Date();
  const [selected, setSelected] = useState(new Date(now.getFullYear(), now.getMonth(), now.getDate()));

  const year = selected.getFullYear();
  const month = selected.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const dayCells = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const selectedJobs = useMemo(() => jobs.filter((j) => occursOn(selected, j)), [selected]);

  const yyyy = selected.getFullYear();
  const mm = String(selected.getMonth() + 1).padStart(2, "0");
  const dd = String(selected.getDate()).padStart(2, "0");
  const googleDayUrl = `https://calendar.google.com/calendar/u/0/r/day/${yyyy}/${mm}/${dd}`;
  const quickEventUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    "Mission Control Checkpoint"
  )}&dates=${yyyy}${mm}${dd}T090000/${yyyy}${mm}${dd}T093000&details=${encodeURIComponent("Daily Mission Control review")}`;

  return (
    <Shell>
      <h2 className="text-2xl font-semibold">Calendar</h2>
      <p className="mt-2 text-sm text-white/60">Clickable dates + Google Calendar quick actions.</p>

      <div className="mt-6 grid gap-4 lg:grid-cols-[1fr_380px]">
        <section className="card">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white/80">
              {selected.toLocaleString("en-US", { month: "long" })} {year}
            </h3>
            <span className="text-xs text-white/50">Asia/Shanghai</span>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-xs text-white/50">
            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
              <div key={d}>{d}</div>
            ))}
          </div>

          <div className="mt-2 grid grid-cols-7 gap-2">
            {dayCells.map((d) => {
              const date = new Date(year, month, d);
              const active = d === selected.getDate();
              const hasJobs = jobs.some((j) => occursOn(date, j));

              return (
                <button
                  key={d}
                  onClick={() => setSelected(date)}
                  className={`rounded-lg border p-2 text-left text-sm transition ${
                    active
                      ? "border-cyan-400 bg-cyan-500/20"
                      : "border-white/10 bg-black/20 hover:border-fuchsia-400/40 hover:bg-fuchsia-500/10"
                  }`}
                >
                  <div>{d}</div>
                  {hasJobs ? <div className="mt-1 text-[10px] text-cyan-200">Jobs</div> : null}
                </button>
              );
            })}
          </div>
        </section>

        <aside className="card">
          <h3 className="text-sm font-semibold text-white/80">{selected.toDateString()}</h3>
          <p className="mt-1 text-xs text-white/50">Tap a date to see scheduled jobs.</p>

          <div className="mt-3 flex gap-2">
            <a href={googleDayUrl} target="_blank" className="rounded-md border border-cyan-400/40 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
              Open in Google Calendar
            </a>
            <a href={quickEventUrl} target="_blank" className="rounded-md border border-fuchsia-400/40 bg-fuchsia-500/10 px-3 py-2 text-xs text-fuchsia-200">
              + Add Event
            </a>
          </div>

          <ul className="mt-3 space-y-2">
            {selectedJobs.map((j) => (
              <li key={j.title + j.time} className="rounded-lg border border-white/10 bg-black/20 p-3 text-sm">
                <div className="flex justify-between text-white/80">
                  <span>{j.time}</span>
                  <span className="text-xs text-white/50 uppercase">{j.type}</span>
                </div>
                <p className="mt-1 text-white/70">{j.title}</p>
              </li>
            ))}
            {!selectedJobs.length && <li className="text-sm text-white/50">No jobs on this date.</li>}
          </ul>
        </aside>
      </div>
    </Shell>
  );
}
