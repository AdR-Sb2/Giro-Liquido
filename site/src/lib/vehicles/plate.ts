const MERCOSUL_PLATE_LENGTH = 7;
const OLD_PLATE_LENGTH = 6;

export function formatLicensePlate(value: string): string {
  const raw = (value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, MERCOSUL_PLATE_LENGTH);

  if (raw.length <= 3) {
    return raw;
  }

  if (raw.length <= OLD_PLATE_LENGTH) {
    return `${raw.slice(0, 3)}-${raw.slice(3)}`;
  }

  return `${raw.slice(0, 3)}${raw.slice(3)}`;
}

export function isValidLicensePlate(value: string): boolean {
  const raw = (value ?? "")
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "");

  if (raw.length === MERCOSUL_PLATE_LENGTH) {
    return /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/.test(raw);
  }

  if (raw.length === OLD_PLATE_LENGTH) {
    return /^[A-Z]{3}[0-9]{4}$/.test(raw);
  }

  return false;
}
