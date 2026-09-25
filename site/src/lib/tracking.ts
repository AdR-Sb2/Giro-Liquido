export type TrackingPriority = {
  value: string;
  label: string;
  description: string;
  metricId: string;
};

export const trackingPriorityOptions: TrackingPriority[] = [
  {
    value: "revenue",
    label: "Quanto estou ganhando",
    description: "Faturamento bruto registrado.",
    metricId: "revenue",
  },
  {
    value: "expenses",
    label: "Quanto estou gastando",
    description: "Total de despesas do período.",
    metricId: "expenses",
  },
  {
    value: "profit",
    label: "Quanto realmente sobra",
    description: "Lucro líquido após os gastos.",
    metricId: "profit",
  },
  {
    value: "workload",
    label: "Quanto preciso trabalhar",
    description: "Horas e dias trabalhados.",
    metricId: "hours",
  },
  {
    value: "fuel",
    label: "Quanto gasto de combustível",
    description: "Gastos com combustível no período.",
    metricId: "fuel",
  },
  {
    value: "goals",
    label: "Minhas metas",
    description: "Progresso da meta ativa.",
    metricId: "goal",
  },
  {
    value: "productivity",
    label: "Minha produtividade",
    description: "R$/hora e R$/km.",
    metricId: "perHour",
  },
];

export function findTrackingPriority(value: string) {
  return trackingPriorityOptions.find((option) => option.value === value);
}

export function getProgressMessage(percent: number) {
  if (percent >= 100) {
    return "Tudo pronto! Seu RotaX está configurado. ✅";
  }

  if (percent >= 75) {
    return "Quase lá! Falta muito pouco. 🔥";
  }

  if (percent >= 45) {
    return "Falta pouco! 🚀";
  }

  if (percent >= 20) {
    return "Bom começo, continue!";
  }

  return "Vamos lá! 🚀";
}
