"use server";

import { sendNewMatchEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Prisma, Role } from "@prisma/client";

import { requireUser } from "@/lib/auth";
import { ensureActiveMembership } from "@/lib/membership";
import { calculateMatch } from "@/lib/matching-engine";
import { prisma } from "@/lib/prisma";

import { clientSchema } from "@/validators/client";

function toClientData(
  input: unknown,
  realEstateId: string,
  userId: string
) {
  const data =
    clientSchema.parse(input);

  return {
    realEstateId,

    createdById: userId,

    firstName:
      data.firstName,

    lastName:
      data.lastName,

    phone: data.phone,

    email:
      data.email || null,

    minBudget:
      new Prisma.Decimal(
        data.minBudget
      ),

    maxBudget:
      new Prisma.Decimal(
        data.maxBudget
      ),

    currency:
      data.currency,

    desiredTypes:
      data.desiredTypes,

    desiredCities:
      data.desiredCities,

      desiredNeighborhoods:
  data.desiredNeighborhoods ?? [],

    financingNeeded:
  data.financingNeeded ===
  "true",

    financingPercent:
      data.financingPercent,

    hasTrade:
  data.hasTrade ===
  "true",

    tradePercent:
      data.tradePercent,

    needsCredit:
  data.needsCredit ===
  "true",

    minMatchThreshold:
      data.minMatchThreshold,

    requirements: {
      bedrooms:
        data.bedrooms,

      bathrooms:
        data.bathrooms,

      minTotalArea:
        data.minTotalArea,

      luz: data.luz,

      agua: data.agua,

      gas: data.gas,

      conectividad:
        data.conectividad,

      constructionTypes:
        data.constructionTypes
          ?.split(",")

          .map((v) =>
            v.trim()
          )

          .filter(Boolean),

      pool: data.pool,

      garage:
        data.garage,

      neighborhoodType:
        data.neighborhoodType,

      access:
        data.access,
    },

    fieldRequirements: {
      soilAptitude:
        data.soilAptitude,

      minHectares:
        data.minHectares,

      maxHectares:
        data.maxHectares,
    },
  };
}

export async function createClientAction(
  input: unknown
) {
  const user =
    await requireUser();

  ensureActiveMembership(
    user
  );

  if (!user.realEstateId) {
    return {
      error:
        "Tu usuario no pertenece a una inmobiliaria.",
    };
  }

  const client =
    await prisma.client.create({
      data: toClientData(
        input,
        user.realEstateId,
        user.id
      ),
    });

  await recomputeMatchesForClient(
    client.id,
    user.id
  );

  revalidatePath("/clients");

  redirect(
    `/clients/${client.id}`
  );
}

export async function updateClientAction(
  id: string,
  input: unknown
) {
  const user =
    await requireUser();

  ensureActiveMembership(
    user
  );

  const client =
    await prisma.client.findUnique(
      {
        where: { id },
      }
    );

  if (!client) {
    return {
      error:
        "Cliente inexistente.",
    };
  }

  if (
    user.role !==
      Role.SUPER_ADMIN &&
    client.realEstateId !==
      user.realEstateId
  ) {
    return {
      error: "Sin permiso.",
    };
  }

  await prisma.client.update({
    where: { id },

    data: toClientData(
      input,
      client.realEstateId,
      client.createdById
    ),
  });

  await recomputeMatchesForClient(
    id,
    user.id
  );

  revalidatePath("/clients");

  redirect(`/clients/${id}`);
}

export async function deleteClientAction(
  id: string
) {
  const user =
    await requireUser();

  ensureActiveMembership(
    user
  );

  const client =
    await prisma.client.findUnique(
      {
        where: { id },
      }
    );

  if (!client) {
    return {
      error:
        "Cliente inexistente.",
    };
  }

  if (
    user.role !==
      Role.SUPER_ADMIN &&
    client.realEstateId !==
      user.realEstateId
  ) {
    return {
      error: "Sin permiso.",
    };
  }

  await prisma.client.update({
    where: { id },

    data: {
      status: "ARCHIVED",
    },
  });

  revalidatePath("/clients");
}

export async function recomputeMatchesForClient(
  clientId: string,
  requesterId?: string
) {
  const client =
    await prisma.client.findUnique(
      {
        where: {
          id: clientId,
        },
      }
    );

  if (!client) return;

  const properties =
    await prisma.property.findMany(
      {
        where: {
          status: "ACTIVE",
        },
      }
    );

  for (const property of properties) {
    const result =
      calculateMatch(
        property,
        client
      );

      if (
  property.realEstateId ===
  client.realEstateId
) {
  continue;
}

    if (
      result.score >=
        client.minMatchThreshold ||
      result.exclusions
        .length === 0
    ) {
      const match =
        await prisma.match.upsert({
          where: {
            clientId_propertyId:
              {
                clientId,

                propertyId:
                  property.id,
              },
          },

          update: {
            score:
              result.score,

            differences:
              result.differences,

            exclusions:
              result.exclusions,
          },

          create: {
            clientId,

            propertyId:
              property.id,

            requesterId,

            score:
              result.score,

            differences:
              result.differences,

            exclusions:
              result.exclusions,
          },
        });

      await prisma.notification.create({
  data: {
    realEstateId:
      property.realEstateId,

    type: "MATCH",

    title:
      "Nuevo match encontrado",

    body: `${client.firstName} ${client.lastName} coincide con ${property.title} (${result.score}%)`,

    metadata: {
      matchId: match.id,
      propertyId: property.id,
      clientId: client.id,
      score: result.score,
    },
  },
});

if (result.score >= 90) {
  const users =
    await prisma.user.findMany({
      where: {
        realEstateId:
          property.realEstateId,
      },

      select: {
        email: true,
      },
    });

  for (const user of users) {
    await sendNewMatchEmail({
      to: user.email,

      score: result.score,

      clientName:
        `${client.firstName} ${client.lastName}`,

      propertyTitle:
        property.title,

      matchId: match.id,
    });
  }
}
    }
  }
}
