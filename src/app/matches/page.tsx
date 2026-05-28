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



export default async function MatchesPage() {
  const user = await requireUser();

  const matches = await prisma.match.findMany({
    where:
      user.role === Role.SUPER_ADMIN
        ? {}
        : {
            OR: [
              {
                client: {
                  realEstateId:
                    user.realEstateId ?? "",
                },
              },
              {
                property: {
                  realEstateId:
                    user.realEstateId ?? "",
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
      { score: "desc" },
      { createdAt: "desc" },
    ],
  });

  return (
    <AppShell user={user}>
      <div className="mb-6">
        <h2 className="text-2xl font-semibold">
          Matches
        </h2>

        <p className="text-sm text-muted">
          Porcentaje, diferencias,
          exclusiones y flujo de aceptación
          real.
        </p>
      </div>

      <div className="grid gap-4">
        {matches.map((match) => (
          <Card
            key={match.id}
            className={`grid gap-4 lg:grid-cols-[120px_1fr_auto] transition ${
              match.status !== "REJECTED"
                ? "cursor-pointer hover:border-accent/40 hover:bg-accent/5"
                : ""
            }`}
          >
            <Link
              href={
                match.status !== "REJECTED"
                  ? `/matches/${match.id}`
                  : "#"
              }
              className="contents"
            >
              <div className="flex size-24 items-center justify-center rounded-lg border border-border text-2xl font-semibold text-accent">
                {match.score}%
              </div>

              <div>
                <p className="text-lg font-semibold hover:text-accent">
                  {match.client.firstName}{" "}
                  {match.client.lastName} ↔{" "}
                  {match.property.title}
                </p>

                <p className="mt-1 text-sm text-muted">
                  {match.client.realEstate.name} ·{" "}
                  {match.property.realEstate.name} ·{" "}
                  {match.status === "PROPOSED"
                    ? "Propuesto"
                    : match.status ===
                      "WAITING_OTHER_SIDE"
                    ? "Esperando al colega"
                    : match.status ===
                      "CONTACT_OPENED"
                    ? "Contacto desbloqueado"
                    : match.status ===
                      "REJECTED"
                    ? "Rechazado"
                    : match.status}
                </p>

                <p className="mt-2 text-sm text-muted">
                  {(match.differences as string[])
                    .slice(0, 2)
                    .join(" · ") ||
                    "Sin diferencias relevantes"}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-2">
              {match.status ===
              "PROPOSED" ? (
                <>
                  <form
                    action={async () => {
                      "use server";

                      await acceptMatchAction(
                        match.id
                      );
                    }}
                  >
                    <Button variant="secondary">
                      Aceptar
                    </Button>
                  </form>

                  <form
                    action={async () => {
                      "use server";

                      await rejectHighMatchAction(
                        match.id
                      );
                    }}
                  >
                    <Button variant="danger">
                      Rechazar
                    </Button>
                  </form>
                </>
              ) : match.status ===
                "WAITING_OTHER_SIDE" ? (
                <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-400">
                  Esperando al colega...
                </div>
              ) : match.status ===
                "CONTACT_OPENED" ? (
                <div className="rounded-md border border-green-500/30 bg-green-500/10 px-3 py-2 text-sm text-green-400">
                  Contacto desbloqueado
                </div>
              ) : match.status ===
                "REJECTED" ? (
                <div className="rounded-md border border-red-500/30 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                  Rechazado
                </div>
              ) : null}
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}