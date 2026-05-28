"use client";

import {
  useState,
  useTransition,
} from "react";

import Link from "next/link";

import { useRouter } from "next/navigation";

import { useForm } from "react-hook-form";

import { zodResolver } from "@hookform/resolvers/zod";

import { registerAction } from "@/actions/auth";

import { Field } from "@/components/field";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { registerSchema } from "@/validators/auth";

type Values = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  licenseNumber: string;

  realEstateName: string;
  realEstatePhone: string;
  realEstateAddress: string;

  neighborhood?: string;

  city: string;
};

export function RegisterForm() {
  const router =
    useRouter();

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState("");

  const [
    pending,
    startTransition,
  ] = useTransition();

  const form =
    useForm<Values>({
      resolver:
        zodResolver(
          registerSchema
        ),
    });

  return (
    <form
      className="grid gap-4"
      onSubmit={form.handleSubmit(
        (values) =>
          startTransition(
            async () => {
              setError("");
              setSuccess("");

              const result =
                await registerAction(
                  values
                );

              if (
                result?.error
              ) {
                setError(
                  result.error
                );

                return;
              }

              setSuccess(
                "Cuenta creada correctamente."
              );

              setTimeout(() => {
                router.push(
                  "/dashboard"
                );
              }, 1200);
            }
          )
      )}
    >
      <div className="grid gap-4 md:grid-cols-2">
        <Field
          label="Nombre"
          error={
            form.formState
              .errors
              .firstName
              ?.message
          }
        >
          <Input
            {...form.register(
              "firstName"
            )}
          />
        </Field>

        <Field
          label="Apellido"
          error={
            form.formState
              .errors
              .lastName
              ?.message
          }
        >
          <Input
            {...form.register(
              "lastName"
            )}
          />
        </Field>

        <Field
          label="Email"
          error={
            form.formState
              .errors.email
              ?.message
          }
        >
          <Input
            type="email"
            {...form.register(
              "email"
            )}
          />
        </Field>

        <Field
          label="Contraseña"
          error={
            form.formState
              .errors
              .password
              ?.message
          }
        >
          <Input
            type="password"
            {...form.register(
              "password"
            )}
          />
        </Field>

        <Field
          label="Celular particular"
          error={
            form.formState
              .errors.phone
              ?.message
          }
        >
          <Input
            {...form.register(
              "phone"
            )}
          />
        </Field>

        <Field
          label="Matrícula profesional"
          error={
            form.formState
              .errors
              .licenseNumber
              ?.message
          }
        >
          <Input
            {...form.register(
              "licenseNumber"
            )}
          />
        </Field>
      </div>

      <div className="border-t border-border pt-4">
        <h2 className="mb-4 font-semibold">
          Inmobiliaria
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label="Nombre comercial"
            error={
              form.formState
                .errors
                .realEstateName
                ?.message
            }
          >
            <Input
              {...form.register(
                "realEstateName"
              )}
            />
          </Field>

          <Field
            label="Teléfono"
            error={
              form.formState
                .errors
                .realEstatePhone
                ?.message
            }
          >
            <Input
              {...form.register(
                "realEstatePhone"
              )}
            />
          </Field>

          <Field
            label="Dirección física"
            error={
              form.formState
                .errors
                .realEstateAddress
                ?.message
            }
          >
            <Input
              {...form.register(
                "realEstateAddress"
              )}
            />
          </Field>

          <Field label="Barrio">
            <Input
              {...form.register(
                "neighborhood"
              )}
            />
          </Field>

          <Field
            label="Localidad"
            error={
              form.formState
                .errors.city
                ?.message
            }
          >
            <Input
              {...form.register(
                "city"
              )}
            />
          </Field>
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-400">
          {error}
        </p>
      ) : null}

      {success ? (
        <p className="rounded-md border border-green-500/40 bg-green-500/10 p-3 text-sm text-green-400">
          {success}
        </p>
      ) : null}

      <Button
        disabled={pending}
      >
        {pending
          ? "Creando cuenta..."
          : "Crear cuenta pendiente de validación"}
      </Button>

      <Link
        href="/login"
        className="text-sm text-muted"
      >
        Ya tengo cuenta
      </Link>
    </form>
  );
}