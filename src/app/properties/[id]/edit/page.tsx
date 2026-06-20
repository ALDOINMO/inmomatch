import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { PropertyForm } from "@/components/property-form";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export default async function EditPropertyPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const property = await prisma.property.findUnique({ where: { id } });
  if (!property) notFound();
  if (user.role !== Role.SUPER_ADMIN && property.realEstateId !== user.realEstateId) notFound();
  const features = asRecord(property.features);
  const services = asRecord(property.services);
  const quality = asRecord(property.quality);
  const fieldFeatures = asRecord(property.fieldFeatures);

  return (
    <AppShell user={user}>
      <Card>
        <h2 className="mb-6 text-2xl font-semibold">Editar propiedad</h2>
        <PropertyForm property={{
          id: property.id,
          title: property.title,
          cadastralId: property.cadastralId,
          type: property.type,
          price: property.price.toString(),
          currency: property.currency,
          address: property.address,
          province:property.province ?? "",
          department: property.department ?? "",
          city: property.city,
          neighborhood: property.neighborhood ?? "",
          description: property.description ?? "",
          documentation: property.documentation ?? "",
          financing: String(property.financing),
          financingPercent: property.financingPercent ?? undefined,
          acceptsTrade: String(property.acceptsTrade),
          tradePercent: property.tradePercent ?? undefined,
          ...services,
          ...features,
          ...quality,
          ...fieldFeatures,
          constructionTypes: Array.isArray(features.constructionTypes) ? features.constructionTypes.join(", ") : "",
        }} />
      </Card>
    </AppShell>
  );
}
