import { useRef, useState } from "react";
import { Upload, X, Eye, CheckCircle, AlertTriangle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { employeesApi } from "../../lib/api";
import { cn } from "../../lib/utils";

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

export function SeedUploader({ onClose }: Props) {
  const queryClient = useQueryClient();
  const firstRef = useRef<HTMLInputElement>(null);
  const lastRef = useRef<HTMLInputElement>(null);
  const [firstNames, setFirstNames] = useState<string[]>([]);
  const [lastNames, setLastNames] = useState<string[]>([]);
  const [firstName, setFirstFile] = useState("");
  const [lastName, setLastFile] = useState("");
  const [preview, setPreview] = useState<NamePair[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [result, setResult] = useState<{
    seeded: number;
    warnings?: string[];
  } | null>(null);

  function readFile(file: File): Promise<string[]> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const lines = (e.target?.result as string)
          .split("\n")
          .map((l) => l.trim())
          .filter(Boolean);
        resolve(lines);
      };
      reader.readAsText(file);
    });
  }

  async function handleFirstFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFirstFile(file.name);
    setFirstNames(await readFile(file));
    setShowPreview(false);
    setResult(null);
  }

  async function handleLastFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setLastFile(file.name);
    setLastNames(await readFile(file));
    setShowPreview(false);
    setResult(null);
  }

  function buildPreview() {
    const maxLen = Math.max(firstNames.length, lastNames.length);
    const pairs: NamePair[] = [];

    for (let i = 0; i < Math.min(maxLen, 20); i++) {
      const first = firstNames[i] ?? "";
      const last = lastNames[i] ?? "";
      const warned = !first || !last;
      pairs.push({
        index: i + 1,
        firstName: first || "Unknown",
        lastName: last || "Unknown",
        fullName: `${first || "Unknown"} ${last || "Unknown"}`,
        warned,
      });
    }

    setPreview(pairs);
    setShowPreview(true);
  }

  const mutation = useMutation({
    mutationFn: () => employeesApi.seed({ firstNames, lastNames }),
    onSuccess: (data) => {
      setResult(data);
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      queryClient.invalidateQueries({ queryKey: ["insights-summary"] });
    },
  });

  const bothLoaded = firstNames.length > 0 && lastNames.length > 0;
  const maxLen = Math.max(firstNames.length, lastNames.length);
  const warnCount = Math.abs(firstNames.length - lastNames.length);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-background rounded-lg border border-border w-full max-w-2xl max-h-[90vh] overflow-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div>
            <h2 className="text-lg font-semibold">Seed Employees from Files</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Upload first_names.txt and last_names.txt — names are paired by
              line number
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
          {/* File uploads */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                First names file
              </label>
              <div
                onClick={() => firstRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 cursor-pointer text-center transition-colors",
                  firstNames.length > 0
                    ? "border-green-400 bg-green-50 dark:bg-green-950/20"
                    : "border-border hover:border-primary/50 hover:bg-muted/30",
                )}
              >
                <Upload
                  size={20}
                  className="mx-auto mb-2 text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  {firstName || "Click to upload .txt"}
                </p>
                {firstNames.length > 0 && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    {firstNames.length} names loaded
                  </p>
                )}
              </div>
              <input
                ref={firstRef}
                type="file"
                accept=".txt"
                onChange={handleFirstFile}
                className="hidden"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Last names file
              </label>
              <div
                onClick={() => lastRef.current?.click()}
                className={cn(
                  "border-2 border-dashed rounded-lg p-4 cursor-pointer text-center transition-colors",
                  lastNames.length > 0
                    ? "border-green-400 bg-green-50 dark:bg-green-950/20"
                    : "border-border hover:border-primary/50 hover:bg-muted/30",
                )}
              >
                <Upload
                  size={20}
                  className="mx-auto mb-2 text-muted-foreground"
                />
                <p className="text-xs text-muted-foreground">
                  {lastName || "Click to upload .txt"}
                </p>
                {lastNames.length > 0 && (
                  <p className="text-xs text-green-600 font-medium mt-1">
                    {lastNames.length} names loaded
                  </p>
                )}
              </div>
              <input
                ref={lastRef}
                type="file"
                accept=".txt"
                onChange={handleLastFile}
                className="hidden"
              />
            </div>
          </div>

          {/* Stats + warnings */}
          {bothLoaded && (
            <div
              className={cn(
                "rounded-lg px-4 py-3 text-sm border",
                warnCount > 0
                  ? "bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800"
                  : "bg-green-50 border-green-200 dark:bg-green-950/20 dark:border-green-800",
              )}
            >
              <div className="flex items-center gap-2 font-medium">
                {warnCount > 0 ? (
                  <>
                    <AlertTriangle size={15} className="text-amber-600" />{" "}
                    {warnCount} name(s) will be filled with 'Unknown'
                  </>
                ) : (
                  <>
                    <CheckCircle size={15} className="text-green-600" /> All{" "}
                    {maxLen} names paired successfully
                  </>
                )}
              </div>
              {warnCount > 0 && (
                <p className="text-xs mt-1 text-muted-foreground">
                  First names: {firstNames.length} · Last names:{" "}
                  {lastNames.length} · Total pairs: {maxLen}
                </p>
              )}
            </div>
          )}

          {/* Preview */}
          {bothLoaded && (
            <button
              onClick={buildPreview}
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <Eye size={15} />
              Preview first 20 pairs
            </button>
          )}

          {showPreview && preview.length > 0 && (
            <div className="border border-border rounded-lg overflow-hidden">
              <div className="px-4 py-2 bg-muted/30 border-b border-border text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Preview — first {preview.length} of {maxLen} pairs
              </div>
              <div className="max-h-56 overflow-y-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/20 sticky top-0">
                    <tr>
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                        #
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                        First
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                        Last
                      </th>
                      <th className="text-left px-4 py-2 text-xs font-medium text-muted-foreground">
                        Full Name
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {preview.map((p) => (
                      <tr
                        key={p.index}
                        className={cn(
                          p.warned && "bg-amber-50 dark:bg-amber-950/20",
                        )}
                      >
                        <td className="px-4 py-2 text-muted-foreground">
                          {p.index}
                        </td>
                        <td
                          className={cn(
                            "px-4 py-2",
                            !firstNames[p.index - 1] && "text-amber-600 italic",
                          )}
                        >
                          {p.firstName}
                        </td>
                        <td
                          className={cn(
                            "px-4 py-2",
                            !lastNames[p.index - 1] && "text-amber-600 italic",
                          )}
                        >
                          {p.lastName}
                        </td>
                        <td className="px-4 py-2 font-medium">{p.fullName}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-lg px-4 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-green-700 dark:text-green-400">
                <CheckCircle size={15} />
                Successfully seeded {result.seeded.toLocaleString()} employees
              </div>
              {result.warnings && result.warnings.length > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  {result.warnings.length} warning(s) — some names were filled
                  with 'Unknown'
                </p>
              )}
            </div>
          )}

          {mutation.isError && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-lg px-4 py-3 text-sm text-destructive">
              {(mutation.error as Error)?.message ?? "Something went wrong"}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-border">
          <p className="text-xs text-muted-foreground">
            {bothLoaded
              ? `${maxLen.toLocaleString()} employees will be seeded`
              : "Upload both files to continue"}
          </p>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm border border-border rounded-md hover:bg-muted transition-colors"
            >
              {result ? "Close" : "Cancel"}
            </button>
            {!result && (
              <button
                disabled={!bothLoaded || mutation.isPending}
                onClick={() => mutation.mutate()}
                className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {mutation.isPending
                  ? "Seeding…"
                  : `Seed ${maxLen.toLocaleString()} employees`}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
