"use client";

import { useState } from "react";
import { useProfile } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { generateComprehensiveReport, type ExportProgress } from "@/lib/pdf-export";

export function PdfExportButton() {
  const { activeProfile } = useProfile();
  const [exporting, setExporting] = useState(false);
  const [progress, setProgress] = useState<ExportProgress>({ stage: "", percent: 0 });
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    if (!activeProfile || exporting) return;
    setExporting(true);
    setError(null);

    try {
      const blob = await generateComprehensiveReport(activeProfile, setProgress);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${activeProfile.name.replace(/\s+/g, "-")}-natal-report.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF export failed:", err);
      setError(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
      setProgress({ stage: "", percent: 0 });
    }
  };

  return (
    <div className="relative">
      <Button
        variant="secondary"
        onClick={handleExport}
        disabled={exporting || !activeProfile}
        className="flex items-center gap-2"
      >
        <FileText size={16} />
        {exporting ? "Generating Report..." : "Export Full Report (PDF)"}
      </Button>
      {exporting && (
        <div className="mt-2 space-y-1">
          <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
            <div
              className="h-full rounded-full bg-accent-blue transition-all duration-500"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="text-xs text-text-muted">{progress.stage}</p>
        </div>
      )}
      {error && (
        <p className="mt-1 text-xs text-accent-rose">{error}</p>
      )}
    </div>
  );
}
