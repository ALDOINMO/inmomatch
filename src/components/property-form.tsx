"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPropertyAction, updatePropertyAction } from "@/actions/properties";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { propertySchema } from "@/validators/property";

type Values = Record<string, unknown>;

export function PropertyForm({ property }: { property?: { id: string; [key: string]: unknown } }) {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const form = useForm<Values>({ resolver: zodResolver(propertySchema) as never, defaultValues: property ?? { currency: "USD", type: "CASA" } });
  const type = form.watch("type");

  return (
    <form className="grid gap-5" onSubmit={form.handleSubmit((values) => startTransition(async () => {
      const result = property ? await updatePropertyAction(property.id, values) : await createPropertyAction(values);
      if (result?.error) setError(result.error);
    }))}>
      <div className="grid gap-4 md:grid-cols-3">
        <Field label="Titulo"><Input {...form.register("title")} /></Field>
        <Field label="Nomenclatura catastral"><Input {...form.register("cadastralId")} /></Field>
        <Field label="Tipo de bien"><Select {...form.register("type")}><option>CASA</option><option>DEPARTAMENTO</option><option>TERRENO</option><option>CAMPO</option><option>LOCAL</option><option>OFICINA</option><option>CABANA</option><option>GALPON</option></Select></Field>
        <Field label="Valor"><Input type="number" {...form.register("price")} /></Field>
        <Field label="Moneda"><Select {...form.register("currency")}><option>USD</option><option>ARS</option></Select></Field>
        <Field label="Documentacion"><Input {...form.register("documentation")} placeholder="Escritura, boleto, mensura..." /></Field>
        <Field label="Direccion exacta"><Input {...form.register("address")} /></Field>
        <Field label="Localidad"><Input {...form.register("city")} /></Field>
        <Field label="Barrio"><Input {...form.register("neighborhood")} /></Field>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Financiacion"><Select {...form.register("financing")}><option value="false">No</option><option value="true">Si</option></Select></Field>
        <Field label="% financiacion"><Input type="number" {...form.register("financingPercent")} /></Field>
        <Field label="Acepta permuta"><Select {...form.register("acceptsTrade")}><option value="false">No</option><option value="true">Si</option></Select></Field>
        <Field label="% permuta"><Input type="number" {...form.register("tradePercent")} /></Field>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Luz"><Input {...form.register("luz")} placeholder="Red, Solar..." /></Field>
        <Field label="Agua"><Input {...form.register("agua")} placeholder="Red, Pozo..." /></Field>
        <Field label="Gas"><Input {...form.register("gas")} placeholder="Red, Garrafa..." /></Field>
        <Field label="Conectividad"><Input {...form.register("conectividad")} placeholder="Fibra, Satelital..." /></Field>
      </div>
      {type === "CAMPO" ? (
        <div className="grid gap-4 md:grid-cols-3">
          <Field label="Aptitud suelo"><Input {...form.register("soilAptitude")} placeholder="Agricola, Ganadero..." /></Field>
          <Field label="Hectareas"><Input type="number" {...form.register("hectares")} /></Field>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-4">
          <Field label="Dormitorios"><Input type="number" {...form.register("bedrooms")} /></Field>
          <Field label="Banos totales"><Input type="number" {...form.register("bathrooms")} /></Field>
          <Field label="Sup. cubierta m2"><Input type="number" {...form.register("coveredArea")} /></Field>
          <Field label="Sup. total m2"><Input type="number" {...form.register("totalArea")} /></Field>
          <Field label="Apta credito"><Select {...form.register("creditReady")}><option value="false">No</option><option value="true">Si</option></Select></Field>
          <Field label="Pileta"><Select {...form.register("pool")}><option value="false">No</option><option value="true">Si</option></Select></Field>
          <Field label="Cochera"><Select {...form.register("garage")}><option value="false">No</option><option value="true">Si</option></Select></Field>
          <Field label="Tipo barrio"><Input {...form.register("neighborhoodType")} /></Field>
          <Field label="Acceso"><Input {...form.register("access")} /></Field>
          <Field label="Construccion"><Input {...form.register("constructionTypes")} placeholder="Tradicional, Seco" /></Field>
          <Field label="Estado general"><Input {...form.register("generalState")} /></Field>
        </div>
      )}
      <Field label="Comentarios"><Textarea {...form.register("description")} /></Field>
      {error ? <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}
      <Button className="w-fit" disabled={pending}>{pending ? "Guardando..." : "Guardar propiedad"}</Button>
    </form>
  );
}
