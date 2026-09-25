"use client";

import {
  ArrowLeft,
  Bike,
  BriefcaseBusiness,
  CarFront,
  Check,
  CircleDollarSign,
  Footprints,
  Gauge,
  MapPin,
  Pencil,
  Plus,
  Receipt,
  Sparkles,
  Target,
  Truck,
  Wallet,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DateField } from "@/components/ui/date-field";
import { NoticeCard } from "@/components/ui/notice-card";
import { OptionChips } from "@/components/ui/option-chips";
import { SelectSheet, type SheetOption } from "@/components/ui/select-sheet";
import { isValidBirthDate } from "@/lib/dates";
import { findGoalPeriod, findGoalType, formatGoalTarget } from "@/lib/goals/options";
import { fetchCitiesByState, type City } from "@/lib/locations/cities";
import { brazilianStates, formatStateName } from "@/lib/locations/states";
import { getProfileCompletion } from "@/lib/profile-completion";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getProgressMessage, trackingPriorityOptions } from "@/lib/tracking";
import { formatLicensePlate } from "@/lib/vehicles/plate";
import {
  findOwnershipLabel,
  fuelTypeOptions,
  getVehicleBrands,
  getVehicleYears,
  isValidVehicleYear,
  ownershipOptions,
  rentalPeriodicityOptions,
} from "@/lib/vehicles/options";

const STORAGE_KEY = "rotax_onboarding_v1";

type WorkType =
  | "delivery"
  | "ride_hailing"
  | "logistics"
  | "bicycle_delivery"
  | "private_client"
  | "other";
type VehicleType = "motorcycle" | "car" | "bicycle" | "walking" | "other";
type GoalType = "revenue" | "profit" | "hours" | "distance" | "later";
type GoalPeriod = "daily" | "weekly" | "monthly";

type PlatformOption = {
  id: string;
  name: string;
  slug: string;
  platform_type: string;
};

type OnboardingDraft = {
  fullName: string;
  birthDate: string;
  city: string;
  state: string;
  neighborhood: string;
  workTypes: WorkType[];
  vehicleType: VehicleType;
  vehicleName: string;
  vehicleBrand: string;
  vehicleModel: string;
  modelYear: string;
  licensePlate: string;
  ownershipType: string;
  rentalAmount: string;
  rentalPeriodicity: string;
  fuelType: string;
  averageConsumption: string;
  fuelPrice: string;
  monthlyCost: string;
  odometerKm: string;
  isVehicleDefault: boolean;
  platforms: string[];
  customPlatforms: string[];
  expenseCategories: string[];
  customExpenseCategories: string[];
  trackingPriorities: string[];
  goalType: GoalType;
  goalPeriod: GoalPeriod;
  workDays: number[];
  goalTarget: string;
  goalName: string;
  plannedHoursPerDay: string;
};

const defaultDraft: OnboardingDraft = {
  fullName: "",
  birthDate: "",
  city: "",
  state: "",
  neighborhood: "",
  workTypes: [],
  vehicleType: "other",
  vehicleName: "",
  vehicleBrand: "",
  vehicleModel: "",
  modelYear: "",
  licensePlate: "",
  ownershipType: "",
  rentalAmount: "",
  rentalPeriodicity: "",
  fuelType: "",
  averageConsumption: "",
  fuelPrice: "",
  monthlyCost: "",
  odometerKm: "",
  isVehicleDefault: true,
  platforms: [],
  customPlatforms: [],
  expenseCategories: [],
  customExpenseCategories: [],
  trackingPriorities: [],
  goalType: "later",
  goalPeriod: "monthly",
  workDays: [],
  goalTarget: "",
  goalName: "",
  plannedHoursPerDay: "",
};

const workTypeOptions = [
  {
    id: "delivery",
    label: "Entregas",
    description: "iFood, Rappi e pedidos locais.",
    icon: Truck,
    platformTypes: ["delivery"],
  },
  {
    id: "ride_hailing",
    label: "Corridas por aplicativo",
    description: "Uber, 99 e viagens por app.",
    icon: CarFront,
    platformTypes: ["ride_hailing"],
  },
  {
    id: "logistics",
    label: "Fretos e entregas grandes",
    description: "Coletas e transporte de carga.",
    icon: BriefcaseBusiness,
    platformTypes: ["logistics"],
  },
  {
    id: "bicycle_delivery",
    label: "Entregas de bicicleta",
    description: "Pedidos na bike, mais barato e saudável.",
    icon: Bike,
    platformTypes: ["delivery"],
  },
  {
    id: "private_client",
    label: "Trabalho autônomo",
    description: "Clientes diretos e serviços avulsos.",
    icon: Wallet,
    platformTypes: ["private_client"],
  },
  {
    id: "other",
    label: "Outras fontes",
    description: "Combino mais de um tipo de trabalho.",
    icon: Sparkles,
    platformTypes: [],
  },
] as const;

const vehicleOptions = [
  { id: "motorcycle", label: "Moto", icon: Bike },
  { id: "car", label: "Carro", icon: CarFront },
  { id: "bicycle", label: "Bicicleta", icon: Bike },
  { id: "walking", label: "Trabalho a pé", icon: Footprints },
  { id: "other", label: "Não quero cadastrar agora", icon: Sparkles },
] as const;

const weekDayOptions = [
  { value: "1", label: "Segunda", short: "Seg" },
  { value: "2", label: "Terça", short: "Ter" },
  { value: "3", label: "Quarta", short: "Qua" },
  { value: "4", label: "Quinta", short: "Qui" },
  { value: "5", label: "Sexta", short: "Sex" },
  { value: "6", label: "Sábado", short: "Sáb" },
  { value: "7", label: "Domingo", short: "Dom" },
] as const;

const expenseCategoryOptions: SheetOption[] = [
  { value: "fuel", label: "Combustível" },
  { value: "food", label: "Alimentação" },
  { value: "maintenance", label: "Manutenção" },
  { value: "oil_change", label: "Troca de óleo" },
  { value: "tires", label: "Pneus" },
  { value: "insurance", label: "Seguro do veículo" },
  { value: "vehicle_rental", label: "Aluguel de veículo" },
  { value: "vehicle_financing", label: "Financiamento do veículo" },
  { value: "parking", label: "Estacionamento" },
  { value: "toll", label: "Pedágios" },
  { value: "platform_fee", label: "Taxas das plataformas" },
  { value: "mobile_internet", label: "Internet do celular" },
  { value: "equipment", label: "Equipamentos" },
  { value: "taxes", label: "Impostos e taxas" },
  { value: "other", label: "Outros" },
];

const steps = [
  { key: "profile", label: "Perfil", optional: false },
  { key: "work", label: "Como você ganha dinheiro?", optional: false },
  { key: "vehicle", label: "Veículo", optional: true },
  { key: "sources", label: "Fontes de renda", optional: true },
  { key: "expenses", label: "Despesas", optional: true },
  { key: "tracking", label: "O que acompanhar", optional: true },
  { key: "goal", label: "Meta", optional: true },
  { key: "summary", label: "Resumo", optional: false },
] as const;

