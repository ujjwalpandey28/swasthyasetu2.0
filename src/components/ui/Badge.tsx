import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";
import { RiskLevel } from "@/dto/constants/RiskLevel";

const tone: Record<string, string> = {
  LOW: "bg-green-100 text-green-700",
  GREEN: "bg-green-100 text-green-700",
  MODERATE: "bg-amber-100 text-amber-800",
  YELLOW: "bg-amber-100 text-amber-800",
  HIGH: "bg-red-100 text-red-700",
  RED: "bg-red-100 text-red-700",
  INFO: "bg-brand-100 text-brand-700",
};

export function RiskBadge({
  level,
  className,
}: {
  level: RiskLevel | "GREEN" | "YELLOW" | "RED" | "INFO" | "LOW" | "MODERATE" | "HIGH";
  className?: string;
}) {
  const label =
    level === RiskLevel.LOW || level === "GREEN"
      ? "Low"
      : level === RiskLevel.MODERATE || level === "YELLOW"
      ? "Moderate"
      : level === "INFO"
      ? "Info"
      : "High";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone[level],
        className
      )}
    >
      <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-current" />
      {label}
    </span>
  );
}

export function Badge({
  className,
  tone: t = "INFO",
  ...props
}: HTMLAttributes<HTMLSpanElement> & {
  tone?: "INFO" | "GREEN" | "YELLOW" | "RED";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        tone[t],
        className
      )}
      {...props}
    />
  );
}