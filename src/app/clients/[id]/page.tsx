import Link from "next/link";
import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id }, include: { matches: { include: { property: true }, orderBy: { score: "desc" } } } });
  if (!client) notFound();
  if (user.role !== Role.SUPER_ADMIN && client.realEstateId !== user.realEstateId) notFound();

  return (
    <AppShell user={user}>
      <div className="mb-5 flex items-center justify-between">
        <div><h2 className="text-2xl font-semibold">{client.firstName} {client.lastName}</h2><p className="text-sm text-muted">{client.desiredCities.join(", ")} · umbral {client.minMatchThreshold}%</p></div>
        <Link href={`/clients/${client.id}/edit`}><Button variant="secondary">Editar</Button></Link>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_380px]">
        <Card>
          <p className="text-3xl font-semibold">{formatMoney(client.minBudget.toString(), client.currency)} - {formatMoney(client.maxBudget.toString(), client.currency)}</p>
          <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
            <div><dt className="text-muted">Tipos</dt><dd>{client.desiredTypes.join(", ")}</dd></div>
            <div><dt className="text-muted">Financiación</dt><dd>{client.financingNeeded === "SI" ? "Sí" : client.financingNeeded === "NO" ? "No" : "Indiferente"}</dd></div>
            <div><dt className="text-muted">Permuta</dt><dd>{client.hasTrade === "SI" ? "Sí" : client.hasTrade === "NO" ? "No" : "Indiferente"}</dd></div>
            <div><dt className="text-muted">Apta crédito</dt><dd>{client.needsCredit === "SI" ? "Sí" : client.needsCredit === "NO" ? "No" : "Indiferente"}</dd></div>
          </dl>
        </Card>
        <Card>
          <h3 className="font-semibold">Propiedades candidatas</h3>
          <div className="mt-4 space-y-3">
            {client.matches.map((match) => (
              <Link key={match.id} href={`/matches/${match.id}`} className="block rounded-md border border-border p-3 hover:bg-white/5">
                <p className="font-medium">{match.property.title}</p>
                <p className="text-sm text-muted">{match.score}% · {match.status}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
