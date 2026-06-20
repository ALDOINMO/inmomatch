import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Limpiando locations...");

  await prisma.location.deleteMany();

  console.log("Obteniendo provincias...");

  const provincesResponse = await fetch(
    "https://apis.datos.gob.ar/georef/api/provincias?campos=id,nombre&max=100"
  );

  const provincesData =
    await provincesResponse.json();

  const locations: {
    province: string;
    department: string;
    city: string;
  }[] = [];

  for (const province of provincesData.provincias) {
    console.log(
      `Provincia: ${province.nombre}`
    );

    const departmentsResponse =
      await fetch(
        `https://apis.datos.gob.ar/georef/api/departamentos?provincia=${encodeURIComponent(
          province.nombre
        )}&campos=id,nombre&max=1000`
      );

    const departmentsData =
      await departmentsResponse.json();

    for (const department of departmentsData.departamentos) {
      const localitiesResponse =
        await fetch(
          `https://apis.datos.gob.ar/georef/api/localidades?provincia=${encodeURIComponent(
            province.nombre
          )}&departamento=${encodeURIComponent(
            department.nombre
          )}&campos=id,nombre&max=1000`
        );

      const localitiesData =
        await localitiesResponse.json();

      for (const locality of localitiesData.localidades ?? []) {
        locations.push({
          province:
            province.nombre,
          department:
            department.nombre,
          city:
            locality.nombre,
        });
      }
    }
  }

  console.log(
  `Insertando ${locations.length} localidades...`
);

const chunkSize = 1000;

for (
  let i = 0;
  i < locations.length;
  i += chunkSize
) {
  const chunk =
    locations.slice(
      i,
      i + chunkSize
    );

  await prisma.location.createMany({
  data: chunk,
  skipDuplicates: true,
});

  console.log(
    `Insertadas ${Math.min(
      i + chunkSize,
      locations.length
    )}/${locations.length}`
  );
}

  console.log("Listo 🚀");
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });