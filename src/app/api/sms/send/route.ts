import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { sendSMS } from "@/lib/sms";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { centerId, department, customPhone, message } = body;

    if (!message || message.trim() === "") {
      return NextResponse.json(
        { success: false, error: "SMS message text is required." },
        { status: 400 }
      );
    }

    // Direct single-number send
    if (customPhone) {
      const result = await sendSMS({ to: customPhone, message });
      return NextResponse.json({
        success: result.success,
        count: 1,
        details: [result],
      });
    }

    // Group / Broadcast send based on criteria
    const where: any = {};
    if (centerId && centerId !== "all") {
      where.centerId = centerId;
    }
    if (department && department !== "all") {
      where.department = department;
    }

    const members = await prisma.member.findMany({
      where,
      select: { phone: true, firstName: true },
    });

    if (members.length === 0) {
      return NextResponse.json(
        { success: false, error: "No members found matching the specified criteria." },
        { status: 404 }
      );
    }

    // Dispatch SMS in batches
    const results = [];
    for (const member of members) {
      if (member.phone) {
        const res = await sendSMS({ to: member.phone, message });
        results.push(res);
      }
    }

    return NextResponse.json({
      success: true,
      count: results.length,
      message: `SMS dispatched to ${results.length} members.`,
      simulated: !process.env.TERMII_API_KEY,
    });
  } catch (error: any) {
    console.error("SMS Broadcast Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to broadcast SMS." },
      { status: 500 }
    );
  }
}
