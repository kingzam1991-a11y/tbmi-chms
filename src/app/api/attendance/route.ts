import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const centerId = searchParams.get("centerId");

    const where: any = {};
    if (centerId && centerId !== "all") {
      where.centerId = centerId;
    }

    const attendances = await prisma.attendance.findMany({
      where,
      orderBy: { serviceDate: "desc" },
      include: { center: true },
      take: 50,
    });

    return NextResponse.json({ success: true, attendances });
  } catch (error) {
    console.error("Failed to fetch attendance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch attendance" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      centerId,
      serviceDate,
      serviceType,
      menCount,
      womenCount,
      youthCount,
      childrenCount,
      firstTimersCount,
      notes,
    } = body;

    if (!centerId || !serviceDate || !serviceType) {
      return NextResponse.json(
        { success: false, error: "Missing required service parameters" },
        { status: 400 }
      );
    }

    const men = parseInt(menCount || 0);
    const women = parseInt(womenCount || 0);
    const youth = parseInt(youthCount || 0);
    const children = parseInt(childrenCount || 0);
    const firstTimers = parseInt(firstTimersCount || 0);
    const totalCount = men + women + youth + children;

    const record = await prisma.attendance.create({
      data: {
        centerId,
        serviceDate: new Date(serviceDate),
        serviceType,
        menCount: men,
        womenCount: women,
        youthCount: youth,
        childrenCount: children,
        firstTimersCount: firstTimers,
        totalCount,
        notes: notes || null,
      },
      include: { center: true },
    });

    return NextResponse.json({ success: true, record });
  } catch (error) {
    console.error("Failed to record attendance:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record attendance" },
      { status: 500 }
    );
  }
}
