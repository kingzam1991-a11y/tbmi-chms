import Link from "next/link";
import Image from "next/image";
import {
  Users,
  UserCheck,
  Church,
  CalendarCheck,
  Share2,
  HeartHandshake,
  MapPin,
  ShieldCheck,
  ArrowRight,
  Flame,
  Sparkles,
} from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-100">
      {/* Header / Navigation */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2.5">
              <Image
                src="/tbmi-logo-white.png"
                alt="Torchbearers Ministries International"
                width={200}
                height={68}
                className="h-10 sm:h-11 w-auto object-contain"
                priority
              />
            </Link>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/give"
              className="text-xs sm:text-sm font-semibold px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 transition flex items-center gap-1.5"
            >
              <HeartHandshake className="w-3.5 h-3.5 text-rose-400" />
              <span>Give</span>
            </Link>
            <Link
              href="/admin"
              className="text-xs sm:text-sm font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700/60 transition"
            >
              Pastoral / Admin
            </Link>
            <Link
              href="/join"
              className="text-xs sm:text-sm font-medium px-3 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold shadow-md shadow-amber-500/20 transition"
            >
              Join Directory
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-16 text-center">
        {/* Ministry Vision Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-semibold mb-6 shadow-lg shadow-amber-500/5">
          <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
          <span>The Torchbearers Vision</span>
        </div>

        {/* The Exact Vision Statement */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight max-w-4xl mx-auto mb-6 text-white">
          &ldquo;Raising a generation of people{" "}
          <span className="bg-gradient-to-r from-amber-400 via-yellow-300 to-orange-400 bg-clip-text text-transparent">
            using power for purpose
          </span>
          .&rdquo;
        </h1>

        <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto mb-10 leading-relaxed">
          Welcome to the digital ministry portal of <strong>Torchbearers Ministries International (TBMI)</strong>.
        </p>

        {/* Primary Action Banner for WhatsApp Groups */}
        <div className="max-w-xl mx-auto bg-slate-900/90 border border-slate-700/80 rounded-3xl p-6 shadow-2xl relative overflow-hidden text-left mb-14">
          <div className="absolute top-0 right-0 bg-emerald-500/20 border-b border-l border-emerald-500/30 text-emerald-400 text-xs px-3 py-1 rounded-bl-lg font-semibold flex items-center gap-1">
            <Share2 className="w-3.5 h-3.5" /> For WhatsApp Groups
          </div>
          <h2 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-amber-400" />
            Member Self-Onboarding
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mb-4 leading-relaxed">
            Fellowshipping at <strong>TBMI Osogbo Center</strong> or <strong>Torch Tribe</strong>? Take 90 seconds to complete your record to stay connected to pastoral updates, cell fellowships, and church milestones.
          </p>
          <Link
            href="/join"
            className="w-full flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 transition group"
          >
            <span>Register / Update Member Profile</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 4 Core Gateways Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <Link
            href="/join"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-amber-500/50 hover:bg-slate-900 transition group"
          >
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white mb-1">Member Directory</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Register yourself & family into TBMI’s unified database.
            </p>
          </Link>

          <Link
            href="/admin"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-900 transition group"
          >
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white mb-1">Pastoral Dashboard</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Manage centers, SMS broadcasts, attendance & members.
            </p>
          </Link>

          <Link
            href="/give"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-rose-500/50 hover:bg-slate-900 transition group"
          >
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <HeartHandshake className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white mb-1">Online Giving</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Tithes, offerings & pledges via Paystack or direct transfer.
            </p>
          </Link>

          <Link
            href="/admin"
            className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-emerald-500/50 hover:bg-slate-900 transition group"
          >
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
              <CalendarCheck className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-white mb-1">Attendance Tracking</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Mobile headcount records for Sunday & Midweek services.
            </p>
          </Link>
        </div>
      </section>

      {/* Official Centers Showcase */}
      <section className="max-w-5xl mx-auto px-4 pb-20">
        <div className="border-t border-slate-800 pt-12">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Flame className="w-4 h-4 text-amber-400" />
                <span className="text-xs uppercase font-bold text-amber-400 tracking-wider">
                  Worship Centers
                </span>
              </div>
              <h2 className="text-2xl font-bold text-white">TBMI Worship Centers</h2>
              <p className="text-xs sm:text-sm text-slate-400">
                Join our life-transforming services at any of our designated centers
              </p>
            </div>
            <div className="mt-3 sm:mt-0 text-xs text-slate-400 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-amber-400" /> Osogbo, Osun State, Nigeria
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 1. TBMI Osogbo Center */}
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between hover:border-amber-500/40 transition">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                    OSOGBO
                  </span>
                  <span className="text-xs text-slate-400">Sundays &bull; 8:00 AM</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">TBMI Osogbo Center</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                  Cele Area, Oke Baale, Osogbo
                </p>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  TBMI Osogbo is a purpose-driven community committed to raising a generation of people who know God, grow in His Word, develop spiritual depth and godly character, and deploy His power for the fulfilment of divine purpose.
                </p>
              </div>
              <Link
                href="/join?center=OSOGBO"
                className="w-full text-center py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition"
              >
                Join Osogbo Center Directory &rarr;
              </Link>
            </div>

            {/* 2. Torch Tribe Center */}
            <div className="p-6 rounded-3xl bg-slate-900/50 border border-slate-800/80 flex flex-col justify-between hover:border-indigo-500/40 transition">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1">
                    <Flame className="w-3 h-3 text-indigo-400" /> TORCH-TRIBE
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">Torch Tribe Center</h3>
                <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                  <MapPin className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  Torch Tribe, Osogbo
                </p>
                <p className="text-xs text-slate-300 leading-relaxed mb-6">
                  TBMI Osogbo is a purpose-driven community committed to raising a generation of people who know God, grow in His Word, develop spiritual depth and godly character, and deploy His power for the fulfilment of divine purpose.
                </p>
              </div>
              <Link
                href="/join?center=TORCH-TRIBE"
                className="w-full text-center py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs transition"
              >
                Join Torch Tribe Directory &rarr;
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-10 text-center text-xs text-slate-400">
        <div className="flex flex-col items-center justify-center gap-2 mb-2">
          <Image
            src="/tbmi-logo-white.png"
            alt="TBMI"
            width={160}
            height={54}
            className="h-8 w-auto mb-1"
          />
          <span className="font-bold text-slate-300">Torchbearers Ministries International (TBMI)</span>
        </div>
        <p className="text-amber-400 font-semibold mb-2">
          &ldquo;Raising a generation of people using power for purpose.&rdquo;
        </p>
        <p className="text-slate-500 text-[11px]">
          ChMS Platform &bull; TBMI Osogbo Center &bull; Torch Tribe Center
        </p>
      </footer>
    </div>
  );
}
