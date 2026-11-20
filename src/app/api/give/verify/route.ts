import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyPaystackPayment } from "@/lib/paystack";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const reference = searchParams.get("reference");
    const simulated = searchParams.get("simulated") === "true";
    const simAmount = searchParams.get("amount");
    const simCategory = searchParams.get("category");
    const simDonor = searchParams.get("donorName");
    const simCenterId = searchParams.get("centerId");

    if (!reference) {
      return NextResponse.json(
        { success: false, error: "Payment reference is required." },
        { status: 400 }
      );
    }

    // Check if transaction already exists in database
    let existingTx = await prisma.givingTransaction.findUnique({
      where: { reference },
      include: { center: true },
    });

    if (existingTx) {
      return NextResponse.json({
        success: true,
        alreadyProcessed: true,
        transaction: existingTx,
      });
    }

    // If simulated mode from frontend
    if (simulated) {
      const center = simCenterId
        ? await prisma.center.findUnique({ where: { id: simCenterId } })
        : await prisma.center.findFirst();

      if (!center) {
        return NextResponse.json(
          { success: false, error: "Center not found" },
          { status: 400 }
        );
      }

      const tx = await prisma.givingTransaction.create({
        data: {
          centerId: center.id,
          donorName: simDonor || "Beloved Member",
          category: simCategory || "TITHE",
          amount: parseFloat(simAmount || "5000"),
          currency: "NGN",
          paymentMethod: "PAYSTACK_ONLINE",
          reference,
          status: "SUCCESS",
          notes: "Online Giving (Simulated Paystack Mode)",
        },
        include: { center: true },
      });

      return NextResponse.json({
        success: true,
        transaction: tx,
      });
    }

    // Verify with Paystack live API
    const verification = await verifyPaystackPayment(reference);

    if (!verification.success || verification.status !== "success") {
      return NextResponse.json(
        { success: false, error: "Payment could not be verified by Paystack." },
        { status: 400 }
      );
    }

    // Metadata extracted
    const metadata = verification.metadata || {};
    const centerId = metadata.centerId;
    const category = metadata.category || "SUNDAY_OFFERING";
    const donorName = metadata.donorName || verification.customer?.email || "Beloved Giver";
    const donorPhone = metadata.phone;

    // Resolve center
    const center = centerId
      ? await prisma.center.findUnique({ where: { id: centerId } })
      : await prisma.center.findFirst();

    if (!center) {
      return NextResponse.json(
        { success: false, error: "Church Center not resolved" },
        { status: 400 }
      );
    }

    // Optional: link to member if phone matches
    let memberId = undefined;
    if (donorPhone) {
      const member = await prisma.member.findFirst({
        where: { phone: donorPhone },
      });
      if (member) memberId = member.id;
    }

    const tx = await prisma.givingTransaction.create({
      data: {
        centerId: center.id,
        memberId,
        donorName,
        donorPhone,
        category,
        amount: verification.amount || 0,
        currency: verification.currency || "NGN",
        paymentMethod: "PAYSTACK_ONLINE",
        reference,
        status: "SUCCESS",
        date: verification.paidAt ? new Date(verification.paidAt) : new Date(),
        notes: `Paystack Channel: ${verification.channel || "card"}`,
      },
      include: { center: true },
    });

    return NextResponse.json({
      success: true,
      transaction: tx,
    });
  } catch (error: any) {
    console.error("Giving Verify Error:", error);
    return NextResponse.json(
      { success: false, error: error.message || "Failed to verify transaction." },
      { status: 500 }
    );
  }
}
