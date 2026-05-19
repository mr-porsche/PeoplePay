import { useRef, useState } from "react";
import {
  Upload,
  X,
  Eye,
  CheckCircle,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  Braces,
  ChevronRight,
} from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import { employeesApi } from "../../lib/api";
import { cn } from "../../lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────
type TopFormat = "txt" | "csv" | "json" | "excel";
type TxtSubFormat = "txt_pair" | "txt_full" | "txt_columns";
type FillMode = "yes" | "no" | null;

interface SeedRecord {
  full_name?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  job_title?: string;
  department?: string;
  country?: string;
  salary?: number;
  currency?: string;
  hire_date?: string;
  status?: string;
}

interface NamePair {
  index: number;
  firstName: string;
  lastName: string;
  fullName: string;
  warned: boolean;
}

interface Props {
  onClose: () => void;
}

const MAX_RECORDS = 15_000;

// ── Constants ─────────────────────────────────────────────────────────────────
const TOP_FORMATS = [
  {
    value: "txt" as TopFormat,
    label: "TXT",
    icon: <FileText size={18} />,
    desc: "Plain text — name pairs, single file with all details, or one file per column",
  },
  {
    value: "csv" as TopFormat,
    label: "CSV",
    icon: <FileText size={18} />,
    desc: "Comma-separated with headers: full_name, email, job_title, department…",
  },
  {
    value: "json" as TopFormat,
    label: "JSON",
    icon: <Braces size={18} />,
    desc: "Array of employee objects or { data: [] }",
  },
  {
    value: "excel" as TopFormat,
    label: "Excel",
    icon: <FileSpreadsheet size={18} />,
    desc: ".xlsx or .xls — first sheet is used",
  },
];

const TXT_SUB_FORMATS = [
  {
    value: "txt_pair" as TxtSubFormat,
    label: "Two name files",
    desc: "first_names.txt + last_names.txt — paired line by line. Rest of the details are generated optionally.",
  },
  {
    value: "txt_full" as TxtSubFormat,
    label: "Single file — all details per line",
    desc: 'Each line: "Full Name  email  job_title  department  country  salary  currency  hire_date  status" (tab or 2+ spaces as separator). Name only lines also accepted.',
  },
  {
    value: "txt_columns" as TxtSubFormat,
    label: "Separate file per column",
    desc: "One .txt file per field. first_name.txt and last_name.txt are required. All others optional.",
  },
];

const COLUMN_DEFS = [
  { key: "first_name", label: "first_name.txt", required: true },
  { key: "last_name", label: "last_name.txt", required: true },
  { key: "email", label: "email.txt", required: false },
  { key: "job_title", label: "job_title.txt", required: false },
  { key: "department", label: "department.txt", required: false },
  { key: "country", label: "country.txt", required: false },
  { key: "salary", label: "salary.txt", required: false },
  { key: "currency", label: "currency.txt", required: false },
  { key: "hire_date", label: "hire_date.txt", required: false },
  { key: "status", label: "status.txt", required: false },
];

// ── File utilities ────────────────────────────────────────────────────────────
function readText(file: File): Promise<string> {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = (e) => resolve(e.target?.result as string);
    r.readAsText(file);
  });
}

function readBuffer(file: File): Promise<ArrayBuffer> {
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = (e) => resolve(e.target?.result as ArrayBuffer);
    r.readAsArrayBuffer(file);
  });
}

function splitLines(content: string): string[] {
  return content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
}

function normaliseSalary(raw: string | undefined): number | undefined {
  if (!raw) return undefined;
  const n = Number(raw.replace(/[^0-9.]/g, ""));
  return isNaN(n) ? undefined : n;
}

