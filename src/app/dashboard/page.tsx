import Link from "next/link";

import { Role } from "@prisma/client";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { AppShell } from "@/components/app-shell";

import { Button } from "@/components/ui/button";

import {
  Card,
  StatCard,
} from "@/components/ui/card";

export default async function DashboardPage() {
  const user =
    await requireUser();

  const tenantFilter =
    user.role ===
    Role.SUPER_ADMIN
      ? {}
      : {
          realEstateId:
            user.realEstateId ??
            "",
        };

  const [
    properties,
    clients,
    matches,
    realEstates,
    strongMatches,
    pendingMatches,
    notifications,
  ] = await Promise.all([
    prisma.property.count({
      where: tenantFilter,
    }),

    prisma.client.count({
      where: tenantFilter,
    }),

    prisma.match.count({
      where:
        user.role ===
        Role.SUPER_ADMIN
          ? {}
          : {
              OR: [
                {
                  client:
                    tenantFilter,
                },

                {
                  property:
                    tenantFilter,
                },
              ],
            },
    }),

    prisma.realEstate.count(),

    prisma.match.count({
      where:
        user.role ===
        Role.SUPER_ADMIN
          ? {
              score: {
                gte: 90,
              },
            }
          : {
              score: {
                gte: 90,
              },

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
    }),

    prisma.match.count({
      where:
        user.role ===
        Role.SUPER_ADMIN
          ? {
              status:
                "WAITING_OTHER_SIDE",
            }
          : {
              status:
                "WAITING_OTHER_SIDE",

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
    }),

    prisma.notification.findMany({
      where:
        user.realEstateId
          ? {
              realEstateId:
                user.realEstateId,
            }
          : undefined,

      orderBy: {
        createdAt: "desc",
      },

      take: 5,
    }),
  ]);

  return (
    <AppShell user={user}>
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-semibold">
            Centro de oportunidades
          </h2>

          <p className="mt-2 text-sm text-muted">
            Cruzá demandas reales,
            detectá oportunidades y
            conectate con colegas
            compatibles.
          </p>
        </div>

        <div className="flex gap-2">
          <Link href="/properties/new">
            <Button>
              Tengo una propiedad
            </Button>
          </Link>

          <Link href="/clients/new">
            <Button variant="secondary">
              Tengo un cliente
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          label="Propiedades"
          value={properties}
        />

        <StatCard
          label="Clientes activos"
          value={clients}
        />

        <StatCard
          label="Matches"
          value={matches}
        />

        <StatCard
          label="Inmobiliarias red"
          value={realEstates}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Card className="border-green-500/20 bg-green-500/5">
          <p className="text-sm text-green-400">
            Matches premium
          </p>

          <h3 className="mt-3 text-4xl font-bold">
            {strongMatches}
          </h3>

          <p className="mt-2 text-sm text-muted">
            Coincidencias superiores
            al 90%.
          </p>
        </Card>

        <Card className="border-yellow-500/20 bg-yellow-500/5">
          <p className="text-sm text-yellow-400">
            Esperando respuesta
          </p>

          <h3 className="mt-3 text-4xl font-bold">
            {pendingMatches}
          </h3>

          <p className="mt-2 text-sm text-muted">
            Matches pendientes del
            colega.
          </p>
        </Card>

        <Card>
          <p className="text-sm text-accent">
            Estado operativo
          </p>

          <h3 className="mt-3 text-xl font-semibold">
            {user.role ===
            "SUPER_ADMIN"
              ? "Administrador general"
              : user.realEstate
                  ?.status ===
                "ACTIVE"
              ? "Cuenta activa"
              : "Pendiente validación"}
          </h3>

          <p className="mt-2 text-sm text-muted">
            {user.role ===
            "SUPER_ADMIN"
              ? "Control total de la plataforma."
              : user.realEstate
                  ?.status ===
                "ACTIVE"
              ? "Tu inmobiliaria está operativa dentro de la red."
              : "Tu matrícula todavía está siendo revisada."}
          </p>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.3fr_0.7fr]">
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold">
                Actividad reciente
              </h3>

              <p className="mt-1 text-sm text-muted">
                Movimiento reciente
                dentro de InmoMatch.
              </p>
            </div>

            <Link href="/matches">
              <Button variant="secondary">
                Ver matches
              </Button>
            </Link>
          </div>

          <div className="mt-6 space-y-4">
            {notifications.length ? (
              notifications.map(
                (item) => (
                  <div
                    key={item.id}
                    className="rounded-xl border border-border p-4 transition hover:border-accent/30 hover:bg-white/[0.02]"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-medium">
                          {item.title}
                        </p>

                        <p className="mt-1 text-sm text-muted">
                          {item.body}
                        </p>
                      </div>

                      <div className="rounded-full bg-accent/10 px-3 py-1 text-xs text-accent">
                        Nuevo
                      </div>
                    </div>
                  </div>
                )
              )
            ) : (
              <div className="rounded-xl border border-border p-5 text-sm text-muted">
                Todavía no hay
                actividad reciente.
              </div>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-xl font-semibold">
            Oportunidades rápidas
          </h3>

          <div className="mt-5 space-y-4">
            <Link
              href="/matches"
              className="block rounded-xl border border-border p-4 transition hover:border-green-500/30 hover:bg-green-500/5"
            >
              <p className="text-sm text-green-400">
                🔥 Matches premium
              </p>

              <p className="mt-2 text-sm text-muted">
                Revisá coincidencias
                de alta precisión.
              </p>
            </Link>

            <Link
              href="/clients/new"
              className="block rounded-xl border border-border p-4 transition hover:border-blue-500/30 hover:bg-blue-500/5"
            >
              <p className="text-sm text-blue-400">
                👤 Nueva demanda
              </p>

              <p className="mt-2 text-sm text-muted">
                Cargá un cliente y
                buscá stock en toda la
                red.
              </p>
            </Link>

            <Link
              href="/properties/new"
              className="block rounded-xl border border-border p-4 transition hover:border-yellow-500/30 hover:bg-yellow-500/5"
            >
              <p className="text-sm text-yellow-400">
                🏠 Nuevo stock
              </p>

              <p className="mt-2 text-sm text-muted">
                Publicá propiedades y
                detectá clientes
                compatibles.
              </p>
            </Link>
          </div>
        </Card>
      </div>
    </AppShell>
  );
}