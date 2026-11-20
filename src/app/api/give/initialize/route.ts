import { NextRequest, NextResponse } from "next/server";
import { initializePaystackPayment } from "@/lib/paystack";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, amount, donorName, phone, centerId, category } = body;

    if (!amount || amount <= 0 || !donorName || !centerId || !category) {
      return NextResponse.json(
        { success: false, error: "Please provide valid donation details." },
        { status: 400 }
      );
    }

    // Default donor email if none provided
    const donorEmail = email && email.includes("@") ? email : `giving-${Date.now()}@tbmi-osogbo.org`;

    const host = req.headers.get("host") || "localhost:3000";
    const protocol = host.includes("localhost") ? "http" : "https";
    const callbackUrl = `${protocol}://${host}/give/receipt`;

    const result = await initializePaystackPayment({
      email: donorEmail,
      amount: parseFloat(amount),
      donorName,
      phone,
      centerId,
      category,
      callbackUrl,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("Giving Init Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to initialize giving." },
      { status: 500 }
    );
  }
}