const goalTypeFallbackLabel: Record<GoalType, string> = {
  profit: "Meta de lucro",
  revenue: "Meta de faturamento",
  hours: "Meta de horas",
  distance: "Meta de quilômetros",
  later: "Meta",
};

const fieldClass =
  "w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-brand-400 focus:outline-none";

function readStoredDraft(): OnboardingDraft {
  if (typeof window === "undefined") {
    return defaultDraft;
  }

  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return defaultDraft;
    }

    const parsed = JSON.parse(stored) as Partial<OnboardingDraft> & { workType?: string };
    const merged = { ...defaultDraft, ...parsed };

    if (Array.isArray(merged.workTypes) && merged.workTypes.length > 0) {
      return merged;
    }

    if (typeof parsed.workType === "string" && parsed.workType) {
      return { ...merged, workTypes: [parsed.workType as WorkType] };
    }

    return { ...merged, workTypes: [] };
  } catch {
    return defaultDraft;
  }
}

function parseOptionalNumber(value: string): number | null {
  if (!value.trim()) {
    return null;
  }

  const parsed = Number(value.replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

type CitiesState = {
  forState: string;
  forRequest: number;
  items: City[];
  status: "idle" | "error" | "ready";
};

function useCitiesByState(stateCode: string) {
  const [requestId, setRequestId] = useState(0);
  const [state, setState] = useState<CitiesState>({
    forState: "",
    forRequest: 0,
    items: [],
    status: "idle",
  });

  useEffect(() => {
    if (!stateCode) {
      return;
    }

    let active = true;

    fetchCitiesByState(stateCode)
      .then((items) => {
        if (active) {
          setState({ forState: stateCode, forRequest: requestId, items, status: "ready" });
        }
      })
      .catch(() => {
        if (active) {
          setState({ forState: stateCode, forRequest: requestId, items: [], status: "error" });
        }
      });

    return () => {
      active = false;
    };
  }, [stateCode, requestId]);

  const isCurrent = Boolean(stateCode) && state.forState === stateCode && state.forRequest === requestId;

  return {
    cities: isCurrent ? state.items : [],
    loading: Boolean(stateCode) && !isCurrent,
    failed: isCurrent && state.status === "error",
    retry: () => setRequestId((current) => current + 1),
  };
}

function CustomOptionInput({
  label,
  placeholder,
  onAdd,
}: {
  label: string;
  placeholder: string;
  onAdd: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState("");

  function handleAdd() {
    const name = value.trim();
    if (!name) {
      return;
    }

    onAdd(name);
    setValue("");
    setOpen(false);
  }

  if (!open) {
    return (
      <Button type="button" variant="ghost" className="w-full" onClick={() => setOpen(true)}>
        <Plus className="mr-2 h-4 w-4" /> {label}
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          value={value}
          autoFocus
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              handleAdd();
            }
          }}
          placeholder={placeholder}
          className={fieldClass}
        />
        <Button type="button" className="shrink-0" onClick={handleAdd}>
          Salvar
        </Button>
      </div>

      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="w-full"
        onClick={() => {
          setOpen(false);
          setValue("");
        }}
      >
        Cancelar
      </Button>
    </div>
  );
}

function SelectedCustomList({
  items,
  onRemove,
}: {
  items: string[];
  onRemove: (value: string) => void;
}) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-brand-500/50 bg-brand-500/10 px-3 py-1 text-sm text-white"
        >
          {item}
          <button
            type="button"
            aria-label={`Remover ${item}`}
            onClick={() => onRemove(item)}
            className="flex h-6 w-6 items-center justify-center rounded-full text-brand-200 transition hover:bg-brand-500/20"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </span>
      ))}
    </div>
  );
}

function SummaryBlock({
  label,
  value,
  onEdit,
}: {
  label: string;
  value: string;
  onEdit: () => void;
}) {
  return (
    <div className="flex items-start justify-between gap-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-3">
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-[0.18em] text-slate-500">{label}</p>
        <p className="mt-1 text-sm text-white">{value}</p>
      </div>
      <button
        type="button"
        onClick={onEdit}
        aria-label={`Editar ${label}`}
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-slate-700 text-slate-300 transition hover:border-brand-400 hover:text-brand-300"
      >
        <Pencil className="h-4 w-4" />
      </button>
    </div>
  );
}

