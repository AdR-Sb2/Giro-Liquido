"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { supabaseBrowser } from "@/lib/supabase/client";

const vehicleTypes = ["motorcycle", "car", "bicycle", "walking", "other"];

function CreateVehicleForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    vehicleType: "motorcycle",
    make: "",
    model: "",
    licensePlate: "",
    isDefault: false,
    isActive: true,
  });

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const { data: userData } = await supabaseBrowser.auth.getUser();
      const user = userData.user;

      if (!user) {
        setMessage("Você precisa estar autenticado para cadastrar um veículo.");
        router.push("/entrar");
        return;
      }

      const { error } = await supabaseBrowser.from("vehicles").insert([
        {
          user_id: user.id,
          name: form.name,
          vehicle_type: form.vehicleType,
          make: form.make || null,
          model: form.model || null,
          license_plate: form.licensePlate || null,
          is_default: form.isDefault,
          is_active: form.isActive,
        },
      ]);

      if (error) {
        setMessage(error.message);
        return;
      }

      router.push("/veiculos");
      router.refresh();
    } catch (error) {
      const message = error instanceof Error ? error.message : "Não foi possível salvar o veículo.";
      setMessage(message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-6">
      <div className="mb-6 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-white">Cadastrar veículo</h2>
        <Button asChild variant="secondary">
          <Link href="/veiculos">Voltar</Link>
        </Button>
      </div>

      <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2 md:col-span-1">
          <span className="text-sm text-slate-300">Nome</span>
          <input
            type="text"
            value={form.name}
            onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-brand-400"
            placeholder="Moto principal"
            required
          />
        </label>

        <label className="space-y-2 md:col-span-1">
          <span className="text-sm text-slate-300">Tipo</span>
          <select
            value={form.vehicleType}
            onChange={(event) => setForm((current) => ({ ...current, vehicleType: event.target.value }))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-brand-400"
          >
            {vehicleTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </label>

        <label className="space-y-2 md:col-span-1">
          <span className="text-sm text-slate-300">Marca</span>
          <input
            type="text"
            value={form.make}
            onChange={(event) => setForm((current) => ({ ...current, make: event.target.value }))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-brand-400"
            placeholder="Honda"
          />
        </label>

        <label className="space-y-2 md:col-span-1">
          <span className="text-sm text-slate-300">Modelo</span>
          <input
            type="text"
            value={form.model}
            onChange={(event) => setForm((current) => ({ ...current, model: event.target.value }))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-brand-400"
            placeholder="CG 160"
          />
        </label>

        <label className="space-y-2 md:col-span-1">
          <span className="text-sm text-slate-300">Placa</span>
          <input
            type="text"
            value={form.licensePlate}
            onChange={(event) => setForm((current) => ({ ...current, licensePlate: event.target.value }))}
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none transition focus:border-brand-400"
            placeholder="ABC1D23"
          />
        </label>

        <div className="md:col-span-2 flex flex-wrap gap-4">
          <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.isDefault}
              onChange={(event) => setForm((current) => ({ ...current, isDefault: event.target.checked }))}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-brand-500"
            />
            Veículo padrão
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
              className="h-4 w-4 rounded border-slate-600 bg-slate-900 text-brand-500"
            />
            Ativo
          </label>
        </div>

        {message && <p className="md:col-span-2 text-sm text-red-300">{message}</p>}

        <div className="md:col-span-2 flex justify-end">
          <Button type="submit" disabled={loading}>
            {loading ? "Salvando..." : "Salvar veículo"}
          </Button>
        </div>
      </form>
    </div>
  );
}

export default function NewVehiclePage() {
  return (
    <AppShell title="Novo veículo">
      <CreateVehicleForm />
    </AppShell>
  );
}
