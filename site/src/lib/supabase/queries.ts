import { createServerSupabase } from "@/lib/supabase/server";

export type DashboardSummary = {
  total_revenue: number;
  total_base_earnings: number;
  total_tips: number;
  total_bonus: number;
  total_expenses: number;
  total_profit: number;
  total_worked_minutes: number;
  total_distance_km: number;
};

const defaultSummary: DashboardSummary = {
  total_revenue: 0,
  total_base_earnings: 0,
  total_tips: 0,
  total_bonus: 0,
  total_expenses: 0,
  total_profit: 0,
  total_worked_minutes: 0,
  total_distance_km: 0,
};

export function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

const monthStart = new Date();
monthStart.setDate(1);
monthStart.setHours(0, 0, 0, 0);

const monthEnd = new Date();
monthEnd.setMonth(monthEnd.getMonth() + 1, 0);
monthEnd.setHours(23, 59, 59, 999);

export async function getDashboardData() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const [{ data: summaryData }, { data: profileData }, { data: vehiclesData }, { data: earningsData }, { data: expensesData }, { data: goalsData }] =
    await Promise.all([
      supabase.rpc("get_financial_summary", {
        p_start_date: monthStart.toISOString().slice(0, 10),
        p_end_date: monthEnd.toISOString().slice(0, 10),
      }),
      supabase.from("profiles").select("full_name,onboarding_completed").eq("id", user.id).maybeSingle(),
      supabase.from("vehicles").select("*").eq("user_id", user.id).order("is_default", { ascending: false }).order("created_at", { ascending: false }).limit(10),
      supabase.from("earnings").select("id, amount, earned_at, earning_date, description, platforms(name)").eq("user_id", user.id).order("earned_at", { ascending: false }).limit(5),
      supabase.from("expenses").select("id, amount, expense_at, expense_date, category, description").eq("user_id", user.id).order("expense_at", { ascending: false }).limit(5),
      supabase.from("goals").select("*").eq("user_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(3),
    ]);

  const summary = (summaryData as DashboardSummary[] | null)?.[0] ?? defaultSummary;

  return {
    user,
    profile: profileData,
    vehicles: vehiclesData ?? [],
    earnings: earningsData ?? [],
    expenses: expensesData ?? [],
    goals: goalsData ?? [],
    summary,
  };
}

export async function getRecentEarnings() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data } = await supabase
    .from("earnings")
    .select("id, amount, earned_at, description, platforms(name)")
    .eq("user_id", user.id)
    .order("earned_at", { ascending: false })
    .limit(10);

  return data ?? [];
}

export async function getRecentExpenses() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data } = await supabase
    .from("expenses")
    .select("id, amount, expense_at, category, description")
    .eq("user_id", user.id)
    .order("expense_at", { ascending: false })
    .limit(10);

  return data ?? [];
}

export async function getVehicles() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data } = await supabase
    .from("vehicles")
    .select("*")
    .eq("user_id", user.id)
    .order("is_default", { ascending: false })
    .order("created_at", { ascending: false });

  return data ?? [];
}

export async function getGoals() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data } = await supabase
    .from("goals")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return data ?? [];
}
