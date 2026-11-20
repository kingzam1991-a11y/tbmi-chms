"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Church,
  CheckCircle2,
  Printer,
  ArrowLeft,
  Share2,
  HeartHandshake,
  Calendar,
  CreditCard,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";

function ReceiptContent() {
  const searchParams = useSearchParams();
  const reference = searchParams.get("reference");
  const simulated = searchParams.get("simulated");
  const simAmount = searchParams.get("amount");
  const simCategory = searchParams.get("category");
  const simDonor = searchParams.get("donorName");
  const simCenterId = searchParams.get("centerId");

  const [loading, setLoading] = useState(true);
  const [transaction, setTransaction] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!reference) {
      setError("No transaction reference provided.");
      setLoading(false);
      return;
    }

    async function verify() {
      try {
        const params = new URLSearchParams();
        params.set("reference", reference!);
        if (simulated) params.set("simulated", simulated);
        if (simAmount) params.set("amount", simAmount);
        if (simCategory) params.set("category", simCategory);
        if (simDonor) params.set("donorName", simDonor);
        if (simCenterId) params.set("centerId", simCenterId);

        const res = await fetch(`/api/give/verify?${params.toString()}`);
        const data = await res.json();

        if (data.success && data.transaction) {
          setTransaction(data.transaction);
        } else {
          setError(data.error || "Failed to verify transaction status.");
        }
      } catch (err: any) {
        setError("Network error while verifying payment.");
      } finally {
        setLoading(false);
      }
    }

    verify();
  }, [reference, simulated, simAmount, simCategory, simDonor, simCenterId]);

  if (loading) {
    return (
      <div className="py-24 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-amber-400 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-white">Verifying Payment with Paystack...</h2>
        <p className="text-xs text-slate-400 mt-1">
          Generating your official TBMI Osogbo giving receipt.
        </p>
      </div>
    );
  }

  if (error || !transaction) {
    return (
      <div className="max-w-md mx-auto p-8 bg-slate-900 border border-rose-500/30 rounded-3xl text-center">
        <AlertCircle className="w-12 h-12 text-rose-400 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-white mb-2">Verification Notice</h2>
        <p className="text-xs text-slate-300 mb-6">{error || "Could not retrieve transaction."}</p>
        <Link
          href="/give"
          className="inline-block px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl"
        >
          Return to Giving Portal
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <div className="mb-4 text-center print:hidden">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold mb-2">
          <CheckCircle2 className="w-3.5 h-3.5" /> Payment Confirmed
        </div>
        <h1 className="text-2xl font-black text-white">Thank You For Your Seed!</h1>
        <p className="text-xs text-slate-400 mt-1">
          &quot;Give, and it shall be given unto you; good measure, pressed down...&quot; — Luke 6:38
        </p>
      </div>

      {/* Official Printable Receipt Card */}
      <div className="bg-white text-slate-900 rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 relative overflow-hidden">
        {/* Top Watermark / Badge */}
        <div className="flex items-center justify-between pb-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <Image
              src="/tbmi-logo-full.png"
              alt="Torchbearers Ministries International"
              width={200}
              height={68}
              className="h-11 w-auto object-contain"
              priority
            />
            <div>
              <div className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                Official Giving Receipt
              </div>
              <div className="text-[11px] text-amber-600 font-semibold">
                Verified Donation
              </div>
            </div>
          </div>
          <div className="text-right">
            <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase tracking-wider">
              Paid
            </span>
          </div>
        </div>

        {/* Amount Banner */}
        <div className="py-6 text-center border-b border-slate-200">
          <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-1">
            Amount Seeded
          </span>
          <div className="text-3xl font-black text-slate-950">
            ₦{transaction.amount?.toLocaleString()}
          </div>
          <span className="text-xs font-semibold text-emerald-600 block mt-1">
            {transaction.category?.replace(/_/g, " ")}
          </span>
        </div>

        {/* Breakdown Items */}
        <div className="py-5 space-y-3 text-xs border-b border-slate-200">
          <div className="flex justify-between">
            <span className="text-slate-500">Giver / Donor</span>
            <span className="font-bold text-slate-900">{transaction.donorName}</span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Destination Center</span>
            <span className="font-bold text-slate-900">
              {transaction.center?.name || "TBMI Osogbo"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Payment Gateway</span>
            <span className="font-medium text-slate-800">
              {transaction.paymentMethod === "PAYSTACK_ONLINE" ? "Paystack (Card/USSD)" : "Bank Transfer"}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Reference No.</span>
            <span className="font-mono text-[11px] font-bold text-slate-700">
              {transaction.reference}
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-slate-500">Date & Time</span>
            <span className="text-slate-700">
              {new Date(transaction.date || transaction.createdAt).toLocaleString("en-GB", {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </span>
          </div>
        </div>

        {/* Footer Blessing & Vision */}
        <div className="pt-4 text-center">
          <p className="text-[11px] font-semibold text-amber-700 italic mb-1">
            &ldquo;Raising a generation of people using power for purpose.&rdquo;
          </p>
          <p className="text-[10px] text-slate-500 italic">
            &quot;The Lord will open to you His good treasure, the heavens to give the rain to your land in its season, and to bless all the work of your hand.&quot; — Deut 28:12
          </p>
          <div className="text-[9px] text-slate-400 mt-2 font-mono">
            Verified by TBMI Central Secretariat &bull; Osun State, Nigeria
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 space-y-3 print:hidden">
        <button
          onClick={() => window.print()}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition"
        >
          <Printer className="w-4 h-4" /> Print or Save Receipt (PDF)
        </button>

        <div className="flex gap-2">
          <Link
            href="/give"
            className="flex-1 text-center py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition"
          >
            Give Again
          </Link>

          <Link
            href="/"
            className="flex-1 text-center py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold text-xs transition"
          >
            Portal Home
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function ReceiptPage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 py-12 px-4">
      <Suspense fallback={<div className="text-center text-slate-400">Loading receipt...</div>}>
        <ReceiptContent />
      </Suspense>
    </div>
  );
}
