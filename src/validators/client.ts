import { z } from "zod";

export const clientSchema = z.object({
  firstName: z.string().min(2).max(80),
  lastName: z.string().min(2).max(80),
  phone: z.string().optional(),
  email: z.string().email().optional().or(z.literal("")),
  minBudget: z.coerce.number().min(0),
  maxBudget: z.coerce.number().positive(),
  currency: z.enum(["USD", "ARS"]).default("USD"),
  desiredTypes: z.array(z.enum(["CASA", "DEPARTAMENTO", "TERRENO", "CAMPO", "LOCAL", "OFICINA", "CABANA", "GALPON"])).min(1),
  desiredCities: z
  .array(z.string())
  .min(
    1,
    "Seleccioná al menos una localidad"
  )
  .max(
    4,
    "Máximo 4 localidades"
  ),
  financingNeeded: z.coerce.boolean().default(false),
  financingPercent: z.coerce.number().int().min(0).max(100).optional(),
  hasTrade: z.coerce.boolean().default(false),
  tradePercent: z.coerce.number().int().min(0).max(100).optional(),
  needsCredit: z.coerce.boolean().default(false),
  minMatchThreshold: z.coerce.number().int().min(0).max(100).default(70),
  bedrooms: z.coerce.number().int().min(0).optional(),
  bathrooms: z.coerce.number().int().min(0).optional(),
  minTotalArea: z.coerce.number().min(0).optional(),
  luz: z.enum([
  "RED",
  "SOLAR",
  "GENERADOR",
  "SIN_SERVICIO",
]).optional(),

agua: z.enum([
  "RED",
  "POZO",
  "VERTIENTE",
  "SIN_SERVICIO",
]).optional(),

gas: z.enum([
  "RED",
  "GARRAFA",
  "ZEPPELIN",
  "SIN_SERVICIO",
]).optional(),

conectividad: z.enum([
  "FIBRA",
  "CABLE",
  "4G_5G",
  "SATELITAL",
  "SIN_SERVICIO",
]).optional(),
  constructionTypes: z.enum([
  "TRADICIONAL",
  "STEEL_FRAME",
  "WOOD_FRAME",
  "SECO",
  "MIXTO",
]).optional(),
  pool: z.string().optional(),
  garage: z.string().optional(),
  neighborhoodType: z.enum([
  "CENTRO",
  "BARRIO_ABIERTO",
  "BARRIO_CERRADO",
  "COUNTRY",
  "PRIVADO",
]).optional(),
  access: z.enum([
  "ASFALTO",
  "RIPIO",
  "TIERRA",
]).optional(),
  soilAptitude: z.string().optional(),
  minHectares: z.coerce.number().min(0).optional(),
  maxHectares: z.coerce.number().min(0).optional(),
});
