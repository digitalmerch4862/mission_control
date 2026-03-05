import { NextRequest, NextResponse } from "next/server";
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

type ProjectRow = { name: string; progress?: number; focus?: string; owner?: string; status?: string };

type DeletePayload = {
  projectName: string;
  githubRepo?: string;
  vercelProject?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as DeletePayload;
    const projectName = (body.projectName || "").trim();
    if (!projectName) return NextResponse.json({ ok: false, error: "Missing projectName" }, { status: 400 });

    const publicDir = path.join(process.cwd(), "public");
    const projectsPath = path.join(publicDir, "projects-latest.json");
    const auditPath = path.join(publicDir, "delete-audit.json");

    let projects: ProjectRow[] = [];
    try {
      const raw = await readFile(projectsPath, "utf8");
      const parsed = JSON.parse(raw) as { generatedAt?: string; projects?: ProjectRow[] };
      projects = parsed.projects || [];
    } catch {
      projects = [];
    }

    projects = projects.filter((p) => p.name !== projectName);
    await writeFile(
      projectsPath,
      JSON.stringify({ generatedAt: new Date().toISOString(), projects }, null, 2),
      "utf8"
    );

    const auditEntry = {
      at: new Date().toISOString(),
      action: "hard-delete",
      projectName,
      githubRepo: body.githubRepo || null,
      vercelProject: body.vercelProject || null,
      githubDeleted: false,
      vercelDeleted: false,
      notes: [] as string[],
    };

    const ghToken = process.env.GITHUB_TOKEN;
    if (ghToken && body.githubRepo) {
      const ghRes = await fetch(`https://api.github.com/repos/${body.githubRepo}`, {
        method: "DELETE",
        headers: {
          Authorization: `token ${ghToken}`,
          Accept: "application/vnd.github+json",
        },
      });
      auditEntry.githubDeleted = ghRes.status === 204;
      if (!auditEntry.githubDeleted) auditEntry.notes.push(`GitHub delete failed: ${ghRes.status}`);
    } else {
      auditEntry.notes.push("GitHub delete skipped (missing token or repo)");
    }

    const vercelToken = process.env.VERCEL_TOKEN;
    const vercelTeam = process.env.VERCEL_TEAM_ID;
    if (vercelToken && body.vercelProject) {
      const qs = vercelTeam ? `?teamId=${encodeURIComponent(vercelTeam)}` : "";
      const vRes = await fetch(`https://api.vercel.com/v9/projects/${encodeURIComponent(body.vercelProject)}${qs}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${vercelToken}`,
        },
      });
      auditEntry.vercelDeleted = vRes.ok;
      if (!auditEntry.vercelDeleted) auditEntry.notes.push(`Vercel delete failed: ${vRes.status}`);
    } else {
      auditEntry.notes.push("Vercel delete skipped (missing token or project)");
    }

    let audits: unknown[] = [];
    try {
      const raw = await readFile(auditPath, "utf8");
      audits = JSON.parse(raw) as unknown[];
    } catch {
      audits = [];
    }
    audits = [auditEntry, ...audits].slice(0, 100);
    await writeFile(auditPath, JSON.stringify(audits, null, 2), "utf8");

    return NextResponse.json({ ok: true, audit: auditEntry });
  } catch (e) {
    return NextResponse.json({ ok: false, error: (e as Error).message }, { status: 500 });
  }
}
