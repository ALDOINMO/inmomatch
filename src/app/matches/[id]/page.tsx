import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { acceptMatchAction } from "@/actions/matches";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function MatchDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();

  const { id } = await params;

  const match = await prisma.match.findUnique({
    where: { id },
    include: {
      client: {
        include: {
          realEstate: true,
          createdBy: true,
        },
      },
      property: {
        include: {
          realEstate: true,
          createdBy: true,
        },
      },
    },
  });

  if (!match) notFound();

  const involved = [
    match.client.realEstateId,
    match.property.realEstateId,
  ].includes(user.realEstateId ?? "");

  if (user.role !== Role.SUPER_ADMIN && !involved) {
    notFound();
  }

  const differences = match.differences as string[];
  const exclusions = match.exclusions as string[];

  const contactVisible = match.status === "CONTACT_OPENED";

  const isClientSide =
    match.client.realEstateId === user.realEstateId;

  const colleague = isClientSide
    ? match.property.createdBy
    : match.client.createdBy;

  const colleagueLabel = isClientSide
    ? "Colega de propiedad"
    : "Colega de cliente";

  return (
    <AppShell user={user}>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold">
                Match #{match.id.slice(0, 8)}
              </h2>

              <p className="text-sm text-muted">
                {match.status === "PROPOSED"
                  ? "Propuesto"
                  : match.status === "ACCEPTED"
                  ? "Interés mutuo"
                  : match.status === "CONTACT_OPENED"
                  ? "Contacto desbloqueado"
                  : match.status === "REJECTED"
                  ? "Rechazado"
                  : match.status}
              </p>
            </div>

            <div className="text-4xl font-semibold text-accent">
              {match.score}%
            </div>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <h3 className="font-semibold">Cliente</h3>

              <p className="mt-2">
                {match.client.firstName} {match.client.lastName}
              </p>

              <p className="text-sm text-muted">
                {match.client.realEstate.name}
              </p>
            </div>

            <div className="rounded-lg border border-border p-4">
              <h3 className="font-semibold">Propiedad</h3>

              <p className="mt-2">{match.property.title}</p>

              <p className="text-sm text-muted">
                {match.property.city}
              </p>
            </div>
          </div>

          <h3 className="mt-6 font-semibold">Diferencias</h3>

          <ul className="mt-2 list-inside list-disc text-sm text-muted">
            {differences.length ? (
              differences.map((d) => <li key={d}>{d}</li>)
            ) : (
              <li>Sin diferencias relevantes.</li>
            )}
          </ul>

          {exclusions.length ? (
            <>
              <h3 className="mt-6 font-semibold text-danger">
                Exclusiones detectadas
              </h3>

              <ul className="mt-2 list-inside list-disc text-sm text-danger">
                {exclusions.map((d) => (
                  <li key={d}>{d}</li>
                ))}
              </ul>
            </>
          ) : null}
        </Card>

        <Card>
          <h3 className="font-semibold">
            Compromiso de partición
          </h3>

          <p className="mt-2 text-sm text-muted">
            Antes de abrir el contacto, queda registrado que
            aceptas respetar la partición de comisión acordada.
          </p>

          {!contactVisible ? (
            <form
              className="mt-4"
              action={async () => {
                "use server";
                await acceptMatchAction(match.id);
              }}
            >
              <Button type="submit" className="w-full">
                Acepto y abrir contacto
              </Button>
            </form>
          ) : null}

          {contactVisible ? (
            <div className="mt-5 rounded-lg border border-accent/40 bg-accent/10 p-4">
              <p className="font-semibold">
                Contacto habilitado
              </p>

              <div className="mt-4 grid gap-3">
                <div className="rounded-lg border border-border bg-background p-3">
                  <p className="font-medium">
                    {colleagueLabel}
                  </p>

                  <p className="text-sm text-muted">
                    {colleague.firstName}{" "}
                    {colleague.lastName}
                  </p>

                  <p className="text-sm">
                    {colleague.phone ?? "Sin teléfono"}
                  </p>

                  {colleague.phone ? (
                    <a
                      href={`https://wa.me/${colleague.phone.replace(
                        /\D/g,
                        ""
                      )}`}
                      target="_blank"
                      className="mt-3 inline-flex w-full items-center justify-center rounded-md bg-green-600 px-3 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      WhatsApp colega
                    </a>
                  ) : null}
                </div>
              </div>
            </div>
          ) : null}
        </Card>
      </div>
    </AppShell>
  );
}