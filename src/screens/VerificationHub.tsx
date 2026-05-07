import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, ClipboardList, Users, Settings, LifeBuoy, LogOut,
  Search, Bell, HelpCircle, History, Maximize2, Download, ChevronLeft,
  ChevronRight, ShieldCheck, AlertTriangle, ChevronDown, X, Check,
  MapPin, Clock, AlertCircle, Plus, Filter, Eye, FileText, Zap,
  CheckCircle2, XCircle, DollarSign, RefreshCw, Menu
} from "lucide-react";

// ─── Data ─────────────────────────────────────────────────────────────────────
const REPORTS = [
  {
    id: "#8821-V", type: "Illegal Disposal", severity: "Urgent",
    time: "2 mins ago", user: "@citizen_kane", status: "active",
    location: "42nd St & Lex Ave", precision: "2.1m",
    confidence: 98.4, suggestedFine: 250,
    images: [
      "https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?q=80&w=1200&auto=format&fit=crop",
    ],
    thumb: "https://images.unsplash.com/photo-1530587191325-3db32d826c18?q=80&w=400&auto=format&fit=crop",
    description: "Unauthorized dumping of construction debris on public sidewalk. GPS coordinates confirmed. Multiple witnesses reported.",
    audit: [
      { label: "Case Submitted", desc: "10:42 AM · Citizen app", done: true },
      { label: "AI Preliminary Scan", desc: "10:43 AM · Violation detected: 94%", done: true },
      { label: "Awaiting Admin Action", desc: "Currently in your queue", done: false },
    ],
  },
  {
    id: "#8819-B", type: "Vandalism", severity: "Medium",
    time: "15 mins ago", user: "@urban_eye", status: "pending",
    location: "Park Ave & 57th St", precision: "3.4m",
    confidence: 87.2, suggestedFine: 150,
    images: [
      "https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1474112704314-8162b7749a90?q=80&w=1200&auto=format&fit=crop",
    ],
    thumb: "https://images.unsplash.com/photo-1582139329536-e7284fece509?q=80&w=400&auto=format&fit=crop",
    description: "Graffiti tagged on public utility box. Content is non-political but constitutes property damage.",
    audit: [
      { label: "Case Submitted", desc: "10:27 AM · Citizen app", done: true },
      { label: "AI Preliminary Scan", desc: "10:28 AM · Vandalism detected: 87%", done: true },
      { label: "Awaiting Admin Action", desc: "Currently in your queue", done: false },
    ],
  },
  {
    id: "#8815-L", type: "Infra Failure", severity: "Routine",
    time: "42 mins ago", user: "@light_guard", status: "pending",
    location: "Broadway & 34th St", precision: "1.8m",
    confidence: 76.5, suggestedFine: 0,
    images: [
      "https://images.unsplash.com/photo-1474112704314-8162b7749a90?q=80&w=1200&auto=format&fit=crop",
    ],
    thumb: "https://images.unsplash.com/photo-1474112704314-8162b7749a90?q=80&w=400&auto=format&fit=crop",
    description: "Street light malfunction reported. Fixture appears to have wiring issue. Safety hazard for pedestrians.",
    audit: [
      { label: "Case Submitted", desc: "10:00 AM · Citizen app", done: true },
      { label: "AI Preliminary Scan", desc: "10:01 AM · Infrastructure issue: 76%", done: true },
      { label: "Forwarded to Dept", desc: "10:05 AM · Public Works notified", done: true },
      { label: "Awaiting Admin Action", desc: "Currently in your queue", done: false },
    ],
  },
  {
    id: "#8812-N", type: "Noise Complaint", severity: "Routine",
    time: "1 hr ago", user: "@sound_watch", status: "pending",
    location: "5th Ave & 23rd St", precision: "5.2m",
    confidence: 65.0, suggestedFine: 75,
    images: [
      "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=1200&auto=format&fit=crop",
    ],
    thumb: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?q=80&w=400&auto=format&fit=crop",
    description: "Persistent loud music from commercial establishment exceeding decibel limits. Multiple complaints logged.",
    audit: [
      { label: "Case Submitted", desc: "09:42 AM · Citizen app", done: true },
      { label: "AI Preliminary Scan", desc: "09:43 AM · Noise violation: 65%", done: true },
      { label: "Awaiting Admin Action", desc: "Currently in your queue", done: false },
    ],
  },
];

const REJECTION_REASONS = [
  "Insufficient evidence",
  "Location mismatch",
  "Duplicate report",
  "Not a civic violation",
  "Image quality too low",
  "False alarm confirmed",
];

