import { AppShell } from "@/components/app-shell";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { requireUser } from "@/lib/auth";

export default async function AccountPage() {
  const user =
    await requireUser();

  return (
    <AppShell user={user}>
      <div className="mx-auto max-w-3xl">
        <h2 className="mb-6 text-3xl font-semibold">
          Mi cuenta
        </h2>

        <div className="grid gap-6">
          <Card>
            <h3 className="text-lg font-semibold">
              Perfil
            </h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted">
                  Nombre
                </p>

                <p className="mt-1 font-medium">
                  {user.firstName}{" "}
                  {user.lastName}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted">
                  Email
                </p>

                <p className="mt-1 font-medium">
                  {user.email}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted">
                  Teléfono
                </p>

                <p className="mt-1 font-medium">
                  {user.phone ??
                    "Sin teléfono"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted">
                  Rol
                </p>

                <p className="mt-1 font-medium">
  {user.role === "SUPER_ADMIN"
    ? "Super Administrador"
    : user.role === "ADMIN_REAL_ESTATE"
    ? "Administrador"
    : "Corredor"}
</p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold">
              Inmobiliaria
            </h3>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm text-muted">
                  Nombre
                </p>

                <p className="mt-1 font-medium">
                  {user.realEstate
                    ?.name ??
                    "Sin inmobiliaria"}
                </p>
              </div>

              <div>
                <p className="text-sm text-muted">
                  Estado
                </p>

                <p className="mt-1 font-medium">
  {user.realEstate?.status ===
  "ACTIVE"
    ? "Activo"
    : user.realEstate?.status ===
      "PENDING_VALIDATION"
    ? "Pendiente de validación"
    : user.realEstate?.status ===
      "SUSPENDED"
    ? "Suspendido"
    : "Sin estado"}
</p>
              </div>

              <div>
                <p className="text-sm text-muted">
                  Membresía vence
                </p>

                <p className="mt-1 font-medium">
                  {user.realEstate
                    ?.membershipExpiresAt
                    ? new Date(
                        user.realEstate.membershipExpiresAt
                      ).toLocaleDateString(
                        "es-AR"
                      )
                    : "No definida"}
                </p>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-lg font-semibold">
  Seguridad y acceso
</h3>

<p className="mt-2 text-sm text-muted">
  Próximamente vas a poder gestionar la seguridad de tu cuenta.
</p>

            <ul className="mt-4 list-inside list-disc space-y-2 text-sm text-muted">
              <li>
                Cambiar contraseña
              </li>

              <li>
                Ver sesiones activas
              </li>

              <li>
                Activar autenticación
                en dos pasos
              </li>
            </ul>

            <Button className="mt-6">
              Cambiar contraseña
            </Button>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}