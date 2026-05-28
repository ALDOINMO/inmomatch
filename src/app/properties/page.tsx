import Link from "next/link";
import { Role } from "@prisma/client";
import { deletePropertyAction } from "@/actions/properties";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PropertiesPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const properties = await prisma.property.findMany({
    where: {
      ...(user.role === Role.SUPER_ADMIN ? {} : { realEstateId: user.realEstateId ?? "" }),
      status: { not: "ARCHIVED" },
      ...(params.type ? { type: params.type as never } : {}),
      ...(params.q ? { OR: [{ title: { contains: params.q, mode: "insensitive" } }, { city: { contains: params.q, mode: "insensitive" } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { images: true, realEstate: true },
  });

  return (
    <AppShell user={user}>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div><h2 className="text-2xl font-semibold">Propiedades</h2><p className="text-sm text-muted">Direccion exacta privada y bloqueo de duplicados activo.</p></div>
        <Link href="/properties/new"><Button>Nueva propiedad</Button></Link>
      </div>
      <form className="mb-5 grid gap-3 md:grid-cols-[1fr_180px_120px]">
        <input name="q" placeholder="Buscar por titulo o localidad" className="h-10 rounded-md border border-border bg-black/20 px-3 text-sm" />
        <select name="type" className="h-10 rounded-md border border-border bg-black/20 px-3 text-sm"><option value="">Todos</option><option>CASA</option><option>DEPARTAMENTO</option><option>TERRENO</option><option>CAMPO</option></select>
        <Button type="submit" variant="secondary">Filtrar</Button>
      </form>
      <div className="grid gap-4">
        {properties.map((property) => (
          <Card key={property.id} className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Link href={`/properties/${property.id}`} className="text-lg font-semibold hover:text-accent">{property.title}</Link>
                <span className="rounded-md border border-border px-2 py-1 text-xs text-muted">{property.type}</span>
                <span className="rounded-md border border-border px-2 py-1 text-xs text-muted">{property.status}</span>
              </div>
              <p className="mt-1 text-sm text-muted">{property.city} · {property.neighborhood ?? "Sin barrio"} · {property.realEstate.name}</p>
              <p className="mt-3 font-semibold">{formatMoney(property.price.toString(), property.currency)}</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/properties/${property.id}/edit`}><Button variant="secondary">Editar</Button></Link>
              <form action={async () => { "use server"; await deletePropertyAction(property.id); }}><Button variant="danger">Eliminar</Button></form>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
