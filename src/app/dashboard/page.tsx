import Link from "next/link";
import { Role } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card, StatCard } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await requireUser();
  const tenantFilter = user.role === Role.SUPER_ADMIN ? {} : { realEstateId: user.realEstateId ?? "" };
  const [properties, clients, matches, realEstates] = await Promise.all([
    prisma.property.count({ where: tenantFilter }),
    prisma.client.count({ where: tenantFilter }),
    prisma.match.count({ where: user.role === Role.SUPER_ADMIN ? {} : { OR: [{ client: tenantFilter }, { property: tenantFilter }] } }),
    prisma.realEstate.count(),
  ]);

  return (
    <AppShell user={user}>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">Panel operativo</h2>
          <p className="text-sm text-muted">Carga stock, demandas reales y cruza oportunidades con la red.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/properties/new"><Button>Tengo una propiedad</Button></Link>
          <Link href="/clients/new"><Button variant="secondary">Tengo un cliente</Button></Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard label="Propiedades" value={properties} />
        <StatCard label="Clientes activos" value={clients} />
        <StatCard label="Matches" value={matches} />
        <StatCard label="Inmobiliarias red" value={realEstates} />
      </div>
      <Card className="mt-6">
        <h3 className="font-semibold">Estado de cuenta</h3>
        <p className="mt-4 text-sm text-muted">
  {user.role === "SUPER_ADMIN"
    ? "Administrador general de la plataforma."
    : user.realEstate?.status === "ACTIVE"
      ? "Validada y operativa."
      : "Pendiente de validacion profesional por Super Admin."}
</p>
    </Card>
    </AppShell>
  );
}