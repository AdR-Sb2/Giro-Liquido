"use client";

import {
  ArrowLeft,
  Bike,
  BriefcaseBusiness,
  CarFront,
  Check,
  CircleDollarSign,
  Footprints,
  MapPin,
  Sparkles,
  Target,
  Truck,
  Wallet,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const STORAGE_KEY = "rotax_onboarding_v1";

type WorkType = "delivery" | "ride_hailing" | "logistics" | "private_client" | "other";
type VehicleType = "motorcycle" | "car" | "bicycle" | "walking" | "other";
type GoalType = "revenue" | "profit" | "later";
type GoalPeriod = "daily" | "weekly" | "monthly";

type PlatformOption = {
  id: string;
  name: string;
  slug: string;
  platform_type: string;
};

type OnboardingDraft = {
  fullName: string;
  city: string;
  state: string;
  workType: WorkType;
  vehicleType: VehicleType;
  vehicleName: string;
  vehicleBrand: string;
  vehicleModel: string;
  averageConsumption: string;
  fuelPrice: string;
  monthlyCost: string;
  isVehicleDefault: boolean;
  platforms: string[];
  goalType: GoalType;
  goalPeriod: GoalPeriod;
  goalTarget: string;
  goalName: string;
};

const defaultDraft: OnboardingDraft = {
  fullName: "",
  city: "",
  state: "",
  workType: "delivery",
  vehicleType: "other",
  vehicleName: "",
  vehicleBrand: "",
  vehicleModel: "",
  averageConsumption: "",
  fuelPrice: "",
  monthlyCost: "",
  isVehicleDefault: true,
  platforms: [],
  goalType: "later",
  goalPeriod: "monthly",
  goalTarget: "",
  goalName: "",
};

const workTypeOptions = [
  { id: "delivery", label: "Entregas", description: "iFood, Rappi e pedidos locais.", icon: Truck },
  { id: "ride_hailing", label: "Corridas por aplicativo", description: "Uber, 99 e viagens por app.", icon: CarFront },
  { id: "logistics", label: "Fretes e logística", description: "Coletas e transporte de carga.", icon: BriefcaseBusiness },
  { id: "private_client", label: "Particular", description: "Clientes diretos e serviços avulsos.", icon: Wallet },
  { id: "other", label: "Outro", description: "Ajuste conforme seu dia a dia.", icon: Sparkles },
] as const;

const vehicleOptions = [
  { id: "motorcycle", label: "Moto", icon: Bike },
  { id: "car", label: "Carro", icon: CarFront },
  { id: "bicycle", label: "Bicicleta", icon: Bike },
  { id: "walking", label: "Trabalho a pé", icon: Footprints },
  { id: "other", label: "Não quero cadastrar agora", icon: Sparkles },
] as const;

const steps = [
  { label: "Perfil" },
  { label: "Trabalho" },
  { label: "Veículo" },
  { label: "Plataformas" },
  { label: "Meta" },
  { label: "Concluir" },
];

function readStoredDraft(): OnboardingDraft {
  if (typeof window === "undefined") {
    return defaultDraft;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultDraft;
    }

    return { ...defaultDraft, ...JSON.parse(stored) };
  } catch {
    return defaultDraft;
  }
}

function formatCurrency(value: number | string | null | undefined) {
  const numeric = Number(value ?? 0);
  if (Number.isNaN(numeric)) {
    return "R$ 0,00";
  }
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(numeric);
}

