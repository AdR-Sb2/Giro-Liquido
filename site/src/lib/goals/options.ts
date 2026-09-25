export type GoalTypeOption = {
  value: "revenue" | "profit" | "hours" | "distance" | "later";
  label: string;
  note: string;
  targetLabel: string;
  unit: "currency" | "hours" | "distance";
};

export const goalTypeOptions: GoalTypeOption[] = [
  {
    value: "profit",
    label: "Lucro",
    note: "O que realmente sobra depois dos gastos.",
    targetLabel: "Quanto quer lucrar por",
    unit: "currency",
  },
  {
    value: "revenue",
    label: "Ganhos",
    note: "O valor bruto que entra, antes dos gastos.",
    targetLabel: "Quanto quer ganhar por",
    unit: "currency",
  },
  {
    value: "hours",
    label: "Horas trabalhadas",
    note: "Quantas horas você pretende trabalhar por período.",
    targetLabel: "Quantas horas por",
    unit: "hours",
  },
  {
    value: "distance",
    label: "Quilômetros",
    note: "Quantos quilômetros você pretende rodar por período.",
    targetLabel: "Quantos quilômetros por",
    unit: "distance",
  },
  {
    value: "later",
    label: "Criar depois",
    note: "Não quero definir agora.",
    targetLabel: "",
    unit: "currency",
  },
];

export const goalPeriodOptions = [
  { value: "daily", label: "Diária", short: "dia" },
  { value: "weekly", label: "Semanal", short: "semana" },
  { value: "monthly", label: "Mensal", short: "mês" },
] as const;

export type GoalPeriod = "daily" | "weekly" | "monthly";

export function findGoalType(value: string) {
  return goalTypeOptions.find((option) => option.value === value);
}

export function findGoalPeriod(value: string) {
  return goalPeriodOptions.find((option) => option.value === value);
}

export function formatGoalTarget(unit: "currency" | "hours" | "distance", value: number | string) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) {
    return unit === "currency" ? "R$ 0,00" : "0";
  }

  if (unit === "hours") {
    return `${numeric.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}h`;
  }

  if (unit === "distance") {
    return `${numeric.toLocaleString("pt-BR", { maximumFractionDigits: 0 })} km`;
  }

  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(numeric);
}

export function isFinancialGoalType(value: string) {
  return value === "revenue" || value === "profit";
}
