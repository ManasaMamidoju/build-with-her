import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { importPeople, type ImportReport } from "@/lib/studio.functions";

export const Route = createFileRoute("/_authenticated/admin/import")({
  head: () => ({
    meta: [
      { title: "Bring people in | Build With Her Media" },
      { name: "description", content: "Upload a spreadsheet export and see what will happen first." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: ImportPeople,
});

type Row = {
  fullName: string;
  email: string;
  businessName: string;
  phone: string;
  source: string;
};

function splitLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (quoted) {
      if (char === '"' && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        current += char;
      }
    } else if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      cells.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  cells.push(current);
  return cells.map((cell) => cell.trim());
}

const FIELD_HINTS: Record<keyof Row, string[]> = {
  fullName: ["name", "full name", "person", "contact"],
  email: ["email", "e-mail", "email address"],
  businessName: ["business", "company", "brand", "business name"],
  phone: ["phone", "mobile", "number", "whatsapp"],
  source: ["source", "where", "origin", "channel"],
};

function parseCsv(text: string): { rows: Row[]; unmapped: string[] } {
  const lines = text.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return { rows: [], unmapped: [] };
  const header = splitLine(lines[0] ?? "").map((h) => h.toLowerCase());

  const index: Partial<Record<keyof Row, number>> = {};
  (Object.keys(FIELD_HINTS) as (keyof Row)[]).forEach((field) => {
    const found = header.findIndex((column) =>
      FIELD_HINTS[field].some((hint) => column === hint || column.includes(hint)),
    );
    if (found >= 0) index[field] = found;
  });

  const used = new Set(Object.values(index));
  const unmapped = header.filter((_, i) => !used.has(i));

  const rows = lines.slice(1).map((line) => {
    const cells = splitLine(line);
    const pick = (field: keyof Row) => {
      const at = index[field];
      return at === undefined ? "" : (cells[at] ?? "");
    };
    return {
      fullName: pick("fullName"),
      email: pick("email"),
      businessName: pick("businessName"),
      phone: pick("phone"),
      source: pick("source"),
    };
  });

  return { rows, unmapped };
}

function ImportPeople() {
  const importFn = useServerFn(importPeople);
  const [rows, setRows] = useState<Row[]>([]);
  const [unmapped, setUnmapped] = useState<string[]>([]);
  const [report, setReport] = useState<ImportReport | null>(null);
  const [committed, setCommitted] = useState(false);
  const [busy, setBusy] = useState(false);

  async function onFile(file: File) {
    const text = await file.text();
    const parsed = parseCsv(text);
    if (parsed.rows.length === 0) {
      toast.error("We could not read any people out of that file.");
      return;
    }
    setRows(parsed.rows);
    setUnmapped(parsed.unmapped);
    setReport(null);
    setCommitted(false);
  }

  async function run(commit: boolean) {
    setBusy(true);
    try {
      const result = await importFn({ data: { rows, commit } });
      setReport(result);
      setCommitted(commit);
      if (commit) toast.success("Import finished");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "We could not read that list.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl">Bring your people in</h1>
      <p className="mt-3 text-base text-muted-foreground">
        Export your Notion list as a spreadsheet file, drop it here, and we show you exactly what
        will happen before anything changes. We match women by email address.
      </p>

      <div className="mt-8 rounded-2xl border border-border bg-blush p-6">
        <Label htmlFor="file">Your spreadsheet export</Label>
        <input
          id="file"
          type="file"
          accept=".csv,text/csv"
          className="mt-3 block w-full text-sm"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) void onFile(file);
          }}
        />
        <p className="mt-3 text-sm text-muted-foreground">
          We look for columns named name, email, business, phone and source. Anything else is
          ignored.
        </p>
      </div>

      {rows.length > 0 ? (
        <div className="mt-8 rounded-2xl border border-border bg-card p-6">
          <p className="text-base">
            We read <span className="numeric font-medium">{rows.length}</span> lines from your file.
          </p>
          {unmapped.length > 0 ? (
            <p className="mt-2 text-sm text-muted-foreground">
              Columns we are leaving alone: {unmapped.join(", ")}.
            </p>
          ) : null}
          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={() => run(false)} disabled={busy}>
              Show me what will happen
            </Button>
            {report && !committed ? (
              <Button variant="outline" onClick={() => run(true)} disabled={busy}>
                Bring these people in
              </Button>
            ) : null}
          </div>
        </div>
      ) : null}

      {report ? (
        <div className="mt-8 space-y-6">
          <h2 className="text-2xl">{committed ? "What we did" : "What would happen"}</h2>

          <Block
            title="Already in your list"
            note="We fill in anything missing on her record and leave the rest alone."
            items={report.matched.map((row) => `${row.name || "No name"} · ${row.email}`)}
            emptyNote="Nobody in this file is already in your list."
          />
          <Block
            title="New to you"
            note="Held against her email so she joins up the moment she signs in with Google."
            items={report.newPeople.map((row) => `${row.name || "No name"} · ${row.email}`)}
            emptyNote="No new women in this file."
          />
          <Block
            title="The same email twice"
            note="We keep the first line and skip the rest."
            items={report.duplicates.map((row) => `${row.email} appears ${row.count} times`)}
            emptyNote="No repeated emails."
          />
          <Block
            title="No email address"
            note="We cannot match these. Chase the email and add them again."
            items={report.missingEmail.map(
              (row) => `${row.name || "No name"} ${row.businessName ? `· ${row.businessName}` : ""}`,
            )}
            emptyNote="Everyone in the file has an email address."
          />

          {committed ? (
            <p className="rounded-2xl border border-border bg-blush p-6 text-base">
              <span className="numeric font-medium">{report.applied}</span> records saved. Open your
              people list to see them.
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function Block({
  title,
  note,
  items,
  emptyNote,
}: {
  title: string;
  note: string;
  items: string[];
  emptyNote: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card p-6">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-lg">{title}</h3>
        <span className="numeric text-sm text-muted-foreground">{items.length}</span>
      </div>
      <p className="mt-2 text-sm text-muted-foreground">{note}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-muted-foreground">{emptyNote}</p>
      ) : (
        <ul className="mt-3 space-y-1 text-sm">
          {items.slice(0, 50).map((item) => (
            <li key={item}>{item}</li>
          ))}
          {items.length > 50 ? (
            <li className="text-muted-foreground">and {items.length - 50} more</li>
          ) : null}
        </ul>
      )}
    </section>
  );
}
