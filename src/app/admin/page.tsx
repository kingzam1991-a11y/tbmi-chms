"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Church,
  Users,
  Search,
  Filter,
  Download,
  Share2,
  CalendarCheck,
  PlusCircle,
  Phone,
  MessageSquare,
  MapPin,
  Check,
  Copy,
  ChevronDown,
  Building2,
  Sparkles,
  ArrowLeft,
  Calendar,
  Loader2,
  Send,
  HeartHandshake,
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Clock,
  Upload,
  UserPlus,
  FileSpreadsheet,
  X,
  Settings,
  Key,
} from "lucide-react";

interface Center {
  id: string;
  name: string;
  code: string;
  address: string;
  _count?: { members: number; attendances: number };
}

interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  whatsapp: string;
  email: string | null;
  gender: string;
  residentialArea: string;
  department: string | null;
  dobDay: number | null;
  dobMonth: number | null;
  joinedVia: string;
  createdAt: string;
  center: { id: string; name: string; code: string };
}

export default function AdminDashboard() {
  const [centers, setCenters] = useState<Center[]>([]);
  const [selectedCenterId, setSelectedCenterId] = useState<string>("all");
  const [members, setMembers] = useState<Member[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDept, setSelectedDept] = useState("all");

  const [activeTab, setActiveTab] = useState<
    "directory" | "broadcast" | "sms" | "attendance" | "finance"
  >("directory");

  // Broadcast copy state
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  // Attendance form state
  const [attendanceDate, setAttendanceDate] = useState("");
  useEffect(() => {
    setAttendanceDate(new Date().toISOString().split("T")[0]);
  }, []);

  const [attendanceType, setAttendanceType] = useState("SUNDAY_1ST_SERVICE");
  const [attendanceCounts, setAttendanceCounts] = useState({
    men: "",
    women: "",
    youth: "",
    children: "",
    firstTimers: "",
    notes: "",
  });
  const [savingAttendance, setSavingAttendance] = useState(false);
  const [attendanceSuccess, setAttendanceSuccess] = useState(false);
  const [recentAttendances, setRecentAttendances] = useState<any[]>([]);

  // SMS Console State
  const [smsTarget, setSmsTarget] = useState<"all" | "center" | "dept">("all");
  const [smsTargetDept, setSmsTargetDept] = useState("Choir / Worship Ministry");
  const [smsCustomPhone, setSmsCustomPhone] = useState("");
  const [smsText, setSmsText] = useState(
    "Calvary greetings from TBMI Osogbo! Join us for a special communion service this Sunday at 8:00 AM. Bring a friend!"
  );
  const [sendingSms, setSendingSms] = useState(false);
  const [smsFeedback, setSmsFeedback] = useState<any>(null);

  // SMSLive247 Credentials State
  const [showSmsConfig, setShowSmsConfig] = useState(false);
  const [smsLiveForm, setSmsLiveForm] = useState({
    ownerEmail: "",
    subacct: "",
    password: "",
    apiKey: "",
    senderId: "TBMI",
  });
  const [savingSmsConfig, setSavingSmsConfig] = useState(false);
  const [smsConfigSaved, setSmsConfigSaved] = useState(false);

  useEffect(() => {
    async function loadSmsSettings() {
      try {
        const res = await fetch("/api/settings/sms");
        const data = await res.json();
        if (data.success) {
          setSmsLiveForm((prev) => ({
            ...prev,
            ownerEmail: data.ownerEmail || "",
            subacct: data.subacct || "",
            senderId: data.senderId || "TBMI",
          }));
        }
      } catch (e) {}
    }
    loadSmsSettings();
  }, []);

  const handleSaveSmsSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSmsConfig(true);
    try {
      const res = await fetch("/api/settings/sms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(smsLiveForm),
      });
      const data = await res.json();
      if (data.success) {
        setSmsConfigSaved(true);
        setTimeout(() => setSmsConfigSaved(false), 3000);
      } else {
        alert(data.error || "Failed to save settings.");
      }
    } catch (err: any) {
      alert("Network error saving SMS settings.");
    } finally {
      setSavingSmsConfig(false);
    }
  };

  // Finance State
  const [financeData, setFinanceData] = useState<any>(null);
  const [loadingFinance, setLoadingFinance] = useState(false);

  // New Center Modal State
  const [showNewCenterModal, setShowNewCenterModal] = useState(false);
  const [newCenterForm, setNewCenterForm] = useState({
    name: "",
    code: "",
    address: "",
    leadPastor: "",
    phone: "",
  });
  const [creatingCenter, setCreatingCenter] = useState(false);
  const [centerError, setCenterError] = useState("");

  const handleCreateCenter = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingCenter(true);
    setCenterError("");

    try {
      const res = await fetch("/api/centers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newCenterForm),
      });

      const data = await res.json();
      if (!data.success) {
        setCenterError(data.error || "Failed to create center.");
      } else {
        setShowNewCenterModal(false);
        setNewCenterForm({ name: "", code: "", address: "", leadPastor: "", phone: "" });
        // Reload centers
        const centersRes = await fetch("/api/centers");
        const centersData = await centersRes.json();
        if (centersData.success) {
          setCenters(centersData.centers);
          setSelectedCenterId(data.center.id);
        }
      }
    } catch (err) {
      setCenterError("Network error while creating center.");
    } finally {
      setCreatingCenter(false);
    }
  };

  // Manual Add Member State
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    whatsapp: "",
    centerId: "",
    gender: "MALE",
    residentialArea: "Osogbo",
    department: "General Member",
    dobMonth: "",
    dobDay: "",
    occupation: "",
  });
  const [savingMember, setSavingMember] = useState(false);
  const [addMemberError, setAddMemberError] = useState("");

  // CSV / Google Form Import State
  const [showImportModal, setShowImportModal] = useState(false);
  const [importRows, setImportRows] = useState<any[]>([]);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<any>(null);
  const [importError, setImportError] = useState("");

  // Handle Manual Add Member
  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMember(true);
    setAddMemberError("");

    const centerToUse = newMemberForm.centerId || (selectedCenterId !== "all" ? selectedCenterId : centers[0]?.id);

    try {
      const res = await fetch("/api/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newMemberForm, centerId: centerToUse }),
      });

      const data = await res.json();
      if (!data.success) {
        setAddMemberError(data.error || "Failed to add member.");
      } else {
        setShowAddMemberModal(false);
        setNewMemberForm({
          firstName: "",
          lastName: "",
          phone: "",
          whatsapp: "",
          centerId: "",
          gender: "MALE",
          residentialArea: "Osogbo",
          department: "General Member",
          dobMonth: "",
          dobDay: "",
          occupation: "",
        });
        // Refresh members
        fetchMembersList();
      }
    } catch (err: any) {
      setAddMemberError("Network error adding member.");
    } finally {
      setSavingMember(false);
    }
  };

  // Parse CSV File from Google Forms / Excel
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImportError("");
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const lines = text.trim().split(/\r\n|\n/);
        if (lines.length < 2) {
          setImportError("CSV file appears empty or has no header row.");
          return;
        }

        const headers = lines[0].split(",").map((h) => h.trim().replace(/^["']|["']$/g, ""));
        const parsed: any[] = [];

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          // Split line by comma, taking into account quotes
          const match = line.match(/(".*?"|[^",\s]+)(?=\s*,|\s*$)/g) || line.split(",");
          const values = match.map((v) => v.trim().replace(/^["']|["']$/g, ""));

          const rowObj: any = {};
          headers.forEach((h, idx) => {
            rowObj[h] = values[idx] || "";
          });
          parsed.push(rowObj);
        }

        setImportRows(parsed);
      } catch (err) {
        setImportError("Failed to parse CSV file. Ensure it is a valid CSV.");
      }
    };
    reader.readAsText(file);
  };

  // Submit Bulk Import
  const handleBulkImport = async () => {
    if (importRows.length === 0) return;
    setImporting(true);
    setImportError("");

    const defaultCenterId = selectedCenterId !== "all" ? selectedCenterId : centers[0]?.id;

    try {
      const res = await fetch("/api/members/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rows: importRows, defaultCenterId }),
      });

      const data = await res.json();
      if (!data.success) {
        setImportError(data.error || "Import failed.");
      } else {
        setImportResult(data);
        fetchMembersList();
      }
    } catch (err: any) {
      setImportError("Network error during bulk import.");
    } finally {
      setImporting(false);
    }
  };

  // Download Google Form / Excel Template
  const handleDownloadTemplate = () => {
    const headers = "Full Name,Phone Number,WhatsApp Number,Center,Gender,Residential Area,Department,Birthday Month,Birthday Day\n";
    const row1 = "Bro Peter Adeleke,08031234567,08031234567,OSOGBO,MALE,Ogo-Oluwa,Choir / Worship Ministry,5,18\n";
    const row2 = "Sis Deborah Ojo,08098765432,08098765432,TORCH-TRIBE,FEMALE,Oke-Fia,Ushering & Greeters,11,4\n";
    const blob = new Blob([headers + row1 + row2], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "TBMI_Google_Forms_Import_Template.csv";
    link.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    async function fetchCenters() {
      try {
        const res = await fetch("/api/centers");
        const data = await res.json();
        if (data.success) {
          setCenters(data.centers);
        }
      } catch (err) {
        console.error("Failed to fetch centers:", err);
      }
    }
    fetchCenters();
  }, []);

  // Load members when center or search changes
  const fetchMembersList = async () => {
    setLoadingMembers(true);
    try {
      const params = new URLSearchParams();
      if (selectedCenterId !== "all") params.set("centerId", selectedCenterId);
      if (searchQuery) params.set("query", searchQuery);
      if (selectedDept !== "all") params.set("department", selectedDept);

      const res = await fetch(`/api/members?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setMembers(data.members);
      }
    } catch (err) {
      console.error("Failed to fetch members:", err);
    } finally {
      setLoadingMembers(false);
    }
  };

  useEffect(() => {
    fetchMembersList();
  }, [selectedCenterId, searchQuery, selectedDept]);

  // Load recent attendances
  const loadAttendance = async () => {
    try {
      const url =
        selectedCenterId === "all"
          ? "/api/attendance"
          : `/api/attendance?centerId=${selectedCenterId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setRecentAttendances(data.attendances || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    if (activeTab === "attendance") {
      loadAttendance();
    }
  }, [activeTab, selectedCenterId]);

  // Load Finance Data
  const loadFinance = async () => {
    setLoadingFinance(true);
    try {
      const url =
        selectedCenterId === "all"
          ? "/api/finance"
          : `/api/finance?centerId=${selectedCenterId}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setFinanceData(data);
      }
    } catch (err) {
      console.error("Failed to load finance data:", err);
    } finally {
      setLoadingFinance(false);
    }
  };

  useEffect(() => {
    if (activeTab === "finance") {
      loadFinance();
    }
  }, [activeTab, selectedCenterId]);

  // Handle Attendance Submit
  const handleAttendanceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const centerToUse =
      selectedCenterId !== "all"
        ? selectedCenterId
        : centers[0]?.id;

    if (!centerToUse) {
      alert("Please select a specific center to log attendance for.");
      return;
    }

    setSavingAttendance(true);
    setAttendanceSuccess(false);

    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          centerId: centerToUse,
          serviceDate: attendanceDate,
          serviceType: attendanceType,
          menCount: attendanceCounts.men,
          womenCount: attendanceCounts.women,
          youthCount: attendanceCounts.youth,
          childrenCount: attendanceCounts.children,
          firstTimersCount: attendanceCounts.firstTimers,
          notes: attendanceCounts.notes,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setAttendanceSuccess(true);
        setAttendanceCounts({
          men: "",
          women: "",
          youth: "",
          children: "",
          firstTimers: "",
          notes: "",
        });
        loadAttendance();
      }
    } catch (err) {
      alert("Failed to save attendance.");
    } finally {
      setSavingAttendance(false);
    }
  };

  // Handle SMS Broadcast
  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setSendingSms(true);
    setSmsFeedback(null);

    try {
      const payload: any = { message: smsText };

      if (smsCustomPhone.trim()) {
        payload.customPhone = smsCustomPhone.trim();
      } else if (smsTarget === "center") {
        payload.centerId = selectedCenterId === "all" ? undefined : selectedCenterId;
      } else if (smsTarget === "dept") {
        payload.department = smsTargetDept;
        if (selectedCenterId !== "all") payload.centerId = selectedCenterId;
      }

      const res = await fetch("/api/sms/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      setSmsFeedback(data);
    } catch (err: any) {
      setSmsFeedback({ success: false, error: "Network error sending SMS" });
    } finally {
      setSendingSms(false);
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    if (members.length === 0) return;
    const headers = [
      "ID",
      "Center",
      "First Name",
      "Last Name",
      "Phone",
      "WhatsApp",
      "Gender",
      "Residential Area",
      "Department",
      "Birthday Month",
      "Birthday Day",
      "Joined Via",
      "Date Registered",
    ];

    const rows = members.map((m) => [
      m.id,
      m.center?.name || "",
      `"${m.firstName}"`,
      `"${m.lastName}"`,
      `'${m.phone}`,
      `'${m.whatsapp}`,
      m.gender,
      `"${m.residentialArea}"`,
      `"${m.department || ""}"`,
      m.dobMonth || "",
      m.dobDay || "",
      m.joinedVia,
      new Date(m.createdAt).toLocaleDateString(),
    ]);

    const csvContent =
      "data:text/csv;charset=utf-8," +
      [headers.join(","), ...rows.map((e) => e.join(","))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute(
      "download",
      `TBMI_Osogbo_Members_${selectedCenterId}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Broadcast messages
  const broadcastTemplates = [
    {
      title: "General TBMI WhatsApp Group Broadcast",
      text: `🕊️ *CALVARY GREETINGS BRETHREN!* 🕊️\n\nTo ensure every member is properly accounted for, prayed for, and connected to our home cells across Osogbo, the church secretariat has launched the official *TBMI Osogbo Member Portal*.\n\nKindly take *90 seconds* to update your membership record using the link below:\n👉 https://tbmi-osogbo.org/join\n\n_Note: You can also register your children and spouses._\n\nGod bless you richly! 🙌\n*TBMI Secretariat — Osogbo*`,
    },
    {
      title: "Center-Specific Broadcast (Selected Center)",
      text: `Praise the Lord TBMI Family! 🌟\n\nIf you attend worship services at our *${
        centers.find((c) => c.id === selectedCenterId)?.name || "TBMI Osogbo"
      }*, kindly complete your member verification here:\n👉 https://tbmi-osogbo.org/join?center=${
        centers.find((c) => c.id === selectedCenterId)?.code || "CENTRAL"
      }\n\nLet's ensure our unit and discipleship database is 100% updated before this Sunday! ✝️`,
    },
    {
      title: "Department / Worker Group Broadcast",
      text: `Hello Beloved Co-Laborers in Christ! 🤝\n\nAs part of our departmental audit and worker scheduling across all TBMI Osogbo centers, please confirm your unit membership on the digital registry:\n👉 https://tbmi-osogbo.org/join\n\nPlease select your current service unit during registration. Thank you for your labour of love! ❤️`,
    },
  ];

  const handleCopyBroadcast = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 pb-16">
      {/* Top Navbar */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="text-slate-400 hover:text-white transition flex items-center gap-1.5 text-xs mr-1"
            >
              <ArrowLeft className="w-4 h-4" /> Portal Home
            </Link>
            <Image
              src="/tbmi-logo-white.png"
              alt="Torchbearers Logo"
              width={180}
              height={60}
              className="h-9 sm:h-10 w-auto object-contain"
              priority
            />
            <div className="hidden sm:block border-l border-slate-800 pl-3">
              <span className="text-[10px] text-amber-400 uppercase tracking-widest font-semibold block">
                Executive & Pastoral Console
              </span>
            </div>
          </div>

          {/* Center Switcher & Add Center Action */}
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-slate-400 hidden sm:inline flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5 text-amber-400" /> Center:
              </span>
              <select
                value={selectedCenterId}
                onChange={(e) => setSelectedCenterId(e.target.value)}
                className="bg-slate-900 border border-amber-500/40 text-amber-300 rounded-xl px-3 py-1.5 text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-amber-400"
              >
                <option value="all">⭐ All Centers (Global HQ View)</option>
                {centers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setShowNewCenterModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1 shadow-md shadow-amber-500/20 transition whitespace-nowrap"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Add Center</span>
            </button>
          </div>
        </div>
      </header>

      {/* New Center Modal */}
      {showNewCenterModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative">
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              <Building2 className="w-5 h-5 text-amber-400" />
              Create New Center Profile
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Add a new worship center, campus fellowship, or missionary outpost under TBMI.
            </p>

            {centerError && (
              <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                {centerError}
              </div>
            )}

            <form onSubmit={handleCreateCenter} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Center Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. TBMI Ede Center or Torch Tribe UniOsun"
                  value={newCenterForm.name}
                  onChange={(e) =>
                    setNewCenterForm({ ...newCenterForm, name: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Unique Code / Slug *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. EDE, UNIOSUN-HUB"
                  value={newCenterForm.code}
                  onChange={(e) =>
                    setNewCenterForm({ ...newCenterForm, code: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. Camp Road, Near Main Gate"
                  value={newCenterForm.address}
                  onChange={(e) =>
                    setNewCenterForm({ ...newCenterForm, address: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Lead Pastor
                  </label>
                  <input
                    type="text"
                    placeholder="Pastor Name"
                    value={newCenterForm.leadPastor}
                    onChange={(e) =>
                      setNewCenterForm({ ...newCenterForm, leadPastor: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Contact Phone
                  </label>
                  <input
                    type="tel"
                    placeholder="080..."
                    value={newCenterForm.phone}
                    onChange={(e) =>
                      setNewCenterForm({ ...newCenterForm, phone: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={creatingCenter}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition disabled:opacity-50"
                >
                  {creatingCenter ? "Creating..." : "Save Center Profile"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewCenterModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 pt-8">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Total Members</span>
              <Users className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-white">{members.length}</div>
            <span className="text-[10px] text-slate-400">
              {selectedCenterId === "all" ? "Across all Osogbo centers" : "In this center"}
            </span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Via WhatsApp</span>
              <MessageSquare className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400">
              {members.filter((m) => m.joinedVia.includes("WHATSAPP")).length}
            </div>
            <span className="text-[10px] text-slate-400">Self-onboarded online</span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">Active Centers</span>
              <Building2 className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-indigo-400">{centers.length}</div>
            <span className="text-[10px] text-slate-400">Osogbo jurisdiction</span>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 p-4 rounded-2xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-slate-400">In Service Units</span>
              <Sparkles className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-white">
              {members.filter((m) => m.department && !m.department.includes("None")).length}
            </div>
            <span className="text-[10px] text-slate-400">Assigned workers</span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 mb-6 gap-2 sm:gap-6 overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab("directory")}
            className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "directory"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Users className="w-4 h-4" /> Member Directory
          </button>

          <button
            onClick={() => setActiveTab("sms")}
            className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "sms"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Send className="w-4 h-4" /> SMS Gateway (SMSLive247 / Termii)
          </button>

          <button
            onClick={() => setActiveTab("finance")}
            className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "finance"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <CreditCard className="w-4 h-4" /> Giving & Paystack Ledger
          </button>

          <button
            onClick={() => setActiveTab("broadcast")}
            className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "broadcast"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <Share2 className="w-4 h-4" /> WhatsApp Broadcast
          </button>

          <button
            onClick={() => setActiveTab("attendance")}
            className={`pb-3 text-xs sm:text-sm font-semibold flex items-center gap-2 border-b-2 transition whitespace-nowrap ${
              activeTab === "attendance"
                ? "border-amber-400 text-amber-400"
                : "border-transparent text-slate-400 hover:text-slate-200"
            }`}
          >
            <CalendarCheck className="w-4 h-4" /> Service Attendance
          </button>
        </div>

        {/* TAB 1: MEMBER DIRECTORY */}
        {activeTab === "directory" && (
          <div className="space-y-4">
            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 items-center justify-between bg-slate-900/60 p-4 rounded-2xl border border-slate-800">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Search name, phone, residential area..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <select
                  value={selectedDept}
                  onChange={(e) => setSelectedDept(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-amber-400"
                >
                  <option value="all">All Departments</option>
                  <option value="Choir / Worship Ministry">Choir</option>
                  <option value="Ushering & Greeters">Ushering</option>
                  <option value="Media & Technical / Sound">Media / Sound</option>
                  <option value="Prayer & Intercessory">Prayer Unit</option>
                  <option value="Welfare & Hospitality">Welfare</option>
                  <option value="Sunday School / Believers Academy">Sunday School</option>
                  <option value="Children & Teens Church">Children/Teens</option>
                </select>

                <button
                  onClick={() => setShowImportModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-xs font-semibold border border-emerald-500/30 transition whitespace-nowrap"
                >
                  <Upload className="w-3.5 h-3.5" /> Import Google Form / CSV
                </button>

                <button
                  onClick={() => setShowAddMemberModal(true)}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold shadow-md shadow-amber-500/20 transition whitespace-nowrap"
                >
                  <UserPlus className="w-3.5 h-3.5" /> + Add Member
                </button>

                <button
                  onClick={handleExportCSV}
                  disabled={members.length === 0}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition disabled:opacity-40 whitespace-nowrap"
                >
                  <Download className="w-3.5 h-3.5" /> Export CSV
                </button>
              </div>
            </div>

            {/* Members Table */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              {loadingMembers ? (
                <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  Loading members...
                </div>
              ) : members.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <Users className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-slate-300">No members found</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Share the WhatsApp onboarding link with your church groups to populate this directory!
                  </p>
                  <Link
                    href="/join"
                    className="inline-block mt-4 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl"
                  >
                    Open Onboarding Form
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Member Name</th>
                        <th className="py-3 px-4">Center</th>
                        <th className="py-3 px-4">Phone / WhatsApp</th>
                        <th className="py-3 px-4">Residential Area</th>
                        <th className="py-3 px-4">Department</th>
                        <th className="py-3 px-4">Birthday</th>
                        <th className="py-3 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {members.map((m) => (
                        <tr key={m.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            {m.firstName} {m.lastName}
                            <span className="block text-[10px] text-slate-400 font-normal">
                              {m.gender}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-medium text-[10px]">
                              {m.center?.code || "CENTRAL"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {m.phone}
                            {m.whatsapp && m.whatsapp !== m.phone && (
                              <span className="block text-[10px] text-emerald-400">
                                WA: {m.whatsapp}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-slate-400" />
                              {m.residentialArea}
                            </span>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 text-[11px]">
                              {m.department || "General Member"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-400">
                            {m.dobMonth && m.dobDay
                              ? `${m.dobMonth}/${m.dobDay}`
                              : "Not recorded"}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <a
                              href={`https://wa.me/234${(m.whatsapp || m.phone).replace(/^0+/, "")}?text=${encodeURIComponent(
                                `Greetings from TBMI Osogbo, ${m.firstName}!`
                              )}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[11px] font-semibold transition"
                            >
                              <MessageSquare className="w-3 h-3" /> Chat
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: SMS GATEWAY (SMSLive247 / Termii) */}
        {activeTab === "sms" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Send className="w-5 h-5 text-amber-400" />
                    SMS Broadcast Engine (SMSLive247 / Termii)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Deliver direct SMS messages to church members across Osogbo & Torch Tribe using your existing SMSLive247 or Termii account.
                  </p>
                </div>
                <div className="text-right flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowSmsConfig(!showSmsConfig)}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 transition border border-slate-700"
                  >
                    <Settings className="w-3.5 h-3.5 text-amber-400" />
                    <span>{showSmsConfig ? "Hide Settings" : "Configure SMSLive247"}</span>
                  </button>
                  <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold">
                    Multi-Gateway
                  </span>
                </div>
              </div>

              {/* SMSLive247 In-App Configuration Panel */}
              {showSmsConfig && (
                <div className="p-5 mb-6 bg-slate-950 border border-amber-500/30 rounded-2xl">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-400" />
                      Enter Your SMSLive247 Account Details
                    </h3>
                    <span className="text-[10px] text-amber-400">Instant In-App Setup</span>
                  </div>
                  <p className="text-xs text-slate-400 mb-4">
                    Enter your SMSLive247 sub-account details below. You don't need to manually edit any files.
                  </p>

                  {smsConfigSaved && (
                    <div className="p-3 mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>SMSLive247 credentials saved successfully!</span>
                    </div>
                  )}

                  <form onSubmit={handleSaveSmsSettings} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          SMSLive247 Owner Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="your_email@domain.com"
                          value={smsLiveForm.ownerEmail}
                          onChange={(e) =>
                            setSmsLiveForm({ ...smsLiveForm, ownerEmail: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Sub-Account Login / Username *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. subaccount_username"
                          value={smsLiveForm.subacct}
                          onChange={(e) =>
                            setSmsLiveForm({ ...smsLiveForm, subacct: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Sub-Account Password *
                        </label>
                        <input
                          type="password"
                          placeholder="••••••••"
                          value={smsLiveForm.password}
                          onChange={(e) =>
                            setSmsLiveForm({ ...smsLiveForm, password: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white"
                        />
                      </div>

                      <div>
                        <label className="block text-[11px] font-medium text-slate-300 mb-1">
                          Sender ID (e.g. TBMI)
                        </label>
                        <input
                          type="text"
                          maxLength={11}
                          placeholder="TBMI"
                          value={smsLiveForm.senderId}
                          onChange={(e) =>
                            setSmsLiveForm({ ...smsLiveForm, senderId: e.target.value })
                          }
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white uppercase font-mono"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-medium text-slate-400 mb-1">
                        Or API Session ID / Key (Optional alternative to password)
                      </label>
                      <input
                        type="text"
                        placeholder="Leave empty if using sub-account password above"
                        value={smsLiveForm.apiKey}
                        onChange={(e) =>
                          setSmsLiveForm({ ...smsLiveForm, apiKey: e.target.value })
                        }
                        className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-1.5 text-xs text-white placeholder-slate-600 font-mono"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={savingSmsConfig}
                      className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition disabled:opacity-50"
                    >
                      {savingSmsConfig ? "Saving..." : "Save SMSLive247 Credentials"}
                    </button>
                  </form>
                </div>
              )}

              {smsFeedback && (
                <div
                  className={`p-4 mb-6 rounded-2xl text-xs flex items-center gap-2 ${
                    smsFeedback.success
                      ? "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300"
                      : "bg-rose-500/10 border border-rose-500/30 text-rose-300"
                  }`}
                >
                  {smsFeedback.success ? (
                    <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
                  )}
                  <div>
                    {smsFeedback.message || smsFeedback.error}
                    {smsFeedback.simulated && (
                      <span className="block text-[11px] opacity-75 mt-0.5">
                        (Simulated mode: Add <code>TERMII_API_KEY</code> in <code>.env</code> to deliver live SMS to phones)
                      </span>
                    )}
                  </div>
                </div>
              )}

              <form onSubmit={handleSendSMS} className="space-y-5">
                {/* Recipient Target */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                    Target Recipient Group
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setSmsTarget("all")}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                        smsTarget === "all"
                          ? "bg-amber-500 text-slate-950 border-amber-400"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      All Church Members ({members.length})
                    </button>

                    <button
                      type="button"
                      onClick={() => setSmsTarget("center")}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                        smsTarget === "center"
                          ? "bg-amber-500 text-slate-950 border-amber-400"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      Active Center Only
                    </button>

                    <button
                      type="button"
                      onClick={() => setSmsTarget("dept")}
                      className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                        smsTarget === "dept"
                          ? "bg-amber-500 text-slate-950 border-amber-400"
                          : "bg-slate-950 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      By Department / Unit
                    </button>
                  </div>
                </div>

                {/* Conditional Department Selector */}
                {smsTarget === "dept" && (
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Select Department
                    </label>
                    <select
                      value={smsTargetDept}
                      onChange={(e) => setSmsTargetDept(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="Choir / Worship Ministry">Choir / Worship Ministry</option>
                      <option value="Ushering & Greeters">Ushering & Greeters</option>
                      <option value="Media & Technical / Sound">Media & Technical</option>
                      <option value="Prayer & Intercessory">Prayer & Intercessory</option>
                      <option value="Welfare & Hospitality">Welfare & Hospitality</option>
                      <option value="Sunday School / Believers Academy">Sunday School</option>
                      <option value="Children & Teens Church">Children & Teens Church</option>
                      <option value="Protocol & Sanctuary Keepers">Protocol</option>
                      <option value="Evangelism & Follow-up">Evangelism</option>
                    </select>
                  </div>
                )}

                {/* Optional Custom Phone Number Override */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center justify-between">
                    <span>Send Test SMS to Specific Phone Number (Optional)</span>
                    <span className="text-[10px] text-slate-400">Overrides group</span>
                  </label>
                  <input
                    type="tel"
                    placeholder="e.g. 08012345678 (Leave empty to broadcast to group)"
                    value={smsCustomPhone}
                    onChange={(e) => setSmsCustomPhone(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500"
                  />
                </div>

                {/* Message Body */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-bold text-slate-300">SMS Message Content</label>
                    <span className="text-[11px] text-slate-400 font-mono">
                      {smsText.length} characters &bull; {Math.ceil(smsText.length / 160) || 1} SMS Page(s)
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={smsText}
                    onChange={(e) => setSmsText(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3 text-xs text-white focus:outline-none focus:border-amber-400 leading-relaxed font-sans"
                  />
                </div>

                {/* Quick Templates */}
                <div>
                  <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                    Quick Preset Message Templates:
                  </span>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setSmsText(
                          "Calvary greetings from TBMI Osogbo! Join us for a powerful worship encounter this Sunday at 8:00 AM. Come expectant for a miracle!"
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                    >
                      Sunday Reminder
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSmsText(
                          "Beloved TBMI brethren, don't miss our Midweek Word & Communion Feast this Wednesday at 5:30 PM. Your breakthrough awaits!"
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                    >
                      Midweek Service
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setSmsText(
                          "All-Night Vigil alert: Join us this Friday at 10:00 PM for night of apostolic prayers, deliverance, and divine impartation. Bring your family!"
                        )
                      }
                      className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] transition"
                    >
                      Night Vigil Alert
                    </button>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={sendingSms}
                  className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm shadow-xl shadow-amber-500/20 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {sendingSms ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Dispatching SMS Messages...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>
                        {smsCustomPhone
                          ? `Send Test SMS to ${smsCustomPhone}`
                          : `Broadcast SMS to ${
                              smsTarget === "all"
                                ? "All Members"
                                : smsTarget === "center"
                                ? "Selected Center"
                                : smsTargetDept
                            }`}
                      </span>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 3: GIVING & PAYSTACK LEDGER */}
        {activeTab === "finance" && (
          <div className="space-y-6">
            {/* Summary Topbar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 block mb-1">Total Seed Collected</span>
                <div className="text-3xl font-black text-amber-400">
                  ₦{financeData ? (financeData.totalAmount || 0).toLocaleString() : "0"}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  {selectedCenterId === "all" ? "Across all Osogbo centers" : "In this center"}
                </span>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl">
                <span className="text-xs text-slate-400 block mb-1">Transactions Count</span>
                <div className="text-3xl font-black text-emerald-400">
                  {financeData ? financeData.totalCount || 0 : "0"}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Via Paystack & Bank Transfers
                </span>
              </div>

              <div className="bg-slate-900/70 border border-slate-800 p-5 rounded-2xl flex flex-col justify-between">
                <div>
                  <span className="text-xs text-slate-400 block mb-1">Public Giving Portal</span>
                  <p className="text-xs text-slate-300">
                    Direct your congregation to the giving portal:
                  </p>
                </div>
                <Link
                  href="/give"
                  target="_blank"
                  className="inline-flex items-center gap-1.5 text-xs text-amber-400 font-bold hover:text-amber-300 mt-2"
                >
                  Open /give Page &rarr;
                </Link>
              </div>
            </div>

            {/* Category Breakdown Badges */}
            {financeData?.categoryTotals && Object.keys(financeData.categoryTotals).length > 0 && (
              <div className="bg-slate-900/40 border border-slate-800 p-4 rounded-2xl">
                <span className="text-xs font-semibold text-slate-400 block mb-2">
                  Breakdown by Category:
                </span>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(financeData.categoryTotals).map(([cat, amt]: any) => (
                    <span
                      key={cat}
                      className="px-3 py-1.5 rounded-xl bg-slate-950 border border-slate-800 text-xs flex items-center gap-2"
                    >
                      <span className="text-slate-400">{cat.replace(/_/g, " ")}:</span>
                      <span className="font-bold text-amber-400">₦{amt.toLocaleString()}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Transactions Table */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 flex items-center justify-between">
                <h3 className="font-bold text-sm text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  Recent Giving Transactions Ledger
                </h3>
                <button
                  onClick={loadFinance}
                  className="text-xs text-slate-400 hover:text-white"
                >
                  Refresh
                </button>
              </div>

              {loadingFinance ? (
                <div className="py-16 text-center text-slate-400 flex items-center justify-center gap-2 text-sm">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  Loading transactions...
                </div>
              ) : !financeData?.transactions || financeData.transactions.length === 0 ? (
                <div className="py-16 text-center text-slate-400">
                  <HeartHandshake className="w-10 h-10 text-slate-400 mx-auto mb-2 opacity-50" />
                  <p className="font-semibold text-slate-300">No transactions recorded yet</p>
                  <p className="text-xs text-slate-400 mt-1">
                    Donations received via Paystack online giving will appear here instantly.
                  </p>
                  <Link
                    href="/give"
                    className="inline-block mt-4 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl"
                  >
                    Test Giving Portal
                  </Link>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase tracking-wider text-[10px]">
                      <tr>
                        <th className="py-3 px-4">Donor Name</th>
                        <th className="py-3 px-4">Center</th>
                        <th className="py-3 px-4">Category</th>
                        <th className="py-3 px-4">Amount</th>
                        <th className="py-3 px-4">Payment Method</th>
                        <th className="py-3 px-4">Reference</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {financeData.transactions.map((tx: any) => (
                        <tr key={tx.id} className="hover:bg-slate-800/40 transition">
                          <td className="py-3.5 px-4 font-semibold text-white">
                            {tx.donorName}
                            {tx.donorPhone && (
                              <span className="block text-[10px] text-slate-400 font-normal">
                                {tx.donorPhone}
                              </span>
                            )}
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 font-medium text-[10px]">
                              {tx.center?.code || "CENTRAL"}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-slate-300">
                            {tx.category.replace(/_/g, " ")}
                          </td>
                          <td className="py-3.5 px-4 font-bold text-amber-400">
                            ₦{tx.amount.toLocaleString()}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {tx.paymentMethod === "PAYSTACK_ONLINE" ? "Paystack" : "Bank Transfer"}
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[10px] text-slate-400">
                            {tx.reference || "N/A"}
                          </td>
                          <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                            {new Date(tx.date || tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase">
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: WHATSAPP BROADCAST GENERATOR */}
        {activeTab === "broadcast" && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 p-6 rounded-3xl">
              <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold text-sm">
                <Share2 className="w-4 h-4" /> WhatsApp Growth Engine
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Populate Your Church Database via WhatsApp
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Copy these pre-formatted broadcast messages and post them into your TBMI WhatsApp groups (Main church group, Workers, Youth fellowship, Women & Men groups). Members tap the link, fill their profile in 90 seconds, and populate your database automatically.
              </p>

              <div className="space-y-4">
                {broadcastTemplates.map((tpl, idx) => (
                  <div
                    key={idx}
                    className="bg-slate-950 border border-slate-800 rounded-2xl p-4 relative"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-amber-400">
                        {tpl.title}
                      </span>
                      <button
                        onClick={() => handleCopyBroadcast(tpl.text, idx)}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold transition"
                      >
                        {copiedIndex === idx ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Text</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap bg-slate-900/60 p-3 rounded-xl border border-slate-800/80 leading-relaxed">
                      {tpl.text}
                    </pre>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: ATTENDANCE LOG */}
        {activeTab === "attendance" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Form */}
            <div className="lg:col-span-1 bg-slate-900/70 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
                <CalendarCheck className="w-4 h-4 text-amber-400" />
                Record Service Attendance
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Record attendance for {centers.find((c) => c.id === selectedCenterId)?.name || "selected center"}.
              </p>

              {attendanceSuccess && (
                <div className="p-3 mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-xl">
                  Attendance recorded successfully!
                </div>
              )}

              <form onSubmit={handleAttendanceSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Service Date
                  </label>
                  <input
                    type="date"
                    required
                    value={attendanceDate}
                    onChange={(e) => setAttendanceDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Service Type
                  </label>
                  <select
                    value={attendanceType}
                    onChange={(e) => setAttendanceType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="SUNDAY_1ST_SERVICE">Sunday 1st Service</option>
                    <option value="SUNDAY_2ND_SERVICE">Sunday 2nd Service</option>
                    <option value="MIDWEEK_SERVICE">Midweek Service (Wednesday)</option>
                    <option value="VIGIL">All-Night Vigil</option>
                    <option value="SPECIAL_CONVENTION">Special Convention / Conference</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Men</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={attendanceCounts.men}
                      onChange={(e) =>
                        setAttendanceCounts({ ...attendanceCounts, men: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Women</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={attendanceCounts.women}
                      onChange={(e) =>
                        setAttendanceCounts({ ...attendanceCounts, women: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Youths</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={attendanceCounts.youth}
                      onChange={(e) =>
                        setAttendanceCounts({ ...attendanceCounts, youth: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Children</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={attendanceCounts.children}
                      onChange={(e) =>
                        setAttendanceCounts({ ...attendanceCounts, children: e.target.value })
                      }
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-amber-400 mb-1">
                    First-Timers Count
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    value={attendanceCounts.firstTimers}
                    onChange={(e) =>
                      setAttendanceCounts({
                        ...attendanceCounts,
                        firstTimers: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-1">Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Special event, weather conditions, guest minister..."
                    value={attendanceCounts.notes}
                    onChange={(e) =>
                      setAttendanceCounts({ ...attendanceCounts, notes: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <button
                  type="submit"
                  disabled={savingAttendance}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition disabled:opacity-50"
                >
                  {savingAttendance ? "Saving..." : "Log Service Attendance"}
                </button>
              </form>
            </div>

            {/* Attendance History */}
            <div className="lg:col-span-2 bg-slate-900/70 border border-slate-800 p-6 rounded-3xl">
              <h3 className="text-base font-bold text-white mb-4">
                Recent Service Attendance Records
              </h3>

              {recentAttendances.length === 0 ? (
                <div className="text-center py-12 text-slate-400 text-xs">
                  No attendance records logged yet.
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAttendances.map((att: any) => (
                    <div
                      key={att.id}
                      className="p-4 bg-slate-950 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs"
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-white">
                            {att.serviceType.replace(/_/g, " ")}
                          </span>
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 text-[10px]">
                            {att.center?.name}
                          </span>
                        </div>
                        <div className="text-slate-400 text-[11px]">
                          {new Date(att.serviceDate).toLocaleDateString("en-GB", {
                            weekday: "short",
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                          })}
                        </div>
                        {att.notes && (
                          <p className="text-[11px] text-slate-400 mt-1 italic">
                            &quot;{att.notes}&quot;
                          </p>
                        )}
                      </div>

                      <div className="text-right">
                        <div className="text-xl font-black text-amber-400">
                          {att.totalCount}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          M: {att.menCount} | W: {att.womenCount} | Y: {att.youthCount} | C:{" "}
                          {att.childrenCount}
                        </div>
                        {att.firstTimersCount > 0 && (
                          <div className="text-[10px] text-emerald-400 font-semibold">
                            +{att.firstTimersCount} First Timers
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* MODAL 1: MANUAL ADD MEMBER */}
      {showAddMemberModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-amber-400" />
                Add Member Manually
              </h3>
              <button
                onClick={() => setShowAddMemberModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Directly register a member from paper registers, service sheets, or WhatsApp chat rosters.
            </p>

            {addMemberError && (
              <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                {addMemberError}
              </div>
            )}

            <form onSubmit={handleAddMember} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Worship Center *
                </label>
                <select
                  value={newMemberForm.centerId || selectedCenterId}
                  onChange={(e) =>
                    setNewMemberForm({ ...newMemberForm, centerId: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  required
                >
                  {centers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John"
                    value={newMemberForm.firstName}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, firstName: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Adeleke"
                    value={newMemberForm.lastName}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, lastName: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="08012345678"
                    value={newMemberForm.phone}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, phone: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    placeholder="Same as phone"
                    value={newMemberForm.whatsapp}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, whatsapp: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Gender
                  </label>
                  <select
                    value={newMemberForm.gender}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, gender: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Residential Area in Osogbo
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ogo-Oluwa, Oke-Fia, Ring Road"
                    value={newMemberForm.residentialArea}
                    onChange={(e) =>
                      setNewMemberForm({
                        ...newMemberForm,
                        residentialArea: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Department / Service Unit
                </label>
                <select
                  value={newMemberForm.department}
                  onChange={(e) =>
                    setNewMemberForm({ ...newMemberForm, department: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                >
                  <option value="General Member">General Member</option>
                  <option value="Choir / Worship Ministry">Choir / Worship Ministry</option>
                  <option value="Ushering & Greeters">Ushering & Greeters</option>
                  <option value="Media & Technical / Sound">Media & Technical</option>
                  <option value="Prayer & Intercessory">Prayer & Intercessory</option>
                  <option value="Welfare & Hospitality">Welfare & Hospitality</option>
                  <option value="Sunday School / Believers Academy">Sunday School</option>
                  <option value="Children & Teens Church">Children & Teens</option>
                  <option value="Protocol & Sanctuary Keepers">Protocol</option>
                  <option value="Evangelism & Follow-up">Evangelism</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Birthday Month
                  </label>
                  <select
                    value={newMemberForm.dobMonth}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, dobMonth: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  >
                    <option value="">Month</option>
                    {[
                      "January", "February", "March", "April", "May", "June",
                      "July", "August", "September", "October", "November", "December"
                    ].map((m, idx) => (
                      <option key={m} value={idx + 1}>{m}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Birthday Day
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    placeholder="Day (1-31)"
                    value={newMemberForm.dobDay}
                    onChange={(e) =>
                      setNewMemberForm({ ...newMemberForm, dobDay: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  disabled={savingMember}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition disabled:opacity-50"
                >
                  {savingMember ? "Saving..." : "Save Member Record"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowAddMemberModal(false)}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: BULK GOOGLE FORMS / CSV IMPORTER */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Upload className="w-5 h-5 text-emerald-400" />
                Import Members from Google Forms / Excel
              </h3>
              <button
                onClick={() => {
                  setShowImportModal(false);
                  setImportRows([]);
                  setImportResult(null);
                  setImportError("");
                }}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-slate-400 mb-4 leading-relaxed">
              Have members filled a Google Form or do you have an existing Excel sheet? Download it as a <strong>.csv</strong> file and upload it here to import hundreds of records into TBMI ChMS in seconds.
            </p>

            {/* Template Download Bar */}
            <div className="bg-slate-950 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                <div>
                  <span className="text-xs font-bold text-white block">
                    Need the Google Form / Excel Template?
                  </span>
                  <span className="text-[10px] text-slate-400 block">
                    Download this sample CSV to see the exact recommended columns.
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1 transition shrink-0"
              >
                <Download className="w-3.5 h-3.5" /> Download Template
              </button>
            </div>

            {/* Status alerts */}
            {importError && (
              <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs rounded-xl">
                {importError}
              </div>
            )}

            {importResult && (
              <div className="p-4 mb-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs rounded-2xl">
                <div className="font-bold text-sm mb-1">Import Completed Successfully!</div>
                <div>&bull; {importResult.importedCount} new members created.</div>
                <div>&bull; {importResult.updatedCount} existing records updated.</div>
                {importResult.errors && importResult.errors.length > 0 && (
                  <div className="mt-2 text-rose-300">
                    <span className="font-semibold">Notice:</span> {importResult.errors.join(", ")}
                  </div>
                )}
              </div>
            )}

            {/* File Upload Zone */}
            <div className="space-y-4">
              <div className="border-2 border-dashed border-slate-700 hover:border-emerald-500/60 rounded-2xl p-6 text-center transition bg-slate-950/60">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <label className="cursor-pointer block text-xs text-slate-200 font-semibold mb-1">
                  <span>Click to choose .csv file</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-[11px] text-slate-500 block">
                  Supports Google Forms CSV exports & Microsoft Excel CSV files
                </span>
              </div>

              {/* Preview Table if rows loaded */}
              {importRows.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-emerald-400">
                      ✓ {importRows.length} member rows ready to import
                    </span>
                    <button
                      type="button"
                      onClick={() => setImportRows([])}
                      className="text-[10px] text-slate-400 hover:text-rose-400"
                    >
                      Clear File
                    </button>
                  </div>

                  <div className="max-h-40 overflow-y-auto bg-slate-950 rounded-xl border border-slate-800 p-2 text-[10px]">
                    <table className="w-full text-left text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400">
                          <th className="py-1 px-2">#</th>
                          <th className="py-1 px-2">Name</th>
                          <th className="py-1 px-2">Phone</th>
                          <th className="py-1 px-2">Center</th>
                          <th className="py-1 px-2">Area</th>
                        </tr>
                      </thead>
                      <tbody>
                        {importRows.slice(0, 5).map((r, i) => (
                          <tr key={i} className="border-b border-slate-800/40">
                            <td className="py-1 px-2">{i + 1}</td>
                            <td className="py-1 px-2 font-medium text-white">
                              {r["Full Name"] || r["Name"] || `${r["First Name"] || ""} ${r["Last Name"] || ""}`}
                            </td>
                            <td className="py-1 px-2 font-mono">
                              {r["Phone Number"] || r["Phone"] || r["WhatsApp Number"]}
                            </td>
                            <td className="py-1 px-2">{r["Center"] || "OSOGBO"}</td>
                            <td className="py-1 px-2">{r["Residential Area"] || r["Area"] || "Osogbo"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    {importRows.length > 5 && (
                      <div className="text-center py-1 text-slate-500 italic text-[9px]">
                        + {importRows.length - 5} more rows...
                      </div>
                    )}
                  </div>

                  <button
                    type="button"
                    disabled={importing}
                    onClick={handleBulkImport}
                    className="w-full mt-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/30 transition flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {importing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Importing Records into Database...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Confirm & Import {importRows.length} Members</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
