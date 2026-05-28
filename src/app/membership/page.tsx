import { AppShell } from "@/components/app-shell";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { PayMembershipButton } from "@/components/pay-membership-button";

import { requireUser } from "@/lib/auth";

export default async function MembershipPage() {
  const user =
    await requireUser();

  const membership =
    user.realEstate
      ?.membershipExpiresAt;

  const active =
    membership &&
    new Date(membership) >
      new Date();

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-6 text-3xl font-semibold">
          Membresía
        </h2>

        <div className="grid gap-6">
          <Card>
            <div className="flex items-start justify-between gap-5">
              <div>
                <h3 className="text-xl font-semibold">
                  Plan Base
                </h3>

                <p className="mt-2 text-sm text-muted">
                  Acceso completo a
                  InmoMatch para tu
                  inmobiliaria.
                </p>
              </div>

              <div
                className={`rounded-full px-3 py-1 text-xs font-medium ${
                  active
                    ? "bg-green-500/10 text-green-400"
                    : "bg-red-500/10 text-red-400"
                }`}
              >
                {active
                  ? "Activa"
                  : "Vencida"}
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted">
                  Inmobiliaria
                </p>

                <p className="mt-1 font-medium">
                  {user.realEstate
                    ?.name ??
                    "Sin inmobiliaria"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted">
                  Vencimiento
                </p>

                <p className="mt-1 font-medium">
                  {membership
                    ? new Date(
                        membership
                      ).toLocaleDateString(
                        "es-AR"
                      )
                    : "No definido"}
                </p>
              </div>
            </div>

            <div className="mt-8">
              <PayMembershipButton />
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold">
              Beneficios incluidos
            </h3>

            <ul className="mt-5 list-inside list-disc space-y-3 text-sm text-muted">
              <li>
                Matches ilimitados
              </li>

              <li>
                Acceso a contactos
              </li>

              <li>
                CRM inmobiliario
              </li>

              <li>
                Gestión de clientes
              </li>

              <li>
                Alertas inteligentes
              </li>
            </ul>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}