"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  QUICK_EARNING_VALUES_KEY,
  getDefaultEarningValues,
  getStoredQuickValues,
} from "@/lib/quick-values";

type PlatformOption = {
  id: string;
  name: string;
};

function CreateEarningForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isQuickEarning = searchParams.get("quick") === "earnings";
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [platforms, setPlatforms] = useState<PlatformOption[]>([]);
  const [quickValues, setQuickValues] = useState<number[]>(getDefaultEarningValues());
  const [showCustomValue, setShowCustomValue] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [form, setForm] = useState({
    amount: "",
    tips: "",
    bonus: "",
    description: "",
    date: new Date().toISOString().slice(0, 10),
    platformId: "",
  });

  useEffect(() => {
    setQuickValues(getStoredQuickValues(QUICK_EARNING_VALUES_KEY, getDefaultEarningValues()));

    async function loadPlatforms() {
      const supabaseBrowser = getSupabaseBrowserClient();
      const { data: userData } = await supabaseBrowser.auth.getUser();
      if (!userData.user) {
        router.push("/entrar");
        return;
      }

      const { data } = await supabaseBrowser
        .from("platforms")
        .select("id, name")
        .eq("is_active", true)
        .order("name", { ascending: true });

      const nextPlatforms = (data ?? []) as PlatformOption[];
      setPlatforms(nextPlatforms);
      setForm((current) => ({ ...current, platformId: nextPlatforms[0]?.id ?? "" }));
    }

    void loadPlatforms();
  }, [router]);

  async function saveEarning(amount: number, description = "Ganho rápido") {
    setLoading(true);
    setMessage(null);

    try {
      const supabaseBrowser = getSupabaseBrowserClient();
      const { data: userData } = await supabaseBrowser.auth.getUser();
      const user = userData.user;

      if (!user) {
        setMessage("Você precisa estar autenticado para registrar um ganho.");
        router.push("/entrar");
        return;
      }

      const { error } = await supabaseBrowser.from("earnings").insert([
        {
          user_id: user.id,
          platform_id: form.platformId || null,
          amount: Number(amount || 0),
          tips_amount: 0,
          bonus_amount: 0,
          earned_at: new Date(`${form.date}T12:00:00`).toISOString(),
          earning_date: form.date,
          description: description || "Ganho rápido",
          source: "manual",
        },
      ]);

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(`Ganho de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount)} registrado.`);
      setTimeout(() => router.push("/ganhos"), 700);
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Não foi possível salvar o ganho.";
      setMessage(nextMessage);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const supabaseBrowser = getSupabaseBrowserClient();
      const { data: userData } = await supabaseBrowser.auth.getUser();
      const user = userData.user;

      if (!user) {
        setMessage("Você precisa estar autenticado para registrar um ganho.");
        router.push("/entrar");
        return;
      }

      const { error } = await supabaseBrowser.from("earnings").insert([
        {
          user_id: user.id,
          platform_id: form.platformId || null,
          amount: Number(form.amount || 0),
          tips_amount: Number(form.tips || 0),
          bonus_amount: Number(form.bonus || 0),
          earned_at: new Date(`${form.date}T12:00:00`).toISOString(),
          earning_date: form.date,
          description: form.description || null,
          source: "manual",
        },
      ]);

      if (error) {
        setMessage(error.message);
        return;
      }

      router.push("/ganhos");
      router.refresh();
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Não foi possível salvar o ganho.";
      setMessage(nextMessage);
    } finally {
      setLoading(false);
    }
  }

  if (isQuickEarning) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-200">Ganho rápido</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Qual foi o valor do ganho?</h2>
          </div>
          <Button asChild variant="secondary">
            <Link href="/ganhos">Voltar</Link>
          </Button>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {quickValues.map((value) => (
            <Button
              key={value}
              type="button"
              variant="secondary"
              className="h-14 text-base"
              onClick={() => {
                setShowCustomValue(false);
                void saveEarning(value);
              }}
              disabled={loading}
            >
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value)}
            </Button>
          ))}
          <Button
            type="button"
            variant="ghost"
            className="h-14 text-base"
            onClick={() => {
              setShowCustomValue((current) => !current);
              if (!showCustomValue) {
                setCustomValue("");
              }
            }}
          >
            Outro valor
          </Button>
        </div>

        {showCustomValue ? (
          <div className="mt-5 space-y-3">
            <label className="space-y-2">
              <span className="text-sm text-slate-300">Outro valor</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={customValue}
                onChange={(event) => setCustomValue(event.target.value)}
                placeholder="Ex.: 75"
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-brand-400"
              />
            </label>
            <Button
              type="button"
              className="w-full"
              onClick={() => {
                const amount = Number(customValue);
                if (Number.isFinite(amount) && amount > 0) {
                  setShowCustomValue(false);
                  void saveEarning(amount);
                }
              }}
              disabled={loading || !customValue || Number(customValue) <= 0}
            >
              Registrar ganho
            </Button>
          </div>
        ) : null}

        {message && <p className="mt-4 text-sm text-brand-300">{message}</p>}
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Registrar ganho</h2>
        <Button asChild variant="secondary">
          <Link href="/ganhos">Voltar</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 md:col-span-1">
          <span className="text-sm text-slate-300">Data</span>
          <input
            type="date"
            value={form.date}
            onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none ring-0 transition focus:border-brand-400"
            required
          />
        </label>

        <label className="space-y-2 md:col-span-1">
          <span className="text-sm text-slate-300">Plataforma</span>
          <select
            value={form.platformId}
            onChange={(event) => setForm((current) => ({ ...current, platformId: event.target.value }))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-brand-400"
          >
            {platforms.map((platform) => (
              <option key={platform.id} value={platform.id}>
                {platform.name}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 md:col-span-1">
          <span className="text-sm text-slate-300">Valor base</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={form.amount}
            onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-brand-400"
            placeholder="0,00"
            required
          />
        </label>

        <label className="space-y-2 md:col-span-1">
          <span className="text-sm text-slate-300">Gorjeta</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={form.tips}
            onChange={(event) => setForm((current) => ({ ...current, tips: event.target.value }))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-brand-400"
            placeholder="0,00"
          />
        </label>

        <label className="space-y-2 md:col-span-1">
          <span className="text-sm text-slate-300">Bônus</span>
          <input
            type="number"
            inputMode="decimal"
            min="0"
            step="0.01"
            value={form.bonus}
            onChange={(event) => setForm((current) => ({ ...current, bonus: event.target.value }))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-brand-400"
            placeholder="0,00"
          />
        </label>

        <div className="md:col-span-1">
          <div className="rounded-2xl border border-brand-500/30 bg-brand-500/5 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-brand-200">Total</p>
            <p className="mt-2 text-2xl font-semibold text-white">
              {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
                Number(form.amount || 0) + Number(form.tips || 0) + Number(form.bonus || 0),
              )}
            </p>
          </div>
        </div>

        <div className="md:col-span-2">
          <label className="space-y-2">
            <span className="text-sm text-slate-300">Descrição</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-brand-400"
              placeholder="Opcional — ex.: entrega de almoço, corrida de ida e volta..."
            />
          </label>
        </div>

        {message && <p className="md:col-span-2 text-sm text-red-300">{message}</p>}

        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar ganho"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewEarningPage() {
  return (
    <AppShell title="Novo ganho">
      <Suspense fallback={<div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-slate-300">Carregando...</div>}>
        <CreateEarningForm />
      </Suspense>
    </AppShell>
  );
}
