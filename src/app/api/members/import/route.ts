import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { rows, defaultCenterId } = body;

    if (!Array.isArray(rows) || rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "No member records found to import." },
        { status: 400 }
      );
    }

    // Fetch existing centers for fuzzy matching
    const centers = await prisma.center.findMany();
    const osogboCenter = centers.find((c) => c.code === "OSOGBO") || centers[0];

    let importedCount = 0;
    let updatedCount = 0;
    const errors: string[] = [];

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];

      // Handle common variations in Google Forms / Excel header names
      const fullName = (
        row["Full Name"] ||
        row["Name"] ||
        row["full_name"] ||
        row["FullName"] ||
        ""
      ).trim();

      let firstName = (row["First Name"] || row["firstName"] || "").trim();
      let lastName = (row["Last Name"] || row["Surname"] || row["lastName"] || "").trim();

      if (!firstName && fullName) {
        const parts = fullName.split(" ");
        firstName = parts[0] || "Member";
        lastName = parts.slice(1).join(" ") || "TBMI";
      }

      const phoneRaw = (
        row["Phone Number"] ||
        row["Phone"] ||
        row["WhatsApp Number"] ||
        row["WhatsApp"] ||
        row["phone"] ||
        ""
      ).toString().trim();

      if (!phoneRaw) {
        errors.push(`Row ${i + 1}: Skipped (Missing phone number).`);
        continue;
      }

      // Clean phone number
      const phone = phoneRaw.replace(/[\s\-\(\)]/g, "");
      const whatsapp = (row["WhatsApp"] || row["WhatsApp Number"] || phone).toString().trim();

      // Resolve center
      const centerRaw = (row["Center"] || row["Worship Center"] || row["center"] || "").toString().toLowerCase();
      let matchedCenterId = defaultCenterId;

      if (centerRaw.includes("torch") || centerRaw.includes("tribe")) {
        const torchCenter = centers.find((c) => c.code === "TORCH-TRIBE");
        if (torchCenter) matchedCenterId = torchCenter.id;
      } else if (centerRaw.includes("osogbo")) {
        matchedCenterId = osogboCenter.id;
      }

      if (!matchedCenterId) {
        matchedCenterId = osogboCenter.id;
      }

      const residentialArea = (
        row["Residential Area"] ||
        row["Area"] ||
        row["Address"] ||
        row["residentialArea"] ||
        "Osogbo"
      ).trim();

      const department = (
        row["Department"] ||
        row["Unit"] ||
        row["Service Unit"] ||
        row["department"] ||
        "General Member"
      ).trim();

      const gender = (row["Gender"] || row["gender"] || "MALE").toUpperCase().includes("F")
        ? "FEMALE"
        : "MALE";

      const dobMonth = row["Birthday Month"] || row["DOB Month"] ? parseInt(row["Birthday Month"] || row["DOB Month"]) : null;
      const dobDay = row["Birthday Day"] || row["DOB Day"] ? parseInt(row["Birthday Day"] || row["DOB Day"]) : null;

      try {
        const existing = await prisma.member.findFirst({
          where: {
            OR: [{ phone }, { whatsapp: phone }],
          },
        });

        if (existing) {
          await prisma.member.update({
            where: { id: existing.id },
            data: {
              firstName: firstName || existing.firstName,
              lastName: lastName || existing.lastName,
              residentialArea: residentialArea || existing.residentialArea,
              department: department || existing.department,
              dobMonth: dobMonth || existing.dobMonth,
              dobDay: dobDay || existing.dobDay,
            },
          });
          updatedCount++;
        } else {
          await prisma.member.create({
            data: {
              firstName: firstName || "Member",
              lastName: lastName || "TBMI",
              phone,
              whatsapp,
              centerId: matchedCenterId,
              gender,
              residentialArea,
              department,
              dobMonth,
              dobDay,
              joinedVia: "GOOGLE_SHEETS_CSV_IMPORT",
            },
          });
          importedCount++;
        }
      } catch (err: any) {
        errors.push(`Row ${i + 1} (${fullName || phone}): ${err.message}`);
      }
    }

    return NextResponse.json({
      success: true,
      importedCount,
      updatedCount,
      totalProcessed: rows.length,
      errors: errors.slice(0, 10),
    });
  } catch (error: any) {
    console.error("Bulk Import Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to process import." },
      { status: 500 }
    );
  }
}
