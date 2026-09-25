export type ProfileSnapshot = {
  fullName?: string | null;
  birthDate?: string | null;
  state?: string | null;
  city?: string | null;
  neighborhood?: string | null;
  workTypes?: string[] | null;
  vehicleType?: string | null;
  vehicleName?: string | null;
  vehicleBrand?: string | null;
  vehicleModel?: string | null;
  licensePlate?: string | null;
  odometerKm?: number | string | null;
  ownershipType?: string | null;
  fuelType?: string | null;
  platforms?: string[] | null;
  customPlatforms?: string[] | null;
  expenseCategories?: string[] | null;
  customExpenseCategories?: string[] | null;
  trackingPriorities?: string[] | null;
  goalType?: string | null;
  goalTarget?: number | string | null;
  plannedHoursPerDay?: number | string | null;
  workDays?: number[] | null;
};

export type CompletionItem = {
  id: string;
  label: string;
  done: boolean;
};

export type CompletionSection = {
  id: string;
  label: string;
  done: boolean;
  items: CompletionItem[];
};

export type ProfileCompletion = {
  percent: number;
  sections: CompletionSection[];
  pendingSections: CompletionSection[];
};

function isFilled(value: unknown) {
  if (value === null || value === undefined) {
    return false;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "number") {
    return Number.isFinite(value) && value > 0;
  }

  return true;
}

function hasVehicle(snapshot: ProfileSnapshot) {
  return Boolean(snapshot.vehicleType) && snapshot.vehicleType !== "other";
}

export function getProfileCompletion(snapshot: ProfileSnapshot): ProfileCompletion {
  const sections: CompletionSection[] = [
    {
      id: "profile",
      label: "seu perfil",
      done: false,
      items: [
        { id: "fullName", label: "Nome completo", done: isFilled(snapshot.fullName) },
        { id: "birthDate", label: "Data de nascimento", done: isFilled(snapshot.birthDate) },
        { id: "city", label: "Cidade e estado", done: isFilled(snapshot.city) && isFilled(snapshot.state) },
      ],
    },
    {
      id: "work",
      label: "como você ganha dinheiro",
      done: false,
      items: [{ id: "workTypes", label: "Tipo de trabalho", done: isFilled(snapshot.workTypes) }],
    },
    {
      id: "vehicle",
      label: "seu veículo",
      done: false,
      items: [
        { id: "vehicleType", label: "Tipo de veículo", done: hasVehicle(snapshot) },
        { id: "vehicleBrand", label: "Marca e modelo", done: isFilled(snapshot.vehicleBrand) || isFilled(snapshot.vehicleModel) },
        { id: "licensePlate", label: "Placa", done: isFilled(snapshot.licensePlate) },
        { id: "odometer", label: "Hodômetro", done: isFilled(snapshot.odometerKm) },
      ],
    },
    {
      id: "sources",
      label: "suas fontes de renda",
      done: false,
      items: [
        {
          id: "platforms",
          label: "Plataformas",
          done: isFilled(snapshot.platforms) || isFilled(snapshot.customPlatforms),
        },
      ],
    },
    {
      id: "expenses",
      label: "seus tipos de gasto",
      done: false,
      items: [
        {
          id: "expenseCategories",
          label: "Categorias",
          done: isFilled(snapshot.expenseCategories) || isFilled(snapshot.customExpenseCategories),
        },
      ],
    },
    {
      id: "tracking",
      label: "o que você quer acompanhar",
      done: false,
      items: [
        { id: "trackingPriorities", label: "Prioridades", done: isFilled(snapshot.trackingPriorities) },
      ],
    },
    {
      id: "goal",
      label: "sua meta",
      done: false,
      items: [
        {
          id: "goalType",
          label: "Tipo de meta",
          done: Boolean(snapshot.goalType) && snapshot.goalType !== "later",
        },
        { id: "goalTarget", label: "Valor da meta", done: isFilled(snapshot.goalTarget) },
        { id: "workDays", label: "Dias de trabalho", done: isFilled(snapshot.workDays) },
      ],
    },
  ];

  for (const section of sections) {
    section.done = section.items.every((item) => item.done);
  }

  const allItems = sections.flatMap((section) => section.items);
  const doneItems = allItems.filter((item) => item.done).length;
  const percent = allItems.length === 0 ? 0 : Math.round((doneItems / allItems.length) * 100);

  return {
    percent,
    sections,
    pendingSections: sections.filter((section) => !section.done),
  };
}
