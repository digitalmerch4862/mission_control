import { Shell } from "@/components/shell";

const resources = [
  {
    title: "Full Inventory PDF",
    desc: "Download the entire Drive crawl in one PDF – portable and ready for offline review.",
    link: "https://pdf-downloads.vercel.app/drive_inventory_simple_format.pdf",
  },
  {
    title: "Clean Professional Table",
    desc: "High-quality table, search/filters, category+OS columns, cleaned names.",
    link: "https://pdf-downloads.vercel.app/inventory-professional-v3.html",
  },
  {
    title: "Deluxe Table Export",
    desc: "Full 1,554-row table with fixed header, responsive design, CSV + PDF buttons.",
    link: "https://pdf-downloads.vercel.app/inventory-table-master2.html",
  },
  {
    title: "Collapsible Folder Tree",
    desc: "Interactive hierarchy: expand folders to drill into contents with direct links.",
    link: "https://pdf-downloads.vercel.app/inventory-collapsible.html",
  },
  {
    title: "Cleaned CSV Export",
    desc: "CSV ready for spreadsheets (cleaned names + category + OS + direct links).",
    link: "https://pdf-downloads.vercel.app/drive_inventory_clean_table_v2.csv",
  },
];

export default function DownloadsPage() {
  return (
    <Shell>
      <section>
        <h2 className="text-2xl font-semibold">Downloads & Inventory</h2>
        <p className="mt-2 text-sm text-white/60">
          All assets from the Google Drive crawl (PDF, tables, CSV, collapsible tree) available in one spot.
        </p>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        {resources.map((r) => (
          <article key={r.title} className="card hover:shadow-[0_10px_40px_rgba(15,23,42,.45)]">
            <h3 className="text-lg font-semibold">{r.title}</h3>
            <p className="mt-2 text-sm text-white/70">{r.desc}</p>
            <a
              className="mt-4 inline-flex items-center gap-2 text-sm text-cyan-300 hover:text-white"
              href={r.link}
              target="_blank"
              rel="noreferrer"
            >
              Open resource
              <span aria-hidden>↗</span>
            </a>
          </article>
        ))}
      </section>
    </Shell>
  );
}
