import Link from "next/link";

import { Role } from "@prisma/client";

import {
  acceptMatchAction,
  rejectHighMatchAction,
} from "@/actions/matches";

import { AppShell } from "@/components/app-shell";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getScoreColor(score: number) {
  if (score >= 90) {
    return "border-green-500/40 bg-green-500/10 text-green-400";
  }

  if (score >= 75) {
    return "border-yellow-500/40 bg-yellow-500/10 text-yellow-400";
  }

  if (score >= 50) {
    return "border-orange-500/40 bg-orange-500/10 text-orange-400";
  }

  return "border-red-500/40 bg-red-500/10 text-red-400";
}

function getStatus(match: any) {
  switch (match.status) {
    case "PROPOSED":
      return {
        label: "Match propuesto",
        className:
          "border-blue-500/30 bg-blue-500/10 text-blue-400",
      };

    case "WAITING_OTHER_SIDE":
      return {
        label:
          "Esperando respuesta del colega",
        className:
          "border-yellow-500/30 bg-yellow-500/10 text-yellow-400",
      };

    case "CONTACT_OPENED":
      return {
        label: "Contacto desbloqueado",
        className:
          "border-green-500/30 bg-green-500/10 text-green-400",
      };

    case "REJECTED":
      return {
        label: "Match rechazado",
        className:
          "border-red-500/30 bg-red-500/10 text-red-400",
      };

    case "LATENT":
      return {
        label: "Match latente",
        className:
          "border-orange-500/30 bg-orange-500/10 text-orange-400",
      };

    case "CONFLICT":
      return {
        label:
          "Conflicto entre colegas",
        className:
          "border-red-500/30 bg-red-500/10 text-red-400",
      };

    default:
      return {
        label: match.status,
        className:
          "border-border bg-muted text-muted",
      };
  }
}

