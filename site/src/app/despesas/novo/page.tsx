"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  QUICK_FUEL_VALUES_KEY,
  getDefaultFuelValues,
  getStoredQuickValues,
} from "@/lib/quick-values";

type VehicleOption = {
  id: string;
  name: string;
};

const categories = [
  { value: "fuel", label: "Combustível" },
  { value: "maintenance", label: "Manutenção" },
  { value: "tires", label: "Pneus" },
  { value: "oil_change", label: "Óleo" },
  { value: "toll", label: "Pedágio" },
  { value: "parking", label: "Estacionamento" },
  { value: "food", label: "Alimentação" },
  { value: "mobile_internet", label: "Celular/Internet" },
  { value: "taxes", label: "Documentação" },
  { value: "equipment", label: "Peças" },
  { value: "cleaning", label: "Lavagem" },
  { value: "other", label: "Outros" },
];

function CreateExpenseForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isQuickFuel = searchParams.get("quick") === "fuel";
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [quickValues, setQuickValues] = useState<number[]>(getDefaultFuelValues());
  const [showCustomValue, setShowCustomValue] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [form, setForm] = useState({
    amount: "",
    description: "",
    category: "fuel",
    date: new Date().toISOString().slice(0, 10),
    vehicleId: "",
    recurring: false,
  });

  useEffect(() => {
    setQuickValues(getStoredQuickValues(QUICK_FUEL_VALUES_KEY, getDefaultFuelValues()));

    async function loadVehicles() {
      const supabaseBrowser = getSupabaseBrowserClient();
      const { data: userData } = await supabaseBrowser.auth.getUser();
      if (!userData.user) {
        router.push("/entrar");
        return;
      }

      const { data } = await supabaseBrowser
        .from("vehicles")
        .select("id, name")
        .eq("user_id", userData.user.id)
        .order("created_at", { ascending: false });

      const nextVehicles = (data ?? []) as VehicleOption[];
      setVehicles(nextVehicles);
      setForm((current) => ({ ...current, vehicleId: nextVehicles[0]?.id ?? "" }));
    }

    void loadVehicles();
  }, [router]);

  async function saveExpense(amount: number, description = "Abastecimento") {
    setLoading(true);
    setMessage(null);

    try {
      const supabaseBrowser = getSupabaseBrowserClient();
      const { data: userData } = await supabaseBrowser.auth.getUser();
      const user = userData.user;

      if (!user) {
        setMessage("Você precisa estar autenticado para registrar um abastecimento.");
        router.push("/entrar");
        return;
      }

      const { error } = await supabaseBrowser.from("expenses").insert([
        {
          user_id: user.id,
          vehicle_id: form.vehicleId || null,
          category: "fuel",
          amount: Number(amount || 0),
          expense_at: new Date(`${form.date}T12:00:00`).toISOString(),
          expense_date: form.date,
          description: description || "Abastecimento",
          is_recurring: false,
          source: "manual",
        },
      ]);

      if (error) {
        setMessage(error.message);
        return;
      }

      setMessage(`Abastecimento de ${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(amount)} registrado.`);
      setTimeout(() => router.push("/despesas"), 700);
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Não foi possível registrar o abastecimento.";
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
        setMessage("Você precisa estar autenticado para lançar uma despesa.");
        router.push("/entrar");
        return;
      }

      const { error } = await supabaseBrowser.from("expenses").insert([
        {
          user_id: user.id,
          vehicle_id: form.vehicleId || null,
          category: form.category,
          amount: Number(form.amount || 0),
          expense_at: new Date(`${form.date}T12:00:00`).toISOString(),
          expense_date: form.date,
          description: form.description || null,
          is_recurring: form.recurring,
          source: "manual",
        },
      ]);

      if (error) {
        setMessage(error.message);
        return;
      }

      router.push("/despesas");
      router.refresh();
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Não foi possível salvar a despesa.";
      setMessage(nextMessage);
    } finally {
      setLoading(false);
    }
  }

  if (isQuickFuel) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
        <div className="mb-5 flex items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-brand-200">Abastecimento</p>
            <h2 className="mt-2 text-2xl font-semibold text-white">Quanto você abasteceu?</h2>
          </div>
          <Button asChild variant="secondary">
            <Link href="/despesas">Voltar</Link>
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
                void saveExpense(value);
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
                  void saveExpense(amount);
                }
              }}
              disabled={loading || !customValue || Number(customValue) <= 0}
            >
              Registrar abastecimento
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
        <h2 className="text-xl font-semibold text-white">Lançar despesa</h2>
        <Button asChild variant="secondary">
          <Link href="/despesas">Voltar</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 md:col-span-1">
          <span className="text-sm text-slate-300">Data</span>
          <input
            type="date"
            value={form.date}
            onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-brand-400"
            required
          />
        </label>

        <label className="space-y-2 md:col-span-1">
          <span className="text-sm text-slate-300">Categoria</span>
          <select
            value={form.category}
            onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-brand-400"
          >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>
                {category.label}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 md:col-span-1">
          <span className="text-sm text-slate-300">Valor</span>
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
          <span className="text-sm text-slate-300">Veículo</span>
          <select
            value={form.vehicleId}
            onChange={(event) => setForm((current) => ({ ...current, vehicleId: event.target.value }))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-brand-400"
          >
            <option value="">Sem veículo</option>
            {vehicles.map((vehicle) => (
              <option key={vehicle.id} value={vehicle.id}>
                {vehicle.name}
              </option>
            ))}
          </select>
        </label>

        <label className="md:col-span-2 flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5">
          <input
            type="checkbox"
            checked={form.recurring}
            onChange={(event) => setForm((current) => ({ ...current, recurring: event.target.checked }))}
            className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-brand-500"
          />
          <span className="text-sm text-slate-300">Despesa recorrente</span>
        </label>

        {form.recurring ? (
          <label className="space-y-2 md:col-span-1">
            <span className="text-sm text-slate-300">Frequência</span>
            <select className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-brand-400">
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensal</option>
              <option value="yearly">Anual</option>
            </select>
          </label>
        ) : null}

        <div className="md:col-span-2">
          <label className="space-y-2">
            <span className="text-sm text-slate-300">Descrição</span>
            <textarea
              value={form.description}
              onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
              className="min-h-24 w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-brand-400"
              placeholder="Ex.: Reabastecimento, pedido de almoço, manutenção preventiva..."
            />
          </label>
        </div>

        {message && <p className="md:col-span-2 text-sm text-red-300">{message}</p>}

        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" variant="destructive" disabled={loading}>
            {loading ? "Salvando..." : "Salvar despesa"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewExpensePage() {
  return (
    <AppShell title="Nova despesa">
      <Suspense fallback={<div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6 text-slate-300">Carregando...</div>}>
        <CreateExpenseForm />
      </Suspense>
    </AppShell>
  );
}
