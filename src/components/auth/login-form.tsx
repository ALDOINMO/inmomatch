"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginAction } from "@/actions/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/field";
import { loginSchema } from "@/validators/auth";

type Values = { email: string; password: string };

export function LoginForm() {
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();
  const form = useForm<Values>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });

  return (
    <form
      className="grid gap-4"
      onSubmit={form.handleSubmit((values) => startTransition(async () => {
        const result = await loginAction(values);
        if (result?.error) setError(result.error);
      }))}
    >
      <Field label="Email" error={form.formState.errors.email?.message}><Input type="email" {...form.register("email")} /></Field>
      <Field label="Contraseña" error={form.formState.errors.password?.message}><Input type="password" {...form.register("password")} /></Field>
      {error ? <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">{error}</p> : null}
      <Button disabled={pending}>{pending ? "Ingresando..." : "Ingresar"}</Button>
      <div className="flex justify-between text-sm text-muted">
        <Link href="/register">Crear cuenta</Link>
        <Link href="/reset-password">Recuperar contraseña</Link>
      </div>
    </form>
  );
}
