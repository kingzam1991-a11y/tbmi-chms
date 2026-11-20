import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const centerId = searchParams.get("centerId");
    const query = searchParams.get("query");
    const department = searchParams.get("department");

    const where: any = {};

    if (centerId && centerId !== "all") {
      where.centerId = centerId;
    }

    if (department && department !== "all") {
      where.department = department;
    }

    if (query) {
      where.OR = [
        { firstName: { contains: query } },
        { lastName: { contains: query } },
        { phone: { contains: query } },
        { whatsapp: { contains: query } },
        { residentialArea: { contains: query } },
      ];
    }

    const [members, totalCount] = await Promise.all([
      prisma.member.findMany({
        where,
        orderBy: { createdAt: "desc" },
        include: { center: true },
        take: 100,
      }),
      prisma.member.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      totalCount,
      members,
    });
  } catch (error) {
    console.error("Failed to fetch members:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch members" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      firstName,
      lastName,
      phone,
      whatsapp,
      centerId,
      gender,
      residentialArea,
      department,
      dobMonth,
      dobDay,
      occupation,
    } = body;

    if (!firstName || !lastName || !phone || !centerId) {
      return NextResponse.json(
        { success: false, error: "First Name, Last Name, Phone, and Center are required." },
        { status: 400 }
      );
    }

    const cleanPhone = phone.trim().replace(/[\s\-\(\)]/g, "");
    const cleanWhatsapp = (whatsapp || phone).trim().replace(/[\s\-\(\)]/g, "");

    const newMember = await prisma.member.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: cleanPhone,
        whatsapp: cleanWhatsapp,
        centerId,
        gender: gender || "MALE",
        residentialArea: residentialArea || "Osogbo",
        department: department || "General Member",
        dobMonth: dobMonth ? parseInt(dobMonth) : null,
        dobDay: dobDay ? parseInt(dobDay) : null,
        occupation: occupation || null,
        joinedVia: "ADMIN_MANUAL_ENTRY",
      },
      include: { center: true },
    });

    return NextResponse.json({
      success: true,
      member: newMember,
      message: "Member added successfully.",
    });
  } catch (error: any) {
    console.error("Add Member Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to add member." },
      { status: 500 }
    );
  }
}
