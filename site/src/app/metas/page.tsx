"use client";

import { useEffect, useState } from "react";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

type GoalRecord = {
  id: string;
  name: string;
  goal_type: "revenue" | "profit" | "savings";
  goal_period: "daily" | "weekly" | "monthly" | "yearly";
  target_amount: number;
  start_date: string;
  end_date?: string | null;
  is_active: boolean;
  created_at: string;
};

type SummarySnapshot = {
  total_revenue: number;
  total_profit: number;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

const emptyDraft = {
  name: "",
  goal_type: "profit" as GoalRecord["goal_type"],
  goal_period: "monthly" as GoalRecord["goal_period"],
  target_amount: "",
  start_date: new Date().toISOString().slice(0, 10),
  end_date: "",
};

export default function MetasPage() {
  const [goals, setGoals] = useState<GoalRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [draft, setDraft] = useState(emptyDraft);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummarySnapshot>({ total_revenue: 0, total_profit: 0 });
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    void loadGoals();
  }, []);

  async function loadGoals() {
    setLoading(true);
    const supabase = getSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setLoading(false);
      return;
    }

    const today = new Date();
    const endDate = today.toISOString().slice(0, 10);
    const [summaryResult, goalsResult] = await Promise.all([
      supabase.rpc("get_financial_summary", {
        p_start_date: "2000-01-01",
        p_end_date: endDate,
      }),
      supabase.from("goals").select("*").eq("user_id", userData.user.id).order("created_at", { ascending: false }),
    ]);

    const snapshot = ((summaryResult as { data?: Array<SummarySnapshot> } | null)?.data ?? [])[0] ?? { total_revenue: 0, total_profit: 0 };
    setSummary(snapshot);
    setGoals((goalsResult?.data ?? []) as GoalRecord[]);
    setLoading(false);
  }

  function openCreateForm() {
    setEditingId(null);
    setDraft(emptyDraft);
    setMessage(null);
    setShowForm(true);
  }

  function openEditForm(goal: GoalRecord) {
    setEditingId(goal.id);
    setDraft({
      name: goal.name,
      goal_type: goal.goal_type,
      goal_period: goal.goal_period,
      target_amount: String(goal.target_amount),
      start_date: goal.start_date,
      end_date: goal.end_date ?? "",
    });
    setMessage(null);
    setShowForm(true);
  }

  async function saveGoal(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    const { data: userData } = await supabase.auth.getUser();

    if (!userData.user) {
      setMessage("Você precisa entrar para salvar uma meta.");
      return;
    }

    const target = Number(draft.target_amount);
    if (!draft.name.trim() || !Number.isFinite(target) || target <= 0 || !draft.start_date) {
      setMessage("Preencha nome, valor e período corretamente.");
      return;
    }

    const payload = {
      user_id: userData.user.id,
      name: draft.name.trim(),
      goal_type: draft.goal_type,
      goal_period: draft.goal_period,
      target_amount: target,
      start_date: draft.start_date,
      end_date: draft.end_date || null,
      is_active: true,
    };

    if (editingId) {
      const { error } = await supabase.from("goals").update(payload).eq("id", editingId).eq("user_id", userData.user.id);
      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage("Meta atualizada.");
    } else {
      const { error } = await supabase.from("goals").insert(payload);
      if (error) {
        setMessage(error.message);
        return;
      }
      setMessage("Meta criada com sucesso.");
    }

    setShowForm(false);
    setDraft(emptyDraft);
    setEditingId(null);
    await loadGoals();
  }

  async function deleteGoal(goalId: string) {
    const confirmed = window.confirm("Excluir esta meta?");
    if (!confirmed) {
      return;
    }

    const supabase = getSupabaseBrowserClient();
    const { error } = await supabase.from("goals").delete().eq("id", goalId);
    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Meta excluída.");
    await loadGoals();
  }

  const mappedGoals = goals.map((goal) => {
    const target = Number(goal.target_amount ?? 0);
    const currentValue = goal.goal_type === "profit" ? Number(summary.total_profit ?? 0) : goal.goal_type === "revenue" ? Number(summary.total_revenue ?? 0) : Number(summary.total_profit ?? 0);
    const achieved = target > 0 ? Math.min(100, (currentValue / target) * 100) : 0;
    const remaining = Math.max(0, target - currentValue);
    const endDate = goal.end_date ? new Date(goal.end_date) : null;
    const daysRemaining = endDate ? Math.max(0, Math.ceil((endDate.getTime() - Date.now()) / 86400000)) : 0;

    return {
      ...goal,
      currentValue,
      achieved,
      remaining,
      daysRemaining,
    };
  });

  return (
    <AppShell title="Metas">
      <div className="flex justify-end">
        <Button type="button" onClick={openCreateForm}>+ Criar meta</Button>
      </div>

      {showForm ? (
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between gap-3">
            <h3 className="text-xl font-semibold text-white">{editingId ? "Editar meta" : "Nova meta"}</h3>
            <button type="button" onClick={() => setShowForm(false)} className="text-sm text-slate-400 hover:text-white">Cancelar</button>
          </div>

          <form onSubmit={saveGoal} className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2 md:col-span-2">
              <span className="text-sm text-slate-300">Nome da meta</span>
              <input
                value={draft.name}
                onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-brand-400"
                placeholder="Ex.: Faturar R$ 5.000 no mês"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-300">Tipo</span>
              <select
                value={draft.goal_type}
                onChange={(event) => setDraft((current) => ({ ...current, goal_type: event.target.value as GoalRecord["goal_type"] }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-brand-400"
              >
                <option value="revenue">Faturamento</option>
                <option value="profit">Lucro</option>
                <option value="savings">Economia</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-300">Período</span>
              <select
                value={draft.goal_period}
                onChange={(event) => setDraft((current) => ({ ...current, goal_period: event.target.value as GoalRecord["goal_period"] }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-brand-400"
              >
                <option value="daily">Diário</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
                <option value="yearly">Anual</option>
              </select>
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-300">Valor desejado</span>
              <input
                type="number"
                min="1"
                step="0.01"
                value={draft.target_amount}
                onChange={(event) => setDraft((current) => ({ ...current, target_amount: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-brand-400"
                placeholder="1500"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-300">Data inicial</span>
              <input
                type="date"
                value={draft.start_date}
                onChange={(event) => setDraft((current) => ({ ...current, start_date: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-brand-400"
                required
              />
            </label>

            <label className="space-y-2">
              <span className="text-sm text-slate-300">Data final</span>
              <input
                type="date"
                value={draft.end_date}
                onChange={(event) => setDraft((current) => ({ ...current, end_date: event.target.value }))}
                className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white outline-none focus:border-brand-400"
              />
            </label>

            {message ? <p className="md:col-span-2 text-sm text-brand-300">{message}</p> : null}

            <div className="md:col-span-2 flex justify-end gap-3">
              <Button type="button" variant="secondary" onClick={() => setShowForm(false)}>Cancelar</Button>
              <Button type="submit">{editingId ? "Salvar meta" : "Criar meta"}</Button>
            </div>
          </form>
        </Card>
      ) : null}

      {loading ? (
        <Card className="p-6 text-center text-slate-300">Carregando metas...</Card>
      ) : mappedGoals.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-xl font-semibold text-white">Ainda não há uma meta.</p>
          <p className="mt-2 text-sm text-slate-400">Defina uma meta e acompanhe seu progresso em poucos segundos.</p>
          <div className="mt-5 flex justify-center">
            <Button type="button" onClick={openCreateForm}>+ Criar meta</Button>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {mappedGoals.map((goal) => (
            <Card key={goal.id} className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-[0.2em] text-brand-300">Meta</p>
                  <h3 className="mt-2 text-lg font-semibold text-white">{goal.name}</h3>
                </div>
                <span className="rounded-full bg-brand-500/10 px-2.5 py-1 text-xs font-medium text-brand-300">{goal.achieved.toFixed(0)}%</span>
              </div>

              <div className="mt-4 space-y-3">
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Meta</span>
                  <strong className="text-white">{formatCurrency(goal.target_amount)}</strong>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Atual</span>
                  <strong className="text-brand-300">{formatCurrency(goal.currentValue)}</strong>
                </div>
                <div className="flex items-center justify-between text-sm text-slate-300">
                  <span>Falta</span>
                  <strong className="text-red-300">{formatCurrency(goal.remaining)}</strong>
                </div>
              </div>

              <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full rounded-full bg-brand-500" style={{ width: `${Math.min(100, goal.achieved)}%` }} />
              </div>

              <div className="mt-4 grid gap-2 text-sm text-slate-300 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
                  <p className="text-slate-400">Prazo</p>
                  <p className="mt-1 font-medium text-white">{goal.daysRemaining > 0 ? `${goal.daysRemaining} dias` : "Prazo encerrado"}</p>
                </div>
                <div className="rounded-xl border border-slate-800 bg-slate-900/70 px-3 py-2">
                  <p className="text-slate-400">Status</p>
                  <p className="mt-1 font-medium text-white">{goal.achieved >= 100 ? "Concluída" : goal.achieved >= 80 ? "Quase lá" : "Em andamento"}</p>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-3">
                <Button type="button" variant="secondary" onClick={() => openEditForm(goal)}>Editar</Button>
                <Button type="button" variant="destructive" onClick={() => void deleteGoal(goal.id)}>Excluir</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
