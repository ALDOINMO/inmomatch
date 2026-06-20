import { Client, Prisma, Property, PropertyStatus } from "@prisma/client";

type JsonRecord = Record<string, unknown>;

export type MatchComputation = {
  score: number;
  differences: string[];
  exclusions: string[];
};

function asNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asRecord(value: Prisma.JsonValue | null | undefined): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as JsonRecord) : {};
}

function wants(value: unknown) {
  return value !== undefined && value !== null && value !== "" && value !== "Indiferente";
}

function boolPreferenceSatisfied(required: unknown, available: unknown) {
  if (!wants(required)) return true;
  if (required === "SI" || required === true) return available === true || available === "SI";
  if (required === "NO" || required === false) return available === false || available === "NO";
  return true;
}

function compareList(required: unknown, available: unknown) {
  const req = Array.isArray(required) ? required.map(String) : wants(required) ? [String(required)] : [];
  const av = Array.isArray(available) ? available.map(String) : wants(available) ? [String(available)] : [];
  if (!req.length) return true;
  return req.some((item) => av.includes(item));
}

export function calculateMatch(property: Property, client: Client): MatchComputation {
  const differences: string[] = [];
  const exclusions: string[] = [];
  let score = 100;

  const features = asRecord(property.features);
  const services = asRecord(property.services);
  const quality = asRecord(property.quality);
  const fieldFeatures = asRecord(property.fieldFeatures);
  const requirements = asRecord(client.requirements);
  const fieldRequirements = asRecord(client.fieldRequirements);

  if (property.status !== PropertyStatus.ACTIVE) exclusions.push("La propiedad no esta activa.");
  if (!client.desiredTypes.includes(property.type)) exclusions.push("El tipo de bien no coincide.");
  if (Number(property.price) < Number(client.minBudget) || Number(property.price) > Number(client.maxBudget)) {
    exclusions.push("El valor queda fuera del presupuesto.");
  }
  if (client.desiredCities.length && !client.desiredCities.includes(property.city)) {
    exclusions.push("La localidad no esta dentro de las zonas buscadas.");
  }
  if (
  client.desiredNeighborhoods.length > 0 &&
  !client.desiredNeighborhoods.includes(
    `${property.city}|${property.neighborhood}`
  )
) {
  exclusions.push(
    "El barrio no esta dentro de las zonas buscadas."
  );
}
  if (client.financingNeeded && !property.financing) exclusions.push("El cliente necesita financiacion y la propiedad no la acepta.");
  if (client.hasTrade && !property.acceptsTrade) exclusions.push("El cliente ofrece permuta y la propiedad no la acepta.");
  if (client.hasTrade && property.acceptsTrade && client.tradePercent && property.tradePercent) {
    const delta = Math.abs(client.tradePercent - property.tradePercent);
    if (delta > 20) exclusions.push("La permuta supera la tolerancia de +-20%.");
  }
  if (client.needsCredit && features.creditReady !== true) exclusions.push("El cliente requiere apta credito y la propiedad no lo informa.");

  if (property.type === "CAMPO") {
    if (!compareList(fieldRequirements.soilAptitude, fieldFeatures.soilAptitude)) {
      exclusions.push("La aptitud del suelo del campo no coincide.");
    }
    const hectares = asNumber(fieldFeatures.hectares);
    const minHa = asNumber(fieldRequirements.minHectares);
    const maxHa = asNumber(fieldRequirements.maxHectares);
    if ((minHa && hectares < minHa) || (maxHa && hectares > maxHa)) {
      differences.push("La superficie en hectareas queda fuera del rango solicitado.");
      score -= 12;
    }
  }

  const weightedChecks: Array<[boolean, string, number]> = [
    [compareList(requirements.luz, services.luz), "Servicio de luz diferente", 10],
    [compareList(requirements.agua, services.agua), "Servicio de agua diferente", 10],
    [compareList(requirements.gas, services.gas), "Servicio de gas diferente", 6],
    [compareList(requirements.conectividad, services.conectividad), "Conectividad diferente", 5],
    [compareList(requirements.neighborhoodType, features.neighborhoodType), "Tipo de barrio diferente", 5],
    [compareList(requirements.access, features.access), "Acceso diferente", 5],
    [compareList(requirements.constructionTypes, features.constructionTypes), "Tipo de construccion diferente", 8],
    [compareList(requirements.generalState, quality.generalState), "Estado general diferente", 5],
    [boolPreferenceSatisfied(requirements.pool, features.pool), "Pileta no coincide", 4],
    [boolPreferenceSatisfied(requirements.garage, features.garage), "Cochera no coincide", 5],
    [boolPreferenceSatisfied(requirements.laundry, features.laundry), "Lavadero no coincide", 3],
    [boolPreferenceSatisfied(requirements.furnished, features.furnished), "Amoblado no coincide", 3],
  ];

  for (const [ok, label, penalty] of weightedChecks) {
    if (!ok) {
      differences.push(label);
      score -= penalty;
    }
  }

  const bedrooms = asNumber(features.bedrooms);
  const requestedBedrooms = asNumber(requirements.bedrooms);
  if (requestedBedrooms && bedrooms < requestedBedrooms) exclusions.push("Dormitorios insuficientes.");

  const bathrooms = asNumber(features.bathrooms);
  const requestedBathrooms = asNumber(requirements.bathrooms);
  if (requestedBathrooms && bathrooms < requestedBathrooms) {
    differences.push("Banos por debajo de lo solicitado.");
    score -= 8;
  }

  const totalArea = asNumber(features.totalArea);
  const requestedTotalArea = asNumber(requirements.minTotalArea);
  if (requestedTotalArea && totalArea < requestedTotalArea) {
    differences.push("Superficie total menor a la solicitada.");
    score -= 10;
  }

  if (exclusions.length) return { score: 0, differences, exclusions };
  return { score: Math.max(0, Math.min(100, Math.round(score))), differences, exclusions };
}
