"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { Prisma, Role } from "@prisma/client";

import { requireUser } from "@/lib/auth";
import { ensureActiveMembership } from "@/lib/membership";
import { calculateMatch } from "@/lib/matching-engine";
import { prisma } from "@/lib/prisma";
import { sendNewMatchEmail } from "@/lib/email";
import { normalizeAddress } from "@/lib/utils";

import { propertySchema } from "@/validators/property";

function toPropertyData(
  input: unknown,
  realEstateId: string,
  userId: string
) {
  const data =
    propertySchema.parse(input);

  return {
    realEstateId,

    createdById: userId,

    title: data.title,

    cadastralId:
      data.cadastralId,

    type: data.type,

    price: new Prisma.Decimal(
      data.price
    ),

    currency: data.currency,

    address: data.address,

    addressHash: `${normalizeAddress(
      data.city
    )}|${normalizeAddress(
      data.address
    )}`,

    province:
  data.province,

department:
  data.department,

    city: data.city,

    neighborhood:
      data.neighborhood,

    description:
      data.description,

    documentation:
      data.documentation,

      documentationOther:
  data.documentationOther,

    financing:
  data.financing ===
  "true",

    financingPercent:
      data.financingPercent,

    acceptsTrade:
  data.acceptsTrade ===
  "true",

    tradePercent:
      data.tradePercent,

    services: {
      luz: data.luz,
      agua: data.agua,
      gas: data.gas,
      conectividad:
        data.conectividad,
    },

    features: {
      bedrooms:
        data.bedrooms,

      bathrooms:
        data.bathrooms,

      coveredArea:
        data.coveredArea,

      totalArea:
        data.totalArea,

     creditReady:
  data.creditReady ===
  "true",

pool:
  data.pool ===
  "true",

garage:
  data.garage ===
  "true",

      neighborhoodType:
        data.neighborhoodType,

      access: data.access,

      constructionTypes:
        data.constructionTypes
          ?.split(",")

          .map((v) =>
            v.trim()
          )

          .filter(Boolean),
    },

    fieldFeatures: {
      soilAptitude:
        data.soilAptitude,

      hectares:
        data.hectares,
    },

    quality: {
      generalState:
        data.generalState,
    },
  };
}

export async function createPropertyAction(
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

  const payload =
    toPropertyData(
      input,
      user.realEstateId,
      user.id
    );

  const existing =
    await prisma.property.findFirst(
      {
        where: {
          addressHash:
            payload.addressHash,

          status: {
            in: [
              "ACTIVE",
              "PAUSED",
              "IN_REVIEW",
            ],
          },
        },
      }
    );

  if (existing) {
    return {
      error:
        "Ya existe una ficha activa con esa direccion exacta.",
    };
  }

  const property =
    await prisma.property.create({
      data: payload,
    });

  await recomputeMatchesForProperty(
    property.id,
    user.id
  );

  revalidatePath(
    "/properties"
  );

  redirect(
    `/properties/${property.id}`
  );
}

export async function updatePropertyAction(
  id: string,
  input: unknown
) {
  const user =
    await requireUser();

  ensureActiveMembership(
    user
  );

  const property =
    await prisma.property.findUnique(
      {
        where: { id },
      }
    );

  if (!property) {
    return {
      error:
        "Propiedad inexistente.",
    };
  }

  if (
    user.role !==
      Role.SUPER_ADMIN &&
    property.realEstateId !==
      user.realEstateId
  ) {
    return {
      error: "Sin permiso.",
    };
  }

  const payload =
    toPropertyData(
      input,
      property.realEstateId,
      property.createdById
    );

  await prisma.property.update({
    where: { id },
    data: payload,
  });

  await recomputeMatchesForProperty(
    id,
    user.id
  );

  revalidatePath(
    "/properties"
  );

  redirect(
    `/properties/${id}`
  );
}

export async function deletePropertyAction(
  id: string
) {
  const user =
    await requireUser();

  ensureActiveMembership(
    user
  );

  const property =
    await prisma.property.findUnique(
      {
        where: { id },
      }
    );

  if (!property) {
    return {
      error:
        "Propiedad inexistente.",
    };
  }

  if (
    user.role !==
      Role.SUPER_ADMIN &&
    property.realEstateId !==
      user.realEstateId
  ) {
    return {
      error: "Sin permiso.",
    };
  }

  await prisma.property.update({
    where: { id },

    data: {
      status: "ARCHIVED",
    },
  });

  revalidatePath(
    "/properties"
  );
}

export async function recomputeMatchesForProperty(
  propertyId: string,
  requesterId?: string
) {
  const property =
    await prisma.property.findUnique(
      {
        where: {
          id: propertyId,
        },
      }
    );

  if (!property) return;

  await prisma.match.deleteMany({
  where: {
    propertyId,
  },
});

  const clients =
    await prisma.client.findMany(
      {
        where: {
          status: "ACTIVE",
        },
      }
    );

  for (const client of clients) {
    const result =
      calculateMatch(
        property,
        client
      );

      if (
  client.realEstateId ===
  property.realEstateId
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
                clientId:
                  client.id,

                propertyId,
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
            clientId:
              client.id,

            propertyId,

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
      client.realEstateId,

    type: "MATCH",

    title:
      "Nuevo match encontrado",

    body: `${property.title} coincide con ${client.firstName} ${client.lastName} (${result.score}%)`,

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
          client.realEstateId,
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