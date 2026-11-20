"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  Church,
  UserCheck,
  CheckCircle2,
  Share2,
  ArrowLeft,
  Users,
  MapPin,
  Calendar,
  Briefcase,
  Sparkles,
  PhoneCall,
  Loader2,
  Flame,
} from "lucide-react";

interface Center {
  id: string;
  name: string;
  code: string;
  address: string;
}

const OSOGBO_AREAS = [
  "Ogo-Oluwa / Gbongan Rd",
  "Oke-Fia",
  "Dada Estate",
  "Ring Road / Stadium",
  "Alekuwodo",
  "Powerline / Agunbelewo",
  "Ayetoro",
  "Lameco / Biket",
  "Old Garage / Station Rd",
  "Osunjela / Ilesa Rd",
  "Kola Balogun",
  "Ofatedo",
  "Other Area in Osogbo",
];

const DEPARTMENTS = [
  "Choir / Worship Ministry",
  "Ushering & Greeters",
  "Media & Technical / Sound",
  "Prayer & Intercessory",
  "Welfare & Hospitality",
  "Sunday School / Believers Academy",
  "Children & Teens Church",
  "Protocol & Sanctuary Keepers",
  "Evangelism & Follow-up",
  "None / Interested in Joining a Unit",
];

function JoinForm() {
  const searchParams = useSearchParams();
  const initialCenterCode = searchParams.get("center") || "";

  const [centers, setCenters] = useState<Center[]>([]);
  const [loadingCenters, setLoadingCenters] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<any>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    whatsapp: "",
    sameAsPhone: true,
    email: "",
    centerId: "",
    gender: "MALE",
    residentialArea: "Ogo-Oluwa / Gbongan Rd",
    dobDay: "",
    dobMonth: "",
    maritalStatus: "SINGLE",
    department: "None / Interested in Joining a Unit",
    occupation: "",
  });

  useEffect(() => {
    async function fetchCenters() {
      try {
        const res = await fetch("/api/centers");
        const data = await res.json();
        if (data.success && data.centers) {
          setCenters(data.centers);
          // Match center from URL if provided
          if (initialCenterCode) {
            const matched = data.centers.find(
              (c: Center) => c.code.toUpperCase() === initialCenterCode.toUpperCase()
            );
            if (matched) {
              setFormData((prev) => ({ ...prev, centerId: matched.id }));
              return;
            }
          }
          if (data.centers.length > 0) {
            setFormData((prev) => ({ ...prev, centerId: data.centers[0].id }));
          }
        }
      } catch (err) {
        console.error("Failed to load centers", err);
      } finally {
        setLoadingCenters(false);
      }
    }
    fetchCenters();
  }, [initialCenterCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");
    setSubmitting(true);

    try {
      const payload = {
        ...formData,
        whatsapp: formData.sameAsPhone ? formData.phone : formData.whatsapp,
      };

      const res = await fetch("/api/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!data.success) {
        setErrorMessage(data.error || "Submission failed. Please check your details.");
      } else {
        setSuccessData(data.member);
      }
    } catch (err: any) {
      setErrorMessage("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleShareToWhatsApp = () => {
    const text = encodeURIComponent(
      `Hello brethren! Please update your member details on our official TBMI Osogbo Church Portal so the ministry can stay in touch with you:\n\n👉 https://tbmi-osogbo.org/join\n\nGod bless you!`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, "_blank");
  };

  if (successData) {
    return (
      <div className="max-w-lg mx-auto p-6 sm:p-8 bg-slate-900/90 border border-emerald-500/30 rounded-3xl shadow-2xl text-center">
        <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-500/30">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">
          Welcome to the Family!
        </h2>
        <p className="text-slate-300 text-sm mb-6 leading-relaxed">
          Praise God, <span className="font-semibold text-emerald-400">{successData.firstName}</span>! 
          Your membership profile for{" "}
          <span className="font-semibold text-white">{successData.center?.name || "TBMI Osogbo"}</span>{" "}
          has been recorded successfully.
        </p>

        <div className="bg-slate-950/70 p-4 rounded-2xl border border-slate-800 text-left text-xs space-y-2 mb-6">
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Full Name</span>
            <span className="font-semibold text-slate-200">
              {successData.firstName} {successData.lastName}
            </span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Phone / WhatsApp</span>
            <span className="font-semibold text-slate-200">{successData.phone}</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-800/80">
            <span className="text-slate-400">Residential Zone</span>
            <span className="font-semibold text-slate-200">{successData.residentialArea}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-400">Department</span>
            <span className="font-semibold text-amber-400">{successData.department}</span>
          </div>
        </div>

        {/* WhatsApp Share Action */}
        <div className="space-y-3">
          <button
            onClick={handleShareToWhatsApp}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/30 transition"
          >
            <Share2 className="w-4 h-4" />
            Share Link to Church WhatsApp Group
          </button>

          <button
            onClick={() => {
              setSuccessData(null);
              setFormData({
                firstName: "",
                lastName: "",
                phone: "",
                whatsapp: "",
                sameAsPhone: true,
                email: "",
                centerId: centers[0]?.id || "",
                gender: "MALE",
                residentialArea: "Ogo-Oluwa / Gbongan Rd",
                dobDay: "",
                dobMonth: "",
                maritalStatus: "SINGLE",
                department: "None / Interested in Joining a Unit",
                occupation: "",
              });
            }}
            className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
          >
            Register Another Family Member
          </button>

          <Link
            href="/"
            className="block text-xs text-slate-400 hover:text-white pt-2"
          >
            &larr; Return to Home Portal
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      {/* Header */}
      <div className="mb-6 text-center sm:text-left">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-slate-400 hover:text-amber-400 transition mb-4 font-medium"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Home
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-4">
          <Image
            src="/tbmi-logo-white.png"
            alt="Torchbearers Ministries International"
            width={240}
            height={80}
            className="h-12 sm:h-14 w-auto object-contain mx-auto sm:mx-0"
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
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          TBMI Member Registration
        </h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Select your worship center (TBMI Osogbo Center or Torch Tribe) to complete your membership record.
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 mb-6 bg-rose-500/10 border border-rose-500/30 text-rose-300 rounded-xl text-xs">
          {errorMessage}
        </div>
      )}

      {/* Form Container */}
      <form
        onSubmit={handleSubmit}
        className="bg-slate-900/80 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-xl backdrop-blur space-y-6"
      >
        {/* 1. Center Selection */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-amber-400 mb-2 flex items-center gap-1.5">
            <Church className="w-3.5 h-3.5" /> Select Your TBMI Center
          </label>
          {loadingCenters ? (
            <div className="h-10 bg-slate-800/50 rounded-xl animate-pulse"></div>
          ) : (
            <select
              value={formData.centerId}
              onChange={(e) => setFormData({ ...formData, centerId: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition"
              required
            >
              {centers.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.address})
                </option>
              ))}
            </select>
          )}
          <span className="text-[11px] text-slate-400 mt-1 block">
            Choose the TBMI worship center you attend or live closest to in Osogbo.
          </span>
        </div>

        {/* 2. Names */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              First Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Oluwaseun"
              value={formData.firstName}
              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Last Name (Surname) *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Adeleke"
              value={formData.lastName}
              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition"
            />
          </div>
        </div>

        {/* 3. Phone & WhatsApp */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
              <span>Phone Number *</span>
              <span className="text-[11px] text-slate-400">Calls & SMS</span>
            </label>
            <input
              type="tel"
              required
              placeholder="08012345678"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition"
            />
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="sameAsPhone"
              checked={formData.sameAsPhone}
              onChange={(e) => setFormData({ ...formData, sameAsPhone: e.target.checked })}
              className="rounded border-slate-700 text-amber-500 focus:ring-0 bg-slate-950"
            />
            <label htmlFor="sameAsPhone" className="text-xs text-slate-400 cursor-pointer">
              WhatsApp number is the same as phone number
            </label>
          </div>

          {!formData.sameAsPhone && (
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                WhatsApp Number *
              </label>
              <input
                type="tel"
                placeholder="08098765432"
                value={formData.whatsapp}
                onChange={(e) => setFormData({ ...formData, whatsapp: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition"
              />
            </div>
          )}
        </div>

        {/* 4. Gender & Residential Area */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Gender *
            </label>
            <select
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition"
            >
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400" /> Residential Area in Osogbo *
            </label>
            <select
              value={formData.residentialArea}
              onChange={(e) =>
                setFormData({ ...formData, residentialArea: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition"
              required
            >
              {OSOGBO_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 5. Birthday (Month & Day for Church Wishes) */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-amber-400" /> Birthday (For Pastoral Blessings)
          </label>
          <div className="grid grid-cols-2 gap-3">
            <select
              value={formData.dobMonth}
              onChange={(e) => setFormData({ ...formData, dobMonth: e.target.value })}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition"
            >
              <option value="">Month</option>
              {[
                "January",
                "February",
                "March",
                "April",
                "May",
                "June",
                "July",
                "August",
                "September",
                "October",
                "November",
                "December",
              ].map((m, idx) => (
                <option key={m} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>

            <select
              value={formData.dobDay}
              onChange={(e) => setFormData({ ...formData, dobDay: e.target.value })}
              className="bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition"
            >
              <option value="">Day</option>
              {Array.from({ length: 31 }, (_, i) => i + 1).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 6. Department / Ministry Unit */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-amber-400" /> Department / Service Unit
          </label>
          <select
            value={formData.department}
            onChange={(e) => setFormData({ ...formData, department: e.target.value })}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition"
          >
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* 7. Marital Status & Occupation (Optional) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1">
              Marital Status
            </label>
            <select
              value={formData.maritalStatus}
              onChange={(e) =>
                setFormData({ ...formData, maritalStatus: e.target.value })
              }
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition"
            >
              <option value="SINGLE">Single</option>
              <option value="MARRIED">Married</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
              <Briefcase className="w-3.5 h-3.5 text-slate-400" /> Occupation / Profession
            </label>
            <input
              type="text"
              placeholder="e.g. Teacher, Trader, Civil Servant"
              value={formData.occupation}
              onChange={(e) => setFormData({ ...formData, occupation: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-amber-400 transition"
            />
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={submitting}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-base shadow-xl shadow-amber-500/20 transition disabled:opacity-50"
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Saving Profile...</span>
            </>
          ) : (
            <>
              <UserCheck className="w-5 h-5" />
              <span>Submit Membership Profile</span>
            </>
          )}
        </button>

        <p className="text-[11px] text-center text-slate-400">
          Your personal details are securely held strictly for church fellowship, pastoral care, and communication.
        </p>
      </form>
    </div>
  );
}

export default function JoinPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100 py-10 px-4">
      <Suspense fallback={<div className="text-center text-slate-400">Loading form...</div>}>
        <JoinForm />
      </Suspense>
    </div>
  );
}
