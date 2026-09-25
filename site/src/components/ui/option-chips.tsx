"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/utils";

export type ChipOption = {
  value: string;
  label: string;
  description?: string;
};

type OptionChipsProps = {
  options: ChipOption[];
  selected: string[];
  onToggle: (value: string) => void;
  columns?: string;
  ariaLabel?: string;
};

export function OptionChips({
  options,
  selected,
  onToggle,
  columns = "grid-cols-2",
  ariaLabel,
}: OptionChipsProps) {
  return (
    <div role={ariaLabel ? "group" : undefined} aria-label={ariaLabel} className={cn("grid gap-2", columns)}>
      {options.map((option) => {
        const isSelected = selected.includes(option.value);

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={isSelected}
            onClick={() => onToggle(option.value)}
            className={cn(
              "flex min-h-[48px] items-center justify-between gap-2 rounded-xl border px-3 py-2 text-left transition",
              isSelected
                ? "border-brand-500 bg-brand-500/10 text-white"
                : "border-slate-800 bg-slate-950/70 text-slate-300 hover:border-slate-700",
            )}
          >
            <span className="min-w-0">
              <span className={cn("block truncate text-sm", isSelected && "font-medium")}>{option.label}</span>
              {option.description && (
                <span className="mt-0.5 block text-xs text-slate-400">{option.description}</span>
              )}
            </span>

            {isSelected && <Check className="h-4 w-4 shrink-0 text-brand-400" />}
          </button>
        );
      })}
    </div>
  );
}