function mapRow(row: Record<string, string>): SeedRecord {
  const get = (...aliases: string[]): string | undefined => {
    for (const alias of aliases) {
      const key = Object.keys(row).find(
        (k) =>
          k.toLowerCase().replace(/[\s_-]/g, "") ===
          alias.toLowerCase().replace(/[\s_-]/g, ""),
      );
      if (key && row[key]?.trim()) return row[key].trim();
    }
    return undefined;
  };

  const firstName = get("firstname", "first_name", "first");
  const lastName = get("lastname", "last_name", "last");
  const fullName =
    get("fullname", "full_name", "name") ??
    (firstName && lastName ? `${firstName} ${lastName}` : undefined);

  return {
    full_name: fullName,
    first_name: firstName,
    last_name: lastName,
    email: get("email", "mail"),
    job_title: get("jobtitle", "job_title", "title", "position", "role"),
    department: get("department", "dept", "team"),
    country: get("country", "location"),
    salary: normaliseSalary(get("salary", "pay")),
    currency: get("currency", "curr"),
    hire_date: get("hiredate", "hire_date", "startdate", "start_date"),
    status: get("status"),
  };
}

// ── Component ─────────────────────────────────────────────────────────────────
export function SeedUploader({ onClose }: Props) {
  const queryClient = useQueryClient();

  // Step state
  const [topFormat, setTopFormat] = useState<TopFormat | null>(null);
  const [txtSubFormat, setTxtSubFormat] = useState<TxtSubFormat | null>(null);
  const [fillMode, setFillMode] = useState<FillMode>(null);

  // txt_pair
  const [firstNames, setFirstNames] = useState<string[]>([]);
  const [lastNames, setLastNames] = useState<string[]>([]);
  const [firstName, setFirstFile] = useState("");
  const [lastName, setLastFile] = useState("");
  const firstRef = useRef<HTMLInputElement>(null);
  const lastRef = useRef<HTMLInputElement>(null);

  // txt_columns
  const [colFiles, setColFiles] = useState<Record<string, string[]>>({});
  const colRefs = useRef<Record<string, HTMLInputElement | null>>({});

  // single file (txt_full / csv / json / excel)
  const [records, setRecords] = useState<SeedRecord[]>([]);
  const [fileName, setFileName] = useState("");
  const singleRef = useRef<HTMLInputElement>(null);

  // shared
  const [warnings, setWarnings] = useState<string[]>([]);
  const [preview, setPreview] = useState<(NamePair | SeedRecord)[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [result, setResult] = useState<{
    seeded: number;
    skipped: number;
    warnings?: string[];
  } | null>(null);

  // ── Derived ─────────────────────────────────────────────────────────────────
  const isTxtPair = topFormat === "txt" && txtSubFormat === "txt_pair";
  const isTxtFull = topFormat === "txt" && txtSubFormat === "txt_full";
  const isTxtColumns = topFormat === "txt" && txtSubFormat === "txt_columns";
  const isSingle =
    isTxtFull ||
    topFormat === "csv" ||
    topFormat === "json" ||
    topFormat === "excel";

  const pairReady = isTxtPair && firstNames.length > 0 && lastNames.length > 0;
  const colReady =
    isTxtColumns &&
    (colFiles["first_name"]?.length ?? 0) > 0 &&
    (colFiles["last_name"]?.length ?? 0) > 0;
  const singleReady = isSingle && records.length > 0;
  const filesReady = pairReady || colReady || singleReady;

  const totalCount = isTxtPair
    ? Math.max(firstNames.length, lastNames.length)
    : isTxtColumns
      ? Math.max(...Object.values(colFiles).map((a) => a.length), 0)
      : records.length;

  const pairWarnCount = isTxtPair
    ? Math.abs(firstNames.length - lastNames.length)
    : 0;

  const hasMissingFields =
    isTxtPair ||
    isTxtColumns ||
    (singleReady &&
      records.some((r) => !r.job_title || !r.department || !r.country));

  const needsFillQuestion = filesReady && hasMissingFields;
  const isReady =
    filesReady && (fillMode !== null || (singleReady && !hasMissingFields));

  // const stepNum = (base: number) => (topFormat === "txt" ? base + 1 : base);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  async function onFirstFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFirstFile(f.name);
    setFirstNames(splitLines(await readText(f)));
    setShowPreview(false);
    setResult(null);
  }

  async function onLastFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setLastFile(f.name);
    setLastNames(splitLines(await readText(f)));
    setShowPreview(false);
    setResult(null);
  }

  async function onColFile(
    key: string,
    e: React.ChangeEvent<HTMLInputElement>,
  ) {
    const f = e.target.files?.[0];
    if (!f) return;

    const text = await readText(f);
    const lines = splitLines(text);

    setColFiles((prev) => ({ ...prev, [key]: lines }));

    setShowPreview(false);
    setResult(null);
  }

  async function onSingleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFileName(f.name);
    setResult(null);
    setShowPreview(false);
    setWarnings([]);

    let parsed: SeedRecord[] = [];
    const warn: string[] = [];

    try {
      if (isTxtFull) {
        const text = await readText(f);
        const raw = splitLines(text);
        const start = raw[0]?.toLowerCase().replace(/\s/g, "").includes("name")
          ? 1
          : 0;
        parsed = raw
          .slice(start)
          .map((line) => {
            const parts = line
              .split(/\t|  +/)
              .map((p) => p.trim())
              .filter(Boolean);
            if (parts.length === 0) return null;
            if (parts.length <= 2 && !parts[1]?.includes("@")) {
              return {
                full_name: parts.join(" "),
                first_name: parts[0],
                last_name: parts[1],
              };
            }
            return {
              full_name: parts[0],
              email: parts[1] || undefined,
              job_title: parts[2] || undefined,
              department: parts[3] || undefined,
              country: parts[4] || undefined,
              salary: normaliseSalary(parts[5]),
              currency: parts[6] || undefined,
              hire_date: parts[7] || undefined,
              status: parts[8] || undefined,
            } as SeedRecord;
          })
          .filter(Boolean) as SeedRecord[];
      } else if (topFormat === "csv") {
        const text = await readText(f);
        const lines = text.split("\n").filter((l) => l.trim());
        if (lines.length < 2) {
          warn.push("CSV has no data rows");
        } else {
          const headers = lines[0]
            .split(",")
            .map((h) => h.trim().replace(/^"|"$/g, ""));
          parsed = lines.slice(1).map((line) => {
            const vals = line
              .split(",")
              .map((v) => v.trim().replace(/^"|"$/g, ""));
            const row: Record<string, string> = {};
            headers.forEach((h, i) => {
              row[h] = vals[i] ?? "";
            });
            return mapRow(row);
          });
        }
      } else if (topFormat === "json") {
        const text = await readText(f);
        const raw = JSON.parse(text);
        const rows = Array.isArray(raw) ? raw : (raw.data ?? []);
        if (!Array.isArray(rows) || rows.length === 0)
          warn.push("JSON must be a non-empty array or { data: [] }");
        else parsed = rows.map((r: Record<string, string>) => mapRow(r));
      } else if (topFormat === "excel") {
        const buf = await readBuffer(f);
        const wb = XLSX.read(buf, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json<Record<string, string>>(sheet, {
          defval: "",
        });
        parsed = rows.map((r) => mapRow(r));
      }
    } catch (err) {
      warn.push(
        `Failed to parse file: ${err instanceof Error ? err.message : "unknown error"}`,
      );
    }

    if (parsed.length > MAX_RECORDS) {
      warn.push(
        `${parsed.length.toLocaleString()} rows found — truncated to ${MAX_RECORDS.toLocaleString()}`,
      );
      parsed = parsed.slice(0, MAX_RECORDS);
    }

    setWarnings(warn);
    setRecords(parsed);
  }

  function buildPreview() {
    if (isTxtPair) {
      const maxLen = Math.max(firstNames.length, lastNames.length);
      setPreview(
        Array.from({ length: Math.min(maxLen, 20) }, (_, i) => {
          const first = firstNames[i] ?? "";
          const last = lastNames[i] ?? "";
          return {
            index: i + 1,
            firstName: first || "Unknown",
            lastName: last || "Unknown",
            fullName: `${first || "Unknown"} ${last || "Unknown"}`,
            warned: !first || !last,
          } as NamePair;
        }),
      );
    } else if (isTxtColumns) {
      const maxLen = Math.max(
        ...Object.values(colFiles).map((a) => a.length),
        0,
      );
      setPreview(
        Array.from({ length: Math.min(maxLen, 20) }, (_, i) => {
          const first = colFiles["first_name"]?.[i] ?? "";
          const last = colFiles["last_name"]?.[i] ?? "";
          return {
            index: i + 1,
            firstName: first || "Unknown",
            lastName: last || "Unknown",
            fullName: `${first || "Unknown"} ${last || "Unknown"}`,
            warned: !first || !last,
          } as NamePair;
        }),
      );
    } else {
      setPreview(records.slice(0, 20));
    }
    setShowPreview(true);
  }

  function reset() {
    setTopFormat(null);
    setTxtSubFormat(null);
    setFillMode(null);
    setFirstNames([]);
    setLastNames([]);
    setFirstFile("");
    setLastFile("");
    setColFiles({});
    setRecords([]);
    setFileName("");
    setWarnings([]);
    setPreview([]);
    setShowPreview(false);
    setResult(null);
  }

  // ── Mutation ─────────────────────────────────────────────────────────────────
  const mutation = useMutation({
    mutationFn: () => {
      const fill =
        fillMode === "yes" || (!hasMissingFields && fillMode === null);

      if (isTxtPair) {
        return employeesApi.seed({
          format: "txt_pair",
          firstNames,
          lastNames,
          fillMissing: fill,
        });
      }

      if (isTxtColumns) {
        return employeesApi.seed({
          format: "txt_columns",
          columns: colFiles,
          fillMissing: fill,
        });
      }

      const format = isTxtFull
        ? "txt_full"
        : topFormat === "csv"
          ? "csv"
          : topFormat === "json"
            ? "json"
            : "excel";

      return employeesApi.seed({ format, records, fillMissing: fill });
    },
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["insights-summary"] });
      queryClient.invalidateQueries({ queryKey: ["employees-meta"] });
    },
  });

  // ── Accept attr ──────────────────────────────────────────────────────────────
  const singleAccept =
    topFormat === "csv"
      ? ".csv"
      : topFormat === "json"
        ? ".json"
        : topFormat === "excel"
          ? ".xlsx,.xls"
          : ".txt";

  // ── UI helpers ────────────────────────────────────────────────────────────────
  const dropZone = (
    loaded: boolean,
    name: string,
    count: number,
    inputRef: React.RefObject<HTMLInputElement | null>,
  ) => (
    <div
      onClick={() => inputRef.current?.click()}
      className={cn(
        "border-2 border-dashed rounded-lg p-4 cursor-pointer text-center transition-colors",
        loaded
          ? "border-green-400 bg-green-50 dark:bg-green-950/20"
          : "border-border hover:border-primary/50 hover:bg-muted/30",
      )}
    >
      <Upload size={18} className="mx-auto mb-1 text-muted-foreground" />
      <p className="text-xs text-muted-foreground truncate">
        {name || "Click to upload"}
      </p>
      {loaded && (
        <p className="text-xs text-green-600 dark:text-green-400 font-medium mt-1">
          {count.toLocaleString()} rows
        </p>
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-background rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Seed Employees from File</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              TXT · CSV · JSON · Excel — up to {MAX_RECORDS.toLocaleString()}{" "}
              records
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="px-6 py-5 space-y-5">
          {/* ── Step 1: Top format ─────────────────────────────────────────── */}
          {!topFormat && (
            <div>
              <p className="text-sm font-medium mb-3">
                Step 1 — Choose file format
              </p>
              <div className="grid grid-cols-2 gap-3">
                {TOP_FORMATS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setTopFormat(f.value)}
                    className="text-left border border-border rounded-lg p-4 hover:border-primary/50 hover:bg-muted/30 transition-all"
                  >
                    <div className="text-primary mb-1">{f.icon}</div>
                    <p className="text-sm font-semibold">{f.label}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {f.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Format breadcrumb */}
          {topFormat && (
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 bg-primary/10 text-primary rounded text-xs font-medium">
                {TOP_FORMATS.find((f) => f.value === topFormat)?.label}
              </span>
              {txtSubFormat && (
                <>
                  <ChevronRight size={12} className="text-muted-foreground" />
                  <span className="px-2 py-0.5 bg-muted text-foreground rounded text-xs font-medium">
                    {
                      TXT_SUB_FORMATS.find((f) => f.value === txtSubFormat)
                        ?.label
                    }
                  </span>
                </>
              )}
              <button
                onClick={reset}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground underline cursor-pointer"
              >
                Start over
              </button>
            </div>
          )}

          {/* ── Step 2: TXT sub-format ─────────────────────────────────────── */}
          {topFormat === "txt" && !txtSubFormat && (
            <div>
              <p className="text-sm font-medium mb-3">
                Step 2 — Choose TXT type
              </p>
              <div className="flex flex-col gap-3">
                {TXT_SUB_FORMATS.map((f) => (
                  <button
                    key={f.value}
                    onClick={() => setTxtSubFormat(f.value)}
                    className="text-left border border-border rounded-lg p-4 hover:border-primary/50 hover:bg-muted/30 transition-all"
                  >
                    <p className="text-sm font-semibold">{f.label}</p>
                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                      {f.desc}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ── Upload: txt_pair ───────────────────────────────────────────── */}
          {isTxtPair && (
            <div>
              <p className="text-sm font-medium mb-3">
                Step 3 — Upload name files
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-mono">
                    first_names.txt <span className="text-destructive">*</span>
                  </p>
                  {dropZone(
                    firstNames.length > 0,
                    firstName,
                    firstNames.length,
                    firstRef,
                  )}
                  <input
                    ref={firstRef}
                    type="file"
                    accept=".txt"
                    onChange={onFirstFile}
                    className="hidden"
                  />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-2 font-mono">
                    last_names.txt <span className="text-destructive">*</span>
                  </p>
                  {dropZone(
                    lastNames.length > 0,
                    lastName,
                    lastNames.length,
                    lastRef,
                  )}
                  <input
                    ref={lastRef}
                    type="file"
                    accept=".txt"
                    onChange={onLastFile}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Upload: txt_columns ────────────────────────────────────────── */}
          {isTxtColumns && (
            <div>
              <p className="text-sm font-medium mb-1">
                Step 3 — Upload column files
              </p>
              <p className="text-xs text-muted-foreground mb-3">
                <span className="text-destructive">*</span> Required &nbsp;·
                &nbsp;All others optional
              </p>
              <div className="grid grid-cols-2 gap-2">
                {COLUMN_DEFS.map((col) => {
                  const count = colFiles[col.key]?.length ?? 0;
                  const loaded = count > 0;
                  return (
                    <div key={col.key}>
                      <div
                        onClick={() => colRefs.current[col.key]?.click()}
                        className={cn(
                          "flex items-center gap-2 border border-dashed rounded-md px-3 py-2 cursor-pointer transition-colors text-xs",
                          loaded
                            ? "border-green-400 bg-green-50 dark:bg-green-950/20 text-green-700 dark:text-green-400"
                            : "border-border hover:border-primary/50 hover:bg-muted/30 text-muted-foreground",
                        )}
                      >
                        <Upload size={12} className="shrink-0" />
                        <span className="font-mono truncate">
                          {col.label}
                          {col.required && (
                            <span className="text-destructive ml-0.5">*</span>
                          )}
                        </span>
                        {loaded && (
                          <span className="ml-auto shrink-0">{count}</span>
                        )}
                      </div>
                      <input
                        ref={(el) => {
                          colRefs.current[col.key] = el;
                        }}
                        type="file"
                        accept=".txt"
                        onChange={(e) => onColFile(col.key, e)}
                        className="hidden"
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Upload: single file ────────────────────────────────────────── */}
          {isSingle && !isTxtPair && !isTxtColumns && (
            <div>
              <p className="text-sm font-medium mb-2">
                Step {topFormat === "txt" ? "3" : "2"} — Upload file
              </p>
              {isTxtFull && (
                <div className="bg-muted/30 rounded-md px-3 py-2 mb-3 text-xs text-muted-foreground leading-relaxed">
                  <p className="font-medium text-foreground mb-1">
                    Expected format (tab or 2+ spaces as separator):
                  </p>
                  <code className="text-xs">
                    Full Name email job_title department country salary currency
                    hire_date status
                  </code>
                  <p className="mt-1">
                    Name-only lines also accepted: <code>James Smith</code>
                  </p>
                </div>
              )}
              {dropZone(
                records.length > 0,
                fileName,
                records.length,
                singleRef,
              )}
              <input
                ref={singleRef}
                type="file"
                accept={singleAccept}
                onChange={onSingleFile}
                className="hidden"
              />
            </div>
          )}

          {/* ── Fill missing question ──────────────────────────────────────── */}
          {needsFillQuestion && fillMode === null && (
            <div className="border border-primary/20 rounded-lg p-4 bg-primary/5">
              <p className="text-sm font-semibold mb-1">
                Step {topFormat === "txt" ? "4" : "3"} — Fill missing details?
              </p>
              <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
                {isTxtPair || isTxtColumns
                  ? "Your files only contain names. Randomly generate job title, department, country, salary, etc.?"
                  : "Some records have missing fields (job title, department, country…). Fill them in randomly?"}
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setFillMode("yes")}
                  className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors cursor-pointer"
                >
                  Yes, fill randomly
                </button>
                <button
                  onClick={() => setFillMode("no")}
                  className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors cursor-pointer"
                >
                  No, seed names only
                </button>
              </div>
            </div>
          )}

          {fillMode !== null && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              Missing fields:
              <span className="font-medium text-foreground">
                {fillMode === "yes"
                  ? "Will be filled randomly"
                  : "Will be left as Unknown / 0"}
              </span>
              <button
                onClick={() => setFillMode(null)}
                className="underline hover:text-foreground cursor-pointer ml-1"
              >
                Change
              </button>
            </div>
          )}

          {/* ── Pair mismatch warning ──────────────────────────────────────── */}
          {pairWarnCount > 0 && (
            <div className="flex items-start gap-2 bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3 text-xs text-amber-700 dark:text-amber-400">
              <AlertTriangle size={14} className="shrink-0 mt-0.5" />
              <span>
                {pairWarnCount} name(s) missing a pair — will be filled with
                'Unknown'
              </span>
            </div>
          )}

          {/* ── File parse warnings ────────────────────────────────────────── */}
          {warnings.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                <AlertTriangle size={13} /> Parse warnings
              </div>
              {warnings.map((w, i) => (
                <p
                  key={i}
                  className="text-xs text-amber-600 dark:text-amber-400"
                >
                  {w}
                </p>
              ))}
            </div>
          )}

          {/* ── Ready pill ────────────────────────────────────────────────── */}
          {filesReady && (
            <div
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-3 text-sm border font-medium",
                pairWarnCount > 0 || warnings.length > 0
                  ? "bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:border-amber-800 dark:text-amber-400"
                  : "bg-green-50 border-green-200 text-green-700 dark:bg-green-950/20 dark:border-green-800 dark:text-green-400",
              )}
            >
              {pairWarnCount === 0 && warnings.length === 0 ? (
                <>
                  <CheckCircle size={15} /> {totalCount.toLocaleString()}{" "}
                  records ready to seed
                </>
              ) : (
                <>
                  <AlertTriangle size={15} /> {totalCount.toLocaleString()}{" "}
                  records ({pairWarnCount + warnings.length} warning(s))
                </>
              )}
            </div>
          )}

          {/* ── Preview ───────────────────────────────────────────────────── */}
          {filesReady && (
            <button
              onClick={buildPreview}
              className="flex items-center gap-1.5 text-sm text-primary hover:underline cursor-pointer"
            >
              <Eye size={14} />
              Preview first 20 records
            </button>
          )}

          {showPreview && preview.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Preview — {preview.length} of {totalCount.toLocaleString()}
              </div>
              <div className="max-h-52 overflow-y-auto">
                {isTxtPair || isTxtColumns ? (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/20 sticky top-0">
                      <tr>
                        {["#", "First", "Last", "Full Name"].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-2 text-xs font-medium text-muted-foreground"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(preview as NamePair[]).map((p) => (
                        <tr
                          key={p.index}
                          className={cn(
                            "transition-colors",
                            p.warned
                              ? "bg-amber-50 dark:bg-amber-950/20"
                              : "hover:bg-muted/30",
                          )}
                        >
                          <td className="px-4 py-2 text-xs text-muted-foreground">
                            {p.index}
                          </td>
                          <td
                            className={cn(
                              "px-4 py-2",
                              p.warned &&
                                "text-amber-600 dark:text-amber-400 italic",
                            )}
                          >
                            {p.firstName}
                          </td>
                          <td
                            className={cn(
                              "px-4 py-2",
                              p.warned &&
                                "text-amber-600 dark:text-amber-400 italic",
                            )}
                          >
                            {p.lastName}
                          </td>
                          <td className="px-4 py-2 font-medium">
                            {p.fullName}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <table className="w-full text-sm">
                    <thead className="bg-muted/20 sticky top-0">
                      <tr>
                        {[
                          "Name",
                          "Email",
                          "Job Title",
                          "Dept",
                          "Country",
                          "Salary",
                        ].map((h) => (
                          <th
                            key={h}
                            className="text-left px-4 py-2 text-xs font-medium text-muted-foreground"
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {(preview as SeedRecord[]).map((r, i) => (
                        <tr
                          key={i}
                          className="hover:bg-muted/30 transition-colors"
                        >
                          <td className="px-4 py-2 font-medium">
                            {r.full_name ??
                              `${r.first_name ?? "?"} ${r.last_name ?? "?"}`}
                          </td>
                          <td className="px-4 py-2 text-xs text-muted-foreground">
                            {r.email ?? (
                              <em className="text-amber-500">missing</em>
                            )}
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">
                            {r.job_title ?? (
                              <em className="text-amber-500">missing</em>
                            )}
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">
                            {r.department ?? (
                              <em className="text-amber-500">missing</em>
                            )}
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">
                            {r.country ?? (
                              <em className="text-amber-500">missing</em>
                            )}
                          </td>
                          <td className="px-4 py-2 text-muted-foreground">
                            {r.salary ?? (
                              <em className="text-amber-500">missing</em>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ── Result ────────────────────────────────────────────────────── */}
          {result && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3 space-y-1">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                <CheckCircle size={15} />
                {result.seeded.toLocaleString()} employees seeded successfully
              </div>
              {result.skipped > 0 && (
                <p className="text-xs text-muted-foreground">
                  {result.skipped} skipped (duplicate emails)
                </p>
              )}
              {result.warnings && result.warnings.length > 0 && (
                <p className="text-xs text-amber-600">
                  {result.warnings.length} warning(s) during seeding
                </p>
              )}
            </div>
          )}

          {mutation.isError && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 text-sm text-destructive">
              {(mutation.error as Error)?.message ??
                "Seed failed — check server logs"}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {isReady
              ? `${totalCount.toLocaleString()} employees will be seeded`
              : "Complete the steps above to continue"}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors cursor-pointer"
            >
              {result ? "Close" : "Cancel"}
            </button>
            {!result && (
              <button
                disabled={!isReady || mutation.isPending}
                onClick={() => mutation.mutate()}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {mutation.isPending
                  ? "Seeding…"
                  : `Seed ${totalCount.toLocaleString()} employees`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