export default function OnboardingPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<OnboardingDraft>(() => readStoredDraft());
  const [currentStep, setCurrentStep] = useState(0);
  const [platformOptions, setPlatformOptions] = useState<PlatformOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const persist = () => {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
    };

    persist();
  }, [draft]);

  useEffect(() => {
    const load = async () => {
      const supabase = getSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/entrar");
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, city, state, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      const nextDraft: Partial<OnboardingDraft> = {
        fullName: profile?.full_name ?? user.user_metadata?.full_name ?? draft.fullName,
        city: profile?.city ?? draft.city,
        state: profile?.state ?? draft.state,
      };

      setDraft((previous) => ({ ...previous, ...nextDraft }));

      const { data: platformsData } = await supabase
        .from("platforms")
        .select("id, slug, name, platform_type")
        .eq("is_active", true)
        .order("name", { ascending: true });

      setPlatformOptions(platformsData ?? []);

      if (profile?.onboarding_completed) {
        router.replace("/dashboard");
        return;
      }

      setLoading(false);
    };

    void load();
  }, [router]);

  const progressPercent = useMemo(() => ((currentStep + 1) / steps.length) * 100, [currentStep]);

  const currentVehicleLabel = useMemo(
    () => vehicleOptions.find((option) => option.id === draft.vehicleType)?.label ?? "Veículo",
    [draft.vehicleType],
  );

  function updateDraft(nextValues: Partial<OnboardingDraft>) {
    setDraft((previous) => ({ ...previous, ...nextValues }));
  }

  function goBack() {
    setCurrentStep((previous) => Math.max(0, previous - 1));
  }

  function goNext() {
    setCurrentStep((previous) => Math.min(previous + 1, steps.length - 1));
  }

  async function persistOnboarding(completed: boolean) {
    const supabase = getSupabaseBrowserClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      throw new Error("Sua sessão expirou. Faça login novamente.");
    }

    const profilePayload: Record<string, unknown> = {
      id: user.id,
      full_name: draft.fullName.trim() || user.user_metadata?.full_name || user.email?.split("@")[0] || "Motorista",
      city: draft.city.trim() || null,
      state: draft.state ? draft.state.trim().slice(0, 2).toUpperCase() : null,
      onboarding_completed: completed,
    };

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("accepted_terms_at")
      .eq("id", user.id)
      .maybeSingle();

    if (!existingProfile?.accepted_terms_at && completed) {
      profilePayload.accepted_terms_at = new Date().toISOString();
    }

    const { error: profileError } = await supabase.from("profiles").upsert(profilePayload as Record<string, unknown>, { onConflict: "id" });
    if (profileError) {
      throw new Error(profileError.message);
    }

    if (draft.vehicleType !== "other" && draft.vehicleType !== "walking") {
      const vehicleName = draft.vehicleName.trim() || currentVehicleLabel;
      const vehicleType = draft.vehicleType;

      const { data: existingVehicle } = await supabase
        .from("vehicles")
        .select("id, name")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const vehicleInsert = {
        user_id: user.id,
        name: vehicleName,
        vehicle_type: vehicleType,
        make: draft.vehicleBrand.trim() || null,
        model: draft.vehicleModel.trim() || null,
        average_consumption_km_per_liter: draft.averageConsumption ? Number(draft.averageConsumption) : null,
        estimated_fuel_price: draft.fuelPrice ? Number(draft.fuelPrice.replace(",", ".")) : null,
        fixed_monthly_cost: draft.monthlyCost ? Number(draft.monthlyCost.replace(",", ".")) : 0,
        is_default: draft.isVehicleDefault || !existingVehicle,
        is_active: true,
      };

      if (existingVehicle) {
        const { error: vehicleError } = await supabase
          .from("vehicles")
          .update({
            ...vehicleInsert,
            is_default: draft.isVehicleDefault || existingVehicle.id === existingVehicle.id,
          })
          .eq("id", existingVehicle.id)
          .eq("user_id", user.id);

        if (vehicleError) {
          throw new Error(vehicleError.message);
        }
      } else {
        const { error: vehicleError } = await supabase.from("vehicles").insert(vehicleInsert);
        if (vehicleError) {
          throw new Error(vehicleError.message);
        }
      }
    }

    if (draft.goalType !== "later" && Number(draft.goalTarget) > 0) {
      const target = Number(draft.goalTarget);
      const goalName = draft.goalName.trim() || (draft.goalType === "profit" ? "Meta de lucro" : "Meta de faturamento");
      const goalPayload = {
        user_id: user.id,
        name: goalName,
        goal_type: draft.goalType,
        goal_period: draft.goalPeriod,
        target_amount: target,
        start_date: new Date().toISOString().slice(0, 10),
        end_date: null,
        is_active: true,
      };

      const { data: existingGoals } = await supabase
        .from("goals")
        .select("id")
        .eq("user_id", user.id)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);

      if (existingGoals && existingGoals.length > 0) {
        const { error: goalError } = await supabase
          .from("goals")
          .update(goalPayload)
          .eq("id", existingGoals[0].id)
          .eq("user_id", user.id);

        if (goalError) {
          throw new Error(goalError.message);
        }
      } else {
        const { error: goalError } = await supabase.from("goals").insert(goalPayload);
        if (goalError) {
          throw new Error(goalError.message);
        }
      }
    }

    return true;
  }

  async function finishOnboarding() {
    setSaving(true);
    setErrorMessage(null);

    try {
      await persistOnboarding(true);
      window.localStorage.removeItem(STORAGE_KEY);
      router.push("/dashboard");
      router.refresh();
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível concluir o onboarding.");
    } finally {
      setSaving(false);
    }
  }

  async function saveProgressAndContinue(nextStep: number) {
    setSaving(true);
    setErrorMessage(null);

    try {
      await persistOnboarding(false);
      setCurrentStep(nextStep);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Não foi possível salvar o progresso.");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 text-white">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/80 px-6 py-5 text-sm text-slate-300">
          Preparando seu painel...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-md sm:max-w-2xl">
        <div className="space-y-5 py-2">
          <div className="flex items-center justify-between text-sm text-slate-300">
            <span>
              Etapa {currentStep + 1} de {steps.length}
            </span>
            <span>{Math.round(progressPercent)}%</span>
          </div>

          <div className="h-2 overflow-hidden rounded-full bg-slate-800">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {currentStep === 0 && (
            <Card className="border-slate-800 bg-slate-900/80 p-5 sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                <CircleDollarSign className="h-6 w-6" />
              </div>
              <h1 className="text-2xl font-semibold text-white">Vamos preparar seu painel.</h1>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Em poucos passos, o RotaX entende seu perfil, seu jeito de trabalhar e o que precisa acompanhar para te ajudar a lucrar de verdade.
              </p>

              <div className="mt-5 space-y-4">
                <label className="block space-y-2">
                  <span className="text-sm text-slate-300">Nome completo</span>
                  <input
                    value={draft.fullName}
                    onChange={(event) => updateDraft({ fullName: event.target.value })}
                    placeholder="Seu nome"
                    className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                  />
                </label>

                <div className="grid grid-cols-[1fr_110px] gap-3">
                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">Cidade</span>
                    <input
                      value={draft.city}
                      onChange={(event) => updateDraft({ city: event.target.value })}
                      placeholder="São Paulo"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                    />
                  </label>

                  <label className="space-y-2">
                    <span className="text-sm text-slate-300">Estado</span>
                    <input
                      value={draft.state}
                      onChange={(event) => updateDraft({ state: event.target.value.toUpperCase().slice(0, 2) })}
                      placeholder="SP"
                      className="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                    />
                  </label>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <Button type="button" className="flex-1" onClick={() => void saveProgressAndContinue(1)} disabled={saving}>
                  {saving ? "Salvando..." : "Continuar"}
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 1 && (
            <Card className="border-slate-800 bg-slate-900/80 p-5 sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                <Truck className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Como você trabalha?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Esta escolha ajuda a deixar o dashboard mais útil para o seu dia a dia.
              </p>

              <div className="mt-6 space-y-3">
                {workTypeOptions.map(({ id, label, description, icon: Icon }) => {
                  const selected = draft.workType === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => updateDraft({ workType: id })}
                      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                        selected ? "border-brand-500 bg-brand-500/10" : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                      }`}
                    >
                      <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-brand-300">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-base font-medium text-white">{label}</span>
                        <span className="mt-1 block text-sm text-slate-300">{description}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={goBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button type="button" className="flex-1" onClick={() => void saveProgressAndContinue(2)} disabled={saving}>
                  {saving ? "Salvando..." : "Continuar"}
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 2 && (
            <Card className="border-slate-800 bg-slate-900/80 p-5 sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                <MapPin className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Seu veículo principal</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Você pode registrar um veículo agora ou continuar sem isso e ajustar depois.
              </p>

              <div className="mt-6 grid grid-cols-2 gap-3">
                {vehicleOptions.map(({ id, label, icon: Icon }) => {
                  const selected = draft.vehicleType === id;
                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => updateDraft({ vehicleType: id })}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected ? "border-brand-500 bg-brand-500/10" : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                      }`}
                    >
                      <Icon className="mb-3 h-5 w-5 text-brand-300" />
                      <span className="block text-sm font-medium text-white">{label}</span>
                    </button>
                  );
                })}
              </div>

              {draft.vehicleType !== "other" && draft.vehicleType !== "walking" && (
                <div className="mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Nome do veículo</label>
                    <input
                      value={draft.vehicleName}
                      onChange={(event) => updateDraft({ vehicleName: event.target.value })}
                      placeholder={draft.vehicleType === "motorcycle" ? "CG 160" : "Corolla"}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Marca</label>
                      <input
                        value={draft.vehicleBrand}
                        onChange={(event) => updateDraft({ vehicleBrand: event.target.value })}
                        placeholder="Honda"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Modelo</label>
                      <input
                        value={draft.vehicleModel}
                        onChange={(event) => updateDraft({ vehicleModel: event.target.value })}
                        placeholder="CG 160"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Km/l</label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={draft.averageConsumption}
                        onChange={(event) => updateDraft({ averageConsumption: event.target.value })}
                        placeholder="35"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Combustível</label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={draft.fuelPrice}
                        onChange={(event) => updateDraft({ fuelPrice: event.target.value })}
                        placeholder="R$ 6,20"
                        className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                      />
                    </div>
                  </div>

                  <label className="flex items-center gap-3 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={draft.isVehicleDefault}
                      onChange={(event) => updateDraft({ isVehicleDefault: event.target.checked })}
                      className="h-4 w-4 rounded border-slate-600 bg-slate-900"
                    />
                    Definir como veículo principal
                  </label>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={goBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button type="button" className="flex-1" onClick={() => void saveProgressAndContinue(3)} disabled={saving}>
                  {saving ? "Salvando..." : "Continuar"}
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 3 && (
            <Card className="border-slate-800 bg-slate-900/80 p-5 sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                <Wallet className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Onde você ganha?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Selecione as fontes principais do seu faturamento para organizar o painel.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {platformOptions.map((platform) => {
                  const selected = draft.platforms.includes(platform.slug);
                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => {
                        const nextPlatforms = selected
                          ? draft.platforms.filter((value) => value !== platform.slug)
                          : [...draft.platforms, platform.slug];
                        updateDraft({ platforms: nextPlatforms });
                      }}
                      className={`rounded-2xl border p-3 text-left transition ${
                        selected ? "border-brand-500 bg-brand-500/10" : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                      }`}
                    >
                      <span className="block text-sm font-medium text-white">{platform.name}</span>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={goBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button type="button" className="flex-1" onClick={() => void saveProgressAndContinue(4)} disabled={saving}>
                  {saving ? "Salvando..." : "Continuar"}
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="border-slate-800 bg-slate-900/80 p-5 sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Defina sua primeira meta</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Você pode marcar um alvo de faturamento ou lucro para manter o foco no dia a dia.
              </p>

              <div className="mt-6 grid gap-3">
                {[
                  { id: "profit", label: "Lucro", note: "Acompanhar o que sobra ao final do dia." },
                  { id: "revenue", label: "Faturamento", note: "Seguir o valor bruto que entrou." },
                  { id: "later", label: "Criar depois", note: "Não quero definir agora." },
                ].map((item) => {
                  const selected = draft.goalType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateDraft({ goalType: item.id as GoalType })}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected ? "border-brand-500 bg-brand-500/10" : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                      }`}
                    >
                      <span className="block text-base font-medium text-white">{item.label}</span>
                      <span className="mt-1 block text-sm text-slate-300">{item.note}</span>
                    </button>
                  );
                })}
              </div>

              {draft.goalType !== "later" && (
                <div className="mt-5 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Período</label>
                    <select
                      value={draft.goalPeriod}
                      onChange={(event) => updateDraft({ goalPeriod: event.target.value as GoalPeriod })}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white focus:border-brand-500"
                    >
                      <option value="daily">Diário</option>
                      <option value="weekly">Semanal</option>
                      <option value="monthly">Mensal</option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Valor da meta</label>
                    <input
                      type="number"
                      min="1"
                      step="0.01"
                      value={draft.goalTarget}
                      onChange={(event) => updateDraft({ goalTarget: event.target.value })}
                      placeholder="R$ 800,00"
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Nome da meta</label>
                    <input
                      value={draft.goalName}
                      onChange={(event) => updateDraft({ goalName: event.target.value })}
                      placeholder={draft.goalType === "profit" ? "Meta de lucro" : "Meta de faturamento"}
                      className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-white placeholder:text-slate-500 focus:border-brand-500"
                    />
                  </div>
                </div>
              )}

              <div className="mt-6 flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={goBack}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </Button>
                <Button type="button" className="flex-1" onClick={() => void saveProgressAndContinue(5)} disabled={saving}>
                  {saving ? "Salvando..." : "Continuar"}
                </Button>
              </div>
            </Card>
          )}

          {currentStep === 5 && (
            <Card className="border-slate-800 bg-slate-900/80 p-5 sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                <Check className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Seu painel está pronto.</h2>

              <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-300">
                <p className="font-medium text-white">Resumo da configuração</p>
                <ul className="mt-3 space-y-2">
                  <li>• Trabalho: {workTypeOptions.find((item) => item.id === draft.workType)?.label ?? "Não informado"}</li>
                  <li>• Veículo: {draft.vehicleType === "other" ? "Não cadastrado agora" : currentVehicleLabel}</li>
                  <li>• Meta: {draft.goalType === "later" ? "Definir depois" : `${draft.goalName || (draft.goalType === "profit" ? "Meta de lucro" : "Meta de faturamento")}: ${formatCurrency(draft.goalTarget || 0)}`}</li>
                  <li>• Plataformas: {draft.platforms.length > 0 ? draft.platforms.length : "Nenhuma selecionada"}</li>
                </ul>
              </div>

              {errorMessage && <p className="mt-4 text-sm text-red-300">{errorMessage}</p>}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button type="button" size="lg" className="flex-1" onClick={() => void finishOnboarding()} disabled={saving}>
                  {saving ? "Finalizando..." : "Ir para o painel"}
                </Button>
                <Button type="button" variant="secondary" size="lg" className="flex-1" onClick={() => router.push("/dashboard")}>
                  Explorar sem salvar
                </Button>
              </div>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
