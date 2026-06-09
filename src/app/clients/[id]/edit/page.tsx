import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { ClientForm } from "@/components/client-form";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export default async function EditClientPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const client = await prisma.client.findUnique({ where: { id } });
  if (!client) notFound();
  if (user.role !== Role.SUPER_ADMIN && client.realEstateId !== user.realEstateId) notFound();
  const requirements = asRecord(client.requirements);
  const fieldRequirements = asRecord(client.fieldRequirements);

  return (
    <AppShell user={user}>
      <Card>
        <h2 className="mb-6 text-2xl font-semibold">Editar cliente</h2>
        <ClientForm client={{
          id: client.id,
          firstName: client.firstName,
          lastName: client.lastName,
          phone: client.phone ?? "",
          email: client.email ?? "",
          minBudget: client.minBudget.toString(),
          maxBudget: client.maxBudget.toString(),
          currency: client.currency,
          desiredTypes: client.desiredTypes,
          desiredCities: client.desiredCities,
          financingNeeded: String(client.financingNeeded),
          financingPercent: client.financingPercent ?? undefined,
          hasTrade: String(client.hasTrade),
          tradePercent: client.tradePercent ?? undefined,
          needsCredit: String(client.needsCredit),
          minMatchThreshold: client.minMatchThreshold,
          ...requirements,
          ...fieldRequirements,
          constructionTypes: Array.isArray(requirements.constructionTypes) ? requirements.constructionTypes.join(", ") : "",
        }} />
      </Card>
    </AppShell>
  );
}
