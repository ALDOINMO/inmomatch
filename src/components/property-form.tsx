"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createPropertyAction, updatePropertyAction } from "@/actions/properties";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input, Select, Textarea } from "@/components/ui/input";
import { propertySchema } from "@/validators/property";
import { GeoRefLocalitySelect } from "@/components/georef-locality-select";
import { NeighborhoodSelect } from "@/components/neighborhood-select";

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
        <Field label="Documentación"><Select {...form.register("documentation")}><option value="">Seleccionar...</option><option value="ESCRITURA">Escritura</option><option value="BOLETO_COMPRAVENTA">Boleto de compraventa</option><option value="CESION_DERECHOS">Cesión de derechos</option><option value="SUCESION">Sucesión</option><option value="POSESION">Posesión</option><option value="PRIMER_TESTIMONIO">Primer testimonio</option><option value="OTRO">Otro</option></Select></Field>{form.watch("documentation")==="OTRO"&&<Field label="Detalle de la documentación"><Input {...form.register("documentationOther")} placeholder="Ej: Boleto con posesión, Cesión en trámite, Escritura en proceso..." /></Field>}
        <Field label="Direccion exacta"><Input {...form.register("address")} /></Field>
        <Field label="Localidad">
  <GeoRefLocalitySelect
  value={{
    province: String(
      form.watch("province") ?? ""
    ),

    department: String(
      form.watch("department") ?? ""
    ),

    city: String(
      form.watch("city") ?? ""
    ),
  }}
  onChange={(value) => {
    form.setValue(
      "province",
      value.province
    );

    form.setValue(
      "department",
      value.department
    );

    form.setValue(
      "city",
      value.city
    );

    form.setValue(
      "neighborhood",
      ""
    );
  }}
/>
</Field>
        <Field label="Barrio">
  <NeighborhoodSelect
    city={String(
      form.watch("city") ?? ""
    )}
    value={String(
      form.watch(
        "neighborhood"
      ) ?? ""
    )}
    onChange={(value) =>
      form.setValue(
        "neighborhood",
        value
      )
    }
  />
</Field>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Financiacion"><Select {...form.register("financing")}><option value="false">No</option><option value="true">Si</option></Select></Field>
        <Field label="% financiacion"><Input type="number" {...form.register("financingPercent")} /></Field>
        <Field label="Acepta permuta"><Select {...form.register("acceptsTrade")}><option value="false">No</option><option value="true">Si</option></Select></Field>
        <Field label="% permuta"><Input type="number" {...form.register("tradePercent")} /></Field>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <Field label="Luz">
  <Select
    {...form.register(
      "luz"
    )}
  >
    <option value="">
      Seleccionar
    </option>

    <option value="RED">
      Red eléctrica
    </option>

    <option value="SOLAR">
      Solar
    </option>

    <option value="GENERADOR">
      Generador
    </option>

    <option value="SIN_SERVICIO">
      Sin servicio
    </option>
  </Select>
</Field>
        <Field label="Agua">
  <Select {...form.register("agua")}>
    <option value="">Seleccionar</option>
    <option value="RED">Red</option>
    <option value="POZO">Pozo</option>
    <option value="VERTIENTE">Vertiente</option>
    <option value="SIN_SERVICIO">Sin servicio</option>
  </Select>
</Field>
        <Field label="Gas">
  <Select {...form.register("gas")}>
    <option value="">Seleccionar</option>
    <option value="RED">Red</option>
    <option value="GARRAFA">Garrafa</option>
    <option value="ZEPPELIN">Zeppelin</option>
    <option value="SIN_SERVICIO">Sin servicio</option>
  </Select>
</Field>
        <Field label="Conectividad">
  <Select {...form.register("conectividad")}>
    <option value="">Seleccionar</option>
    <option value="FIBRA">Fibra óptica</option>
    <option value="CABLE">Cable</option>
    <option value="4G_5G">4G / 5G</option>
    <option value="SATELITAL">Satelital</option>
    <option value="SIN_SERVICIO">Sin servicio</option>
  </Select>
</Field>
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
          <Field label="Tipo barrio">
  <Select
    {...form.register(
      "neighborhoodType"
    )}
  >
    <option value="">
      Seleccionar
    </option>

    <option value="CENTRO">
      Centro
    </option>

    <option value="BARRIO_ABIERTO">
      Barrio abierto
    </option>

    <option value="BARRIO_CERRADO">
      Barrio cerrado
    </option>

    <option value="COUNTRY">
      Country
    </option>

    <option value="PRIVADO">
      Privado
    </option>
  </Select>
</Field>
          <Field label="Acceso">
  <Select {...form.register("access")}>
    <option value="">
      Seleccionar
    </option>

    <option value="ASFALTO">
      Asfalto
    </option>

    <option value="RIPIO">
      Ripio
    </option>

    <option value="TIERRA">
      Tierra
    </option>
  </Select>
</Field>
          <Field label="Construcción">
  <Select
    {...form.register(
      "constructionTypes"
    )}
  >
    <option value="">
      Seleccionar
    </option>

    <option value="TRADICIONAL">
      Tradicional
    </option>

    <option value="STEEL_FRAME">
      Steel Frame
    </option>

    <option value="WOOD_FRAME">
      Wood Frame
    </option>

    <option value="SECO">
      Construcción en seco
    </option>

    <option value="MIXTO">
      Mixto
    </option>
  </Select>
</Field>
          <Field label="Estado general">
  <Select {...form.register("generalState")}>
    <option value="">
      Seleccionar
    </option>

    <option value="EXCELENTE">
      Excelente
    </option>

    <option value="MUY_BUENO">
      Muy bueno
    </option>

    <option value="BUENO">
      Bueno
    </option>

    <option value="A_REFACCIONAR">
      A refaccionar
    </option>
  </Select>
</Field>
        </div>
      )}
      <Field label="Comentarios"><Textarea {...form.register("description")} /></Field>
      {error ? <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}
      <Button className="w-fit" disabled={pending}>{pending ? "Guardando..." : "Guardar propiedad"}</Button>
    </form>
  );
}
