import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

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

    return NextResponse.json({ success: true, centers });
  } catch (error) {
    console.error("Failed to fetch centers:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch centers" },
      { status: 500 }
    );
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
