import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function run() {
  const centers = await prisma.center.findMany();
  console.log("Database Centers Count:", centers.length);
  centers.forEach((c) => console.log(`- ${c.name} [Code: ${c.code}]`));
  const user = await prisma.user.findFirst();
  console.log("Seeded Admin User:", user?.name, user?.email);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
