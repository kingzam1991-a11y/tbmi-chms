import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function resetCenters() {
  console.log("Updating TBMI Centers to Osogbo Center and Torch Tribe Center...");

  // Desired centers
  const desiredCenters = [
    {
      name: "TBMI Osogbo Center",
      code: "OSOGBO",
      address: "Gbongan-Ibadan Road Axis, Osogbo",
      city: "Osogbo",
      state: "Osun",
      leadPastor: "Resident Pastor",
      phone: "+2348000000001",
    },
    {
      name: "Torch Tribe Center",
      code: "TORCH-TRIBE",
      address: "Torch Tribe Hub, Osogbo",
      city: "Osogbo",
      state: "Osun",
      leadPastor: "Torch Tribe Pastor",
      phone: "+2348000000002",
    },
  ];

  // Upsert the two active centers
  for (const c of desiredCenters) {
    await prisma.center.upsert({
      where: { code: c.code },
      update: c,
      create: c,
    });
  }

  const osogboCenter = await prisma.center.findUnique({ where: { code: "OSOGBO" } });

  // Re-link any existing members, users, and attendances from deleted codes to Osogbo Center
  const otherCenters = await prisma.center.findMany({
    where: {
      code: {
        notIn: ["OSOGBO", "TORCH-TRIBE"],
      },
    },
  });

  if (osogboCenter && otherCenters.length > 0) {
    const otherIds = otherCenters.map((c) => c.id);

    await prisma.member.updateMany({
      where: { centerId: { in: otherIds } },
      data: { centerId: osogboCenter.id },
    });

    await prisma.user.updateMany({
      where: { centerId: { in: otherIds } },
      data: { centerId: osogboCenter.id },
    });

    await prisma.attendance.updateMany({
      where: { centerId: { in: otherIds } },
      data: { centerId: osogboCenter.id },
    });

    await prisma.givingTransaction.updateMany({
      where: { centerId: { in: otherIds } },
      data: { centerId: osogboCenter.id },
    });

    // Delete obsolete mock centers
    await prisma.center.deleteMany({
      where: { id: { in: otherIds } },
    });
  }

  // Ensure Admin user is linked to Osogbo Center
  await prisma.user.upsert({
    where: { email: "admin@tbmi-osogbo.org" },
    update: { centerId: osogboCenter?.id },
    create: {
      name: "TBMI Secretariat Admin",
      email: "admin@tbmi-osogbo.org",
      passwordHash: "demo1234",
      role: "HQ_ADMIN",
      centerId: osogboCenter?.id,
      phone: "+2348000000000",
    },
  });

  console.log("Centers updated successfully. Current centers:");
  const current = await prisma.center.findMany();
  current.forEach((c) => console.log(`- ${c.name} [${c.code}]`));
}

resetCenters()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
