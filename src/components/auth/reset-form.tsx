"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { resetPasswordAction } from "@/actions/auth";
import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { resetPasswordSchema } from "@/validators/auth";

export function ResetForm() {
  const [message, setMessage] = useState("");
  const [pending, startTransition] = useTransition();
  const form = useForm<{ email: string }>({ resolver: zodResolver(resetPasswordSchema) });

  return (
    <form className="grid gap-4" onSubmit={form.handleSubmit((values) => startTransition(async () => {
      const result = await resetPasswordAction(values);
      setMessage(result?.error ?? "Te enviamos el enlace de recuperacion si el email existe.");
    }))}>
      <Field label="Email" error={form.formState.errors.email?.message}><Input type="email" {...form.register("email")} /></Field>
      {message ? <p className="rounded-md border border-border bg-card p-3 text-sm text-muted">{message}</p> : null}
      <Button disabled={pending}>{pending ? "Enviando..." : "Enviar recuperacion"}</Button>
    </form>
  );
}
