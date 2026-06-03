"use server";

import { redirect } from "next/navigation";

import {
  AccountStatus,
  Role,
} from "@prisma/client";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function createAgentAction(
  input: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }
) {
  const currentUser =
    await requireUser([
      Role.ADMIN_REAL_ESTATE,
      Role.SUPER_ADMIN,
    ]);

  if (
    !currentUser.realEstateId &&
    currentUser.role !==
      Role.SUPER_ADMIN
  ) {
    return {
      error:
        "No pertenecés a una inmobiliaria.",
    };
  }

  const existingUser =
    await prisma.user.findUnique({
      where: {
        email:
          input.email,
      },
    });

  if (existingUser) {
    return {
      error:
        "Ya existe un usuario con ese email.",
    };
  }

  const supabaseAdmin =
    createSupabaseAdminClient();

  const {
    data,
    error,
  } =
    await supabaseAdmin.auth.admin.createUser(
      {
        email:
          input.email,

        password:
          input.password,

        email_confirm: true,
      }
    );

  if (
    error ||
    !data.user
  ) {
    return {
      error:
        error?.message ??
        "No se pudo crear el usuario.",
    };
  }

  await prisma.user.create({
    data: {
      authUserId:
        data.user.id,

      email:
        input.email,

      firstName:
        input.firstName,

      lastName:
        input.lastName,

      role: Role.AGENT,

      status:
        AccountStatus.ACTIVE,

      realEstateId:
        currentUser.realEstateId,
    },
  });

  redirect("/users");
}