const NOTIFICATIONS = [
  { id: 1, text: "Case #8821-V flagged as urgent", time: "2m ago", unread: true, type: "urgent" },
  { id: 2, text: "AI confidence score updated for #8819-B", time: "14m ago", unread: true, type: "info" },
  { id: 3, text: "Monthly quota 72% reached", time: "1h ago", unread: false, type: "info" },
  { id: 4, text: "New user @light_guard verified", time: "2h ago", unread: false, type: "success" },
];

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: "Dashboard", view: "dashboard" },
  { icon: ClipboardList, label: "Reports Queue", view: "queue" },
  { icon: Users, label: "User Management", view: "users" },
];

const SEVERITY_STYLES = {
  Urgent: "bg-red-50 text-red-600 border border-red-200",
  Medium: "bg-blue-50 text-blue-600 border border-blue-200",
  Routine: "bg-slate-50 text-slate-500 border border-slate-200",
};

// ─── Toast Component ───────────────────────────────────────────────────────────
function Toast({ toasts, dismiss }) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
      {toasts.map((t) => (
        <div
          key={t.id}
          className={`flex items-center gap-3 px-4 py-3 rounded-2xl shadow-lg text-sm font-bold pointer-events-auto
            ${t.type === "success" ? "bg-emerald-600 text-white" :
              t.type === "error" ? "bg-red-600 text-white" :
              t.type === "warning" ? "bg-amber-500 text-white" :
              "bg-[#1976D2] text-white"}`}
          style={{ animation: "slideIn 0.25s ease" }}
        >
          {t.type === "success" ? <CheckCircle2 size={16} /> :
           t.type === "error" ? <XCircle size={16} /> :
           t.type === "warning" ? <AlertTriangle size={16} /> :
           <AlertCircle size={16} />}
          <span>{t.message}</span>
          <button onClick={() => dismiss(t.id)} className="ml-1 opacity-70 hover:opacity-100">
            <X size={14} />
          </button>
        </div>
      ))}
    </div>
  );
}