export default function OnboardingPage() {
  const router = useRouter();
  const [draft, setDraft] = useState<OnboardingDraft>(() => readStoredDraft());
  const [currentStep, setCurrentStep] = useState(0);
  const [platformOptions, setPlatformOptions] = useState<PlatformOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [dismissedNotices, setDismissedNotices] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const cityList = useCitiesByState(draft.state);

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

      const editing = new URLSearchParams(window.location.search).get("editar") === "1";
      setIsEditing(editing);

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select(
          "full_name, city, state, neighborhood, birth_date, work_types, tracking_priorities, favorite_platforms, custom_platforms, preferred_expense_categories, custom_expense_categories, planned_hours_per_day, onboarding_completed",
        )
        .eq("id", user.id)
        .maybeSingle();

      const loadedProfile = profileError
        ? (
            await supabase
              .from("profiles")
              .select("full_name, city, state, neighborhood, birth_date, onboarding_completed")
              .eq("id", user.id)
              .maybeSingle()
          ).data
        : profile;

      const storedDraft = readStoredDraft();

      const nextDraft: Partial<OnboardingDraft> = {
        fullName: loadedProfile?.full_name ?? user.user_metadata?.full_name ?? storedDraft.fullName,
        city: loadedProfile?.city ?? storedDraft.city,
        state: loadedProfile?.state ?? storedDraft.state,
        neighborhood: loadedProfile?.neighborhood ?? storedDraft.neighborhood,
        birthDate: loadedProfile?.birth_date ?? storedDraft.birthDate,
      };

      const workTypes = (loadedProfile as { work_types?: string[] | null } | null)?.work_types;
      if (workTypes && workTypes.length > 0) {
        nextDraft.workTypes = workTypes as WorkType[];
      }

      const trackingPriorities = (loadedProfile as { tracking_priorities?: string[] | null } | null)
        ?.tracking_priorities;
      if (trackingPriorities && trackingPriorities.length > 0) {
        nextDraft.trackingPriorities = trackingPriorities;
      }

      const favoritePlatforms = (loadedProfile as { favorite_platforms?: string[] | null } | null)
        ?.favorite_platforms;
      if (favoritePlatforms && favoritePlatforms.length > 0) {
        nextDraft.platforms = favoritePlatforms;
      }

      const customPlatforms = (loadedProfile as { custom_platforms?: string[] | null } | null)
        ?.custom_platforms;
      if (customPlatforms && customPlatforms.length > 0) {
        nextDraft.customPlatforms = customPlatforms;
      }

      const preferredCategories = (loadedProfile as { preferred_expense_categories?: string[] | null } | null)
        ?.preferred_expense_categories;
      if (preferredCategories && preferredCategories.length > 0) {
        nextDraft.expenseCategories = preferredCategories;
      }

      const customCategories = (loadedProfile as { custom_expense_categories?: string[] | null } | null)
        ?.custom_expense_categories;
      if (customCategories && customCategories.length > 0) {
        nextDraft.customExpenseCategories = customCategories;
      }

      const plannedHours = (loadedProfile as { planned_hours_per_day?: number | null } | null)
        ?.planned_hours_per_day;
      if (plannedHours) {
        nextDraft.plannedHoursPerDay = String(plannedHours);
      }

      const { data: platformsData } = await supabase
        .from("platforms")
        .select("id, slug, name, platform_type")
        .eq("is_active", true)
        .order("name", { ascending: true });

      setPlatformOptions(platformsData ?? []);

      if (loadedProfile?.onboarding_completed && !editing) {
        router.replace("/dashboard");
        return;
      }

      if (loadedProfile?.onboarding_completed) {
        const { data: vehicle } = await supabase
          .from("vehicles")
          .select(
            "vehicle_type, name, make, model, model_year, license_plate, ownership_type, rental_amount, rental_periodicity, fuel_type, average_consumption_km_per_liter, estimated_fuel_price, fixed_monthly_cost, odometer_km",
          )
          .eq("user_id", user.id)
          .order("is_default", { ascending: false })
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (vehicle) {
          nextDraft.vehicleType = (vehicle.vehicle_type as VehicleType) ?? "other";
          nextDraft.vehicleName = vehicle.name ?? "";
          nextDraft.vehicleBrand = vehicle.make ?? "";
          nextDraft.vehicleModel = vehicle.model ?? "";
          nextDraft.modelYear = vehicle.model_year ? String(vehicle.model_year) : "";
          nextDraft.licensePlate = vehicle.license_plate ?? "";
          nextDraft.ownershipType = vehicle.ownership_type ?? "";
          nextDraft.rentalAmount = vehicle.rental_amount ? String(vehicle.rental_amount) : "";
          nextDraft.rentalPeriodicity = vehicle.rental_periodicity ?? "";
          nextDraft.fuelType = vehicle.fuel_type ?? "";
          nextDraft.averageConsumption = vehicle.average_consumption_km_per_liter
            ? String(vehicle.average_consumption_km_per_liter)
            : "";
          nextDraft.fuelPrice = vehicle.estimated_fuel_price ? String(vehicle.estimated_fuel_price) : "";
          nextDraft.monthlyCost = vehicle.fixed_monthly_cost ? String(vehicle.fixed_monthly_cost) : "";
          nextDraft.odometerKm = vehicle.odometer_km ? String(vehicle.odometer_km) : "";
        }

        const { data: goal } = await supabase
          .from("goals")
          .select("goal_type, goal_period, target_amount, name, work_days")
          .eq("user_id", user.id)
          .eq("is_active", true)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (goal) {
          nextDraft.goalType = (goal.goal_type as GoalType) ?? "later";
          nextDraft.goalPeriod = (goal.goal_period as GoalPeriod) ?? "monthly";
          nextDraft.goalTarget = goal.target_amount ? String(goal.target_amount) : "";
          nextDraft.goalName = goal.name ?? "";
          nextDraft.workDays = goal.work_days ?? [];
        }
      }

      setDraft((previous) => ({ ...previous, ...nextDraft }));
      setLoading(false);
    };

    void load();
  }, [router]);

  const completion = useMemo(
    () =>
      getProfileCompletion({
        fullName: draft.fullName,
        birthDate: draft.birthDate,
        city: draft.city,
        state: draft.state,
        workTypes: draft.workTypes,
        vehicleType: draft.vehicleType,
        vehicleBrand: draft.vehicleBrand,
        vehicleModel: draft.vehicleModel,
        licensePlate: draft.licensePlate,
        odometerKm: draft.odometerKm,
        platforms: draft.platforms,
        customPlatforms: draft.customPlatforms,
        expenseCategories: draft.expenseCategories,
        customExpenseCategories: draft.customExpenseCategories,
        trackingPriorities: draft.trackingPriorities,
        goalType: draft.goalType,
        goalTarget: draft.goalTarget,
        workDays: draft.workDays,
      }),
    [draft],
  );

  const currentVehicleLabel = useMemo(
    () => vehicleOptions.find((option) => option.id === draft.vehicleType)?.label ?? "Veículo",
    [draft.vehicleType],
  );

  const stateOptions = useMemo<SheetOption[]>(
    () => brazilianStates.map((state) => ({ value: state.code, label: state.name, keywords: state.code })),
    [],
  );

  const cityOptions = useMemo<SheetOption[]>(
    () => cityList.cities.map((city) => ({ value: city.name, label: city.name })),
    [cityList.cities],
  );

  const brandOptions = useMemo<SheetOption[]>(() => {
    const brands = getVehicleBrands(draft.vehicleType);
    return brands.map((brand) => ({ value: brand, label: brand }));
  }, [draft.vehicleType]);

  const yearOptions = useMemo<SheetOption[]>(
    () => getVehicleYears().map((year) => ({ value: String(year), label: String(year) })),
    [],
  );

  const suggestedPlatformTypes = useMemo(() => {
    const types = new Set<string>();
    for (const workType of draft.workTypes) {
      const option = workTypeOptions.find((item) => item.id === workType);
      option?.platformTypes.forEach((type) => types.add(type));
    }
    return types;
  }, [draft.workTypes]);

  const orderedPlatforms = useMemo(() => {
    if (suggestedPlatformTypes.size === 0) {
      return platformOptions;
    }

    return [...platformOptions].sort((first, second) => {
      const firstSuggested = suggestedPlatformTypes.has(first.platform_type) ? 0 : 1;
      const secondSuggested = suggestedPlatformTypes.has(second.platform_type) ? 0 : 1;
      return firstSuggested - secondSuggested;
    });
  }, [platformOptions, suggestedPlatformTypes]);

  const hasVehicleDetails = draft.vehicleType !== "other" && draft.vehicleType !== "walking";
  const usesFuel = draft.vehicleType === "motorcycle" || draft.vehicleType === "car";
  const isRented = draft.ownershipType === "rented";
  const needsVehicleForWork =
    (draft.workTypes.includes("delivery") ||
      draft.workTypes.includes("bicycle_delivery") ||
      draft.workTypes.includes("logistics") ||
      draft.workTypes.includes("ride_hailing")) &&
    (draft.vehicleType === "walking" || draft.vehicleType === "other");
  const fuelWithoutEngine = draft.expenseCategories.includes("fuel") && !usesFuel;
  const dailyGoalWithWorkDays = draft.goalType !== "later" && draft.goalPeriod === "daily" && draft.workDays.length > 0;

  const activeGoalType = findGoalType(draft.goalType);
  const activeGoalPeriod = findGoalPeriod(draft.goalPeriod);

  const workTypeLabels = draft.workTypes
    .map((workType) => workTypeOptions.find((item) => item.id === workType)?.label)
    .filter(Boolean)
    .join(" e ");

  const vehicleSummary = useMemo(() => {
    if (draft.vehicleType === "other") {
      return "Não cadastrado agora";
    }

    const name = [draft.vehicleBrand, draft.vehicleModel].filter(Boolean).join(" ");
    const ownership = findOwnershipLabel(draft.ownershipType);
    const base = name || currentVehicleLabel;

    if (isRented && draft.rentalAmount) {
      const periodicity =
        rentalPeriodicityOptions.find((item) => item.value === draft.rentalPeriodicity)?.label.toLowerCase() ??
        "mensal";
      return `${base} · alugado por ${formatGoalTarget("currency", draft.rentalAmount)}/${periodicity}`;
    }

    return ownership ? `${base} · ${ownership.toLowerCase()}` : base;
  }, [
    currentVehicleLabel,
    draft.ownershipType,
    draft.rentalAmount,
    draft.rentalPeriodicity,
    draft.vehicleBrand,
    draft.vehicleModel,
    draft.vehicleType,
    isRented,
  ]);

  const goalSummary = useMemo(() => {
    if (draft.goalType === "later" || !activeGoalType) {
      return "Definir depois";
    }

    const target = formatGoalTarget(activeGoalType.unit, draft.goalTarget || 0);
    const period = activeGoalPeriod?.label.toLowerCase() ?? "";
    return `${period} · ${target}`;
  }, [activeGoalPeriod, activeGoalType, draft.goalType, draft.goalTarget]);

  function updateDraft(nextValues: Partial<OnboardingDraft>) {
    setDraft((previous) => ({ ...previous, ...nextValues }));
  }

  function goBack() {
    setCurrentStep((previous) => Math.max(0, previous - 1));
  }

  function toggleListItem(list: string[], value: string) {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
  }

  function addCustomItem(list: string[], value: string) {
    const alreadyExists = list.some(
      (item) => item.toLocaleLowerCase("pt-BR") === value.toLocaleLowerCase("pt-BR"),
    );

    return alreadyExists ? list : [...list, value];
  }

  function dismissNotice(id: string) {
    setDismissedNotices((previous) => (previous.includes(id) ? previous : [...previous, id]));
  }

  function showNotice(id: string) {
    return !dismissedNotices.includes(id);
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

    const userId = user.id;

    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("accepted_terms_at")
      .eq("id", userId)
      .maybeSingle();

    const baseProfilePayload: Record<string, unknown> = {
      id: userId,
      full_name: draft.fullName.trim() || user.user_metadata?.full_name || user.email?.split("@")[0] || "Motorista",
      city: draft.city.trim() || null,
      state: draft.state ? draft.state.trim().slice(0, 2).toUpperCase() : null,
      onboarding_completed: completed,
    };

    const extendedProfilePayload: Record<string, unknown> = {
      ...baseProfilePayload,
      birth_date: isValidBirthDate(draft.birthDate) ? draft.birthDate : null,
      neighborhood: draft.neighborhood.trim() || null,
      favorite_platforms: draft.platforms,
      custom_platforms: draft.customPlatforms,
      preferred_expense_categories: draft.expenseCategories,
      custom_expense_categories: draft.customExpenseCategories,
      work_types: draft.workTypes,
      tracking_priorities: draft.trackingPriorities,
      planned_hours_per_day: parseOptionalNumber(draft.plannedHoursPerDay),
    };

    if (!existingProfile?.accepted_terms_at && completed) {
      const acceptedAt = new Date().toISOString();
      baseProfilePayload.accepted_terms_at = acceptedAt;
      extendedProfilePayload.accepted_terms_at = acceptedAt;
    }

    const { error: profileError } = await supabase
      .from("profiles")
      .upsert(extendedProfilePayload, { onConflict: "id" });

    if (profileError) {
      const { error: fallbackError } = await supabase
        .from("profiles")
        .update(baseProfilePayload)
        .eq("id", userId);

      if (fallbackError) {
        throw new Error(profileError.message);
      }
    }

    if (hasVehicleDetails) {
      const vehicleName = draft.vehicleName.trim() || currentVehicleLabel;
      const vehicleType = draft.vehicleType;

      const { data: existingVehicle } = await supabase
        .from("vehicles")
        .select("id, name")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      const baseVehiclePayload: Record<string, unknown> = {
        user_id: userId,
        name: vehicleName,
        vehicle_type: vehicleType,
        make: draft.vehicleBrand.trim() || null,
        model: draft.vehicleModel.trim() || null,
        average_consumption_km_per_liter: parseOptionalNumber(draft.averageConsumption),
        estimated_fuel_price: parseOptionalNumber(draft.fuelPrice),
        fixed_monthly_cost: parseOptionalNumber(draft.monthlyCost) ?? 0,
        is_default: draft.isVehicleDefault || !existingVehicle,
        is_active: true,
      };

      const extendedVehiclePayload: Record<string, unknown> = {
        ...baseVehiclePayload,
        model_year: isValidVehicleYear(Number(draft.modelYear)) ? Number(draft.modelYear) : null,
        license_plate: formatLicensePlate(draft.licensePlate) || null,
        fuel_type: draft.fuelType || null,
        odometer_km: parseOptionalNumber(draft.odometerKm),
        ownership_type: draft.ownershipType || null,
        rental_amount: isRented ? parseOptionalNumber(draft.rentalAmount) : null,
        rental_periodicity: isRented ? draft.rentalPeriodicity || null : null,
      };

      async function writeVehicle(payload: Record<string, unknown>) {
        if (existingVehicle) {
          const { error } = await supabase
            .from("vehicles")
            .update({
              ...payload,
              is_default: draft.isVehicleDefault || existingVehicle.id === existingVehicle.id,
            } as Record<string, unknown>)
            .eq("id", existingVehicle.id)
            .eq("user_id", userId);

          return error;
        }

        const { error } = await supabase.from("vehicles").insert(payload);
        return error;
      }

      const vehicleError = await writeVehicle(extendedVehiclePayload);

      if (vehicleError) {
        const fallbackError = await writeVehicle(baseVehiclePayload);
        if (fallbackError) {
          throw new Error(vehicleError.message);
        }
      }
    }

    if (draft.goalType !== "later" && Number(draft.goalTarget) > 0) {
      const target = Number(draft.goalTarget);
      const goalName = draft.goalName.trim() || goalTypeFallbackLabel[draft.goalType];

      const baseGoalPayload: Record<string, unknown> = {
        user_id: userId,
        name: goalName,
        goal_type: draft.goalType,
        goal_period: draft.goalPeriod,
        target_amount: target,
        start_date: new Date().toISOString().slice(0, 10),
        end_date: null,
        is_active: true,
      };

      const extendedGoalPayload: Record<string, unknown> = {
        ...baseGoalPayload,
        work_days: draft.workDays,
      };

      const { data: existingGoals } = await supabase
        .from("goals")
        .select("id")
        .eq("user_id", userId)
        .eq("is_active", true)
        .order("created_at", { ascending: false })
        .limit(1);

      async function writeGoal(payload: Record<string, unknown>) {
        if (existingGoals && existingGoals.length > 0) {
          const { error } = await supabase
            .from("goals")
            .update(payload)
            .eq("id", existingGoals[0].id)
            .eq("user_id", userId);

          return error;
        }

        const { error } = await supabase.from("goals").insert(payload);
        return error;
      }

      const goalError = await writeGoal(extendedGoalPayload);

      if (goalError) {
        const fallbackError = await writeGoal(baseGoalPayload);
        if (fallbackError) {
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

  const isCurrentStepOptional = steps[currentStep].optional;

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
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-3 text-sm">
              <span className="font-medium text-white">
                {isEditing ? "Ajuste sua configuração" : `Seu RotaX está ${completion.percent}% configurado`}
              </span>
              <span className="text-xs text-slate-400">
                Etapa {currentStep + 1} de {steps.length}
              </span>
            </div>

            <div className="h-2.5 overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-brand-500 transition-all duration-300"
                style={{ width: `${isEditing ? ((currentStep + 1) / steps.length) * 100 : completion.percent}%` }}
              />
            </div>

            <p className="text-xs text-slate-400">
              {isEditing
                ? "Toque no bloco que quer mudar no resumo final."
                : getProgressMessage(completion.percent)}
            </p>
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
                    className={fieldClass}
                  />
                </label>

                <div className="space-y-2">
                  <span className="text-sm text-slate-300">Data de nascimento</span>
                  <DateField value={draft.birthDate} onChange={(value) => updateDraft({ birthDate: value })} />
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-slate-300">Estado</span>
                  <SelectSheet
                    title="Estado"
                    placeholder="Selecione o estado"
                    searchPlaceholder="Buscar estado..."
                    options={stateOptions}
                    value={draft.state || null}
                    onChange={(value) => updateDraft({ state: value ?? "", city: "" })}
                  />
                </div>

                <div className="space-y-2">
                  <span className="text-sm text-slate-300">Cidade</span>
                  <SelectSheet
                    title="Cidade"
                    placeholder={draft.state ? "Selecione a cidade" : "Escolha o estado primeiro"}
                    searchPlaceholder="Buscar cidade..."
                    options={cityOptions}
                    value={draft.city || null}
                    onChange={(value) => updateDraft({ city: value ?? "" })}
                    disabled={!draft.state}
                    loading={cityList.loading}
                    errorMessage={cityList.failed ? "Não foi possível carregar as cidades agora." : null}
                    onRetry={cityList.retry}
                    emptyMessage={
                      draft.state ? "Nenhuma cidade encontrada." : "Selecione um estado para ver as cidades."
                    }
                  />
                </div>

                <label className="block space-y-2">
                  <span className="text-sm text-slate-300">Bairro (opcional)</span>
                  <input
                    value={draft.neighborhood}
                    onChange={(event) => updateDraft({ neighborhood: event.target.value })}
                    placeholder="Seu bairro"
                    className={fieldClass}
                  />
                </label>
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
              <h2 className="text-2xl font-semibold text-white">Como você ganha dinheiro?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Pode escolher mais de uma. Essa resposta deixa as próximas etapas personalizadas para o seu dia a dia.
              </p>

              <div className="mt-6 space-y-3">
                {workTypeOptions.map(({ id, label, description, icon: Icon }) => {
                  const selected = draft.workTypes.includes(id);
                  return (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => updateDraft({ workTypes: toggleListItem(draft.workTypes, id) as WorkType[] })}
                      className={`flex w-full items-start gap-3 rounded-2xl border p-4 text-left transition ${
                        selected
                          ? "border-brand-500 bg-brand-500/10"
                          : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                      }`}
                    >
                      <span className="mt-1 flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800 text-brand-300">
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="flex-1">
                        <span className="block text-base font-medium text-white">{label}</span>
                        <span className="mt-1 block text-sm text-slate-300">{description}</span>
                      </span>
                      {selected ? <Check className="mt-1 h-5 w-5 shrink-0 text-brand-400" /> : null}
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
                      onClick={() =>
                        updateDraft({
                          vehicleType: id,
                          vehicleBrand: "",
                          modelYear: "",
                          fuelType: "",
                        })
                      }
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

              {needsVehicleForWork && showNotice("vehicle-work") ? (
                <div className="mt-5">
                  <NoticeCard
                    title="Você trabalha com entregas e não tem veículo cadastrado"
                    description="Sem veículo, o custo por corrida e o lucro por km ficam sem comparação. Quer cadastrar um agora?"
                    actionLabel="Cadastrar veículo"
                    onAction={() =>
                      updateDraft({
                        vehicleType: draft.workTypes.includes("bicycle_delivery") ? "bicycle" : "motorcycle",
                      })
                    }
                    secondaryLabel="Agora não"
                    onSecondary={() => dismissNotice("vehicle-work")}
                  />
                </div>
              ) : null}

              {hasVehicleDetails && (
                <div className="mt-6 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Nome do veículo</label>
                    <input
                      value={draft.vehicleName}
                      onChange={(event) => updateDraft({ vehicleName: event.target.value })}
                      placeholder={draft.vehicleType === "motorcycle" ? "CG 160" : "Corolla"}
                      className={fieldClass}
                    />
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-slate-300">Marca</span>
                    <SelectSheet
                      title="Marca do veículo"
                      placeholder="Selecione a marca"
                      searchPlaceholder="Buscar marca..."
                      options={brandOptions}
                      value={draft.vehicleBrand || null}
                      onChange={(value) => updateDraft({ vehicleBrand: value ?? "" })}
                      emptyMessage={
                        draft.vehicleType === "bicycle"
                          ? "Nenhuma marca na lista. Digite o modelo abaixo."
                          : "Nenhuma marca encontrada."
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Modelo</label>
                    <input
                      value={draft.vehicleModel}
                      onChange={(event) => updateDraft({ vehicleModel: event.target.value })}
                      placeholder={draft.vehicleType === "motorcycle" ? "CG 160" : "Corolla"}
                      className={fieldClass}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <span className="text-sm text-slate-300">Ano</span>
                      <SelectSheet
                        title="Ano do veículo"
                        placeholder="Selecione"
                        searchPlaceholder="Buscar ano..."
                        options={yearOptions}
                        value={draft.modelYear || null}
                        onChange={(value) => updateDraft({ modelYear: value ?? "" })}
                        emptyMessage="Nenhum ano encontrado."
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Placa</label>
                      <input
                        value={draft.licensePlate}
                        onChange={(event) =>
                          updateDraft({ licensePlate: formatLicensePlate(event.target.value) })
                        }
                        placeholder="ABC1D23"
                        maxLength={8}
                        className={fieldClass}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-slate-300">O veículo é seu?</span>
                    <OptionChips
                      options={ownershipOptions.map((option) => ({ value: option.value, label: option.label }))}
                      selected={draft.ownershipType ? [draft.ownershipType] : []}
                      onToggle={(value) =>
                        updateDraft({
                          ownershipType: draft.ownershipType === value ? "" : value,
                          rentalAmount: value === "rented" ? draft.rentalAmount : "",
                          rentalPeriodicity: value === "rented" ? draft.rentalPeriodicity : "",
                        })
                      }
                      columns="grid-cols-2"
                      ariaLabel="Tipo de posse"
                    />
                  </div>

                  {isRented && (
                    <div className="space-y-3 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-3">
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="mb-2 block text-sm text-slate-300">Valor do aluguel</label>
                          <input
                            type="number"
                            inputMode="decimal"
                            min="0"
                            step="0.01"
                            value={draft.rentalAmount}
                            onChange={(event) => updateDraft({ rentalAmount: event.target.value })}
                            placeholder="R$ 900"
                            className={fieldClass}
                          />
                        </div>
                        <div className="space-y-2">
                          <span className="text-sm text-slate-300">Pago</span>
                          <OptionChips
                            options={rentalPeriodicityOptions.map((option) => ({
                              value: option.value,
                              label: option.label,
                            }))}
                            selected={draft.rentalPeriodicity ? [draft.rentalPeriodicity] : []}
                            onToggle={(value) =>
                              updateDraft({
                                rentalPeriodicity: draft.rentalPeriodicity === value ? "" : value,
                              })
                            }
                            columns="grid-cols-3"
                            ariaLabel="Periodicidade do aluguel"
                          />
                        </div>
                      </div>

                      {!draft.rentalAmount && showNotice("rental") ? (
                        <NoticeCard
                          title="Falta o valor do aluguel"
                          description="Sem esse valor, o custo fixo do mês fica zerado e o lucro appear inflado."
                          secondaryLabel="Deixar em branco"
                          onSecondary={() => dismissNotice("rental")}
                        />
                      ) : null}
                    </div>
                  )}

                  {usesFuel && (
                    <div className="space-y-2">
                      <span className="text-sm text-slate-300">Combustível</span>
                      <OptionChips
                        options={fuelTypeOptions}
                        selected={draft.fuelType ? [draft.fuelType] : []}
                        onToggle={(value) => updateDraft({ fuelType: draft.fuelType === value ? "" : value })}
                        columns="grid-cols-2"
                        ariaLabel="Combustível"
                      />
                    </div>
                  )}

                  {usesFuel && (
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="mb-2 block text-sm text-slate-300">Km/l</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.1"
                          value={draft.averageConsumption}
                          onChange={(event) => updateDraft({ averageConsumption: event.target.value })}
                          placeholder="35"
                          className={fieldClass}
                        />
                      </div>
                      <div>
                        <label className="mb-2 block text-sm text-slate-300">Preço do litro</label>
                        <input
                          type="number"
                          inputMode="decimal"
                          min="0"
                          step="0.01"
                          value={draft.fuelPrice}
                          onChange={(event) => updateDraft({ fuelPrice: event.target.value })}
                          placeholder="R$ 6,20"
                          className={fieldClass}
                        />
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Hodômetro (km)</label>
                      <input
                        type="number"
                        inputMode="numeric"
                        min="0"
                        step="1"
                        value={draft.odometerKm}
                        onChange={(event) => updateDraft({ odometerKm: event.target.value })}
                        placeholder="15000"
                        className={fieldClass}
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm text-slate-300">Custo mensal</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        step="0.01"
                        value={draft.monthlyCost}
                        onChange={(event) => updateDraft({ monthlyCost: event.target.value })}
                        placeholder="R$ 180"
                        className={fieldClass}
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

              <div className="mt-6 space-y-3">
                {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

                <div className="flex gap-3">
                  <Button type="button" variant="secondary" className="flex-1" onClick={goBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => void saveProgressAndContinue(3)} disabled={saving}>
                    {saving ? "Salvando..." : "Continuar"}
                  </Button>
                </div>

                {isCurrentStepOptional ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => void saveProgressAndContinue(3)}
                    disabled={saving}
                  >
                    Pular por enquanto
                  </Button>
                ) : null}
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

              {suggestedPlatformTypes.size > 0 ? (
                <p className="mt-4 rounded-xl border border-brand-500/30 bg-brand-500/5 px-3 py-2 text-xs text-brand-200">
                  Suggested first for you, based on how you work.
                </p>
              ) : null}

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {orderedPlatforms.map((platform) => {
                  const selected = draft.platforms.includes(platform.slug);
                  const suggested = suggestedPlatformTypes.has(platform.platform_type);

                  return (
                    <button
                      key={platform.id}
                      type="button"
                      onClick={() => updateDraft({ platforms: toggleListItem(draft.platforms, platform.slug) })}
                      className={`min-h-[48px] rounded-2xl border p-3 text-left transition ${
                        selected
                          ? "border-brand-500 bg-brand-500/10"
                          : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                      }`}
                    >
                      <span className="block text-sm font-medium text-white">{platform.name}</span>
                      {suggested ? <span className="mt-0.5 block text-xs text-brand-300">Sugerido</span> : null}
                    </button>
                  );
                })}
              </div>

              <div className="mt-4 space-y-3">
                <SelectedCustomList
                  items={draft.customPlatforms}
                  onRemove={(value) =>
                    updateDraft({ customPlatforms: draft.customPlatforms.filter((item) => item !== value) })
                  }
                />

                <CustomOptionInput
                  label="Adicionar outro"
                  placeholder="Nome da fonte de renda"
                  onAdd={(value) => updateDraft({ customPlatforms: addCustomItem(draft.customPlatforms, value) })}
                />
              </div>

              <div className="mt-6 space-y-3">
                {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

                <div className="flex gap-3">
                  <Button type="button" variant="secondary" className="flex-1" onClick={goBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => void saveProgressAndContinue(4)} disabled={saving}>
                    {saving ? "Salvando..." : "Continuar"}
                  </Button>
                </div>

                {isCurrentStepOptional ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => void saveProgressAndContinue(4)}
                    disabled={saving}
                  >
                    Pular por enquanto
                  </Button>
                ) : null}
              </div>
            </Card>
          )}

          {currentStep === 4 && (
            <Card className="border-slate-800 bg-slate-900/80 p-5 sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                <Receipt className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Seus principais gastos</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Escolha os tipos de gasto que mais aparecem no seu dia a dia para agilizar os lançamentos.
              </p>

              <div className="mt-6 space-y-2">
                <OptionChips
                  options={expenseCategoryOptions}
                  selected={draft.expenseCategories}
                  onToggle={(value) => updateDraft({ expenseCategories: toggleListItem(draft.expenseCategories, value) })}
                  columns="grid-cols-2"
                  ariaLabel="Tipos de gasto"
                />
              </div>

              {fuelWithoutEngine && showNotice("fuel-without-engine") ? (
                <div className="mt-5">
                  <NoticeCard
                    title="Combustível marcado, mas seu veículo não usa combustível"
                    description={
                      draft.vehicleType === "bicycle"
                        ? "Bicicleta e trabalho a pé não gastam combustível. Isso pode distorcer o cálculo de custo por km."
                        : "Você marcou combustível, mas não cadastrou moto ou carro. Vale revisar essa escolha."
                    }
                    actionLabel="Usar moto no lugar"
                    onAction={() => updateDraft({ vehicleType: "motorcycle" })}
                    secondaryLabel="Deixar assim"
                    onSecondary={() => dismissNotice("fuel-without-engine")}
                  />
                </div>
              ) : null}

              <div className="mt-4 space-y-3">
                <SelectedCustomList
                  items={draft.customExpenseCategories}
                  onRemove={(value) =>
                    updateDraft({
                      customExpenseCategories: draft.customExpenseCategories.filter((item) => item !== value),
                    })
                  }
                />

                <CustomOptionInput
                  label="Adicionar outros"
                  placeholder="Nome do tipo de gasto"
                  onAdd={(value) =>
                    updateDraft({ customExpenseCategories: addCustomItem(draft.customExpenseCategories, value) })
                  }
                />
              </div>

              <div className="mt-6 space-y-3">
                {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

                <div className="flex gap-3">
                  <Button type="button" variant="secondary" className="flex-1" onClick={goBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => void saveProgressAndContinue(5)} disabled={saving}>
                    {saving ? "Salvando..." : "Continuar"}
                  </Button>
                </div>

                {isCurrentStepOptional ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => void saveProgressAndContinue(5)}
                    disabled={saving}
                  >
                    Pular por enquanto
                  </Button>
                ) : null}
              </div>
            </Card>
          )}

          {currentStep === 5 && (
            <Card className="border-slate-800 bg-slate-900/80 p-5 sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                <Gauge className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold text-white">O que você quer acompanhar?</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Escolha os indicadores que mais importam. O painel vai trazer esses números para o topo.
              </p>

              <div className="mt-6 space-y-2">
                <OptionChips
                  options={trackingPriorityOptions.map((option) => ({
                    value: option.value,
                    label: option.label,
                    description: option.description,
                  }))}
                  selected={draft.trackingPriorities}
                  onToggle={(value) =>
                    updateDraft({ trackingPriorities: toggleListItem(draft.trackingPriorities, value) })
                  }
                  columns="grid-cols-1 sm:grid-cols-2"
                  ariaLabel="Indicadores prioritários"
                />
              </div>

              <div className="mt-6 space-y-3">
                {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

                <div className="flex gap-3">
                  <Button type="button" variant="secondary" className="flex-1" onClick={goBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => void saveProgressAndContinue(6)} disabled={saving}>
                    {saving ? "Salvando..." : "Continuar"}
                  </Button>
                </div>

                {isCurrentStepOptional ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => void saveProgressAndContinue(6)}
                    disabled={saving}
                  >
                    Pular por enquanto
                  </Button>
                ) : null}
              </div>
            </Card>
          )}

          {currentStep === 6 && (
            <Card className="border-slate-800 bg-slate-900/80 p-5 sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                <Target className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold text-white">Sua meta</h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Escolha o que você quer medir. Metas de horas e quilômetros usam os seus turnos registrados.
              </p>

              <div className="mt-6 grid gap-3">
                {(Object.keys(goalTypeFallbackLabel) as GoalType[]).map((goalType) => {
                  const option = findGoalType(goalType);
                  if (!option) {
                    return null;
                  }

                  const selected = draft.goalType === goalType;

                  return (
                    <button
                      key={goalType}
                      type="button"
                      onClick={() => updateDraft({ goalType })}
                      className={`rounded-2xl border p-4 text-left transition ${
                        selected ? "border-brand-500 bg-brand-500/10" : "border-slate-800 bg-slate-950/70 hover:border-slate-700"
                      }`}
                    >
                      <span className="block text-base font-medium text-white">{option.label}</span>
                      <span className="mt-1 block text-sm text-slate-300">{option.note}</span>
                    </button>
                  );
                })}
              </div>

              {activeGoalType && draft.goalType !== "later" && (
                <div className="mt-5 space-y-4 rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                  <div className="space-y-2">
                    <span className="text-sm text-slate-300">Frequência</span>
                    <OptionChips
                      options={[
                        { value: "daily", label: "Diária" },
                        { value: "weekly", label: "Semanal" },
                        { value: "monthly", label: "Mensal" },
                      ]}
                      selected={[draft.goalPeriod]}
                      onToggle={(value) => updateDraft({ goalPeriod: (value as GoalPeriod) ?? draft.goalPeriod })}
                      columns="grid-cols-3"
                      ariaLabel="Frequência da meta"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">
                      {activeGoalType.targetLabel} {draft.goalPeriod === "weekly" ? "semana" : draft.goalPeriod === "monthly" ? "mês" : "dia"}
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        inputMode="decimal"
                        min="1"
                        step={activeGoalType.unit === "currency" ? "0.01" : activeGoalType.unit === "hours" ? "0.5" : "1"}
                        value={draft.goalTarget}
                        onChange={(event) => updateDraft({ goalTarget: event.target.value })}
                        placeholder={activeGoalType.unit === "hours" ? "8" : activeGoalType.unit === "distance" ? "150" : "R$ 250,00"}
                        className={fieldClass}
                      />
                      {activeGoalType.unit === "hours" ? <span className="text-sm text-slate-400">horas</span> : null}
                      {activeGoalType.unit === "distance" ? <span className="text-sm text-slate-400">km</span> : null}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-sm text-slate-300">Dias de trabalho (opcional)</span>
                    <OptionChips
                      options={weekDayOptions.map((day) => ({ value: day.value, label: day.short }))}
                      selected={draft.workDays.map((day) => String(day))}
                      onToggle={(value) =>
                        updateDraft({
                          workDays: toggleListItem(
                            draft.workDays.map((day) => String(day)),
                            value,
                          ).map((day) => Number(day)),
                        })
                      }
                      columns="grid-cols-4"
                      ariaLabel="Dias de trabalho"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Horas por dia que pretende trabalhar (opcional)</label>
                    <div className="flex items-center gap-3">
                      <input
                        type="number"
                        inputMode="decimal"
                        min="1"
                        max="24"
                        step="0.5"
                        value={draft.plannedHoursPerDay}
                        onChange={(event) => updateDraft({ plannedHoursPerDay: event.target.value })}
                        placeholder="8"
                        className={fieldClass}
                      />
                      <span className="shrink-0 text-sm text-slate-400">horas</span>
                    </div>
                    {Number(draft.plannedHoursPerDay) > 0 && activeGoalType.unit === "currency" ? (
                      <p className="mt-2 text-xs text-slate-400">
                        Para chegar na meta, você precisa de{" "}
                        {formatGoalTarget(
                          "currency",
                          Number(draft.goalTarget) / Number(draft.plannedHoursPerDay),
                        )}{" "}
                        por hora trabalhada.
                      </p>
                    ) : null}
                  </div>

                  <div>
                    <label className="mb-2 block text-sm text-slate-300">Nome da meta (opcional)</label>
                    <input
                      value={draft.goalName}
                      onChange={(event) => updateDraft({ goalName: event.target.value })}
                      placeholder={goalTypeFallbackLabel[draft.goalType]}
                      className={fieldClass}
                    />
                  </div>

                  {dailyGoalWithWorkDays && showNotice("daily-work-days") ? (
                    <NoticeCard
                      title="Sua meta é diária, mas você marcou dias da semana"
                      description="Dias da semana fazem mais sentido para uma meta semanal."
                      actionLabel="Mudar para semanal"
                      onAction={() => updateDraft({ goalPeriod: "weekly" })}
                      secondaryLabel="Manter diária"
                      onSecondary={() => dismissNotice("daily-work-days")}
                    />
                  ) : null}
                </div>
              )}

              <div className="mt-6 space-y-3">
                {errorMessage ? <p className="text-sm text-red-300">{errorMessage}</p> : null}

                <div className="flex gap-3">
                  <Button type="button" variant="secondary" className="flex-1" onClick={goBack}>
                    <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                  </Button>
                  <Button type="button" className="flex-1" onClick={() => void saveProgressAndContinue(7)} disabled={saving}>
                    {saving ? "Salvando..." : "Continuar"}
                  </Button>
                </div>

                {isCurrentStepOptional ? (
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full"
                    onClick={() => void saveProgressAndContinue(7)}
                    disabled={saving}
                  >
                    Pular por enquanto
                  </Button>
                ) : null}
              </div>
            </Card>
          )}

          {currentStep === 7 && (
            <Card className="border-slate-800 bg-slate-900/80 p-5 sm:p-6">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-500/10 text-brand-300">
                <Check className="h-6 w-6" />
              </div>
              <h2 className="text-2xl font-semibold text-white">
                {isEditing ? "Revise sua configuração" : "Seu painel está pronto."}
              </h2>
              <p className="mt-3 text-sm leading-6 text-slate-300">
                Toque no lápis de qualquer bloco para voltar e ajustar.
              </p>

              <div className="mt-5 space-y-2 rounded-2xl border border-brand-500/30 bg-brand-500/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-brand-300">Seu perfil de trabalho</p>
                <ul className="space-y-1.5 text-sm text-slate-200">
                  <li>
                    💼 {workTypeLabels || "Tipo de trabalho não informado"}
                    {draft.neighborhood || draft.city
                      ? ` · 📍 ${[draft.neighborhood, draft.city, formatStateName(draft.state)].filter(Boolean).join(" ")}`
                      : ""}
                  </li>
                  {hasVehicleDetails ? <li>🛵 {vehicleSummary}</li> : null}
                  {draft.platforms.length + draft.customPlatforms.length > 0 ? (
                    <li>
                      📱 {draft.platforms.length + draft.customPlatforms.length} fonte(s) de renda
                    </li>
                  ) : null}
                  <li>🎯 {goalSummary}</li>
                  {Number(draft.plannedHoursPerDay) > 0 ? <li>⏱️ {draft.plannedHoursPerDay}h por dia</li> : null}
                  {draft.workDays.length > 0 ? <li>📅 {draft.workDays.length} dia(s) de trabalho</li> : null}
                </ul>
              </div>

              <div className="mt-4 space-y-2">
                <SummaryBlock
                  label="Perfil"
                  value={[draft.city, formatStateName(draft.state)].filter(Boolean).join("/") || "Não informado"}
                  onEdit={() => setCurrentStep(0)}
                />
                <SummaryBlock
                  label="Como você ganha dinheiro"
                  value={workTypeLabels || "Não informado"}
                  onEdit={() => setCurrentStep(1)}
                />
                <SummaryBlock label="Veículo" value={vehicleSummary} onEdit={() => setCurrentStep(2)} />
                <SummaryBlock
                  label="Fontes de renda"
                  value={
                    draft.platforms.length + draft.customPlatforms.length > 0
                      ? `${draft.platforms.length + draft.customPlatforms.length} selecionada(s)`
                      : "Nenhuma selecionada"
                  }
                  onEdit={() => setCurrentStep(3)}
                />
                <SummaryBlock
                  label="Despesas"
                  value={
                    draft.expenseCategories.length + draft.customExpenseCategories.length > 0
                      ? `${draft.expenseCategories.length + draft.customExpenseCategories.length} tipo(s)`
                      : "Nenhum selecionado"
                  }
                  onEdit={() => setCurrentStep(4)}
                />
                <SummaryBlock
                  label="O que acompanhar"
                  value={
                    draft.trackingPriorities.length > 0
                      ? draft.trackingPriorities
                          .map((priority) => trackingPriorityOptions.find((item) => item.value === priority)?.label)
                          .filter(Boolean)
                          .join(", ")
                      : "Nenhum selecionado"
                  }
                  onEdit={() => setCurrentStep(5)}
                />
                <SummaryBlock label="Meta" value={goalSummary} onEdit={() => setCurrentStep(6)} />
              </div>

              {errorMessage ? <p className="mt-4 text-sm text-red-300">{errorMessage}</p> : null}

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  type="button"
                  size="lg"
                  className="flex-1"
                  onClick={() => void finishOnboarding()}
                  disabled={saving}
                >
                  {saving ? "Finalizando..." : isEditing ? "Salvar e voltar ao painel" : "Ir para o painel"}
                </Button>
                {!isEditing ? (
                  <Button
                    type="button"
                    variant="secondary"
                    size="lg"
                    className="flex-1"
                    onClick={() => router.push("/dashboard")}
                  >
                    Explorar sem salvar
                  </Button>
                ) : null}
              </div>
            </Card>
          )}
        </div>
      </div>
    </main>
  );
}
