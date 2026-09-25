export type FuelTypeOption = {
  value: string;
  label: string;
};

export const fuelTypeOptions: FuelTypeOption[] = [
  { value: "gasoline", label: "Gasolina" },
  { value: "ethanol", label: "Etanol" },
  { value: "flex", label: "Flex" },
  { value: "diesel", label: "Diesel" },
  { value: "gnv", label: "GNV" },
  { value: "electric", label: "Elétrico" },
  { value: "hybrid", label: "Híbrido" },
  { value: "other", label: "Outro" },
];

export function findFuelTypeLabel(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return fuelTypeOptions.find((option) => option.value === value)?.label ?? value;
}

const motorcycleBrands = [
  "Bajaj",
  "BMW",
  "Ducati",
  "Haojue",
  "Harley-Davidson",
  "Honda",
  "Jialing",
  "Kawasaki",
  "Kymco",
  "Royal Enfield",
  "Suzuki",
  "Triumph",
  "Yamaha",
];

const carBrands = [
  "Audi",
  "BMW",
  "BYD",
  "Caoa Chery",
  "Chevrolet",
  "Citroën",
  "Fiat",
  "Ford",
  "Haval",
  "Honda",
  "Hyundai",
  "Jeep",
  "Kia",
  "Land Rover",
  "Mercedes-Benz",
  "Mitsubishi",
  "Nissan",
  "Peugeot",
  "Renault",
  "Toyota",
  "Volkswagen",
  "Volvo",
];

const bicycleBrands = [
  "Aroe",
  "Athlon",
  "Brompton",
  "Caloi",
  "Continental",
  "Giant",
  "Shimano",
  "Specialized",
  "Speed",
  "Trek",
];

export function getVehicleBrands(vehicleType: string): string[] {
  if (vehicleType === "motorcycle") {
    return motorcycleBrands;
  }

  if (vehicleType === "car") {
    return carBrands;
  }

  if (vehicleType === "bicycle") {
    return bicycleBrands;
  }

  return [];
}

const CURRENT_YEAR = new Date().getFullYear();
const EARLIEST_VEHICLE_YEAR = 1970;

export function getVehicleYears(): number[] {
  const years: number[] = [];

  for (let year = CURRENT_YEAR + 1; year >= EARLIEST_VEHICLE_YEAR; year -= 1) {
    years.push(year);
  }

  return years;
}

export function isValidVehicleYear(year: number): boolean {
  return year >= EARLIEST_VEHICLE_YEAR && year <= CURRENT_YEAR + 1;
}

export type OwnershipOption = {
  value: string;
  label: string;
  description: string;
};

export const ownershipOptions: OwnershipOption[] = [
  { value: "owned", label: "Meu", description: "O veículo é seu." },
  { value: "rented", label: "Alugado", description: "Você paga para usar." },
  { value: "borrowed", label: "Emprestado", description: "Está com alguém emprestado." },
  { value: "financed", label: "Financiado", description: "Você está pagando parcelas." },
  { value: "other", label: "Outro", description: "Depende, deixo em branco." },
];

export const rentalPeriodicityOptions = [
  { value: "daily", label: "Diário" },
  { value: "weekly", label: "Semanal" },
  { value: "monthly", label: "Mensal" },
] as const;

export function findOwnershipLabel(value: string | null | undefined): string {
  if (!value) {
    return "";
  }

  return ownershipOptions.find((option) => option.value === value)?.label ?? value;
}