// ─── Create Alert Modal ────────────────────────────────────────────────────────
function CreateAlertModal({ onClose, onSave }) {
  const [title, setTitle] = useState("");
  const [area, setArea] = useState("");
  const [level, setLevel] = useState("Medium");

  const handleSave = () => {
    if (!title.trim() || !area.trim()) return;
    onSave({ title, area, level });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-black text-[#0A1D25]">Create Alert</h3>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors">
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Alert Title</label>
            <input
              className="mt-1.5 w-full p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#1976D2]/20"
              placeholder="e.g. Increased disposal activity"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Affected Area</label>
            <input
              className="mt-1.5 w-full p-3.5 bg-[#F8FAFC] rounded-xl border border-slate-200 text-sm font-medium outline-none focus:ring-2 focus:ring-[#1976D2]/20"
              placeholder="e.g. Midtown Manhattan"
              value={area}
              onChange={e => setArea(e.target.value)}
            />
          </div>
          <div>
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Severity Level</label>
            <div className="mt-1.5 grid grid-cols-3 gap-2">
              {["Routine", "Medium", "Urgent"].map(l => (
                <button
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`py-2.5 rounded-xl text-sm font-black transition-all border ${
                    level === l
                      ? l === "Urgent" ? "bg-red-600 text-white border-red-600"
                        : l === "Medium" ? "bg-[#1976D2] text-white border-[#1976D2]"
                        : "bg-slate-600 text-white border-slate-600"
                      : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"
                  }`}
                >{l}</button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-8">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-slate-200 text-slate-600 font-black text-sm hover:bg-slate-50">Cancel</button>
          <button
            onClick={handleSave}
            disabled={!title.trim() || !area.trim()}
            className="flex-1 py-3 rounded-xl bg-[#1976D2] text-white font-black text-sm hover:bg-[#1464B5] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            Publish Alert
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
export default function VerificationHub() {
  const [activeView, setActiveView] = useState("queue");
  const [reports, setReports] = useState(REPORTS);
  const [selectedId, setSelectedId] = useState("#8821-V");
  const [imageIndex, setImageIndex] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [rejectionReason, setRejectionReason] = useState("");
  const [adminNote, setAdminNote] = useState("");
  const [showReasonDrop, setShowReasonDrop] = useState(false);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showCreateAlert, setShowCreateAlert] = useState(false);
  const [toasts, setToasts] = useState([]);
  const [quota, setQuota] = useState(72);
  const [notifications, setNotifications] = useState(NOTIFICATIONS);
  const [actionHistory, setActionHistory] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [imageFullscreen, setImageFullscreen] = useState(false);
  const dropRef = useRef(null);
  const notifRef = useRef(null);

  const selected = reports.find(r => r.id === selectedId);
  const filteredReports = reports.filter(r =>
    r.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.user.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const unreadCount = notifications.filter(n => n.unread).length;
  const resolvedCount = reports.filter(r => ["approved", "rejected", "fined"].includes(r.status)).length;

  useEffect(() => {
    setImageIndex(0);
  }, [selectedId]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropRef.current && !dropRef.current.contains(e.target)) setShowReasonDrop(false);
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotifs(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const addToast = (message, type = "info") => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  };

  const dismissToast = (id) => setToasts(prev => prev.filter(t => t.id !== id));

  const updateReportStatus = (id, newStatus, auditEntry) => {
    setReports(prev => prev.map(r => r.id === id ? {
      ...r,
      status: newStatus,
      audit: [...r.audit.slice(0, -1), { label: auditEntry, desc: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) + " · Admin action", done: true }, { label: "Case Closed", desc: "Processed successfully", done: true }]
    } : r));
  };

  const handleApprove = async () => {
    if (!selected || isProcessing) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 800));
    updateReportStatus(selectedId, "approved", "Report Approved");
    setQuota(q => Math.min(100, q + 1));
    setActionHistory(h => [{ id: selectedId, action: "Approved", time: new Date().toLocaleTimeString() }, ...h]);
    addToast(`Case ${selectedId} approved successfully`, "success");
    setAdminNote("");
    setIsProcessing(false);
    const remaining = filteredReports.filter(r => r.id !== selectedId && !["approved", "rejected", "fined"].includes(r.status));
    if (remaining.length > 0) setSelectedId(remaining[0].id);
  };

  const handleReject = async () => {
    if (!selected || isProcessing) return;
    if (!rejectionReason) { addToast("Please select a rejection reason first", "warning"); return; }
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 800));
    updateReportStatus(selectedId, "rejected", `Rejected: ${rejectionReason}`);
    setActionHistory(h => [{ id: selectedId, action: "Rejected", time: new Date().toLocaleTimeString() }, ...h]);
    addToast(`Case ${selectedId} rejected`, "error");
    setAdminNote("");
    setRejectionReason("");
    setIsProcessing(false);
    const remaining = filteredReports.filter(r => r.id !== selectedId && !["approved", "rejected", "fined"].includes(r.status));
    if (remaining.length > 0) setSelectedId(remaining[0].id);
  };

  const handleFine = async () => {
    if (!selected || isProcessing || selected.suggestedFine === 0) return;
    setIsProcessing(true);
    await new Promise(r => setTimeout(r, 800));
    updateReportStatus(selectedId, "fined", `Fine Issued: $${selected.suggestedFine}`);
    setQuota(q => Math.min(100, q + 1));
    setActionHistory(h => [{ id: selectedId, action: `Fined $${selected.suggestedFine}`, time: new Date().toLocaleTimeString() }, ...h]);
    addToast(`Fine of $${selected.suggestedFine} issued for ${selectedId}`, "success");
    setAdminNote("");
    setIsProcessing(false);
  };

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const handleSaveAlert = (alert) => {
    addToast(`Alert "${alert.title}" published for ${alert.area}`, "success");
  };

  const prevImage = () => setImageIndex(i => Math.max(0, i - 1));
  const nextImage = () => setImageIndex(i => Math.min((selected?.images?.length || 1) - 1, i + 1));

  const isResolved = selected && ["approved", "rejected", "fined"].includes(selected.status);

  const STATUS_BADGE = {
    active: "bg-red-50 text-red-600 border border-red-200",
    pending: "bg-amber-50 text-amber-600 border border-amber-200",
    approved: "bg-emerald-50 text-emerald-600 border border-emerald-200",
    rejected: "bg-slate-100 text-slate-500 border border-slate-200",
    fined: "bg-purple-50 text-purple-600 border border-purple-200",
  };

  return (
    <div className="flex h-screen bg-[#F5F7FA] text-[#0A1D25] font-sans overflow-hidden" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <style>{`
        @keyframes slideIn { from { transform: translateX(100px); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        .spin { animation: spin 1s linear infinite; }
        .custom-scroll::-webkit-scrollbar { width: 4px; }
        .custom-scroll::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll::-webkit-scrollbar-thumb { background: #E2E8F0; border-radius: 9999px; }
        .custom-scroll::-webkit-scrollbar-thumb:hover { background: #CBD5E1; }
      `}</style>

      {/* ─── LEFT SIDEBAR ─── */}
      <aside className="w-60 bg-white border-r border-slate-100 flex flex-col py-6 px-4 shrink-0">
        <div className="px-2 mb-8">
          <h1 className="text-lg font-black text-[#005DAC] tracking-tight">CivicAdmin</h1>
          <p className="text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase mt-0.5">Veranda OS · v2.4</p>
        </div>

        <nav className="flex-1 space-y-1">
          {NAV_ITEMS.map(({ icon: Icon, label, view }) => (
            <button
              key={view}
              onClick={() => setActiveView(view)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all text-sm font-bold relative ${
                activeView === view
                  ? "text-[#1976D2] bg-[#EBF5FF]"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
            >
              {activeView === view && <div className="absolute left-[-16px] top-1/2 -translate-y-1/2 w-1 h-7 bg-[#1976D2] rounded-r-full" />}
              <Icon size={18} />
              <span>{label}</span>
              {view === "queue" && (
                <span className="ml-auto text-[9px] font-black bg-[#1976D2] text-white px-1.5 py-0.5 rounded-md">
                  {reports.filter(r => !["approved", "rejected", "fined"].includes(r.status)).length}
                </span>
              )}
            </button>
          ))}
        </nav>

        <div className="pt-4 border-t border-slate-100 space-y-4">
          <button
            onClick={() => setShowCreateAlert(true)}
            className="w-full py-3 bg-[#1976D2] text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-[#1464B5] transition-all text-sm shadow-md shadow-blue-500/20"
          >
            <Plus size={16} />
            Create Alert
          </button>
          <div className="space-y-0.5">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-all text-sm">
              <Settings size={18} /> Settings
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-slate-500 font-bold hover:bg-slate-50 hover:text-slate-700 rounded-xl transition-all text-sm">
              <LifeBuoy size={18} /> Support
            </button>
            <button className="w-full flex items-center gap-3 px-3 py-2.5 text-red-400 font-bold hover:bg-red-50 hover:text-red-600 rounded-xl transition-all text-sm">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT ─── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* HEADER */}
        <header className="h-16 bg-white px-6 flex items-center justify-between shrink-0 border-b border-slate-100 z-10 relative">
          <div className="flex items-center gap-6 flex-1">
            <h2 className="text-base font-black text-[#005DAC] uppercase tracking-wide shrink-0">
              Verification Hub
            </h2>
            <div className="relative flex-1 max-w-xl">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={15} />
              <input
                type="text"
                placeholder="Search case ID, type or user..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-[#F4F7FA] rounded-full border border-transparent focus:border-[#1976D2]/30 focus:ring-2 focus:ring-blue-500/10 text-sm font-medium outline-none transition-all"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3 ml-6">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => { setShowNotifs(!showNotifs); setShowHelp(false); setShowHistory(false); }}
                className="relative w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              {showNotifs && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <span className="text-sm font-black">Notifications</span>
                    <button onClick={handleMarkAllRead} className="text-[11px] text-[#1976D2] font-bold hover:underline">Mark all read</button>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto custom-scroll">
                    {notifications.map(n => (
                      <div key={n.id} className={`px-4 py-3 flex gap-3 items-start ${n.unread ? "bg-[#F0F7FF]" : ""}`}>
                        <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${n.unread ? "bg-[#1976D2]" : "bg-slate-200"}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-[12px] font-bold text-[#0A1D25] leading-snug">{n.text}</p>
                          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{n.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Help */}
            <div className="relative">
              <button
                onClick={() => { setShowHelp(!showHelp); setShowNotifs(false); setShowHistory(false); }}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
              >
                <HelpCircle size={18} />
              </button>
              {showHelp && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  {["Documentation", "Keyboard Shortcuts", "Report a Bug", "Contact Support"].map(item => (
                    <button key={item} onClick={() => setShowHelp(false)} className="w-full text-left px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0">
                      {item}
                    </button>
                  ))}
                </div>
              )}
            </div>
            {/* History */}
            <div className="relative">
              <button
                onClick={() => { setShowHistory(!showHistory); setShowNotifs(false); setShowHelp(false); }}
                className="w-8 h-8 flex items-center justify-center rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 transition-all"
              >
                <History size={18} />
              </button>
              {showHistory && (
                <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <span className="text-sm font-black">Action History</span>
                  </div>
                  <div className="divide-y divide-slate-50 max-h-64 overflow-y-auto custom-scroll">
                    {actionHistory.length === 0 ? (
                      <div className="px-4 py-6 text-center text-sm text-slate-400 font-medium">No actions yet</div>
                    ) : actionHistory.map((h, i) => (
                      <div key={i} className="px-4 py-3 flex justify-between items-center">
                        <div>
                          <p className="text-[12px] font-black text-[#0A1D25]">{h.id}</p>
                          <p className="text-[11px] text-slate-400 font-medium">{h.action}</p>
                        </div>
                        <span className="text-[10px] text-slate-400">{h.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#1976D2] to-[#005DAC] overflow-hidden flex items-center justify-center text-white text-xs font-black cursor-pointer">
              CA
            </div>
          </div>
        </header>

        {/* QUEUE VIEW */}
        {activeView !== "queue" ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#EBF5FF] rounded-3xl flex items-center justify-center mx-auto mb-4">
                {activeView === "dashboard" ? <LayoutDashboard size={28} className="text-[#1976D2]" /> : <Users size={28} className="text-[#1976D2]" />}
              </div>
              <h3 className="text-xl font-black text-[#0A1D25] mb-2">
                {activeView === "dashboard" ? "Dashboard" : "User Management"}
              </h3>
              <p className="text-sm text-slate-400 font-medium">This section is under development</p>
              <button onClick={() => setActiveView("queue")} className="mt-6 px-6 py-2.5 bg-[#1976D2] text-white rounded-xl font-bold text-sm hover:bg-[#1464B5] transition-all">
                Back to Queue
              </button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-hidden flex p-4 gap-4">

            {/* 1. INCOMING QUEUE */}
            <div className="w-64 flex flex-col shrink-0 h-full overflow-hidden">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div>
                  <h3 className="text-base font-black text-[#0A1D25]">Incoming Queue</h3>
                  <p className="text-[10px] text-slate-400 font-bold mt-0.5">
                    {reports.filter(r => !["approved", "rejected", "fined"].includes(r.status)).length} active ·&nbsp;
                    {resolvedCount} resolved
                  </p>
                </div>
                <div className="bg-[#EBF5FF] px-2.5 py-1.5 rounded-xl flex flex-col items-center">
                  <span className="text-[#1976D2] text-sm font-black leading-none">
                    {reports.filter(r => !["approved", "rejected", "fined"].includes(r.status)).length}
                  </span>
                  <span className="text-[#1976D2] text-[8px] font-black uppercase tracking-wider leading-none mt-0.5">Active</span>
                </div>
              </div>

              {searchQuery && filteredReports.length === 0 && (
                <div className="py-6 text-center text-sm text-slate-400 font-medium">No results for "{searchQuery}"</div>
              )}

              <div className="space-y-2 overflow-y-auto flex-1 pr-1 custom-scroll">
                {filteredReports.map((rpt) => (
                  <button
                    key={rpt.id}
                    onClick={() => setSelectedId(rpt.id)}
                    className={`w-full p-3 rounded-2xl cursor-pointer transition-all border text-left ${
                      selectedId === rpt.id
                        ? "bg-white border-[#1976D2]/25 shadow-md ring-1 ring-[#1976D2]/10"
                        : "bg-white border-slate-100 shadow-sm hover:border-slate-200 hover:shadow"
                    }`}
                  >
                    <div className="flex gap-2.5">
                      <div className="w-12 h-12 rounded-xl overflow-hidden shrink-0 relative">
                        <img src={rpt.thumb} alt="" className="w-full h-full object-cover" />
                        {["approved", "rejected", "fined"].includes(rpt.status) && (
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                            {rpt.status === "approved" || rpt.status === "fined" ? <Check size={16} className="text-white" /> : <X size={16} className="text-white" />}
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start">
                          <h4 className="font-black text-[12px] truncate text-[#0A1D25]">{rpt.type}</h4>
                        </div>
                        <p className="text-[9px] font-bold text-slate-400 truncate">Case {rpt.id}</p>
                        <div className="flex items-center justify-between mt-1.5">
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${SEVERITY_STYLES[rpt.severity]}`}>
                            {rpt.severity}
                          </span>
                          <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${STATUS_BADGE[rpt.status]}`}>
                            {rpt.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. CASE EVIDENCE */}
            <div className="flex-1 flex flex-col gap-4 overflow-hidden min-w-0 h-full">
              {/* EVIDENCE CARD */}
              <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col flex-1 min-h-0">
                <div className="flex justify-between items-start mb-3 shrink-0">
                  <div>
                    <h3 className="text-base font-bold flex items-center gap-2">
                      Case Evidence: <span className="text-[#1976D2]">{selectedId}</span>
                      {isResolved && (
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${STATUS_BADGE[selected?.status]}`}>
                          {selected?.status}
                        </span>
                      )}
                    </h3>
                    <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                      {selected?.user} · {selected?.images?.length} {selected?.images?.length === 1 ? "file" : "files"} attached
                    </p>
                    {selected?.description && (
                      <p className="text-[11px] text-slate-500 mt-1 max-w-lg leading-relaxed">{selected.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="bg-[#EBF5FF] px-3 py-2 rounded-xl flex items-center gap-1.5">
                      <ShieldCheck size={15} className="text-[#1976D2]" />
                      <span className="text-[#1976D2] font-black text-sm">{selected?.confidence}% Confidence</span>
                    </div>
                  </div>
                </div>

                {/* IMAGE VIEWER */}
                <div className="relative flex-1 rounded-2xl overflow-hidden min-h-0 bg-slate-100">
                  {selected?.images && (
                    <img
                      src={selected.images[imageIndex]}
                      alt="Evidence"
                      className="w-full h-full object-cover transition-all duration-300"
                    />
                  )}

                  {/* OVERLAY TOOLBAR */}
                  <div className="absolute top-4 right-4 flex flex-col gap-2">
                    <button
                      onClick={() => setImageFullscreen(!imageFullscreen)}
                      className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm text-slate-700 flex items-center justify-center hover:bg-white shadow border border-slate-200/50 transition-all"
                      title="Toggle fullscreen"
                    ><Maximize2 size={15} /></button>
                    <button
                      onClick={() => addToast("Download started", "info")}
                      className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm text-slate-700 flex items-center justify-center hover:bg-white shadow border border-slate-200/50 transition-all"
                      title="Download evidence"
                    ><Download size={15} /></button>
                    <button
                      onClick={() => addToast("Link copied to clipboard", "info")}
                      className="w-8 h-8 rounded-lg bg-white/90 backdrop-blur-sm text-slate-700 flex items-center justify-center hover:bg-white shadow border border-slate-200/50 transition-all"
                      title="Share evidence"
                    ><Eye size={15} /></button>
                  </div>

                  {/* IMAGE NAV */}
                  {selected?.images && selected.images.length > 1 && (
                    <>
                      <button
                        onClick={prevImage}
                        disabled={imageIndex === 0}
                        className="absolute left-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      ><ChevronLeft size={18} /></button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
                        {selected.images.map((_, i) => (
                          <button
                            key={i}
                            onClick={() => setImageIndex(i)}
                            className={`rounded-full transition-all ${i === imageIndex ? "w-6 h-2 bg-white" : "w-2 h-2 bg-white/50 hover:bg-white/80"}`}
                          />
                        ))}
                      </div>
                      <div className="absolute bottom-4 right-4 px-3 py-1.5 rounded-xl bg-black/30 backdrop-blur-md text-white font-black text-[10px]">
                        {imageIndex + 1} / {selected.images.length}
                      </div>
                      <button
                        onClick={nextImage}
                        disabled={imageIndex === (selected?.images?.length || 1) - 1}
                        className="absolute right-4 top-1/2 -translate-y-1/2 w-9 h-9 rounded-xl bg-white/20 backdrop-blur-md text-white flex items-center justify-center hover:bg-white/40 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      ><ChevronRight size={18} /></button>
                    </>
                  )}

                  {/* Resolved overlay */}
                  {isResolved && (
                    <div className="absolute inset-0 bg-black/20 flex items-center justify-center backdrop-blur-[2px]">
                      <div className={`px-6 py-3 rounded-2xl font-black text-sm uppercase tracking-widest ${
                        selected?.status === "rejected" ? "bg-slate-800 text-white" : "bg-emerald-600 text-white"
                      }`}>
                        Case {selected?.status?.toUpperCase()}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* LOWER GRID: MAP & AUDIT */}
              <div className="grid grid-cols-2 gap-4 h-48 shrink-0">
                {/* MAP CARD */}
                <div className="bg-[#0A1D25] rounded-3xl overflow-hidden relative h-full">
                  <div className="absolute top-4 left-4 z-10 px-3 py-1.5 bg-white/90 backdrop-blur-md text-[9px] font-black uppercase tracking-widest rounded-full shadow text-[#0A1D25] flex items-center gap-1.5">
                    <MapPin size={10} className="text-[#1976D2]" />
                    Location Validated
                  </div>
                  <img
                    src="https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=800&auto=format&fit=crop"
                    alt="Map"
                    className="w-full h-full object-cover opacity-60"
                  />
                  <div className="absolute bottom-4 left-4 right-4 bg-white rounded-xl p-3 flex justify-between items-center shadow-lg">
                    <div>
                      <h4 className="font-black text-[13px] text-[#0A1D25]">{selected?.location}</h4>
                      <p className="text-[9px] text-slate-400 font-bold mt-0.5">{selected?.severity} priority zone</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[12px] font-black text-[#1976D2]">{selected?.precision}</p>
                      <p className="text-[8px] font-bold text-slate-400">Precision</p>
                    </div>
                  </div>
                </div>

                {/* AUDIT TRAIL */}
                <div className="bg-white rounded-3xl p-5 shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden">
                  <h4 className="text-[9px] font-black text-[#1976D2] uppercase tracking-[0.15em] mb-3 shrink-0">Audit Trail</h4>
                  <div className="space-y-3 flex-1 overflow-y-auto custom-scroll pr-1">
                    {selected?.audit.map((item, i) => (
                      <div key={i} className="flex gap-3 relative">
                        <div className="flex flex-col items-center">
                          <div className={`w-2 h-2 rounded-full shrink-0 relative z-10 ${item.done ? "bg-[#1976D2]" : "bg-slate-200"}`} />
                          {i < selected.audit.length - 1 && (
                            <div className={`w-px flex-1 mt-1 ${item.done ? "bg-[#1976D2]/20" : "bg-slate-100"}`} style={{ minHeight: "16px" }} />
                          )}
                        </div>
                        <div className="pb-2">
                          <h5 className={`text-[11px] font-black ${item.done ? "text-[#0A1D25]" : "text-slate-400"}`}>{item.label}</h5>
                          <p className="text-[9px] font-bold text-slate-400 mt-0.5">{item.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. TAKE ACTION PANEL */}
            <div className="w-72 flex flex-col shrink-0 gap-4 h-full overflow-hidden">
              <div className="bg-white rounded-3xl shadow-sm border border-slate-100 flex-1 flex flex-col p-5 min-h-0 overflow-y-auto custom-scroll">
                <h3 className="text-base font-black mb-0.5 text-[#0A1D25]">Take Action</h3>
                <p className="text-[10px] text-slate-400 font-medium mb-5">
                  Protocol V2.4 · Case {selectedId}
                </p>

                {isResolved ? (
                  <div className="py-4 px-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
                    <CheckCircle2 size={24} className="text-slate-400 mx-auto mb-2" />
                    <p className="text-sm font-black text-slate-500">Case Resolved</p>
                    <p className="text-[11px] text-slate-400 font-medium mt-1">Status: {selected?.status}</p>
                    <button
                      onClick={() => {
                        const next = filteredReports.find(r => !["approved", "rejected", "fined"].includes(r.status));
                        if (next) setSelectedId(next.id);
                      }}
                      className="mt-4 w-full py-2.5 bg-[#1976D2] text-white rounded-xl font-bold text-sm hover:bg-[#1464B5] transition-all"
                    >
                      Next Case →
                    </button>
                  </div>
                ) : (
                  <>
                    {/* ACTION BUTTONS */}
                    <div className="space-y-2">
                      <button
                        onClick={handleApprove}
                        disabled={isProcessing}
                        className="w-full py-3 bg-[#1976D2] text-white rounded-xl font-black flex items-center justify-center gap-2 hover:bg-[#1464B5] transition-all shadow-md shadow-blue-500/20 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isProcessing ? (
                          <RefreshCw size={15} className="spin" />
                        ) : <ShieldCheck size={15} />}
                        Approve Report
                      </button>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={handleReject}
                          disabled={isProcessing}
                          className="py-2.5 bg-slate-100 text-slate-600 rounded-xl font-black text-sm hover:bg-slate-200 transition-all disabled:opacity-60"
                        >
                          Reject Case
                        </button>
                        <button
                          onClick={handleFine}
                          disabled={isProcessing || selected?.suggestedFine === 0}
                          className="py-2.5 border border-red-200 bg-red-50 text-red-600 rounded-xl font-black text-sm hover:bg-red-100 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          Issue Fine
                        </button>
                      </div>
                    </div>

                    {/* REJECTION REASON */}
                    <div className="mt-5" ref={dropRef}>
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rejection Reason</label>
                      <div
                        className="mt-1.5 flex items-center justify-between p-3 bg-[#F8FAFC] rounded-xl border border-slate-200 cursor-pointer hover:border-[#1976D2]/30 transition-colors"
                        onClick={() => setShowReasonDrop(!showReasonDrop)}
                      >
                        <span className={`text-sm font-medium ${rejectionReason ? "text-[#0A1D25]" : "text-slate-400"}`}>
                          {rejectionReason || "Select a reason..."}
                        </span>
                        <ChevronDown size={14} className={`text-slate-400 transition-transform ${showReasonDrop ? "rotate-180" : ""}`} />
                      </div>
                      {showReasonDrop && (
                        <div className="mt-1 bg-white rounded-xl border border-slate-200 shadow-lg overflow-hidden z-20 relative">
                          {REJECTION_REASONS.map(r => (
                            <button
                              key={r}
                              onClick={() => { setRejectionReason(r); setShowReasonDrop(false); }}
                              className={`w-full text-left px-3.5 py-2.5 text-sm font-medium hover:bg-[#EBF5FF] hover:text-[#1976D2] transition-colors border-b border-slate-50 last:border-0 ${rejectionReason === r ? "bg-[#EBF5FF] text-[#1976D2] font-bold" : "text-slate-600"}`}
                            >{r}</button>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* ADMIN NOTES */}
                    <div className="mt-4">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Internal Admin Notes</label>
                      <textarea
                        className="mt-1.5 w-full p-3 bg-[#F8FAFC] rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-[#1976D2]/20 focus:border-[#1976D2]/30 outline-none resize-none transition-all"
                        rows={3}
                        placeholder="Summarize verification findings..."
                        value={adminNote}
                        onChange={e => setAdminNote(e.target.value)}
                      />
                      {adminNote && (
                        <p className="text-[9px] text-slate-400 font-medium mt-0.5 text-right">
                          {adminNote.length} chars
                        </p>
                      )}
                    </div>

                    {/* SUGGESTED FINE */}
                    {selected?.suggestedFine > 0 && (
                      <div className="mt-4 bg-[#EBF5FF] p-4 rounded-xl flex items-center gap-3 border border-[#1976D2]/10">
                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shadow-sm shrink-0">
                          <DollarSign size={16} className="text-[#1976D2]" />
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-[#1976D2] uppercase tracking-wider mb-0.5">Suggested Fine</p>
                          <p className="text-xl font-black text-[#1976D2] leading-none">${selected.suggestedFine}.00</p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* QUOTA CARD */}
              <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-100 shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-[#EBF5FF] rounded-xl flex items-center justify-center shrink-0">
                    <Zap className="text-[#1976D2]" size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-1.5">
                      <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Monthly Quota</p>
                      <p className="text-[9px] font-black text-[#1976D2]">{quota}%</p>
                    </div>
                    <div className="w-full h-1.5 bg-[#F0F4F8] rounded-full overflow-hidden mb-1.5">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{
                          width: `${quota}%`,
                          background: quota >= 90 ? "#ef4444" : quota >= 75 ? "#f59e0b" : "#1976D2"
                        }}
                      />
                    </div>
                    <p className="text-[11px] font-black text-[#0A1D25]">{quota} / 100 Verified</p>
                  </div>
                </div>
              </div>

              {/* STATS MINI CARDS */}
              <div className="grid grid-cols-2 gap-2 shrink-0">
                <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Approved</p>
                  <p className="text-xl font-black text-emerald-600 mt-0.5">
                    {reports.filter(r => r.status === "approved").length}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Rejected</p>
                  <p className="text-xl font-black text-slate-500 mt-0.5">
                    {reports.filter(r => r.status === "rejected").length}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Fined</p>
                  <p className="text-xl font-black text-purple-600 mt-0.5">
                    {reports.filter(r => r.status === "fined").length}
                  </p>
                </div>
                <div className="bg-white rounded-2xl p-3 shadow-sm border border-slate-100">
                  <p className="text-[8px] font-black text-slate-400 uppercase tracking-wider">Pending</p>
                  <p className="text-xl font-black text-amber-500 mt-0.5">
                    {reports.filter(r => r.status === "pending").length}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* TOASTS */}
      <Toast toasts={toasts} dismiss={dismissToast} />

      {/* CREATE ALERT MODAL */}
      {showCreateAlert && (
        <CreateAlertModal onClose={() => setShowCreateAlert(false)} onSave={handleSaveAlert} />
      )}

      {/* FULLSCREEN IMAGE */}
      {imageFullscreen && selected && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center" onClick={() => setImageFullscreen(false)}>
          <img
            src={selected.images[imageIndex]}
            alt="Evidence fullscreen"
            className="max-w-full max-h-full object-contain rounded-2xl"
          />
          <button className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-colors">
            <X size={20} />
          </button>
          <div className="absolute bottom-6 text-white/60 text-sm font-medium">
            Click anywhere to close · Image {imageIndex + 1} of {selected.images.length}
          </div>
        </div>
      )}
    </div>
  );
}