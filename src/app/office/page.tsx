import { Shell } from "@/components/shell";

function Desk({ name, role, x, y }: { name: string; role: string; x: number; y: number }) {
  return (
    <div className="absolute" style={{ left: `${x}%`, top: `${y}%` }}>
      <div className="h-8 w-12 rounded-sm border border-black/40 bg-[#6b4f3a]" />
      <div className="mt-1 h-3 w-3 rounded-sm bg-[#8ee6a0]" />
      <div className="mt-1 text-[10px] text-white/80">{name}</div>
      <div className="text-[9px] text-white/50">{role}</div>
    </div>
  );
}

export default function OfficePage() {
  return (
    <Shell>
      <h2 className="text-2xl font-semibold">Office</h2>
      <p className="mt-2 text-sm text-white/60">2D pixel-inspired digital office view of active agents.</p>

      <section className="mt-6 card">
        <div className="relative h-[420px] overflow-hidden rounded-lg border border-white/10 bg-[#1b2030]">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff11_1px,transparent_1px),linear-gradient(to_bottom,#ffffff11_1px,transparent_1px)] bg-[size:16px_16px]" />

          <Desk name="Jonah" role="Advisor" x={10} y={20} />
          <Desk name="Luffy" role="Intake" x={35} y={25} />
          <Desk name="Zoro" role="Build" x={62} y={20} />
          <Desk name="Sanji" role="QA" x={78} y={50} />

          <div className="absolute bottom-4 left-4 rounded-md border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/70">
            Live vibe: Jonah planning sprint + agents executing queues.
          </div>
        </div>
      </section>
    </Shell>
  );
}
