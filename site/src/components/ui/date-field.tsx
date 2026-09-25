"use client";

import { CalendarDays } from "lucide-react";

import { Button } from "@/components/ui/button";
import { formatIsoDate, todayIsoDate } from "@/lib/dates";
import { cn } from "@/lib/utils";

type DateFieldProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  min?: string;
  max?: string;
  name?: string;
  disabled?: boolean;
  invalid?: boolean;
};

export function DateField({
  value,
  onChange,
  placeholder = "Selecionar data",
  min = "1900-01-01",
  max = todayIsoDate(),
  name,
  disabled = false,
  invalid = false,
}: DateFieldProps) {
  const formatted = formatIsoDate(value);

  return (
    <div className="space-y-2">
      <div className="relative">
        <div
          aria-hidden="true"
          className={cn(
            "pointer-events-none flex min-h-[48px] w-full items-center justify-between gap-2 rounded-xl border bg-slate-950 px-3 py-2.5",
            invalid ? "border-rose-500/70" : "border-slate-700",
          )}
        >
          <span className={cn("text-sm", formatted ? "text-white" : "text-slate-500")}>
            {formatted || placeholder}
          </span>
          <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
        </div>

        <input
          type="date"
          name={name}
          value={value}
          min={min}
          max={max}
          disabled={disabled}
          onChange={(event) => onChange(event.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer rounded-xl bg-transparent opacity-0 disabled:cursor-not-allowed"
        />
      </div>

      {value && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => onChange("")}
          disabled={disabled}
        >
          Limpar data
        </Button>
      )}
    </div>
  );
}
