"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerAction } from "@/actions/auth";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { registerSchema } from "@/validators/auth";

type Values = {
  firstName: string; lastName: string; email: string; password: string; phone: string; licenseNumber: string;
  realEstateName: string; realEstatePhone: string; realEstateAddress: string; neighborhood?: string; city: string;
};

export function RegisterForm() {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const form = useForm<Values>({ resolver: zodResolver(registerSchema) });

  return (
    <form
      className="grid gap-4"
      onSubmit={form.handleSubmit((values) => startTransition(async () => {
        const result = await registerAction(values);
        if (result?.error) setError(result.error);
      }))}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre" error={form.formState.errors.firstName?.message}><Input {...form.register("firstName")} /></Field>
        <Field label="Apellido" error={form.formState.errors.lastName?.message}><Input {...form.register("lastName")} /></Field>
        <Field label="Email" error={form.formState.errors.email?.message}><Input type="email" {...form.register("email")} /></Field>
        <Field label="Contrasena" error={form.formState.errors.password?.message}><Input type="password" {...form.register("password")} /></Field>
        <Field label="Celular particular" error={form.formState.errors.phone?.message}><Input {...form.register("phone")} /></Field>
        <Field label="Matricula profesional" error={form.formState.errors.licenseNumber?.message}><Input {...form.register("licenseNumber")} /></Field>
      </div>
      <div className="border-t border-border pt-4">
        <h2 className="mb-4 font-semibold">Inmobiliaria</h2>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Nombre comercial" error={form.formState.errors.realEstateName?.message}><Input {...form.register("realEstateName")} /></Field>
          <Field label="Telefono" error={form.formState.errors.realEstatePhone?.message}><Input {...form.register("realEstatePhone")} /></Field>
          <Field label="Direccion fisica" error={form.formState.errors.realEstateAddress?.message}><Input {...form.register("realEstateAddress")} /></Field>
          <Field label="Barrio"><Input {...form.register("neighborhood")} /></Field>
          <Field label="Localidad" error={form.formState.errors.city?.message}><Input {...form.register("city")} /></Field>
        </div>
      </div>
      {error ? <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}
      <Button disabled={pending}>{pending ? "Creando..." : "Crear cuenta pendiente de validacion"}</Button>
      <Link href="/login" className="text-sm text-muted">Ya tengo cuenta</Link>
    </form>
  );
}
