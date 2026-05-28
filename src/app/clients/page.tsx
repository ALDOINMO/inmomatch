import Link from "next/link";
import { Role } from "@prisma/client";
import { deleteClientAction } from "@/actions/clients";
import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { formatMoney } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser();
  const params = await searchParams;
  const clients = await prisma.client.findMany({
    where: {
      ...(user.role === Role.SUPER_ADMIN ? {} : { realEstateId: user.realEstateId ?? "" }),
      status: { not: "ARCHIVED" },
      ...(params.q ? { OR: [{ firstName: { contains: params.q, mode: "insensitive" } }, { lastName: { contains: params.q, mode: "insensitive" } }] } : {}),
    },
    orderBy: { createdAt: "desc" },
    include: { matches: true },
  });

  return (
    <AppShell user={user}>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div><h2 className="text-2xl font-semibold">Clientes</h2><p className="text-sm text-muted">Demandas reales con presupuesto y reglas excluyentes.</p></div>
        <Link href="/clients/new"><Button>Nuevo cliente</Button></Link>
      </div>
      <form className="mb-5 grid gap-3 md:grid-cols-[1fr_120px]">
        <input name="q" placeholder="Buscar cliente" className="h-10 rounded-md border border-border bg-black/20 px-3 text-sm" />
        <Button type="submit" variant="secondary">Filtrar</Button>
      </form>
      <div className="grid gap-4">
        {clients.map((client) => (
          <Card key={client.id} className="grid gap-4 md:grid-cols-[1fr_auto]">
            <div>
              <Link href={`/clients/${client.id}`} className="text-lg font-semibold hover:text-accent">{client.firstName} {client.lastName}</Link>
              <p className="mt-1 text-sm text-muted">{client.desiredTypes.join(", ")} · {client.desiredCities.join(", ")}</p>
              <p className="mt-3 font-semibold">{formatMoney(client.minBudget.toString(), client.currency)} - {formatMoney(client.maxBudget.toString(), client.currency)}</p>
              <p className="mt-1 text-sm text-muted">{client.matches.length} matches generados</p>
            </div>
            <div className="flex items-center gap-2">
              <Link href={`/clients/${client.id}/edit`}><Button variant="secondary">Editar</Button></Link>
              <form action={async () => { "use server"; await deleteClientAction(client.id); }}><Button variant="danger">Eliminar</Button></form>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
