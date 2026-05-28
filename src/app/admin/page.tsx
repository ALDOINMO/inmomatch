import {
  approveRealEstateAction,
  extendMembershipAction,
  reactivatePropertyAction,
} from "@/actions/admin";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

import { Role } from "@prisma/client";

export const dynamic =
  "force-dynamic";

export default async function AdminPage() {
  const user =
    await requireUser([
      Role.SUPER_ADMIN,
    ]);

  const [
    realEstates,
    reviewProperties,
    users,
  ] = await Promise.all([
    prisma.realEstate.findMany({
      where: {
        status:
          "PENDING_VALIDATION",
      },

      orderBy: {
        createdAt: "desc",
      },

      include: {
        users: true,
      },
    }),

    prisma.property.findMany({
      where: {
        status:
          "IN_REVIEW",
      },

      include: {
        realEstate: true,
      },
    }),

    prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },

      include: {
        realEstate: true,
      },
    }),
  ]);

  return (
    <AppShell user={user}>
      <h2 className="mb-6 text-2xl font-semibold">
        Super Admin
      </h2>

      <div className="grid gap-6">
        <Card>
          <h3 className="font-semibold">
            Validación de matrícula y membresías
          </h3>

          <div className="mt-4 grid gap-3">
            {realEstates.map(
              (item) => (
                <div
                  key={item.id}
                  className="grid gap-3 rounded-md border border-border p-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-medium">
                      {item.name}
                    </p>

                    <p className="text-sm text-muted">
                      Matrícula:{" "}
                      {item.professionalLicense ||
                        "Sin matrícula"}
                    </p>

                    <p className="text-sm text-muted">
                      {item.city} ·{" "}
                      {item.address}
                    </p>

                    <p className="text-sm text-muted">
                      {item.phone}
                    </p>

                    <p className="text-sm text-muted">
                      Usuarios:{" "}
                      {
                        item.users
                          .length
                      }
                    </p>

                    <p className="text-sm text-muted">
                      Estado:{" "}
                      {item.status}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <form
                      action={async () => {
                        "use server";

                        await approveRealEstateAction(
                          item.id
                        );
                      }}
                    >
                      <Button variant="secondary">
                        Aprobar
                      </Button>
                    </form>

                    <form
                      action={async () => {
                        "use server";

                        await extendMembershipAction(
                          item.id
                        );
                      }}
                    >
                      <Button>
                        Extender 30 días
                      </Button>
                    </form>
                  </div>
                </div>
              )
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold">
            Limpieza de stock
          </h3>

          <div className="mt-4 grid gap-3">
            {reviewProperties.map(
              (property) => (
                <div
                  key={property.id}
                  className="grid gap-3 rounded-md border border-border p-4 md:grid-cols-[1fr_auto]"
                >
                  <div>
                    <p className="font-medium">
                      {property.title}
                    </p>

                    <p className="text-sm text-muted">
                      {
                        property
                          .realEstate
                          .name
                      }{" "}
                      ·{" "}
                      {
                        property.rejectionCount90
                      }{" "}
                      rechazos 90%+
                    </p>
                  </div>

                  <form
                    action={async () => {
                      "use server";

                      await reactivatePropertyAction(
                        property.id
                      );
                    }}
                  >
                    <Button variant="secondary">
                      Reactivar
                    </Button>
                  </form>
                </div>
              )
            )}
          </div>
        </Card>

        <Card>
          <h3 className="font-semibold">
            Usuarios
          </h3>

          <div className="mt-4 grid gap-2 text-sm text-muted">
            {users.map((item) => (
              <p key={item.id}>
                {item.email} ·{" "}
                {item.role} ·{" "}
                {item.realEstate
                  ?.name ??
                  "Sin inmobiliaria"}
              </p>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}