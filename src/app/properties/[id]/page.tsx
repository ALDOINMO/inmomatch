import Link from "next/link";
import { notFound } from "next/navigation";
import { Role } from "@prisma/client";
import { AppShell } from "@/components/app-shell";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PropertyDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser();
  const { id } = await params;
  const property = await prisma.property.findUnique({ where: { id }, include: { images: true, matches: { include: { client: true }, orderBy: { score: "desc" } }, realEstate: true } });
  if (!property) notFound();
  if (user.role !== Role.SUPER_ADMIN && property.realEstateId !== user.realEstateId) notFound();

  return (
    <AppShell user={user}>
      <div className="mb-5 flex items-center justify-between">
        <div><h2 className="text-2xl font-semibold">{property.title}</h2><p className="text-sm text-muted">{property.city} · direccion visible solo para tu inmobiliaria</p></div>
        <Link href={`/properties/${property.id}/edit`}><Button variant="secondary">Editar</Button></Link>
      </div>
      <div className="grid gap-5 lg:grid-cols-[1fr_360px]">
        <Card>
          <p className="text-3xl font-semibold">{formatMoney(property.price.toString(), property.currency)}</p>
          <dl className="mt-5 grid gap-3 text-sm md:grid-cols-2">
            <div><dt className="text-muted">Tipo</dt><dd>{property.type}</dd></div>
            <div><dt className="text-muted">Estado</dt><dd>{property.status}</dd></div>
            <div><dt className="text-muted">Nomenclatura</dt><dd>{property.cadastralId}</dd></div>
            <div><dt className="text-muted">Direccion exacta</dt><dd>{property.address}</dd></div>
          </dl>
          <p className="mt-5 text-sm text-muted">{property.description}</p>
        </Card>
        <Card>
          <h3 className="font-semibold">Matches de demanda</h3>
          <div className="mt-4 space-y-3">
            {property.matches.map((match) => (
              <Link key={match.id} href={`/matches/${match.id}`} className="block rounded-md border border-border p-3 hover:bg-white/5">
                <p className="font-medium">{match.client.firstName} {match.client.lastName}</p>
                <p className="text-sm text-muted">{match.score}% · {match.status}</p>
              </Link>
            ))}
          </div>
        </Card>
      </div>
      <div className="mt-5"><ImageUpload propertyId={property.id} images={property.images} /></div>
    </AppShell>
  );
}
