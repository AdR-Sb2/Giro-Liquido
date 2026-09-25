"use client";

import { Check, ChevronDown, Loader2, Search, X } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { normalizeSearch } from "@/lib/locations/cities";
import { cn } from "@/lib/utils";

export type SheetOption = {
  value: string;
  label: string;
  description?: string;
  keywords?: string;
};

type SelectSheetProps = {
  options: SheetOption[];
  value: string | null;
  onChange: (value: string | null) => void;
  placeholder: string;
  searchPlaceholder?: string;
  title: string;
  emptyMessage?: string;
  loading?: boolean;
  errorMessage?: string | null;
  onRetry?: () => void;
  disabled?: boolean;
  invalid?: boolean;
};

const SEARCH_THRESHOLD = 7;

export function SelectSheet({
  options,
  value,
  onChange,
  placeholder,
  searchPlaceholder = "Buscar...",
  title,
  emptyMessage = "Nada encontrado por aqui.",
  loading = false,
  errorMessage = null,
  onRetry,
  disabled = false,
  invalid = false,
}: SelectSheetProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);
  const selected = options.find((option) => option.value === value);

  function openSheet() {
    setQuery("");
    setOpen(true);
  }

  function closeSheet() {
    setQuery("");
    setOpen(false);
  }

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusTimer = window.setTimeout(() => {
      if (options.length > SEARCH_THRESHOLD) {
        searchRef.current?.focus();
      }
    }, 120);

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        closeSheet();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(focusTimer);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, options.length]);

  const visibleOptions = useMemo(() => {
    const normalizedTerm = normalizeSearch(query);

    if (!normalizedTerm) {
      return options;
    }

    const startsWith: SheetOption[] = [];
    const includes: SheetOption[] = [];

    for (const option of options) {
      const haystack = normalizeSearch(
        [option.label, option.description, option.keywords].filter(Boolean).join(" "),
      );

      if (haystack.startsWith(normalizedTerm)) {
        startsWith.push(option);
      } else if (haystack.includes(normalizedTerm)) {
        includes.push(option);
      }
    }

    return [...startsWith, ...includes];
  }, [options, query]);

  return (
    <>
      <button
        type="button"
        disabled={disabled}
        onClick={openSheet}
        className={cn(
          "flex min-h-[48px] w-full items-center justify-between gap-2 rounded-xl border bg-slate-950 px-3 py-2.5 text-left transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 disabled:cursor-not-allowed disabled:opacity-50",
          invalid ? "border-rose-500/70" : "border-slate-700 focus:border-brand-400",
        )}
      >
        <span className={cn("text-sm", selected ? "text-white" : "text-slate-500")}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown className="h-4 w-4 shrink-0 text-slate-400" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-4">
          <button
            type="button"
            aria-label="Fechar lista"
            onClick={closeSheet}
            className="absolute inset-0 animate-fade-in bg-slate-950/80 backdrop-blur-sm"
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="relative flex max-h-[85vh] w-full max-w-md animate-sheet-up flex-col rounded-t-3xl border border-slate-800 bg-slate-900 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-glow sm:max-h-[70vh] sm:rounded-3xl"
          >
            <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4">
              <p className="text-base font-semibold text-white">{title}</p>
              <button
                type="button"
                onClick={closeSheet}
                aria-label="Fechar"
                className="flex h-10 w-10 items-center justify-center rounded-full text-slate-300 transition hover:bg-slate-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {options.length > SEARCH_THRESHOLD && (
              <div className="px-4 pb-3">
                <div className="flex min-h-[48px] items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-3">
                  <Search className="h-4 w-4 shrink-0 text-slate-400" />
                  <input
                    ref={searchRef}
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder={searchPlaceholder}
                    className="w-full bg-transparent text-sm text-white outline-none placeholder:text-slate-500"
                  />
                </div>
              </div>
            )}

            <div className="min-h-0 flex-1 overflow-y-auto px-2">
              {loading && (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-slate-400">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Carregando...
                </div>
              )}

              {!loading && errorMessage && (
                <div className="space-y-3 px-2 py-8 text-center">
                  <p className="text-sm text-rose-300">{errorMessage}</p>
                  {onRetry && (
                    <Button type="button" variant="secondary" size="sm" onClick={onRetry}>
                      Tentar novamente
                    </Button>
                  )}
                </div>
              )}

              {!loading && !errorMessage && visibleOptions.length === 0 && (
                <p className="px-2 py-10 text-center text-sm text-slate-400">{emptyMessage}</p>
              )}

              {!loading &&
                !errorMessage &&
                visibleOptions.map((option) => {
                  const isSelected = option.value === value;

                  return (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => {
                        onChange(option.value);
                        closeSheet();
                      }}
                      className={cn(
                        "flex min-h-[52px] w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition",
                        isSelected
                          ? "border-brand-500 bg-brand-500/10"
                          : "border-transparent hover:border-slate-700 hover:bg-slate-800/60",
                      )}
                    >
                      <span className="flex-1">
                        <span
                          className={cn(
                            "block text-sm",
                            isSelected ? "font-medium text-white" : "text-slate-200",
                          )}
                        >
                          {option.label}
                        </span>
                        {option.description && (
                          <span className="mt-0.5 block text-xs text-slate-400">{option.description}</span>
                        )}
                      </span>

                      {isSelected && <Check className="h-4 w-4 shrink-0 text-brand-400" />}
                    </button>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
