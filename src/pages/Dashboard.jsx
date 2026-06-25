import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  Wrench,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  Users,
  Car,
  Package,
  BarChart3,
  ChevronRight,
  AlertTriangle,
  HardHat,
  MessageCircle,
  Bot,
  X,
  Send,
  TrendingUp,
  TrendingDown,
  MessageSquare,
  Activity,
  Zap,
  Calendar,
  Crown,
  Sparkles,
  Award,
  Gift,
} from "lucide-react";
import { getAllCustomers, calcTier, TIER_CONFIG } from "../context/CustomerAuthContext";
import { getBookingStats } from "../lib/bookingEngine";

const fmt = (n) => "Rp " + Number(n).toLocaleString("id-ID");
const fmtShort = (n) =>
  n >= 1000000 ? `Rp ${(n / 1000000).toFixed(1)}jt` : fmt(n);

// ─── Animated Number ──────────────────────────────────────────────────
function AnimatedNumber({ value, duration = 800, format = (v) => v }) {
  const [display, setDisplay] = useState(0);
  const startTime = useRef(null);
  const startValue = useRef(0);

  useEffect(() => {
    startValue.current = display;
    startTime.current = null;
    const step = (timestamp) => {
      if (!startTime.current) startTime.current = timestamp;
      const progress = Math.min((timestamp - startTime.current) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = startValue.current + (value - startValue.current) * eased;
      setDisplay(current);
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [value, duration]);

  return <>{format(display)}</>;
}

// ─── Ambil data dari sessionStorage ────────────────────────────────────
function useStorageData() {
  const [orders, setOrders]       = useState([]);
  const [inventory, setInventory] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [vehicles, setVehicles]   = useState([]);
  const [bookingStats, setBookingStats] = useState({});

  const load = () => {
    try {
      const o = sessionStorage.getItem("garage_orders");
      if (o) setOrders(JSON.parse(o));
      const i = sessionStorage.getItem("garage_vehicles");
      if (i) setVehicles(JSON.parse(i));
      const m = sessionStorage.getItem("garage_mechanics");
      if (m) setMechanics(JSON.parse(m));
      const inv = sessionStorage.getItem("garage_inventory");
      if (inv) setInventory(JSON.parse(inv));
      try { setBookingStats(getBookingStats()); } catch {}
    } catch {}
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 3000);
    window.addEventListener("storage", load);
    return () => {
      clearInterval(iv);
      window.removeEventListener("storage", load);
    };
  }, []);

  return { orders, inventory, mechanics, vehicles, bookingStats };
}

// ─── Membership stats ──────────────────────────────────────────────────
function useMembershipStats() {
  const [customers, setCustomers] = useState([]);

  useEffect(() => {
    const load = () => {
      try {
        setCustomers(getAllCustomers());
      } catch {
        setCustomers([]);
      }
    };
    load();
    const iv = setInterval(load, 3000);
    window.addEventListener("storage", load);
    return () => {
      clearInterval(iv);
      window.removeEventListener("storage", load);
    };
  }, []);

  return useMemo(() => {
    const total = customers.length;
    const active = customers.filter((c) => c.membershipStatus === "active");
    const totalActive = active.length;

    const now = new Date();
    const thisMonthKey = now.toISOString().slice(0, 7);
    const lastMonthDate = new Date(now);
    lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
    const lastMonthKey = lastMonthDate.toISOString().slice(0, 7);

    const newThisMonth = customers.filter((c) =>
      (c.memberSince || c.joinDate || "").startsWith(thisMonthKey)
    ).length;
    const newLastMonth = customers.filter((c) =>
      (c.memberSince || c.joinDate || "").startsWith(lastMonthKey)
    ).length;

    const growthRate =
      newLastMonth > 0
        ? Math.round(((newThisMonth - newLastMonth) / newLastMonth) * 100)
        : newThisMonth > 0
          ? 100
          : 0;

    const byTier = { Bronze: 0, Silver: 0, Gold: 0, Platinum: 0 };
    active.forEach((c) => {
      byTier[calcTier(c.points || 0)]++;
    });

    return { total, totalActive, newThisMonth, growthRate, byTier };
  }, [customers]);
}

// ─── Build revenue chart ──────────────────────────────────────────────
function buildRevenueChart(orders, range) {
  const now = new Date();
  let days = 18;
  let startDate = new Date(now);

  if (range === "hariini") {
    days = 1;
    startDate = new Date(now);
  } else if (range === "7hari") {
    days = 7;
    startDate.setDate(now.getDate() - 6);
  } else if (range === "30hari") {
    days = 30;
    startDate.setDate(now.getDate() - 29);
  } else if (range === "bulanini") {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    const diff = Math.floor((now - startDate) / (1000 * 60 * 60 * 24)) + 1;
    days = diff;
  }

  const dates = Array.from({ length: days }, (_, i) => {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    return d.toISOString().slice(0, 10);
  });

  return dates.map((date) => {
    const dayOrders = orders.filter(
      (o) => o.date === date && o.status === "Selesai"
    );
    const revenue = dayOrders.reduce((s, o) => s + Number(o.total), 0);
    const d = new Date(date + "T00:00:00");
    const label =
      days === 1
        ? "Hari Ini"
        : `${d.getDate()} ${d.toLocaleString("id-ID", { month: "short" })}`;
    return { date: label, revenue, count: dayOrders.length };
  });
}

// ─── Mini sparkline ───────────────────────────────────────────────────
function buildMiniChart(orders, statusFilter) {
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    const dateStr = d.toISOString().slice(0, 10);
    const count = orders.filter(
      (o) => o.date === dateStr && (!statusFilter || o.status === statusFilter)
    ).length;
    return { v: count };
  });
}

