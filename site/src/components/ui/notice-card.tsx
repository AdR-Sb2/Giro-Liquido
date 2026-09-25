"use client";

import { AlertTriangle, Info, X } from "lucide-react";

type NoticeCardProps = {
  title: string;
  description: string;
  tone?: "warning" | "info";
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  onDismiss?: () => void;
};

export function NoticeCard({
  title,
  description,
  tone = "warning",
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
  onDismiss,
}: NoticeCardProps) {
  const Icon = tone === "warning" ? AlertTriangle : Info;

  return (
    <div
      className={`rounded-2xl border p-4 ${
        tone === "warning" ? "border-amber-500/40 bg-amber-500/10" : "border-slate-700 bg-slate-900/70"
      }`}
    >
      <div className="flex items-start gap-3">
        <Icon
          className={`mt-0.5 h-5 w-5 shrink-0 ${tone === "warning" ? "text-amber-300" : "text-brand-300"}`}
        />

        <div className="flex-1 space-y-3">
          <div>
            <p className="text-sm font-medium text-white">{title}</p>
            <p className="mt-1 text-sm leading-5 text-slate-300">{description}</p>
          </div>

          {(actionLabel || secondaryLabel) && (
            <div className="flex flex-wrap gap-2">
              {actionLabel && onAction ? (
                <button
                  type="button"
                  onClick={onAction}
                  className="min-h-[40px] rounded-xl border border-amber-400/40 bg-amber-400/10 px-3 text-sm font-medium text-amber-100 transition hover:bg-amber-400/20"
                >
                  {actionLabel}
                </button>
              ) : null}

              {secondaryLabel && onSecondary ? (
                <button
                  type="button"
                  onClick={onSecondary}
                  className="min-h-[40px] rounded-xl px-3 text-sm text-slate-300 transition hover:text-white"
                >
                  {secondaryLabel}
                </button>
              ) : null}
            </div>
          )}
        </div>

        {onDismiss ? (
          <button
            type="button"
            aria-label="Dispensar aviso"
            onClick={onDismiss}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
