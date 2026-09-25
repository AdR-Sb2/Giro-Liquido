export type City = {
  id: number;
  name: string;
  stateCode: string;
};

type IbgeCityResponse = {
  id: number;
  nome: string;
};

const cache = new Map<string, City[]>();
const pending = new Map<string, Promise<City[]>>();

const REQUEST_TIMEOUT_MS = 10000;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

export function normalizeSearch(value: string) {
  return normalize(value);
}

export function filterCities(cities: City[], query: string) {
  const term = normalize(query);

  if (!term) {
    return cities;
  }

  const startsWith: City[] = [];
  const includes: City[] = [];

  for (const city of cities) {
    const name = normalize(city.name);

    if (name.startsWith(term)) {
      startsWith.push(city);
    } else if (name.includes(term)) {
      includes.push(city);
    }
  }

  return [...startsWith, ...includes];
}

export async function fetchCitiesByState(stateCode: string): Promise<City[]> {
  const code = stateCode.trim().slice(0, 2).toUpperCase();

  if (!/^[A-Z]{2}$/.test(code)) {
    return [];
  }

  const cached = cache.get(code);
  if (cached) {
    return cached;
  }

  const inFlight = pending.get(code);
  if (inFlight) {
    return inFlight;
  }

  const request = (async () => {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(
        `https://servicodados.ibge.gov.br/api/v1/localidades/estados/${code}/municipios`,
        { signal: controller.signal, cache: "no-store" },
      );

      if (!response.ok) {
        throw new Error("Não foi possível carregar as cidades agora.");
      }

      const payload = (await response.json()) as IbgeCityResponse[];
      const cities = payload
        .filter((item) => typeof item?.nome === "string" && typeof item?.id === "number")
        .map((item) => ({ id: item.id, name: item.nome, stateCode: code }))
        .sort((left, right) => left.name.localeCompare(right.name, "pt-BR"));

      cache.set(code, cities);
      return cities;
    } finally {
      clearTimeout(timeout);
      pending.delete(code);
    }
  })();

  pending.set(code, request);

  return request;
}
