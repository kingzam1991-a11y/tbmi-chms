import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding TBMI Centers...");

  const centers = [
    {
      name: "TBMI Osogbo Center",
      code: "OSOGBO",
      address: "Cele Area, Oke Baale, Osogbo",
      city: "Osogbo",
      state: "Osun",
      leadPastor: "Resident Pastor",
      phone: "+2348000000001",
    },
    {
      name: "Torch Tribe Center",
      code: "TORCH-TRIBE",
      address: "Torch Tribe, Osogbo",
      city: "Osogbo",
      state: "Osun",
      leadPastor: "Torch Tribe Pastor",
      phone: "+2348000000002",
    },
  ];

  for (const c of centers) {
    await prisma.center.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }

  const osogboCenter = await prisma.center.findUnique({
    where: { code: "OSOGBO" },
  });

  // Seed HQ Admin user
  await prisma.user.upsert({
    where: { email: "admin@tbmi-osogbo.org" },
    update: {},
    create: {
      name: "TBMI Secretariat Admin",
      email: "admin@tbmi-osogbo.org",
      passwordHash: "demo1234",
      role: "HQ_ADMIN",
      centerId: osogboCenter?.id,
      phone: "+2348000000000",
    },
  });

  console.log("Seeding completed successfully.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
