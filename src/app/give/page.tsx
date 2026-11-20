"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Church,
  HeartHandshake,
  CreditCard,
  Building,
  ShieldCheck,
  ArrowLeft,
  CheckCircle2,
  Sparkles,
  Loader2,
  Lock,
  Copy,
  Check,
} from "lucide-react";

interface Center {
  id: string;
  name: string;
  code: string;
  address: string;
}

const CATEGORIES = [
  { id: "TITHE", label: "Tithe", desc: "Honor the Lord with the firstfruits (Mal 3:10)" },
  { id: "SUNDAY_OFFERING", label: "Sunday Offering", desc: "General worship & service offering" },
  { id: "THANKSGIVING", label: "Thanksgiving Seed", desc: "For divine protection, healing & miracles" },
  { id: "BUILDING_PROJECT", label: "Building & Cathedral Project", desc: "Expanding sanctuary facilities in Osogbo" },
  { id: "MISSIONS", label: "Missions & Evangelism", desc: "Taking the Gospel across Osun State" },
  { id: "WELFARE", label: "Welfare & Benevolence", desc: "Supporting widows, orphans & the needy" },
  { id: "SPECIAL_SEED", label: "Pastor's Blessing Seed", desc: "Honoring spiritual leadership" },
];

const PRESETS = [1000, 2500, 5000, 10000, 20000, 50000, 100000];

