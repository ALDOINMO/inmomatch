"use server";

import { Role } from "@prisma/client";

import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createNeighborhoodAction(
  city: string,
  name: string
) {
  const user =
    await requireUser();

  if (
    user.role !==
      Role.ADMIN_REAL_ESTATE &&
    user.role !==
      Role.SUPER_ADMIN
  ) {
    return {
      error:
        "No tenés permisos para crear barrios.",
    };
  }

  const existing =
    await prisma.neighborhood.findFirst(
      {
        where: {
          city,
          name,
        },
      }
    );

  if (existing) {
    return {
      error:
        "Ese barrio ya existe.",
    };
  }

  const neighborhood =
    await prisma.neighborhood.create(
      {
        data: {
          city,
          name,
        },
      }
    );

  return neighborhood;
}