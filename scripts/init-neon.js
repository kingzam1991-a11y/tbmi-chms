const { neon, neonConfig } = require("@neondatabase/serverless");

neonConfig.fetchOptions = {
  timeout: 45000,
};

const DATABASE_URL = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_P3gMlF5arLBf@ep-snowy-silence-b9yadgkx-pooler.c-7.eu-central-1.aws.neon.tech/neondb?sslmode=require";

const sql = neon(DATABASE_URL);

async function runWithRetry(fn, desc, maxRetries = 3) {
  for (let i = 1; i <= maxRetries; i++) {
    try {
      console.log(`[Attempt ${i}] ${desc}...`);
      return await fn();
    } catch (e) {
      console.warn(`Attempt ${i} failed (${e.message}). Waiting 3s...`);
      if (i === maxRetries) throw e;
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

async function init() {
  console.log("Connecting to Neon PostgreSQL...");

  await runWithRetry(async () => {
    return await sql`
      CREATE TABLE IF NOT EXISTS "Center" (
        "id" TEXT PRIMARY KEY,
        "name" TEXT NOT NULL,
        "code" TEXT UNIQUE NOT NULL,
        "address" TEXT NOT NULL,
        "city" TEXT NOT NULL DEFAULT 'Osogbo',
        "state" TEXT NOT NULL DEFAULT 'Osun',
        "leadPastor" TEXT,
        "phone" TEXT,
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
  }, "Creating Center table");

  await runWithRetry(async () => {
    return await sql`
      CREATE TABLE IF NOT EXISTS "User" (
        "id" TEXT PRIMARY KEY,
        "email" TEXT UNIQUE NOT NULL,
        "passwordHash" TEXT NOT NULL,
        "name" TEXT NOT NULL,
        "role" TEXT NOT NULL DEFAULT 'WORKER',
        "phone" TEXT,
        "centerId" TEXT REFERENCES "Center"("id") ON DELETE SET NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
  }, "Creating User table");

  await runWithRetry(async () => {
    return await sql`
      CREATE TABLE IF NOT EXISTS "Member" (
        "id" TEXT PRIMARY KEY,
        "centerId" TEXT NOT NULL REFERENCES "Center"("id") ON DELETE RESTRICT,
        "firstName" TEXT NOT NULL,
        "lastName" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "whatsapp" TEXT NOT NULL,
        "email" TEXT,
        "gender" TEXT NOT NULL,
        "dobDay" INTEGER,
        "dobMonth" INTEGER,
        "dobYear" INTEGER,
        "residentialArea" TEXT NOT NULL,
        "occupation" TEXT,
        "maritalStatus" TEXT,
        "weddingAnniversary" TEXT,
        "department" TEXT,
        "homeCellZone" TEXT,
        "joinedVia" TEXT NOT NULL DEFAULT 'WHATSAPP_SELF_REGISTRATION',
        "isActive" BOOLEAN NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
  }, "Creating Member table");

  await runWithRetry(async () => {
    return await sql`
      CREATE TABLE IF NOT EXISTS "FirstTimer" (
        "id" TEXT PRIMARY KEY,
        "centerId" TEXT NOT NULL REFERENCES "Center"("id") ON DELETE RESTRICT,
        "memberId" TEXT UNIQUE REFERENCES "Member"("id") ON DELETE SET NULL,
        "fullName" TEXT NOT NULL,
        "phone" TEXT NOT NULL,
        "whatsapp" TEXT,
        "gender" TEXT,
        "residentialArea" TEXT,
        "invitedBy" TEXT,
        "serviceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "serviceType" TEXT NOT NULL DEFAULT 'SUNDAY_1ST_SERVICE',
        "stage" TEXT NOT NULL DEFAULT 'NEW',
        "assignedWorkerId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
        "notes" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
  }, "Creating FirstTimer table");

  await runWithRetry(async () => {
    return await sql`
      CREATE TABLE IF NOT EXISTS "Attendance" (
        "id" TEXT PRIMARY KEY,
        "centerId" TEXT NOT NULL REFERENCES "Center"("id") ON DELETE RESTRICT,
        "serviceDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "serviceType" TEXT NOT NULL,
        "totalCount" INTEGER NOT NULL DEFAULT 0,
        "menCount" INTEGER NOT NULL DEFAULT 0,
        "womenCount" INTEGER NOT NULL DEFAULT 0,
        "youthCount" INTEGER NOT NULL DEFAULT 0,
        "childrenCount" INTEGER NOT NULL DEFAULT 0,
        "firstTimersCount" INTEGER NOT NULL DEFAULT 0,
        "notes" TEXT,
        "recordedByUserId" TEXT REFERENCES "User"("id") ON DELETE SET NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
  }, "Creating Attendance table");

  await runWithRetry(async () => {
    return await sql`
      CREATE TABLE IF NOT EXISTS "GivingTransaction" (
        "id" TEXT PRIMARY KEY,
        "centerId" TEXT NOT NULL REFERENCES "Center"("id") ON DELETE RESTRICT,
        "memberId" TEXT REFERENCES "Member"("id") ON DELETE SET NULL,
        "donorName" TEXT NOT NULL,
        "donorPhone" TEXT,
        "category" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "currency" TEXT NOT NULL DEFAULT 'NGN',
        "paymentMethod" TEXT NOT NULL,
        "reference" TEXT UNIQUE,
        "status" TEXT NOT NULL DEFAULT 'SUCCESS',
        "notes" TEXT,
        "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
      );
    `;
  }, "Creating GivingTransaction table");

  console.log("All tables created successfully!");

  console.log("Seeding initial Centers...");
  await runWithRetry(async () => {
    return await sql`
      INSERT INTO "Center" ("id", "name", "code", "address", "city", "state", "leadPastor", "phone", "isActive", "createdAt", "updatedAt")
      VALUES 
        ('center-osogbo-01', 'TBMI Osogbo Center', 'OSOGBO', 'Cele Area, Oke Baale, Osogbo', 'Osogbo', 'Osun', 'Lead Pastor', '08030000000', true, NOW(), NOW())
      ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name", "address" = EXCLUDED."address";
    `;
  }, "Seeding TBMI Osogbo Center");

  await runWithRetry(async () => {
    return await sql`
      INSERT INTO "Center" ("id", "name", "code", "address", "city", "state", "leadPastor", "phone", "isActive", "createdAt", "updatedAt")
      VALUES 
        ('center-torch-tribe-02', 'Torch Tribe Center', 'TORCH-TRIBE', 'Torch Tribe, Osogbo', 'Osogbo', 'Osun', 'Youth Pastor', '08030000001', true, NOW(), NOW())
      ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name", "address" = EXCLUDED."address";
    `;
  }, "Seeding Torch Tribe Center");

  const centers = await sql`SELECT "id", "name", "code", "address" FROM "Center";`;
  console.log("SUCCESS! Centers in Neon Postgres:", centers);
}

init().catch((err) => {
  console.error("Init Error:", err);
  process.exit(1);
});
