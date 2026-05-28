import Link from "next/link";

import {
  Bell,
  Building2,
  Home,
  LayoutDashboard,
  LogOut,
  Users,
  WandSparkles,
  ShieldCheck,
} from "lucide-react";

import { Role, User } from "@prisma/client";

import { logoutAction } from "@/actions/auth";
import { prisma } from "@/lib/prisma";

import { Button } from "@/components/ui/button";

const nav = [
  {
    href: "/dashboard",
    label: "Panel",
    icon: LayoutDashboard,
  },

  {
    href: "/properties",
    label: "Propiedades",
    icon: Home,
  },

  {
    href: "/clients",
    label: "Clientes",
    icon: Users,
  },

  {
    href: "/matches",
    label: "Matches",
    icon: WandSparkles,
  },
];

export async function AppShell({
  user,
  children,
}: {
  user: User & {
    realEstate?: {
      name: string;
    } | null;
  };

  children: React.ReactNode;
}) {
  const notifications =
    user.realEstateId
      ? await prisma.notification.findMany({
          where: {
            realEstateId:
              user.realEstateId,
          },

          orderBy: {
            createdAt: "desc",
          },

          take: 5,
        })
      : [];

  return (
    <div className="min-h-screen">
      <aside className="fixed inset-y-0 left-0 hidden w-68 border-r border-border bg-black/20 p-5 md:block">
        <Link
          href="/dashboard"
          className="flex items-center gap-3"
        >
          <div className="flex size-10 items-center justify-center rounded-md bg-accent text-slate-950">
            <Building2 size={20} />
          </div>

          <div>
            <p className="font-semibold">
              InmoMatch
            </p>

            <p className="text-xs text-muted">
              {user.realEstate?.name ??
                "Plataforma"}
            </p>
          </div>
        </Link>

        <nav className="mt-8 space-y-1">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted hover:bg-white/10 hover:text-foreground"
            >
              <item.icon size={17} />
              {item.label}
            </Link>
          ))}

          {user.role ===
            Role.SUPER_ADMIN && (
            <Link
              href="/admin"
              className="flex items-center gap-3 rounded-md px-3 py-2 text-sm text-muted hover:bg-white/10 hover:text-foreground"
            >
              <ShieldCheck size={17} />
              Super Admin
            </Link>
          )}
        </nav>

        <form
          action={logoutAction}
          className="absolute bottom-5 left-5 right-5"
        >
          <Button
            type="submit"
            variant="secondary"
            className="w-full"
          >
            <LogOut size={16} />
            Salir
          </Button>
        </form>
      </aside>

      <main className="md:pl-68">
        <header className="sticky top-0 z-10 border-b border-border bg-background/85 px-5 py-4 backdrop-blur md:px-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted">
                Sesion activa
              </p>

              <h1 className="font-semibold">
                {user.firstName}{" "}
                {user.lastName}
              </h1>
            </div>

            <div className="flex items-center gap-3">
              <div className="relative group">
                <button className="relative rounded-md border border-border p-2 hover:bg-white/10">
                  <Bell size={18} />

                  {notifications.length >
                  0 ? (
                    <span className="absolute -right-1 -top-1 flex size-5 items-center justify-center rounded-full bg-red-500 text-[10px] text-white">
                      {
                        notifications.length
                      }
                    </span>
                  ) : null}
                </button>

                <div className="absolute right-0 mt-2 hidden w-80 rounded-lg border border-border bg-background p-3 shadow-xl group-hover:block">
                  <p className="mb-3 text-sm font-semibold">
                    Notificaciones
                  </p>

                  <div className="space-y-3">
                    {notifications.length ? (
                      notifications.map(
                        (item) => (
                          <div
                            key={item.id}
                            className="rounded-md border border-border p-3"
                          >
                            <p className="text-sm font-medium">
                              {item.title}
                            </p>

                            <p className="mt-1 text-xs text-muted">
                              {item.body}
                            </p>
                          </div>
                        )
                      )
                    ) : (
                      <p className="text-sm text-muted">
                        Sin notificaciones
                      </p>
                    )}
                  </div>
                </div>
              </div>

              <span className="rounded-md border border-border px-3 py-1 text-xs text-muted">
                {user.role.replaceAll(
                  "_",
                  " "
                )}
              </span>
            </div>
          </div>
        </header>

        <div className="px-5 py-6 md:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}
