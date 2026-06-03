"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { createAgentAction } from "../actions/users";

import { Field } from "@/components/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Values = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
};

export function UserForm() {
  const [error, setError] = useState("");
  const [pending, startTransition] =
    useTransition();

  const form = useForm<Values>({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
    },
  });

  return (
    <form
      className="grid gap-5"
      onSubmit={form.handleSubmit(
        (values) =>
          startTransition(async () => {
            const result =
              await createAgentAction(
                values
              );

            if (result?.error) {
              setError(
                result.error
              );
            }
          })
      )}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field label="Nombre">
          <Input
            {...form.register(
              "firstName"
            )}
          />
        </Field>

        <Field label="Apellido">
          <Input
            {...form.register(
              "lastName"
            )}
          />
        </Field>

        <Field label="Email">
          <Input
            type="email"
            {...form.register(
              "email"
            )}
          />
        </Field>

        <Field label="Contraseña">
          <Input
            type="password"
            {...form.register(
              "password"
            )}
          />
        </Field>
      </div>

      {error ? (
        <p className="rounded-md border border-danger/40 bg-danger/10 p-3 text-sm text-danger">
          {error}
        </p>
      ) : null}

      <Button
        className="w-fit"
        disabled={pending}
      >
        {pending
          ? "Creando..."
          : "Crear corredor"}
      </Button>
    </form>
  );
}