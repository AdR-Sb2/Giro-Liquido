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
  profit_per_hour: number | null;
  profit_per_km: number | null;
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
  profit_per_hour: null,
  profit_per_km: null,
};

export function formatCurrency(value: number | null | undefined) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value ?? 0));
}

export function formatMinutes(value: number | null | undefined) {
  const minutes = Number(value ?? 0);
  if (!Number.isFinite(minutes) || minutes <= 0) {
    return "0h 00min";
  }

  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return `${hours}h ${String(rest).padStart(2, "0")}min`;
}

export function formatDistance(value: number | null | undefined) {
  const distance = Number(value ?? 0);
  if (!Number.isFinite(distance) || distance <= 0) {
    return "0 km";
  }

  return `${distance.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} km`;
}

export function getPercentChange(current: number, previous: number) {
  if (!Number.isFinite(current) || !Number.isFinite(previous) || Math.abs(previous) < 0.01) {
    return null;
  }

  return ((current - previous) / previous) * 100;
}

function toDateString(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function getPeriodRange(period: string | undefined) {
  const today = new Date();
  const end = new Date(today);
  end.setHours(23, 59, 59, 999);

  const normalizedPeriod = period === "week" || period === "month" ? period : "today";

  if (normalizedPeriod === "week") {
    const start = new Date(today);
    start.setDate(today.getDate() - 6);
    start.setHours(0, 0, 0, 0);

    const previousEnd = new Date(start);
    previousEnd.setDate(previousEnd.getDate() - 1);
    previousEnd.setHours(23, 59, 59, 999);

    const previousStart = new Date(previousEnd);
    previousStart.setDate(previousStart.getDate() - 6);
    previousStart.setHours(0, 0, 0, 0);

    return {
      startDate: toDateString(start),
      endDate: toDateString(end),
      previousStartDate: toDateString(previousStart),
      previousEndDate: toDateString(previousEnd),
    };
  }

  if (normalizedPeriod === "month") {
    const start = new Date(today.getFullYear(), today.getMonth(), 1);
    const previousEnd = new Date(today.getFullYear(), today.getMonth(), 0);
    const previousStart = new Date(previousEnd.getFullYear(), previousEnd.getMonth(), 1);

    return {
      startDate: toDateString(start),
      endDate: toDateString(end),
      previousStartDate: toDateString(previousStart),
      previousEndDate: toDateString(previousEnd),
    };
  }

  const start = new Date(today);
  start.setHours(0, 0, 0, 0);

  const previousEnd = new Date(start);
  previousEnd.setDate(previousEnd.getDate() - 1);
  previousEnd.setHours(23, 59, 59, 999);

  const previousStart = new Date(previousEnd);
  previousStart.setHours(0, 0, 0, 0);
  previousStart.setDate(previousStart.getDate() - 0);

  return {
    startDate: toDateString(start),
    endDate: toDateString(end),
    previousStartDate: toDateString(previousStart),
    previousEndDate: toDateString(previousEnd),
  };
}

export async function getDashboardData(period: string | undefined = "today") {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const range = getPeriodRange(period);

  const [{ data: summaryData }, { data: previousSummaryData }, { data: activeSessionData }, { data: profileData }, { data: vehiclesData }, { data: earningsData }, { data: expensesData }, { data: goalsData }] =
    await Promise.all([
      supabase.rpc("get_financial_summary", {
        p_start_date: range.startDate,
        p_end_date: range.endDate,
      }),
      supabase.rpc("get_financial_summary", {
        p_start_date: range.previousStartDate,
        p_end_date: range.previousEndDate,
      }),
      supabase
        .from("work_sessions")
        .select("id, status, started_at, ended_at, duration_minutes, distance_km, notes")
        .eq("user_id", user.id)
        .is("ended_at", null)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("profiles").select("full_name,onboarding_completed").eq("id", user.id).maybeSingle(),
      supabase.from("vehicles").select("*").eq("user_id", user.id).order("is_default", { ascending: false }).order("created_at", { ascending: false }).limit(10),
      supabase.from("earnings").select("id, amount, earned_at, earning_date, description, platforms(name)").eq("user_id", user.id).gte("earning_date", range.startDate).lte("earning_date", range.endDate).order("earned_at", { ascending: false }).limit(5),
      supabase.from("expenses").select("id, amount, expense_at, expense_date, category, description").eq("user_id", user.id).gte("expense_date", range.startDate).lte("expense_date", range.endDate).order("expense_at", { ascending: false }).limit(5),
      supabase.from("goals").select("*").eq("user_id", user.id).eq("is_active", true).order("created_at", { ascending: false }).limit(3),
    ]);

  const summary = (summaryData as DashboardSummary[] | null)?.[0] ?? defaultSummary;
  const comparisonSummary = (previousSummaryData as DashboardSummary[] | null)?.[0] ?? defaultSummary;

  return {
    user,
    profile: profileData,
    vehicles: vehiclesData ?? [],
    earnings: earningsData ?? [],
    expenses: expensesData ?? [],
    goals: goalsData ?? [],
    summary,
    comparisonSummary,
    activeSession: activeSessionData,
    period: range,
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

export async function getMaintenanceRecords(limit = 10) {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data } = await supabase
    .from("maintenance_records")
    .select("id, amount, maintenance_date, category, description, vehicles(name)")
    .eq("user_id", user.id)
    .order("maintenance_date", { ascending: false })
    .limit(limit);

  return data ?? [];
}

export async function getPlatforms() {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data } = await supabase
    .from("platforms")
    .select("id, name")
    .eq("is_active", true)
    .order("name", { ascending: true });

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

export async function getWorkSessions(limit = 10, period: string | undefined = "today") {
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const range = getPeriodRange(period);

  const { data } = await supabase
    .from("work_sessions")
    .select("id, status, started_at, ended_at, work_date, duration_minutes, distance_km, notes")
    .eq("user_id", user.id)
    .gte("work_date", range.startDate)
    .lte("work_date", range.endDate)
    .order("started_at", { ascending: false })
    .limit(limit);

  return data ?? [];
}
