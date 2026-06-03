import Link from "next/link";
import { Role } from "@prisma/client";

import { AppShell } from "@/components/app-shell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function getRoleLabel(role: string) {
  switch (role) {
    case "SUPER_ADMIN":
      return "Super Administrador";

    case "ADMIN_REAL_ESTATE":
      return "Administrador";

    case "AGENT":
      return "Corredor";

    default:
      return role;
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "ACTIVE":
      return "Activo";

    case "PENDING_VALIDATION":
      return "Pendiente de validación";

    case "SUSPENDED":
      return "Suspendido";

    default:
      return status;
  }
}

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const currentUser = await requireUser([
    Role.ADMIN_REAL_ESTATE,
    Role.SUPER_ADMIN,
  ]);

  const params = await searchParams;

  const users = await prisma.user.findMany({
    where: {
      ...(currentUser.role === Role.SUPER_ADMIN
        ? {}
        : {
            realEstateId:
              currentUser.realEstateId ?? "",
          }),

      ...(params.q
        ? {
            OR: [
              {
                firstName: {
                  contains: params.q,
                  mode: "insensitive",
                },
              },
              {
                lastName: {
                  contains: params.q,
                  mode: "insensitive",
                },
              },
              {
                email: {
                  contains: params.q,
                  mode: "insensitive",
                },
              },
            ],
          }
        : {}),
    },

    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <AppShell user={currentUser}>
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-semibold">
            Usuarios
          </h2>

          <p className="text-sm text-muted">
            Administrá los usuarios de tu inmobiliaria.
          </p>
        </div>

        <Link href="/users/new">
          <Button>
            Nuevo corredor
          </Button>
        </Link>
      </div>

      <form className="mb-5 grid gap-3 md:grid-cols-[1fr_120px]">
        <input
          name="q"
          placeholder="Buscar usuario"
          className="h-10 rounded-md border border-border bg-black/20 px-3 text-sm"
        />

        <Button
          type="submit"
          variant="secondary"
        >
          Filtrar
        </Button>
      </form>

      <div className="grid gap-4">
        {users.map((user) => (
          <Card
            key={user.id}
            className="grid gap-4 md:grid-cols-[1fr_auto]"
          >
            <div>
              <p className="text-lg font-semibold">
                {user.firstName} {user.lastName}
              </p>

              <p className="mt-1 text-sm text-muted">
                {user.email}
              </p>

              <div className="mt-3 flex gap-2">
                <span className="rounded-md border border-border px-2 py-1 text-xs text-muted">
                  {getRoleLabel(user.role)}
                </span>

                <span className="rounded-md border border-border px-2 py-1 text-xs text-muted">
                  {getStatusLabel(user.status)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="secondary">
                Editar
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}