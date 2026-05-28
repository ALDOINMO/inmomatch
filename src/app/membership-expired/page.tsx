import Link from "next/link";

import { AppShell } from "@/components/app-shell";
import { PayMembershipButton } from "@/components/pay-membership-button";
import { Button } from "@/components/ui/button";

import { requireUser } from "@/lib/auth";

export default async function MembershipExpiredPage() {
  const user = await requireUser();

  return (
    <AppShell user={user}>
      <div className="mx-auto mt-20 max-w-2xl rounded-2xl border border-red-500/20 bg-red-500/5 p-10 text-center">
        <h1 className="text-3xl font-semibold text-red-400">
          Membresía vencida
        </h1>

        <p className="mt-4 text-muted">
          Tu inmobiliaria perdió acceso a
          InmoMatch porque la membresía
          se encuentra vencida.
        </p>

        <div className="mt-8 rounded-xl border border-border bg-background/50 p-6 text-left">
          <h2 className="font-semibold">
            Acciones bloqueadas
          </h2>

          <ul className="mt-4 space-y-2 text-sm text-muted">
            <li>
              • Crear propiedades
            </li>

            <li>
              • Crear clientes
            </li>

            <li>
              • Generar matches
            </li>

            <li>
              • Abrir contactos
            </li>

            <li>
              • Recibir alertas premium
            </li>
          </ul>
        </div>

        <div className="mt-8 flex items-center justify-center gap-3">
          <Link href="/dashboard">
            <Button variant="secondary">
              Volver al panel
            </Button>
          </Link>

          <PayMembershipButton />
        </div>
      </div>
    </AppShell>
  );
}