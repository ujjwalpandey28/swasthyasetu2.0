import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  actions,
  backTo,
  backLabel,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  backTo?: string;
  backLabel?: string;
}) {
  return (
    <div className="mb-6 space-y-2">
      {backTo && (
        <Link
          to={backTo}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700 hover:text-brand-800 transition py-0.5"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          {backLabel || "Back to Dashboard"}
        </Link>
      )}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-fg">{title}</h1>
          {subtitle && <p className="text-sm text-muted">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
    </div>
  );
}

export function LoadingBlob({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-muted">
      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-brand-700 border-t-transparent" />
      {label}
    </div>
  );
}