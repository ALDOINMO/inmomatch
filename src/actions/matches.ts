"use server";

import { revalidatePath } from "next/cache";

import { Role } from "@prisma/client";

import { requireUser } from "@/lib/auth";
import { ensureActiveMembership } from "@/lib/membership";
import { prisma } from "@/lib/prisma";

function followUpDate(days: number) {
  return new Date(
    Date.now() +
      days *
        24 *
        60 *
        60 *
        1000
  );
}

export async function acceptMatchAction(
  matchId: string
) {
  const user =
    await requireUser();

  ensureActiveMembership(
    user
  );

  const match =
    await prisma.match.findUnique(
      {
        where: {
          id: matchId,
        },

        include: {
          client: true,
          property: true,
        },
      }
    );

  if (!match) {
    return {
      error:
        "Match inexistente.",
    };
  }

  const involved = [
    match.client.realEstateId,
    match.property.realEstateId,
  ].includes(
    user.realEstateId ?? ""
  );

  if (
    user.role !==
      Role.SUPER_ADMIN &&
    !involved
  ) {
    return {
      error: "Sin permiso.",
    };
  }

  // Primera aceptación
  if (
    match.status ===
    "PROPOSED"
  ) {
    await prisma.match.update({
      where: {
        id: matchId,
      },

      data: {
        status:
          "WAITING_OTHER_SIDE",
      },
    });

    revalidatePath(
      "/matches"
    );

    return;
  }

  // Segunda aceptación
  if (
    match.status ===
    "WAITING_OTHER_SIDE"
  ) {
    await prisma.match.update({
      where: {
        id: matchId,
      },

      data: {
        status:
          "CONTACT_OPENED",

        commissionAcceptedAt:
          new Date(),

        contactOpenedAt:
          new Date(),

        followUpAt:
          followUpDate(7),
      },
    });

    revalidatePath(
      "/matches"
    );

    return;
  }
}

export async function openContactAction(
  matchId: string
) {
  const user =
    await requireUser();

  ensureActiveMembership(
    user
  );

  const match =
    await prisma.match.findUnique(
      {
        where: {
          id: matchId,
        },

        include: {
          client: true,
          property: true,
        },
      }
    );

  if (!match) {
    return {
      error:
        "Match inexistente.",
    };
  }

  const involved = [
    match.client.realEstateId,
    match.property.realEstateId,
  ].includes(
    user.realEstateId ?? ""
  );

  if (
    user.role !==
      Role.SUPER_ADMIN &&
    !involved
  ) {
    return {
      error: "Sin permiso.",
    };
  }

  await prisma.match.update({
    where: {
      id: matchId,
    },

    data: {
      status:
        "CONTACT_OPENED",

      commissionAcceptedAt:
        new Date(),

      contactOpenedAt:
        new Date(),

      followUpAt:
        followUpDate(7),
    },
  });

  revalidatePath("/matches");
}

export async function rejectHighMatchAction(
  matchId: string
) {
  const user =
    await requireUser();

  ensureActiveMembership(
    user
  );

  const match =
    await prisma.match.findUnique(
      {
        where: {
          id: matchId,
        },

        include: {
          property: true,
        },
      }
    );

  if (!match) {
    return {
      error:
        "Match inexistente.",
    };
  }

  if (
    user.role !==
      Role.SUPER_ADMIN &&
    match.property
      .realEstateId !==
      user.realEstateId
  ) {
    return {
      error: "Sin permiso.",
    };
  }

  const rejectionCount90 =
    match.score >= 90
      ? match.property
          .rejectionCount90 + 1
      : match.property
          .rejectionCount90;

  await prisma.property.update({
    where: {
      id: match.propertyId,
    },

    data: {
      rejectionCount90,

      status:
        rejectionCount90 >= 3
          ? "IN_REVIEW"
          : match.property
              .status,
    },
  });

  await prisma.match.update({
    where: {
      id: matchId,
    },

    data: {
      status: "REJECTED",
    },
  });

  revalidatePath("/matches");
}