function GiveContent() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") || "TITHE";

  const [centers, setCenters] = useState<Center[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [amount, setAmount] = useState<number | string>(5000);
  const [donorName, setDonorName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"paystack" | "bank">("paystack");
  const [copiedBank, setCopiedBank] = useState(false);

  useEffect(() => {
    async function loadCenters() {
      try {
        const res = await fetch("/api/centers");
        const data = await res.json();
        if (data.success && data.centers) {
          setCenters(data.centers);
          if (data.centers.length > 0) {
            setSelectedCenterId(data.centers[0].id);
          }
        }
      } catch (err) {
        console.error(err);
      }
    }
    loadCenters();
  }, []);

  const handlePaystackPay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
    if (!numAmount || numAmount <= 0) {
      setErrorMessage("Please enter a valid amount.");
      return;
    }
    if (!donorName.trim()) {
      setErrorMessage("Please enter your name.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/give/initialize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: numAmount,
          donorName,
          phone,
          email,
          centerId: selectedCenterId,
          category: selectedCategory,
        }),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error || "Payment initialization failed.");
        setLoading(false);
        return;
      }

      // Redirect to Paystack or receipt
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      }
    } catch (err: any) {
      setErrorMessage("Network error initializing payment.");
      setLoading(false);
    }
  };

  const handleCopyAccount = (acct: string) => {
    navigator.clipboard.writeText(acct);
    setCopiedBank(true);
    setTimeout(() => setCopiedBank(false), 2000);
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* Top Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition font-medium mb-3"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Portal Home
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Image
            src="/tbmi-logo-white.png"
            alt="Torchbearers Ministries International"
            width={240}
            height={80}
            className="h-12 w-auto object-contain"
            priority
          />
          <div className="sm:border-l sm:border-slate-800 sm:pl-3">
            <span className="text-xs uppercase font-extrabold tracking-wider text-amber-400 block">
              The Torchbearers Vision
            </span>
            <span className="text-[11px] text-slate-300 italic block">
              &ldquo;Raising a generation of people using power for purpose.&rdquo;
            </span>
          </div>
        </div>
        <h1 className="text-3xl font-extrabold text-white">Online Giving & Seed</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Support God&apos;s work at TBMI Osogbo Center or Torch Tribe through Paystack or direct transfer.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 mb-6 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs">
          {errorMessage}
        </div>
      )}

      {/* Mode Switcher */}
      <div className="grid grid-cols-2 p-1 bg-slate-900 border border-slate-800 rounded-2xl mb-6">
        <button
          type="button"
          onClick={() => setActiveTab("paystack")}
          className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === "paystack"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <CreditCard className="w-4 h-4" /> Pay with Paystack (Card / USSD / NIP)
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("bank")}
          className={`py-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 ${
            activeTab === "bank"
              ? "bg-amber-500 text-slate-950 shadow-md"
              : "text-slate-400 hover:text-white"
          }`}
        >
          <Building className="w-4 h-4" /> Church Bank Accounts
        </button>
      </div>

      {activeTab === "paystack" ? (
        <form
          onSubmit={handlePaystackPay}
          className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6"
        >
          {/* Center Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
              <Church className="w-3.5 h-3.5" /> Destination Center in Osogbo
            </label>
            <select
              value={selectedCenterId}
              onChange={(e) => setSelectedCenterId(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
              required
            >
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Giving Category
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`p-3 rounded-xl border text-left transition ${
                    selectedCategory === cat.id
                      ? "bg-amber-500/10 border-amber-400 text-amber-300"
                      : "bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700"
                  }`}
                >
                  <span className="block font-bold text-xs text-white">
                    {cat.label}
                  </span>
                  <span className="block text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                    {cat.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Amount Selection & Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-2">
              Amount (NGN ₦)
            </label>
            <div className="grid grid-cols-4 sm:grid-cols-7 gap-2 mb-3">
              {PRESETS.map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAmount(p)}
                  className={`py-2 rounded-xl text-xs font-semibold border transition ${
                    amount === p
                      ? "bg-amber-500 text-slate-950 border-amber-400"
                      : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                  }`}
                >
                  ₦{p.toLocaleString()}
                </button>
              ))}
            </div>

            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-slate-400 font-bold text-sm">
                ₦
              </span>
              <input
                type="number"
                required
                min="100"
                placeholder="Or enter custom amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-sm text-white font-semibold focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          {/* Donor Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Your Full Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Bro. David Olawale"
                value={donorName}
                onChange={(e) => setDonorName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                Phone Number (Optional)
              </label>
              <input
                type="tel"
                placeholder="08012345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
              <span>Email Address (For Instant Receipt)</span>
              <span className="text-[11px] text-slate-400">Optional</span>
            </label>
            <input
              type="email"
              placeholder="e.g. member@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-base shadow-xl shadow-emerald-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Connecting to Paystack...</span>
              </>
            ) : (
              <>
                <Lock className="w-4 h-4" />
                <span>
                  Proceed to Give ₦
                  {typeof amount === "number"
                    ? amount.toLocaleString()
                    : parseFloat(amount || "0").toLocaleString()}
                </span>
              </>
            )}
          </button>

          <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>256-bit Bank Grade Security via Paystack (PCI-DSS Level 1)</span>
          </div>
        </form>
      ) : (
        /* Direct Bank Transfer Information */
        <div className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          <div className="text-center sm:text-left mb-4">
            <h3 className="text-lg font-bold text-white mb-1">
              Official TBMI Osogbo Bank Accounts
            </h3>
            <p className="text-xs text-slate-400">
              You can make direct bank transfers or mobile app deposits into any of these dedicated ministry accounts.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                bank: "Zenith Bank PLC",
                accountNumber: "1012345678",
                accountName: "Torchbearers Ministries International (TBMI)",
                purpose: "Tithe & General Church Account",
              },
              {
                bank: "Guaranty Trust Bank (GTBank)",
                accountNumber: "0123456789",
                accountName: "TBMI Osogbo Cathedral Project",
                purpose: "Building & Expansion Fund",
              },
              {
                bank: "Access Bank",
                accountNumber: "0098765432",
                accountName: "TBMI Osogbo Missions & Welfare",
                purpose: "Missions, Outreach & Welfare",
              },
            ].map((acct, idx) => (
              <div
                key={idx}
                className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 block mb-1">
                    {acct.purpose}
                  </span>
                  <div className="text-sm font-bold text-white">{acct.bank}</div>
                  <div className="text-base font-mono font-bold text-emerald-400 tracking-wider">
                    {acct.accountNumber}
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5">{acct.accountName}</div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyAccount(acct.accountNumber)}
                  className="self-start sm:self-center px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  {copiedBank ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      <span>Copy Account No</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-xs text-amber-300">
            <strong>Note for Bank Transfers:</strong> Please add your Center code (e.g. <code>CENTRAL</code> or <code>OKE-FIA</code>) and Giving Category (e.g. <code>TITHE</code>) in your transfer description/remarks so the finance committee can allocate your gift appropriately.
          </div>
        </div>
      )}
    </div>
  );
}

export default function GivePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 py-10 px-4">
      <Suspense fallback={<div className="text-center text-slate-400">Loading giving portal...</div>}>
        <GiveContent />
      </Suspense>
    </div>
  );
}
