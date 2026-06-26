"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientAction, updateClientAction } from "@/actions/clients";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { clientSchema } from "@/validators/client";
import { ClientLocalitiesSelector } from "@/components/client-localities-selector";
import { ClientNeighborhoodsSelector } from "@/components/client-neighborhoods-selector";

type Values = Record<string, unknown> & { desiredTypes?: string[] };

export function ClientForm({ client }: { client?: { id: string; [key: string]: unknown } }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const form = useForm<Values>({ resolver: zodResolver(clientSchema) as never, defaultValues: client ?? { currency: "USD", desiredTypes: ["CASA"], desiredCities: [], minMatchThreshold: 70 } });


  return (
    <form className="grid gap-5" onSubmit={form.handleSubmit((values) => startTransition(async () => {
      const result = client ? await updateClientAction(client.id, values) : await createClientAction(values);
      if (result?.error) setError(result.error);
    }))}>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Nombre"><Input {...form.register("firstName")} /></Field>
        <Field label="Apellido"><Input {...form.register("lastName")} /></Field>
        <Field label="Celular"><Input {...form.register("phone")} /></Field>
        <Field label="Email"><Input type="email" {...form.register("email")} /></Field>
        <Field label="Presupuesto minimo"><Input type="number" {...form.register("minBudget")} /></Field>
        <Field label="Presupuesto maximo"><Input type="number" {...form.register("maxBudget")} /></Field>
        <Field label="Moneda"><Select {...form.register("currency")}><option>USD</option><option>ARS</option></Select></Field>
        <Field label="Localidades buscadas">
  <ClientLocalitiesSelector
    value={
      (form.watch(
        "desiredCities"
      ) as string[]) ?? []
    }
    onChange={(value) =>
      form.setValue(
        "desiredCities",
        value
      )
    }
  />
</Field>

        <Field label="Umbral alerta %">
  <Input
    className="max-w-24"
    type="number"
    {...form.register(
      "minMatchThreshold"
    )}
  />
</Field>
      </div>
      {
  ((form.watch(
    "desiredCities"
  ) as string[]) ?? [])
    .length > 0 && (
      <Field label="Barrios buscados">
        <ClientNeighborhoodsSelector
          cities={
            (form.watch(
              "desiredCities"
            ) as string[]) ?? []
          }
          value={
            (form.watch(
              "desiredNeighborhoods"
            ) as string[]) ?? []
          }
          onChange={(value) =>
            form.setValue(
              "desiredNeighborhoods",
              value
            )
          }
        />
      </Field>
  )
}
      <div className="grid gap-3 md:grid-cols-4">
        {["CASA", "DEPARTAMENTO", "TERRENO", "CAMPO", "LOCAL", "OFICINA", "CABANA", "GALPON"].map((type) => (
          <label key={type} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
            <input type="checkbox" value={type} {...form.register("desiredTypes")} /> {type}
          </label>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Necesita financiación"><Select {...form.register("financingNeeded")}><option value="INDIFERENTE">Indiferente</option><option value="SI">Sí</option><option value="NO">No</option></Select></Field>
        <Field label="% financiacion"><Input type="number" {...form.register("financingPercent")} /></Field>
        <Field label="Tiene permuta"><Select {...form.register("hasTrade")}><option value="INDIFERENTE">Indiferente</option><option value="SI">Sí</option><option value="NO">No</option></Select></Field>
        <Field label="% permuta"><Input type="number" {...form.register("tradePercent")} /></Field>
        <Field label="Requiere apta crédito"><Select {...form.register("needsCredit")}><option value="INDIFERENTE">Indiferente</option><option value="SI">Sí</option><option value="NO">No</option></Select></Field>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Dormitorios min."><Input type="number" {...form.register("bedrooms")} /></Field>
        <Field label="Banos min."><Input type="number" {...form.register("bathrooms")} /></Field>
        <Field label="Sup. total min."><Input type="number" {...form.register("minTotalArea")} /></Field>
        <Field label="Pileta"><Select {...form.register("pool")}><option>Indiferente</option><option>SI</option><option>NO</option></Select></Field>
        <Field label="Cochera"><Select {...form.register("garage")}><option>Indiferente</option><option>SI</option><option>NO</option></Select></Field>
        <Field label="Luz">
  <Select {...form.register("luz")}>
    <option value="">Indiferente</option>
    <option value="RED">Red eléctrica</option>
    <option value="SOLAR">Solar</option>
    <option value="GENERADOR">Generador</option>
    <option value="SIN_SERVICIO">Sin servicio</option>
  </Select>
</Field>
<Field label="Agua">
  <Select {...form.register("agua")}>
    <option value="">Indiferente</option>
    <option value="RED">Red</option>
    <option value="POZO">Pozo</option>
    <option value="VERTIENTE">Vertiente</option>
    <option value="SIN_SERVICIO">Sin servicio</option>
  </Select>
</Field>
        <Field label="Gas">
  <Select {...form.register("gas")}>
    <option value="">Indiferente</option>
    <option value="RED">Red</option>
    <option value="GARRAFA">Garrafa</option>
    <option value="ZEPPELIN">Zeppelin</option>
    <option value="SIN_SERVICIO">Sin servicio</option>
  </Select>
</Field>
        <Field label="Conectividad">
  <Select {...form.register("conectividad")}>
    <option value="">Indiferente</option>
    <option value="FIBRA">Fibra óptica</option>
    <option value="CABLE">Cable</option>
    <option value="4G_5G">4G / 5G</option>
    <option value="SATELITAL">Satelital</option>
    <option value="SIN_SERVICIO">Sin servicio</option>
  </Select>
</Field>
        <Field label="Construcción">
  <Select {...form.register("constructionTypes")}>
    <option value="">Indiferente</option>
    <option value="TRADICIONAL">Tradicional</option>
    <option value="STEEL_FRAME">Steel Frame</option>
    <option value="WOOD_FRAME">Wood Frame</option>
    <option value="SECO">Construcción en seco</option>
    <option value="MIXTO">Mixto</option>
  </Select>
</Field>
        <Field label="Tipo barrio">
  <Select {...form.register("neighborhoodType")}>
    <option value="">Indiferente</option>
    <option value="CENTRO">Centro</option>
    <option value="BARRIO_ABIERTO">Barrio abierto</option>
    <option value="BARRIO_CERRADO">Barrio cerrado</option>
    <option value="COUNTRY">Country</option>
    <option value="PRIVADO">Privado</option>
  </Select>
</Field>
        <Field label="Acceso">
  <Select {...form.register("access")}>
    <option value="">Indiferente</option>
    <option value="ASFALTO">Asfalto</option>
    <option value="RIPIO">Ripio</option>
    <option value="TIERRA">Tierra</option>
  </Select>
</Field>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Aptitud suelo campo"><Input {...form.register("soilAptitude")} /></Field>
        <Field label="Hectareas min."><Input type="number" {...form.register("minHectares")} /></Field>
        <Field label="Hectareas max."><Input type="number" {...form.register("maxHectares")} /></Field>
      </div>
      {error ? <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}
      <Button className="w-fit" disabled={pending}>{pending ? "Guardando..." : "Guardar cliente"}</Button>
    </form>
  );
}
