import { PrismaClient, Role, AccountStatus, PropertyType } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const realEstate = await prisma.realEstate.upsert({
    where: { id: "seed-real-estate" },
    update: {},
    create: {
      id: "seed-real-estate",
      name: "Firma Demo Inmobiliaria",
      phone: "+54 9 3546 555555",
      address: "Av. Principal 120",
      neighborhood: "Centro",
      city: "Villa Rumipal",
      professionalLicense: "CPI-0001",
      status: AccountStatus.ACTIVE,
      membershipExpiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  const admin = await prisma.user.upsert({
    where: { email: "admin@inmomatch.local" },
    update: {},
    create: {
      authUserId: "seed-auth-admin",
      email: "admin@inmomatch.local",
      firstName: "Admin",
      lastName: "Demo",
      phone: "+54 9 3546 555555",
      licenseNumber: "CPI-0001",
      role: Role.ADMIN_REAL_ESTATE,
      status: AccountStatus.ACTIVE,
      realEstateId: realEstate.id,
    },
  });

  await prisma.realEstate.update({ where: { id: realEstate.id }, data: { ownerId: admin.id } });

  const property = await prisma.property.upsert({
    where: {
  id: "seed-property",
},
    update: {},
    create: {
      realEstateId: realEstate.id,
      createdById: admin.id,
      cadastralId: "VR-E-29",
      id: "seed-property",
      title: "Casa moderna con vista al lago",
      type: PropertyType.CASA,
      price: 145000,
      currency: "USD",
      address: "Calle del Lago 150",
      addressHash: "villa-rumipal|calle-del-lago-150",
      city: "Villa Rumipal",
      neighborhood: "Zona E",
      financing: true,
      financingPercent: 30,
      acceptsTrade: true,
      tradePercent: 25,
      services: { luz: "Red", agua: "Red", gas: "Garrafa", conectividad: "Fibra" },
      features: { bedrooms: 3, bathrooms: 2, coveredArea: 120, totalArea: 560, pool: true, garage: true, creditReady: true, constructionTypes: ["Tradicional"], neighborhoodType: "Abierto", access: "Asfalto" },
      quality: { ageRange: "<5", generalState: "Muy bueno" },
    },
  });

  const client = await prisma.client.upsert({
    where: { id: "seed-client" },
    update: {},
    create: {
      id: "seed-client",
      realEstateId: realEstate.id,
      createdById: admin.id,
      firstName: "Lucia",
      lastName: "Buscadora",
      phone: "+54 9 351 555555",
      minBudget: 120000,
      maxBudget: 160000,
      currency: "USD",
      desiredTypes: [PropertyType.CASA],
      desiredCities: ["Villa Rumipal"],
      financingNeeded: true,
      financingPercent: 20,
      hasTrade: true,
      tradePercent: 30,
      needsCredit: true,
      requirements: { bedrooms: 3, bathrooms: 2, pool: "SI", garage: "SI", luz: "Red", agua: "Red", gas: "Indiferente", constructionTypes: ["Tradicional"], neighborhoodType: "Indiferente", access: "Indiferente" },
      minMatchThreshold: 75,
    },
  });

  await prisma.match.upsert({
    where: { clientId_propertyId: { clientId: client.id, propertyId: property.id } },
    update: {},
    create: { clientId: client.id, propertyId: property.id, requesterId: admin.id, score: 92, differences: [], exclusions: [] },
  });
}

main().finally(async () => prisma.$disconnect());
