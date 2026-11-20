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

    const [transactions, totalAgg] = await Promise.all([
      prisma.givingTransaction.findMany({
        where,
        orderBy: { date: "desc" },
        include: { center: true },
        take: 100,
      }),
      prisma.givingTransaction.aggregate({
        where: { ...where, status: "SUCCESS" },
        _sum: { amount: true },
        _count: { id: true },
      }),
    ]);

    // Breakdown by category
    const categoryTotals: Record<string, number> = {};
    for (const tx of transactions) {
      if (tx.status === "SUCCESS") {
        categoryTotals[tx.category] = (categoryTotals[tx.category] || 0) + tx.amount;
      }
    }

    return NextResponse.json({
      success: true,
      totalAmount: totalAgg._sum.amount || 0,
      totalCount: totalAgg._count.id || 0,
      categoryTotals,
      transactions,
    });
  } catch (error: any) {
    console.error("Finance API Error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch financial data" },
      { status: 500 }
    );
  }
}