export default async function MatchesPage() {
  const user = await requireUser();

  const matches =
    await prisma.match.findMany({
      where:
        user.role ===
        Role.SUPER_ADMIN
          ? {}
          : {
              OR: [
                {
                  client: {
                    realEstateId:
                      user.realEstateId ??
                      "",
                  },
                },

                {
                  property: {
                    realEstateId:
                      user.realEstateId ??
                      "",
                  },
                },
              ],
            },

      include: {
        client: {
          include: {
            realEstate: true,
          },
        },

        property: {
          include: {
            realEstate: true,
          },
        },
      },

      orderBy: [
        {
          score: "desc",
        },

        {
          createdAt: "desc",
        },
      ],
    });

  return (
    <AppShell user={user}>
      <div className="mb-8">
        <h2 className="text-3xl font-semibold">
          Matches inteligentes
        </h2>

        <p className="mt-2 text-sm text-muted">
          InmoMatch analiza
          compatibilidad, excluyentes,
          diferencias y oportunidades
          reales entre colegas.
        </p>
      </div>

      <div className="grid gap-5">
        {matches.map((match) => {
          const status =
            getStatus(match);

          const differences =
            (match.differences as string[]) ??
            [];

          const exclusions =
            (match.exclusions as string[]) ??
            [];

          return (
            <Card
              key={match.id}
              className={`transition hover:border-accent/40 hover:bg-white/[0.02] ${
                match.status ===
                "REJECTED"
                  ? "opacity-70"
                  : ""
              }`}
            >
              <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
                <Link
                  href={`/matches/${match.id}`}
                  className="flex-1"
                >
                  <div className="flex flex-col gap-5 md:flex-row">
                    <div
                      className={`flex h-28 w-28 shrink-0 flex-col items-center justify-center rounded-2xl border text-center ${getScoreColor(
                        match.score
                      )}`}
                    >
                      <span className="text-4xl font-bold">
                        {match.score}%
                      </span>

                      <span className="mt-1 text-xs uppercase tracking-wide">
                        Match
                      </span>
                    </div>

                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-3">
                        <h3 className="text-xl font-semibold">
                          {
                            match.client
                              .firstName
                          }{" "}
                          {
                            match.client
                              .lastName
                          }{" "}
                          ↔{" "}
                          {
                            match.property
                              .title
                          }
                        </h3>

                        <div
                          className={`rounded-full border px-3 py-1 text-xs font-medium ${status.className}`}
                        >
                          {status.label}
                        </div>
                      </div>

                      <p className="mt-2 text-sm text-muted">
                        {
                          match.client
                            .realEstate
                            .name
                        }{" "}
                        ·{" "}
                        {
                          match.property
                            .realEstate
                            .name
                        }
                      </p>

                      <div className="mt-5 grid gap-4 md:grid-cols-2">
                        <div className="rounded-xl border border-green-500/20 bg-green-500/5 p-4">
                          <p className="mb-3 text-sm font-semibold text-green-400">
                            Coincidencias
                          </p>

                          <ul className="space-y-2 text-sm text-muted">
                            <li>
                              ✓ Match superior
                              al promedio
                            </li>

                            <li>
                              ✓ Tipo de
                              propiedad
                              compatible
                            </li>

                            <li>
                              ✓ Zona y
                              presupuesto
                              compatibles
                            </li>

                            {match.score >=
                            90 ? (
                              <li>
                                ✓ Match de
                                alta precisión
                              </li>
                            ) : null}
                          </ul>
                        </div>

                        <div className="rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4">
                          <p className="mb-3 text-sm font-semibold text-yellow-400">
                            Diferencias
                          </p>

                          {differences.length ? (
                            <ul className="space-y-2 text-sm text-muted">
                              {differences
                                .slice(0, 4)
                                .map(
                                  (
                                    item,
                                    index
                                  ) => (
                                    <li
                                      key={
                                        index
                                      }
                                    >
                                      ⚠ {item}
                                    </li>
                                  )
                                )}
                            </ul>
                          ) : (
                            <p className="text-sm text-muted">
                              Sin diferencias
                              relevantes.
                            </p>
                          )}
                        </div>
                      </div>

                      {exclusions.length ? (
                        <div className="mt-4 rounded-xl border border-red-500/20 bg-red-500/5 p-4">
                          <p className="mb-3 text-sm font-semibold text-red-400">
                            Exclusiones
                          </p>

                          <ul className="space-y-2 text-sm text-muted">
                            {exclusions.map(
                              (
                                item,
                                index
                              ) => (
                                <li
                                  key={
                                    index
                                  }
                                >
                                  🚫 {item}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      ) : null}

                      {match.status ===
                        "REJECTED" &&
                      match.score >=
                        90 ? (
                        <div className="mt-4 rounded-xl border border-orange-500/30 bg-orange-500/10 p-4">
                          <p className="text-sm font-medium text-orange-400">
                            ⚠ Match de alta
                            coincidencia
                            rechazado.
                          </p>

                          <p className="mt-1 text-sm text-muted">
                            Esto puede
                            indicar datos
                            desactualizados o
                            disponibilidad
                            incorrecta.
                          </p>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </Link>

                <div className="flex shrink-0 flex-row gap-2 lg:flex-col">
                  {match.status ===
                  "PROPOSED" ? (
                    <>
                      <form
                        action={acceptMatchAction.bind(
                          null,
                          match.id
                        )}
                      >
                        <Button
                          variant="secondary"
                          className="w-full"
                        >
                          Aceptar
                        </Button>
                      </form>

                      <form
                        action={rejectHighMatchAction.bind(
                          null,
                          match.id
                        )}
                      >
                        <Button
                          variant="danger"
                          className="w-full"
                        >
                          Rechazar
                        </Button>
                      </form>
                    </>
                  ) : match.status ===
                    "CONTACT_OPENED" ? (
                    <Link
                      href={`/matches/${match.id}`}
                    >
                      <Button className="w-full">
                        Ver contacto
                      </Button>
                    </Link>
                  ) : null}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </AppShell>
  );
}