// ─── Custom Tooltip ───────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-4 py-3 animate-fadeIn"
      style={{
        background: "rgba(10, 26, 18, 0.95)",
        backdropFilter: "blur(12px)",
        border: "1px solid rgba(52, 211, 153, 0.25)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.6)",
      }}
    >
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-emerald-400 font-bold text-sm">
        {fmtShort(payload[0].value)}
      </p>
      <p className="text-gray-500 text-xs mt-1">{payload[0].payload.count} order</p>
    </div>
  );
};

// ─── Mini Sparkline ───────────────────────────────────────────────────
function MiniSparkline({ data, color = "#34D399" }) {
  return (
    <div style={{ width: "100%", height: 48, minHeight: 48 }}>
      <ResponsiveContainer width="100%" height={48}>
        <AreaChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`spark-${color.replace("#", "")}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.4} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="v"
            stroke={color}
            strokeWidth={2.5}
            fill={`url(#spark-${color.replace("#", "")})`}
            dot={false}
            isAnimationActive={true}
            animationDuration={1200}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

// ─── Top Stat Card ────────────────────────────────────────────────────
function TopStatCard({
  icon: Icon,
  iconBg,
  label,
  value,
  change,
  positive,
  sparkData,
  sparkColor,
  delay = 0,
  format = (v) => (typeof v === "number" ? Math.round(v) : v),
}) {
  return (
    <div
      className="relative rounded-2xl p-5 flex flex-col justify-between overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl hover:shadow-emerald-500/10 group animate-fadeInUp"
      style={{
        background: "linear-gradient(145deg, rgba(10, 26, 18, 0.9), rgba(4, 16, 11, 0.95))",
        border: "1px solid rgba(52, 211, 153, 0.12)",
        backdropFilter: "blur(8px)",
        minHeight: 150,
        animationDelay: `${delay}ms`,
        animationFillMode: "both",
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-1">{label}</p>
          <p className="text-white text-2xl font-black leading-tight tracking-tight">
            <AnimatedNumber value={value} format={format} duration={900} />
          </p>
          {change !== undefined && (
            <span
              className={`inline-flex items-center gap-1 text-xs font-semibold mt-1.5 ${
                positive ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {positive ? (
                <TrendingUp size={12} className="animate-bounce-soft" />
              ) : (
                <TrendingDown size={12} className="animate-bounce-soft" />
              )}
              {change}
            </span>
          )}
        </div>
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-500 group-hover:rotate-12 group-hover:scale-110"
          style={{ background: iconBg }}
        >
          <Icon size={20} className="text-white" />
        </div>
      </div>
      <div className="-mx-2">
        <MiniSparkline data={sparkData} color={sparkColor} />
      </div>
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl -z-10 group-hover:bg-emerald-500/15 transition-all duration-700"></div>
    </div>
  );
}

// ─── Status Badge ─────────────────────────────────────────────────────
const STATUS_CFG = {
  Selesai: { bg: "rgba(52,211,153,0.15)", color: "#34D399", label: "Completed" },
  "Sedang Dikerjakan": { bg: "rgba(251,191,36,0.15)", color: "#FBBF24", label: "In Progress" },
  Menunggu: { bg: "rgba(148,163,184,0.1)", color: "#94A3B8", label: "Waiting" },
  Dibatalkan: { bg: "rgba(239,68,68,0.12)", color: "#EF4444", label: "Cancelled" },
};

function StatusBadge({ status }) {
  const s = STATUS_CFG[status] || STATUS_CFG["Menunggu"];
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider animate-pulse-ring"
      style={{ background: s.bg, color: s.color, border: `1px solid ${s.color}25` }}
    >
      <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: s.color }} />
      {s.label}
    </span>
  );
}

function stringToHue(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % 360;
}

// ─── Donut Chart ──────────────────────────────────────────────────────
function DonutChart({ data, total, centerSub, size = 140 }) {
  const [hoverIndex, setHoverIndex] = useState(null);

  return (
    <div
      className="relative"
      style={{ width: size, height: size }}
      onMouseLeave={() => setHoverIndex(null)}
    >
      <PieChart width={size} height={size}>
        <Pie
          data={data}
          cx={size / 2 - 1}
          cy={size / 2 - 1}
          innerRadius={size * 0.32}
          outerRadius={size * 0.46}
          paddingAngle={2}
          dataKey="value"
          strokeWidth={0}
          isAnimationActive={true}
          animationDuration={1500}
          animationEasing="ease-out"
        >
          {data.map((entry, index) => (
            <Cell
              key={index}
              fill={entry.color}
              onMouseEnter={() => setHoverIndex(index)}
              style={{
                cursor: "pointer",
                transition: "transform 0.3s ease, filter 0.4s ease",
                transform: hoverIndex === index ? "scale(1.08)" : "scale(1)",
                filter: hoverIndex === index
                  ? "drop-shadow(0 0 16px rgba(52,211,153,0.5))"
                  : "none",
                transformOrigin: "center",
              }}
            />
          ))}
        </Pie>
      </PieChart>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <p className="text-white text-2xl font-black leading-none">
          <AnimatedNumber value={total} format={(v) => Math.round(v)} duration={1200} />
        </p>
        <p className="text-gray-400 text-[10px] uppercase tracking-wider mt-0.5">{centerSub}</p>
      </div>
    </div>
  );
}

// ─── CHATBOT MODAL ────────────────────────────────────────────────────
function ChatbotModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    { role: "bot", text: "Halo! Saya AI asisten Esther Garage. Ada yang bisa saya bantu? 😊" },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const getBotReply = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes("harga") || lowerMsg.includes("biaya")) {
      return "Untuk informasi harga servis, silakan cek menu Layanan atau hubungi admin via WhatsApp. Biaya servis standar mulai Rp 150.000.";
    } else if (lowerMsg.includes("jadwal") || lowerMsg.includes("booking")) {
      return "Anda bisa booking servis melalui menu Order Baru. Pastikan memilih tanggal dan layanan yang diinginkan.";
    } else if (lowerMsg.includes("stok") || lowerMsg.includes("spare part")) {
      return "Stok part bisa dilihat di menu Inventaris. Jika part habis, admin akan menginfokan penggantiannya.";
    } else if (lowerMsg.includes("terima kasih") || lowerMsg.includes("thanks")) {
      return "Sama-sama! Senang bisa membantu. 😊";
    } else {
      return "Terima kasih atas pertanyaannya. Tim kami akan segera merespon melalui WhatsApp. Apakah ada hal lain yang bisa saya bantu?";
    }
  };

  const handleSend = async () => {
    if (!input.trim()) return;
    const userText = input.trim();
    setMessages((prev) => [...prev, { role: "user", text: userText }]);
    setInput("");
    setIsTyping(true);
    setTimeout(() => {
      const reply = getBotReply(userText);
      setMessages((prev) => [...prev, { role: "bot", text: reply }]);
      setIsTyping(false);
    }, 800);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div
        className="w-full max-w-md rounded-3xl flex flex-col animate-slideUp"
        style={{
          height: 520,
          background: "linear-gradient(145deg, #0a1e15, #05120b)",
          border: "1px solid rgba(52,211,153,0.2)",
          boxShadow: "0 24px 80px rgba(0,0,0,0.8)",
        }}
      >
        <div className="flex items-center justify-between p-5 border-b border-emerald-500/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/20 flex items-center justify-center animate-pulse">
              <Bot size={18} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-bold text-sm">AI Assistant</h3>
              <p className="text-emerald-400 text-[10px] uppercase tracking-wider">Online</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-white transition-all duration-300 hover:rotate-90"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} animate-fadeInUp`}
              style={{ animationDelay: `${idx * 50}ms` }}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm ${
                  msg.role === "user"
                    ? "bg-emerald-600/30 text-white rounded-br-none border border-emerald-500/20"
                    : "bg-white/5 text-gray-200 rounded-bl-none border border-white/5"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start animate-fadeIn">
              <div className="bg-white/5 rounded-2xl px-4 py-2.5 text-sm text-gray-400 border border-white/5">
                <span className="animate-pulse">···</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t border-emerald-500/10 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === "Enter" && handleSend()}
            placeholder="Tanyakan sesuatu..."
            className="flex-1 bg-white/5 border border-emerald-500/15 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-emerald-400/40 transition-all duration-300"
          />
          <button
            onClick={handleSend}
            className="w-10 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white transition-all duration-300 hover:scale-110 active:scale-95 shadow-lg shadow-emerald-500/20"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FLOATING MENU ────────────────────────────────────────────────────
function FloatingCRMMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const handleWhatsApp = () => {
    const phoneNumber = "6281234567890";
    const message = "Halo Esther Garage, saya ingin menanyakan...";
    window.open(`https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`, "_blank");
    setIsOpen(false);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-40">
        {isOpen && (
          <div className="absolute bottom-16 right-0 mb-2 space-y-2">
            <button
              onClick={() => {
                setShowChatbot(true);
                setIsOpen(false);
              }}
              className="flex items-center gap-3 rounded-full px-5 py-2.5 shadow-xl transition-all w-44 border animate-fadeInUp"
              style={{
                background: "rgba(10, 26, 18, 0.95)",
                backdropFilter: "blur(12px)",
                color: "#34D399",
                borderColor: "rgba(52,211,153,0.3)",
              }}
            >
              <Bot size={18} className="animate-spin-slow" />
              <span className="text-sm font-medium">AI Chatbot</span>
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-3 rounded-full px-5 py-2.5 shadow-xl transition-all w-44 border animate-fadeInUp"
              style={{
                background: "rgba(10, 26, 18, 0.95)",
                backdropFilter: "blur(12px)",
                color: "#34D399",
                borderColor: "rgba(52,211,153,0.3)",
              }}
            >
              <MessageCircle size={18} />
              <span className="text-sm font-medium">WhatsApp</span>
            </button>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95 animate-pulse-ring shadow-2xl shadow-emerald-500/30"
          style={{
            background: "linear-gradient(135deg, #059669, #10B981)",
            boxShadow: "0 0 40px rgba(52,211,153,0.3)",
          }}
        >
          {isOpen ? (
            <X size={24} className="rotate-90 transition-transform duration-300" />
          ) : (
            <MessageSquare size={24} className="transition-transform duration-300" />
          )}
        </button>
      </div>
      <ChatbotModal isOpen={showChatbot} onClose={() => setShowChatbot(false)} />
    </>
  );
}

// ─── Member List Widget ──────────────────────────────────────────────
function MemberListWidget({ membership }) {
  const [search, setSearch] = useState("")
  const [filterTier, setFilterTier] = useState("Semua")
  const allCustomers = getAllCustomers()
  const members = allCustomers.filter(c => c.membershipStatus === "active")

  const tierColors = { Bronze: "#F97316", Silver: "#94A3B8", Gold: "#FBBF24", Platinum: "#A855F7" }
  const tierIcons = { Bronze: <Award size={12} />, Silver: <Gift size={12} />, Gold: <Crown size={12} />, Platinum: <Sparkles size={12} /> }
  const tiers = ["Semua", "Platinum", "Gold", "Silver", "Bronze"]

  const filtered = members.filter(c => {
    const matchSearch = !search || c.name?.toLowerCase().includes(search.toLowerCase()) || c.email?.toLowerCase().includes(search.toLowerCase())
    const matchTier = filterTier === "Semua" || calcTier(c.points || 0) === filterTier
    return matchSearch && matchTier
  }).sort((a, b) => (b.points || 0) - (a.points || 0))

  return (
    <div
      className="rounded-2xl p-6 animate-fadeInUp"
      style={{
        background: "linear-gradient(145deg, rgba(10, 26, 18, 0.9), rgba(4, 16, 11, 0.95))",
        border: "1px solid rgba(52,211,153,0.1)",
        animationDelay: "900ms",
        animationFillMode: "both",
      }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <Users size={16} className="text-emerald-400" />
          </div>
          <p className="text-white text-sm font-bold">Daftar Member Aktif</p>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/20">
            {members.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Cari member..."
            className="text-xs bg-white/5 border border-white/10 rounded-xl px-3.5 py-2 text-white placeholder-gray-500 outline-none focus:border-emerald-400/40 transition-all duration-300 w-44"
          />
          <Link
            to="/membership"
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 group transition-all duration-300 font-medium"
          >
            Kelola <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
      </div>

      {/* Tier filter */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {tiers.map(t => (
          <button
            key={t}
            onClick={() => setFilterTier(t)}
            className={`px-3.5 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all duration-300 border ${
              filterTier === t
                ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/5"
                : "bg-white/5 text-gray-400 border-white/5 hover:text-white hover:bg-white/10"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Member table */}
      {filtered.length === 0 ? (
        <div className="text-center py-10 text-gray-500 text-sm">
          {members.length === 0 ? "Belum ada member aktif." : "Tidak ada member yang cocok."}
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-gray-500 uppercase tracking-wider border-b border-white/5">
                <th className="text-left pb-3 font-semibold">Member</th>
                <th className="text-left pb-3 font-semibold">Tier</th>
                <th className="text-right pb-3 font-semibold">Poin</th>
                <th className="text-right pb-3 font-semibold">Servis</th>
                <th className="text-right pb-3 font-semibold">Total Belanja</th>
                <th className="text-right pb-3 font-semibold">Bergabung</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filtered.slice(0, 8).map((c, i) => {
                const tier = calcTier(c.points || 0)
                const cfg = TIER_CONFIG[tier]
                return (
                  <tr key={c.id || i} className="hover:bg-white/5 transition-colors group">
                    <td className="py-3 pr-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold flex-shrink-0 transition-transform group-hover:scale-110"
                          style={{ background: `${cfg?.color}25`, color: cfg?.color }}
                        >
                          {c.name?.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="text-white font-semibold truncate max-w-[140px]">{c.name}</p>
                          <p className="text-gray-500 truncate max-w-[140px] text-[10px]">{c.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-3">
                      <span
                        className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border"
                        style={{ background: `${cfg?.color}15`, color: cfg?.color, borderColor: `${cfg?.color}30` }}
                      >
                        {tierIcons[tier]} {tier}
                      </span>
                    </td>
                    <td className="py-3 text-right font-bold" style={{ color: cfg?.color }}>
                      {(c.points || 0).toLocaleString("id-ID")}
                    </td>
                    <td className="py-3 text-right text-gray-400">{c.totalOrders || 0}x</td>
                    <td className="py-3 text-right text-gray-300">
                      Rp{((c.totalSpent || 0) / 1000000).toFixed(1)}jt
                    </td>
                    <td className="py-3 text-right text-gray-500 text-[10px]">
                      {c.memberSince ? c.memberSince.slice(0, 7) : "-"}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          {filtered.length > 8 && (
            <div className="text-center mt-4">
              <Link
                to="/membership"
                className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors font-medium"
              >
                + {filtered.length - 8} member lainnya → Lihat semua
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────
export default function Dashboard() {
  const { orders, inventory, mechanics, vehicles, bookingStats } = useStorageData();
  const membership = useMembershipStats();

  const loggedInUser = useMemo(() => {
    try {
      const raw = sessionStorage.getItem('eg_user')
      return raw ? JSON.parse(raw) : null
    } catch { return null }
  }, [])

  const greeting = useMemo(() => {
    const hour = new Date().getHours()
    if (hour < 11) return 'Selamat Pagi'
    if (hour < 15) return 'Selamat Siang'
    if (hour < 18) return 'Selamat Sore'
    return 'Selamat Malam'
  }, [])

  const [timeRange, setTimeRange] = useState("bulanini");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const revenueChart = useMemo(
    () => buildRevenueChart(orders, timeRange),
    [orders, timeRange]
  );

  const totalRevenue = useMemo(() => {
    return revenueChart.reduce((sum, day) => sum + day.revenue, 0);
  }, [revenueChart]);

  const sparkAll = useMemo(() => buildMiniChart(orders, null), [orders]);
  const sparkWip = useMemo(() => buildMiniChart(orders, "Sedang Dikerjakan"), [orders]);
  const sparkDone = useMemo(() => buildMiniChart(orders, "Selesai"), [orders]);

  const totalOrders = orders.length;
  const orderSelesai = orders.filter((o) => o.status === "Selesai").length;
  const orderProses = orders.filter((o) => o.status === "Sedang Dikerjakan").length;
  const orderMenunggu = orders.filter((o) => o.status === "Menunggu").length;
  const orderCancelled = orders.filter((o) => o.status === "Dibatalkan").length;
  const mechAvail = mechanics.filter((m) => m.status === "Tersedia").length;
  const outOfStock = inventory.filter((i) => i.stock === 0).length;
  const reorderSoon = inventory.filter((i) => i.stock > 0 && i.stock <= (i.minStock || 0)).length;
  const goodStock = inventory.filter((i) => i.stock > (i.minStock || 0)).length;
  const totalInv = inventory.length;

  const now = new Date();
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);
  const twoWeekAgo = new Date(now);
  twoWeekAgo.setDate(now.getDate() - 14);

  const thisWeekRev = orders
    .filter((o) => o.status === "Selesai" && o.date >= weekAgo.toISOString().slice(0, 10))
    .reduce((s, o) => s + Number(o.total), 0);
  const lastWeekRev = orders
    .filter(
      (o) =>
        o.status === "Selesai" &&
        o.date >= twoWeekAgo.toISOString().slice(0, 10) &&
        o.date < weekAgo.toISOString().slice(0, 10)
    )
    .reduce((s, o) => s + Number(o.total), 0);
  const revChange = lastWeekRev > 0 ? Math.round(((thisWeekRev - lastWeekRev) / lastWeekRev) * 100) : null;

  const jobDonutData = [
    { name: "Selesai", value: orderSelesai || 1, color: "#34D399" },
    { name: "In Progress", value: orderProses || 0, color: "#FBBF24" },
    { name: "Menunggu", value: orderMenunggu || 0, color: "#818CF8" },
    { name: "Dibatalkan", value: orderCancelled || 0, color: "#4B5563" },
  ].filter((d) => d.value > 0);

  const tierColors = { Gold: "#F59E0B", Silver: "#94A3B8", Bronze: "#CD7F32", Platinum: "#A78BFA" };
  const memberDonutData = Object.entries(membership.byTier)
    .map(([tier, count]) => ({ name: tier, value: count || 0, color: tierColors[tier] }))
    .filter((d) => d.value > 0);

  const invDonutData = [
    { name: "Low Stock", value: outOfStock, color: "#EF4444" },
    { name: "Reorder Soon", value: reorderSoon, color: "#F59E0B" },
    { name: "Good", value: goodStock || 1, color: "#34D399" },
  ].filter((d) => d.value > 0);

  const jadwal = orders
    .filter((o) => o.status === "Menunggu" || o.status === "Sedang Dikerjakan")
    .slice(0, 6);

  const sparkMech = useMemo(
    () => Array.from({ length: 7 }, (_, i) => ({ v: mechAvail > 0 ? mechAvail - (i % 2) : 0 })),
    [mechAvail]
  );

  const rangeLabels = {
    hariini: "Hari Ini",
    "7hari": "7 Hari",
    "30hari": "30 Hari",
    bulanini: "Bulan Ini",
  };

  return (
    <div className="page-animate space-y-6" style={{ background: "#060f0a", minHeight: "100vh", paddingBottom: "2rem" }}>
      {/* ── GREETING ── */}
      {loggedInUser && (
        <div
          className="rounded-2xl px-7 py-5 flex items-center justify-between animate-fadeInUp"
          style={{
            background: "linear-gradient(135deg, rgba(52,211,153,0.08) 0%, rgba(4,28,21,0.6) 100%)",
            border: "1px solid rgba(52,211,153,0.12)",
            backdropFilter: "blur(4px)",
          }}
        >
          <div>
            <p className="text-gray-400 text-sm font-medium">{greeting},</p>
            <p className="text-white text-2xl font-bold mt-0.5 tracking-tight">
              {loggedInUser.name}
              <span className="ml-3 text-sm font-normal text-emerald-400 align-middle">
                ({loggedInUser.email})
              </span>
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <span
              className="px-4 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
              style={{
                background: "rgba(52,211,153,0.15)",
                color: "#6EE7B7",
                border: "1px solid rgba(52,211,153,0.25)",
              }}
            >
              {loggedInUser.role}
            </span>
            <p className="text-gray-500 text-xs">
              {new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        </div>
      )}

      {/* ── TOP STAT CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <TopStatCard
          icon={Wrench}
          iconBg="rgba(52,211,153,0.25)"
          label="Total Orders"
          value={totalOrders}
          change={`+${Math.max(0, Math.round(totalOrders * 0.12))}% vs yesterday`}
          positive
          sparkData={sparkAll}
          sparkColor="#34D399"
          delay={0}
        />
        <TopStatCard
          icon={DollarSign}
          iconBg="rgba(96,165,250,0.25)"
          label="Revenue (7d)"
          value={thisWeekRev}
          format={fmt}
          change={revChange !== null ? `${revChange > 0 ? "+" : ""}${revChange}% vs last week` : undefined}
          positive={revChange === null || revChange >= 0}
          sparkData={sparkDone}
          sparkColor="#60A5FA"
          delay={100}
        />
        <TopStatCard
          icon={Activity}
          iconBg="rgba(251,191,36,0.25)"
          label="Active Jobs"
          value={orderProses}
          change={`+7% in progress`}
          positive
          sparkData={sparkWip}
          sparkColor="#FBBF24"
          delay={200}
        />
        <TopStatCard
          icon={HardHat}
          iconBg="rgba(167,139,250,0.25)"
          label="Mechanics Available"
          value={mechAvail}
          change={mechanics.length > 0 ? `${Math.round((mechAvail / mechanics.length) * 100)}% available` : undefined}
          positive={mechAvail > 0}
          sparkData={sparkMech}
          sparkColor="#A78BFA"
          delay={300}
        />
      </div>

      {/* ── REVENUE CHART + JOB STATUS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Revenue Overview */}
        <div
          className="lg:col-span-2 rounded-2xl p-6 animate-fadeInUp"
          style={{
            background: "linear-gradient(145deg, rgba(10, 26, 18, 0.9), rgba(4, 16, 11, 0.95))",
            border: "1px solid rgba(52,211,153,0.1)",
            animationDelay: "200ms",
            animationFillMode: "both",
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <div>
              <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Revenue Overview</p>
              <p className="text-white text-3xl font-black mt-1 tracking-tight">
                <AnimatedNumber value={totalRevenue} format={fmt} duration={1200} />
              </p>
              {revChange !== null && (
                <span
                  className={`inline-flex items-center gap-1.5 text-xs font-semibold mt-1 ${
                    revChange >= 0 ? "text-emerald-400" : "text-red-400"
                  }`}
                >
                  <TrendingUp size={12} className="animate-bounce-soft" />
                  {revChange > 0 ? "+" : ""}{revChange}% vs last week
                </span>
              )}
            </div>

            {/* ── DROPDOWN FILTER ── */}
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="text-xs px-4 py-2 rounded-xl font-medium transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/10 flex items-center gap-1.5"
                style={{
                  background: "rgba(52,211,153,0.1)",
                  color: "#34D399",
                  border: "1px solid rgba(52,211,153,0.15)",
                }}
              >
                {rangeLabels[timeRange]} <ChevronRight size={14} className={`transition-transform duration-300 ${isDropdownOpen ? "rotate-90" : ""}`} />
              </button>
              {isDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-40 rounded-xl shadow-2xl z-10 animate-fadeInUp"
                  style={{
                    background: "rgba(10, 26, 18, 0.98)",
                    backdropFilter: "blur(12px)",
                    border: "1px solid rgba(52,211,153,0.15)",
                  }}
                >
                  {Object.entries(rangeLabels).map(([key, label]) => (
                    <button
                      key={key}
                      onClick={() => {
                        setTimeRange(key);
                        setIsDropdownOpen(false);
                      }}
                      className={`block w-full text-left px-4 py-2.5 text-xs transition-all duration-200 hover:bg-emerald-500/10 ${
                        timeRange === key ? "text-emerald-400 font-semibold" : "text-gray-400"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {orders.length === 0 ? (
            <div className="h-56 flex items-center justify-center text-gray-500 text-sm">Belum ada data order</div>
          ) : (
            <div style={{ width: "100%", height: 230, minHeight: 230 }}>
              <ResponsiveContainer width="100%" height={230}>
                <AreaChart data={revenueChart} margin={{ top: 10, right: 5, left: 5, bottom: 0 }}>
                  <defs>
                    <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#34D399" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#34D399" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#4b5563", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={Math.max(0, Math.floor(revenueChart.length / 6))}
                  />
                  <YAxis
                    tick={{ fill: "#4b5563", fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => (v === 0 ? "0" : `${(v / 1000000).toFixed(0)}M`)}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#34D399"
                    strokeWidth={3}
                    fill="url(#revGrad)"
                    dot={false}
                    activeDot={{ r: 6, fill: "#34D399", stroke: "#060f0a", strokeWidth: 3 }}
                    isAnimationActive={true}
                    animationDuration={1500}
                    animationEasing="ease-out"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Job Status Overview */}
        <div
          className="rounded-2xl p-6 animate-fadeInUp"
          style={{
            background: "linear-gradient(145deg, rgba(10, 26, 18, 0.9), rgba(4, 16, 11, 0.95))",
            border: "1px solid rgba(52,211,153,0.1)",
            animationDelay: "300ms",
            animationFillMode: "both",
          }}
        >
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider mb-4">Job Status</p>
          <div className="flex justify-center mb-5">
            <DonutChart data={jobDonutData} total={totalOrders} centerSub="Total Jobs" size={150} />
          </div>
          <div className="space-y-3">
            {[
              { label: "Completed", value: orderSelesai, color: "#34D399", pct: totalOrders > 0 ? Math.round((orderSelesai / totalOrders) * 100) : 0 },
              { label: "In Progress", value: orderProses, color: "#FBBF24", pct: totalOrders > 0 ? Math.round((orderProses / totalOrders) * 100) : 0 },
              { label: "Waiting", value: orderMenunggu, color: "#818CF8", pct: totalOrders > 0 ? Math.round((orderMenunggu / totalOrders) * 100) : 0 },
              { label: "Cancelled", value: orderCancelled, color: "#4B5563", pct: totalOrders > 0 ? Math.round((orderCancelled / totalOrders) * 100) : 0 },
            ].map((item, idx) => (
              <div
                key={item.label}
                className="flex items-center justify-between animate-fadeInUp"
                style={{ animationDelay: `${400 + idx * 80}ms`, animationFillMode: "both" }}
              >
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: item.color }} />
                  <span className="text-gray-300 text-xs font-medium">{item.label}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white text-xs font-bold">
                    <AnimatedNumber value={item.value} format={(v) => Math.round(v)} duration={600} />
                  </span>
                  <span className="text-gray-500 text-[10px]">({item.pct}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── TODAY'S JOB QUEUE ── */}
      <div
        className="rounded-2xl p-6 animate-fadeInUp"
        style={{
          background: "linear-gradient(145deg, rgba(10, 26, 18, 0.9), rgba(4, 16, 11, 0.95))",
          border: "1px solid rgba(52,211,153,0.1)",
          animationDelay: "400ms",
          animationFillMode: "both",
        }}
      >
        <div className="flex items-center justify-between mb-5">
          <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Today's Job Queue</p>
          <Link
            to="/orders"
            className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 group transition-all duration-300 font-medium"
          >
            View All <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        </div>
        {jadwal.length === 0 ? (
          <div className="py-10 text-center text-gray-500 text-sm">Tidak ada antrian aktif</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {jadwal.map((o, i) => {
              const hue = stringToHue(o.customer);
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/5 animate-fadeInUp"
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.06)",
                    animationDelay: `${500 + i * 80}ms`,
                    animationFillMode: "both",
                  }}
                >
                  <div
                    className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-sm transition-transform duration-300 group-hover:rotate-12"
                    style={{ background: `hsla(${hue},60%,15%,0.8)`, color: `hsl(${hue},70%,60%)` }}
                  >
                    <Car size={18} style={{ color: `hsl(${hue},70%,60%)` }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-white text-sm font-semibold truncate">{o.customer}</p>
                    <p className="text-gray-400 text-xs truncate">{o.service}</p>
                    {o.id && <p className="text-gray-600 text-[10px] font-mono">#{o.id}</p>}
                  </div>
                  <StatusBadge status={o.status} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── MEMBERSHIP TIER + INVENTORY STATUS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Membership Tier */}
        <div
          className="rounded-2xl p-6 animate-fadeInUp"
          style={{
            background: "linear-gradient(145deg, rgba(10, 26, 18, 0.9), rgba(4, 16, 11, 0.95))",
            border: "1px solid rgba(52,211,153,0.1)",
            animationDelay: "500ms",
            animationFillMode: "both",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Membership Tier</p>
            <Link
              to="/membership"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 group transition-all duration-300 font-medium"
            >
              Detail <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
          <div className="flex items-center gap-8">
            <DonutChart
              data={memberDonutData.length > 0 ? memberDonutData : [{ name: "empty", value: 1, color: "#1f2937" }]}
              total={membership.total}
              centerSub="Members"
              size={140}
            />
            <div className="flex-1 space-y-3">
              {Object.entries(membership.byTier).map(([tier, count], idx) => {
                const pct = membership.totalActive > 0 ? Math.round((count / membership.totalActive) * 100) : 0;
                const cfg = TIER_CONFIG[tier];
                return (
                  <div
                    key={tier}
                    className="animate-fadeInUp"
                    style={{ animationDelay: `${600 + idx * 80}ms`, animationFillMode: "both" }}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{cfg?.icon}</span>
                        <span className="text-xs font-bold" style={{ color: tierColors[tier] }}>
                          {tier}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white text-xs font-bold">
                          <AnimatedNumber value={count} format={(v) => Math.round(v)} duration={600} />
                        </span>
                        <span className="text-gray-500 text-[10px]">({pct}%)</span>
                      </div>
                    </div>
                    <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-1000 ease-out"
                        style={{ width: `${pct}%`, background: tierColors[tier] }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Inventory Status */}
        <div
          className="rounded-2xl p-6 animate-fadeInUp"
          style={{
            background: "linear-gradient(145deg, rgba(10, 26, 18, 0.9), rgba(4, 16, 11, 0.95))",
            border: "1px solid rgba(52,211,153,0.1)",
            animationDelay: "600ms",
            animationFillMode: "both",
          }}
        >
          <div className="flex items-center justify-between mb-5">
            <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">Inventory Status</p>
            <Link
              to="/inventory"
              className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 group transition-all duration-300 font-medium"
            >
              Detail <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
            </Link>
          </div>
          <div className="flex items-center gap-8">
            <DonutChart
              data={invDonutData.length > 0 ? invDonutData : [{ name: "empty", value: 1, color: "#1f2937" }]}
              total={totalInv}
              centerSub="Total Items"
              size={140}
            />
            <div className="flex-1 space-y-3">
              {[
                { label: "Low Stock", value: outOfStock, color: "#EF4444", pct: totalInv > 0 ? Math.round((outOfStock / totalInv) * 100) : 0 },
                { label: "Reorder Soon", value: reorderSoon, color: "#F59E0B", pct: totalInv > 0 ? Math.round((reorderSoon / totalInv) * 100) : 0 },
                { label: "Good", value: goodStock, color: "#34D399", pct: totalInv > 0 ? Math.round((goodStock / totalInv) * 100) : 0 },
              ].map((item, idx) => (
                <div
                  key={item.label}
                  className="animate-fadeInUp"
                  style={{ animationDelay: `${700 + idx * 80}ms`, animationFillMode: "both" }}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full" style={{ background: item.color }} />
                      <span className="text-xs text-gray-300 font-medium">{item.label}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-white text-xs font-bold">
                        <AnimatedNumber value={item.value} format={(v) => Math.round(v)} duration={600} />
                      </span>
                      <span className="text-gray-500 text-[10px]">({item.pct}%)</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                    <div
                      className="h-full rounded-full transition-all duration-1000 ease-out"
                      style={{ width: `${item.pct}%`, background: item.color }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── CRITICAL ALERTS + QUICK ACTIONS ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Critical Alerts */}
        <div
          className="rounded-2xl p-6 animate-fadeInUp"
          style={{
            background: "linear-gradient(145deg, rgba(10, 26, 18, 0.9), rgba(4, 16, 11, 0.95))",
            border: "1px solid rgba(52,211,153,0.1)",
            animationDelay: "700ms",
            animationFillMode: "both",
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 rounded-xl bg-red-500/15 flex items-center justify-center">
              <AlertTriangle size={16} className="text-red-400 animate-pulse" />
            </div>
            <p className="text-white text-sm font-bold">Critical Alerts</p>
          </div>
          <div className="space-y-3">
            {outOfStock > 0 && (
              <Link
                to="/inventory"
                className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-red-500/5 animate-slideInLeft"
                style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.15)" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-red-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Package size={14} className="text-red-400" />
                  </div>
                  <div>
                    <p className="text-red-400 text-xs font-bold">Low Stock</p>
                    <p className="text-gray-400 text-xs">{outOfStock} items are running low</p>
                  </div>
                </div>
                <span className="text-red-400 text-xs flex items-center gap-1 group font-medium">
                  View <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
            )}
            {orderProses > 0 && (
              <Link
                to="/orders"
                className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-yellow-500/5 animate-slideInLeft"
                style={{ background: "rgba(251,191,36,0.06)", border: "1px solid rgba(251,191,36,0.15)", animationDelay: "100ms" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-yellow-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Clock size={14} className="text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-yellow-400 text-xs font-bold">Delayed Jobs</p>
                    <p className="text-gray-400 text-xs">{orderProses} jobs are in progress</p>
                  </div>
                </div>
                <span className="text-yellow-400 text-xs flex items-center gap-1 group font-medium">
                  View <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
            )}
            {orderMenunggu > 0 && (
              <Link
                to="/orders"
                className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/5 animate-slideInLeft"
                style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.15)", animationDelay: "200ms" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Calendar size={14} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-blue-400 text-xs font-bold">Upcoming Service</p>
                    <p className="text-gray-400 text-xs">{orderMenunggu} vehicles need service</p>
                  </div>
                </div>
                <span className="text-blue-400 text-xs flex items-center gap-1 group font-medium">
                  View <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
            )}
            {(bookingStats.pendingConfirmation || 0) > 0 && (
              <Link
                to="/bookings"
                className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/5 animate-slideInLeft"
                style={{ background: "rgba(96,165,250,0.06)", border: "1px solid rgba(96,165,250,0.2)", animationDelay: "300ms" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0 animate-pulse">
                    <Calendar size={14} className="text-blue-400" />
                  </div>
                  <div>
                    <p className="text-blue-400 text-xs font-bold">Booking Menunggu Konfirmasi</p>
                    <p className="text-gray-400 text-xs">{bookingStats.pendingConfirmation} booking baru</p>
                  </div>
                </div>
                <span className="text-blue-400 text-xs flex items-center gap-1 group font-medium">
                  Kelola <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
            )}
            {(bookingStats.today || 0) > 0 && (
              <Link
                to="/bookings"
                className="flex items-center justify-between p-4 rounded-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-emerald-500/5 animate-slideInLeft"
                style={{ background: "rgba(52,211,153,0.06)", border: "1px solid rgba(52,211,153,0.15)", animationDelay: "350ms" }}
              >
                <div className="flex items-center gap-3">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                    <Calendar size={14} className="text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-emerald-400 text-xs font-bold">Jadwal Hari Ini</p>
                    <p className="text-gray-400 text-xs">{bookingStats.today} booking dijadwalkan</p>
                  </div>
                </div>
                <span className="text-emerald-400 text-xs flex items-center gap-1 group font-medium">
                  Lihat <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </Link>
            )}
            {outOfStock === 0 && orderProses === 0 && orderMenunggu === 0 && bookingStats.needsAction === 0 && (
              <div className="py-8 text-center text-gray-500 text-sm flex flex-col items-center gap-3 animate-fadeIn">
                <CheckCircle2 size={32} className="text-emerald-500/40 animate-pulse" />
                Semua dalam kondisi baik
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div
          className="rounded-2xl p-6 animate-fadeInUp"
          style={{
            background: "linear-gradient(145deg, rgba(10, 26, 18, 0.9), rgba(4, 16, 11, 0.95))",
            border: "1px solid rgba(52,211,153,0.1)",
            animationDelay: "800ms",
            animationFillMode: "both",
          }}
        >
          <div className="flex items-center gap-3 mb-5">
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Zap size={16} className="text-emerald-400 animate-pulse" />
            </div>
            <p className="text-white text-sm font-bold">Quick Actions</p>
          </div>
          <div className="grid grid-cols-5 gap-3">
            {[
              { icon: Plus, label: "New Order", to: "/orders", color: "#34D399", bg: "rgba(52,211,153,0.15)" },
              { icon: Users, label: "Add Customer", to: "/customers", color: "#60A5FA", bg: "rgba(96,165,250,0.15)" },
              { icon: Car, label: "Add Vehicle", to: "/vehicles", color: "#818CF8", bg: "rgba(129,140,248,0.15)" },
              { icon: Package, label: "Inventory", to: "/inventory", color: "#F59E0B", bg: "rgba(245,158,11,0.15)" },
              { icon: BarChart3, label: "Reports", to: "/reports", color: "#34D399", bg: "rgba(52,211,153,0.15)" },
            ].map(({ icon: Icon, label, to, color, bg }, idx) => (
              <Link
                key={label}
                to={to}
                className="flex flex-col items-center gap-2.5 p-4 rounded-xl text-center transition-all duration-300 hover:scale-110 hover:shadow-xl hover:shadow-emerald-500/10 group animate-fadeInUp"
                style={{
                  background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  animationDelay: `${900 + idx * 80}ms`,
                  animationFillMode: "both",
                }}
              >
                <div
                  className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110"
                  style={{ background: bg }}
                >
                  <Icon size={20} style={{ color }} className="transition-transform duration-300 group-hover:scale-110" />
                </div>
                <span className="text-gray-300 text-[10px] font-medium leading-tight group-hover:text-white transition-colors duration-300">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* ── DAFTAR MEMBER AKTIF ── */}
      <MemberListWidget membership={membership} />

      {/* Floating CRM Menu */}
      <FloatingCRMMenu />

      {/* ─── GLOBAL ANIMATION STYLES ─── */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(40px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes slideInLeft {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes pulse-ring {
          0% { box-shadow: 0 0 0 0 rgba(52,211,153,0.4); }
          70% { box-shadow: 0 0 0 14px rgba(52,211,153,0); }
          100% { box-shadow: 0 0 0 0 rgba(52,211,153,0); }
        }
        @keyframes bounce-soft {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-5px); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-fadeInUp {
          animation: fadeInUp 0.7s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease both;
        }
        .animate-slideUp {
          animation: slideUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .animate-slideInLeft {
          animation: slideInLeft 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        .animate-pulse-ring {
          animation: pulse-ring 2s ease-out infinite;
        }
        .animate-bounce-soft {
          animation: bounce-soft 1.2s ease-in-out infinite;
        }
        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }
        .page-animate > * {
          will-change: transform, opacity;
        }
      `}</style>
    </div>
  );
}