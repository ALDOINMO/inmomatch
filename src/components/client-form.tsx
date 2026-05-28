"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createClientAction, updateClientAction } from "@/actions/clients";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input, Select } from "@/components/ui/input";
import { clientSchema } from "@/validators/client";

type Values = Record<string, unknown> & { desiredTypes?: string[] };

export function ClientForm({ client }: { client?: { id: string; [key: string]: unknown } }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const form = useForm<Values>({ resolver: zodResolver(clientSchema) as never, defaultValues: client ?? { currency: "USD", desiredTypes: ["CASA"], minMatchThreshold: 70 } });

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
        <Field label="Localidades buscadas"><Input {...form.register("desiredCities")} placeholder="Villa Rumipal, Embalse" /></Field>
        <Field label="Umbral alerta %"><Input type="number" {...form.register("minMatchThreshold")} /></Field>
      </div>
      <div className="grid gap-3 md:grid-cols-4">
        {["CASA", "DEPARTAMENTO", "TERRENO", "CAMPO", "LOCAL", "OFICINA", "CABANA", "GALPON"].map((type) => (
          <label key={type} className="flex items-center gap-2 rounded-md border border-border bg-card px-3 py-2 text-sm">
            <input type="checkbox" value={type} {...form.register("desiredTypes")} /> {type}
          </label>
        ))}
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Necesita financiacion"><Select {...form.register("financingNeeded")}><option value="false">No</option><option value="true">Si</option></Select></Field>
        <Field label="% financiacion"><Input type="number" {...form.register("financingPercent")} /></Field>
        <Field label="Tiene permuta"><Select {...form.register("hasTrade")}><option value="false">No</option><option value="true">Si</option></Select></Field>
        <Field label="% permuta"><Input type="number" {...form.register("tradePercent")} /></Field>
        <Field label="Requiere apta credito"><Select {...form.register("needsCredit")}><option value="false">No</option><option value="true">Si</option></Select></Field>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Dormitorios min."><Input type="number" {...form.register("bedrooms")} /></Field>
        <Field label="Banos min."><Input type="number" {...form.register("bathrooms")} /></Field>
        <Field label="Sup. total min."><Input type="number" {...form.register("minTotalArea")} /></Field>
        <Field label="Pileta"><Select {...form.register("pool")}><option>Indiferente</option><option>SI</option><option>NO</option></Select></Field>
        <Field label="Cochera"><Select {...form.register("garage")}><option>Indiferente</option><option>SI</option><option>NO</option></Select></Field>
        <Field label="Luz"><Input {...form.register("luz")} placeholder="Red, Solar, Indiferente" /></Field>
        <Field label="Agua"><Input {...form.register("agua")} /></Field>
        <Field label="Gas"><Input {...form.register("gas")} /></Field>
        <Field label="Conectividad"><Input {...form.register("conectividad")} /></Field>
        <Field label="Construccion"><Input {...form.register("constructionTypes")} /></Field>
        <Field label="Tipo barrio"><Input {...form.register("neighborhoodType")} /></Field>
        <Field label="Acceso"><Input {...form.register("access")} /></Field>
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
