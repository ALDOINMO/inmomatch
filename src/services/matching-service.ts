import { prisma } from "@/lib/prisma";
import { calculateMatch } from "@/lib/matching-engine";

export async function recomputeAllMatches() {
  const [properties, clients] = await Promise.all([
    prisma.property.findMany({ where: { status: "ACTIVE" } }),
    prisma.client.findMany({ where: { status: "ACTIVE" } }),
  ]);

  let processed = 0;
  for (const property of properties) {
    for (const client of clients) {
      const result = calculateMatch(property, client);
      await prisma.match.upsert({
        where: { clientId_propertyId: { clientId: client.id, propertyId: property.id } },
        update: { score: result.score, differences: result.differences, exclusions: result.exclusions },
        create: { clientId: client.id, propertyId: property.id, score: result.score, differences: result.differences, exclusions: result.exclusions },
      });
      processed += 1;
    }
  }
  return processed;
}
