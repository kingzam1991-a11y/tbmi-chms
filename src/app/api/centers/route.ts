import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const DEFAULT_CENTERS = [
  {
    id: "osogbo-default",
    name: "TBMI Osogbo Center",
    code: "OSOGBO",
    address: "Gbongan-Ibadan Road Axis, Osogbo",
    city: "Osogbo",
    state: "Osun",
    leadPastor: "Lead Pastor",
    phone: "08030000000",
    isActive: true,
    _count: { members: 0, attendances: 0 },
  },
  {
    id: "torch-tribe-default",
    name: "Torch Tribe Center",
    code: "TORCH-TRIBE",
    address: "Torch Tribe, Osogbo",
    city: "Osogbo",
    state: "Osun",
    leadPastor: "Youth Pastor",
    phone: "08030000001",
    isActive: true,
    _count: { members: 0, attendances: 0 },
  },
];

export async function GET() {
  try {
    const centers = await prisma.center.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
      include: {
        _count: {
          select: { members: true, attendances: true },
        },
      },
    });

    if (centers && centers.length > 0) {
      return NextResponse.json({ success: true, centers });
    }

    return NextResponse.json({ success: true, centers: DEFAULT_CENTERS });
  } catch (error) {
    console.warn("Failed to fetch centers from database, returning default centers:", error);
    return NextResponse.json({ success: true, centers: DEFAULT_CENTERS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, code, address, city, state, leadPastor, phone } = body;

    if (!name || !code) {
      return NextResponse.json(
        { success: false, error: "Center name and unique code are required." },
        { status: 400 }
      );
    }

    const cleanCode = code.trim().toUpperCase().replace(/\s+/g, "-");

    const existing = await prisma.center.findUnique({
      where: { code: cleanCode },
    });

    if (existing) {
      return NextResponse.json(
        { success: false, error: `Center code "${cleanCode}" already exists.` },
        { status: 400 }
      );
    }

    const newCenter = await prisma.center.create({
      data: {
        name: name.trim(),
        code: cleanCode,
        address: address ? address.trim() : "Osogbo, Osun State",
        city: city ? city.trim() : "Osogbo",
        state: state ? state.trim() : "Osun",
        leadPastor: leadPastor ? leadPastor.trim() : null,
        phone: phone ? phone.trim() : null,
      },
      include: {
        _count: {
          select: { members: true, attendances: true },
        },
      },
    });

    return NextResponse.json({
      success: true,
      center: newCenter,
      message: `Center "${newCenter.name}" created successfully.`,
    });
  } catch (error: any) {
    console.error("Failed to create center:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to create center." },
      { status: 500 }
    );
  }
}
