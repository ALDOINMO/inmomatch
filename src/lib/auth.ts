import { redirect } from "next/navigation";

import {
  AccountStatus,
  Role,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";

import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function getCurrentUser() {
  const supabase =
    await createSupabaseServerClient();

  const { data } =
    await supabase.auth.getUser();

  if (!data.user) {
    return null;
  }

  return prisma.user.findUnique({
    where: {
      authUserId:
        data.user.id,
    },

    include: {
      realEstate: true,
    },
  });
}

export async function requireUser(
  roles?: Role[]
) {
  const user =
    await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  // Bloqueo por validación pendiente
  if (
    user.status ===
      AccountStatus.PENDING_VALIDATION ||
    user.realEstate
      ?.status ===
      AccountStatus.PENDING_VALIDATION
  ) {
    redirect(
      "/pending-validation"
    );
  }

  // Bloqueo por membresía suspendida
  if (
    user.realEstate
      ?.status ===
    AccountStatus.SUSPENDED
  ) {
    redirect(
      "/membership-expired"
    );
  }

  // Control de roles
  if (
    roles?.length &&
    !roles.includes(
      user.role
    )
  ) {
    redirect("/dashboard");
  }

  return user;
}

export function canManageRealEstate(
  role: Role
) {
  return (
    role ===
      Role.SUPER_ADMIN ||
    role ===
      Role.ADMIN_REAL_ESTATE
  );
}