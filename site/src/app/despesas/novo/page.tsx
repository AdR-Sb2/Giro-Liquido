"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type VehicleOption = {
  id: string;
  name: string;
};

const categories = [
  "fuel",
  "food",
  "maintenance",
  "oil_change",
  "tires",
  "insurance",
  "vehicle_rental",
  "vehicle_financing",
  "parking",
  "toll",
  "platform_fee",
  "mobile_internet",
  "equipment",
  "taxes",
  "other",
];

function CreateExpenseForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [vehicles, setVehicles] = useState<VehicleOption[]>([]);
  const [form, setForm] = useState({
    amount: "",
    description: "",
    category: "fuel",
    date: new Date().toISOString().slice(0, 10),
    vehicleId: "",
    recurring: false,
  });

  useEffect(() => {
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
      const message = error instanceof Error ? error.message : "Não foi possível salvar a despesa.";
      setMessage(message);
    } finally {
      setLoading(false);
    }
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
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 md:col-span-1">
          <span className="text-sm text-slate-300">Valor</span>
          <input
            type="number"
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
      <CreateExpenseForm />
    </AppShell>
  );
}
