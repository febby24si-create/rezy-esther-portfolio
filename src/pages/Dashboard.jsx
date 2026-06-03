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
  Timer,
  AlertTriangle,
  HardHat,
  MessageCircle,
  Bot,
  X,
  Send,
  TrendingUp,
  TrendingDown,
  Gauge,
  Layers,
  Zap,
  MessageSquare,
  Phone,
  Sparkles,
  Activity,
  ArrowUpRight,
} from "lucide-react";
import carHero from "../assets/mobil.png";

const fmt = (n) => "Rp " + Number(n).toLocaleString("id-ID");
const fmtShort = (n) =>
  n >= 1000000 ? `Rp ${(n / 1000000).toFixed(1)}jt` : fmt(n);

// ─── Ambil & proses data dari localStorage ───────────────────────────
function useStorageData() {
  const [orders, setOrders] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [vehicles, setVehicles] = useState([]);

  const load = () => {
    try {
      const o = localStorage.getItem("garage_orders");
      if (o) setOrders(JSON.parse(o));
      const i = localStorage.getItem("garage_vehicles");
      if (i) setVehicles(JSON.parse(i));
      const m = localStorage.getItem("garage_mechanics");
      if (m) setMechanics(JSON.parse(m));
      const inv = localStorage.getItem("garage_inventory");
      if (inv) setInventory(JSON.parse(inv));
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

  return { orders, inventory, mechanics, vehicles };
}

// ─── Build chart data 7 hari terakhir dari orders ────────────────────
function buildRevenueChart(orders) {
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d.toISOString().slice(0, 10);
  });
  return days.map((date) => {
    const dayOrders = orders.filter(
      (o) => o.date === date && o.status === "Selesai",
    );
    const revenue = dayOrders.reduce((s, o) => s + Number(o.total), 0);
    const d = new Date(date + "T00:00:00");
    const label = `${d.getDate()}/${d.getMonth() + 1}`;
    return { date: label, revenue, count: dayOrders.length };
  });
}

// ─── Komponen ─────────────────────────────────────────────────────────
const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl px-3 py-2.5"
      style={{ background: "#06281F", border: "1px solid rgba(34,197,94,0.2)" }}
    >
      <p className="text-xs text-gray-400 mb-1">{label}</p>
      <p className="text-green-400 font-bold text-sm">
        {fmtShort(payload[0].value)}
      </p>
      <p className="text-gray-500 text-xs">{payload[0].payload.count} order</p>
    </div>
  );
};

function StatCard({ icon: Icon, label, value, change, positive, color, sub }) {
  return (
    <div className="stat-card">
      <div className="flex items-start justify-between mb-3">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{
            background: `rgba(${color},0.15)`,
            border: `1px solid rgba(${color},0.2)`,
          }}
        >
          <Icon size={20} style={{ color: `rgb(${color})` }} />
        </div>
        {change !== undefined && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${positive ? "text-green-400" : "text-red-400"}`}
          >
            {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
            {change}
          </span>
        )}
      </div>
      <p className="text-gray-500 text-xs mb-1">{label}</p>
      <p className="text-white text-2xl font-black">{value}</p>
      {sub && <p className="text-gray-600 text-xs mt-1">{sub}</p>}
    </div>
  );
}

const STATUS_STYLE = {
  Selesai: {
    bg: "rgba(34,197,94,0.1)",
    color: "#22C55E",
    border: "rgba(34,197,94,0.2)",
  },
  "Sedang Dikerjakan": {
    bg: "rgba(251,191,36,0.1)",
    color: "#FBBF24",
    border: "rgba(251,191,36,0.2)",
  },
  Menunggu: {
    bg: "rgba(148,163,184,0.1)",
    color: "#94A3B8",
    border: "rgba(148,163,184,0.2)",
  },
};

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE["Menunggu"];
  return (
    <span
      className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-medium"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full"
        style={{ background: s.color }}
      />
      {status}
    </span>
  );
}

function getInitials(name = "") {
  const p = name.trim().split(/\s+/);
  return p.length === 1 ? p[0][0] : p[0][0] + p[p.length - 1][0];
}
function stringToHue(str = "") {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = str.charCodeAt(i) + ((h << 5) - h);
  return Math.abs(h) % 360;
}

// ─── KOMPONEN CHATBOT (modal) ─────────────────────────────────────────
function ChatbotModal({ isOpen, onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "bot",
      text: "Halo! Saya AI asisten Esther Garage. Ada yang bisa saya bantu? 😊",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getBotReply = (userMessage) => {
    const lowerMsg = userMessage.toLowerCase();
    if (lowerMsg.includes("harga") || lowerMsg.includes("biaya")) {
      return "Untuk informasi harga servis, silakan cek menu Layanan atau hubungi admin via WhatsApp. Biaya servis standar mulai Rp 150.000.";
    } else if (lowerMsg.includes("jadwal") || lowerMsg.includes("booking")) {
      return "Anda bisa booking servis melalui menu Order Baru. Pastikan memilih tanggal dan layanan yang diinginkan.";
    } else if (lowerMsg.includes("stok") || lowerMsg.includes("spare part")) {
      return "Stok part bisa dilihat di menu Inventaris. Jika part habis, admin akan menginfokan penggantiannya.";
    } else if (
      lowerMsg.includes("terima kasih") ||
      lowerMsg.includes("thanks")
    ) {
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

  const handleKeyPress = (e) => {
    if (e.key === "Enter") handleSend();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div
        className="glass-card w-full max-w-md rounded-2xl flex flex-col"
        style={{
          height: "500px",
          background: "#041c15",
          border: "1px solid rgba(34,197,94,0.2)",
        }}
      >
        <div className="flex items-center justify-between p-4 border-b border-green-500/10">
          <div className="flex items-center gap-2">
            <Bot size={20} className="text-green-400" />
            <h3 className="text-white font-bold">AI Assistant</h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "bg-green-600/30 text-white rounded-br-none"
                    : "bg-[#0a2c22] text-gray-200 rounded-bl-none"
                }`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#0a2c22] rounded-2xl px-3 py-2 text-sm text-gray-400">
                <span className="animate-pulse">...</span>
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>
        <div className="p-4 border-t border-green-500/10 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Tanyakan sesuatu..."
            className="flex-1 bg-[#0a2c22] border border-green-500/20 rounded-xl px-3 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-green-500/50"
          />
          <button
            onClick={handleSend}
            className="w-9 h-9 rounded-xl bg-green-600/20 hover:bg-green-600/40 flex items-center justify-center text-green-400"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── FLOATING ACTION BUTTON + MENU ────────────────────────────────────
function FloatingCRMMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);

  const handleWhatsApp = () => {
    const phoneNumber = "6281234567890"; // Ganti dengan nomor Anda
    const message = "Halo Esther Garage, saya ingin menanyakan...";
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setIsOpen(false);
  };

  const handleChatbot = () => {
    setShowChatbot(true);
    setIsOpen(false);
  };

  return (
    <>
      {/* Tombol mengambang utama */}
      <div className="fixed bottom-6 right-6 z-40">
        {isOpen && (
          <div className="absolute bottom-16 right-0 mb-2 space-y-2">
            <button
              onClick={handleChatbot}
              className="flex items-center gap-2 bg-[#0a2c22] hover:bg-[#0e3a2e] text-green-400 rounded-full px-4 py-2 shadow-lg transition-all w-36 border border-green-500/30"
            >
              <Bot size={18} />
              <span className="text-sm font-medium">AI Chatbot</span>
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex items-center gap-2 bg-[#0a2c22] hover:bg-[#0e3a2e] text-green-400 rounded-full px-4 py-2 shadow-lg transition-all w-36 border border-green-500/30"
            >
              <MessageCircle size={18} />
              <span className="text-sm font-medium">WhatsApp</span>
            </button>
          </div>
        )}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-green-600 hover:bg-green-500 shadow-lg flex items-center justify-center text-white transition-all duration-200"
          style={{ boxShadow: "0 0 15px rgba(34,197,94,0.5)" }}
        >
          {isOpen ? <X size={24} /> : <MessageSquare size={24} />}
        </button>
      </div>

      {/* Modal Chatbot */}
      <ChatbotModal
        isOpen={showChatbot}
        onClose={() => setShowChatbot(false)}
      />
    </>
  );
}

// ─── MAIN DASHBOARD ───────────────────────────────────────────────────
export default function Dashboard() {
  const { orders, inventory, mechanics, vehicles } = useStorageData();

  const revenueChart = useMemo(() => buildRevenueChart(orders), [orders]);

  const totalOrders = orders.length;
  const orderSelesai = orders.filter((o) => o.status === "Selesai").length;
  const orderProses = orders.filter(
    (o) => o.status === "Sedang Dikerjakan",
  ).length;
  const orderMenunggu = orders.filter((o) => o.status === "Menunggu").length;
  const totalPendapatan = orders
    .filter((o) => o.status === "Selesai")
    .reduce((s, o) => s + Number(o.total), 0);
  const mechAvail = mechanics.filter((m) => m.status === "Tersedia").length;
  const lowStock = inventory.filter(
    (i) => i.stock > 0 && i.stock <= i.minStock,
  ).length;
  const outOfStock = inventory.filter((i) => i.stock === 0).length;

  const jadwal = orders
    .filter((o) => o.status === "Menunggu" || o.status === "Sedang Dikerjakan")
    .slice(0, 5);

  const recentOrders = [...orders]
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""))
    .slice(0, 5);

  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(today.getDate() - 7);
  const twoWeekAgo = new Date(today);
  twoWeekAgo.setDate(today.getDate() - 14);
  const thisWeekRev = orders
    .filter(
      (o) =>
        o.status === "Selesai" && o.date >= weekAgo.toISOString().slice(0, 10),
    )
    .reduce((s, o) => s + Number(o.total), 0);
  const lastWeekRev = orders
    .filter(
      (o) =>
        o.status === "Selesai" &&
        o.date >= twoWeekAgo.toISOString().slice(0, 10) &&
        o.date < weekAgo.toISOString().slice(0, 10),
    )
    .reduce((s, o) => s + Number(o.total), 0);
  const revChange =
    lastWeekRev > 0
      ? Math.round(((thisWeekRev - lastWeekRev) / lastWeekRev) * 100)
      : null;

  return (
    <div className="page-animate space-y-5">
      {/* Hero section */}
      <div
        className="relative overflow-hidden rounded-3xl"
        style={{
          height: 240,
          border: "1px solid rgba(34,197,94,0.15)",
          background: "#041c15",
        }}
      >
        <img
          src={carHero}
          alt="EstherGarage"
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(90deg, rgba(4,28,21,0.92) 0%, rgba(4,28,21,0.5) 50%, rgba(4,28,21,0.1) 100%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(circle at left center, rgba(34,197,94,0.12), transparent 55%)",
          }}
        />
        <div className="absolute left-8 top-1/2 -translate-y-1/2 z-10">
          <p className="text-gray-400 text-sm mb-1.5">
            Selamat datang kembali,
          </p>
          <h2 className="text-4xl font-black text-white mb-2.5">
            Esther Admin 👋
          </h2>
          <p className="text-gray-400 text-sm max-w-sm mb-4">
            Pantau semua aktivitas bengkel secara real-time.
          </p>
          <div className="flex items-center gap-2 flex-wrap">
            <div
              className="px-3.5 py-1.5 rounded-xl text-sm text-white"
              style={{
                background: "rgba(34,197,94,0.12)",
                border: "1px solid rgba(34,197,94,0.2)",
                backdropFilter: "blur(10px)",
              }}
            >
              🚗 {totalOrders} Total Order
            </div>
            <div
              className="px-3.5 py-1.5 rounded-xl text-sm text-white"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.08)",
                backdropFilter: "blur(10px)",
              }}
            >
              💰 {fmtShort(totalPendapatan)}
            </div>
            {lowStock + outOfStock > 0 && (
              <div
                className="px-3.5 py-1.5 rounded-xl text-sm text-yellow-400 flex items-center gap-1.5"
                style={{
                  background: "rgba(234,179,8,0.1)",
                  border: "1px solid rgba(234,179,8,0.2)",
                  backdropFilter: "blur(10px)",
                }}
              >
                <AlertTriangle size={14} /> {lowStock + outOfStock} stok perlu
                perhatian
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          icon={Wrench}
          label="Total Order"
          value={totalOrders}
          color="34,197,94"
          positive
          change={`${orderSelesai} selesai`}
        />
        <StatCard
          icon={CheckCircle2}
          label="Order Selesai"
          value={orderSelesai}
          color="34,197,94"
          positive
          sub={`${orderProses} sedang proses`}
        />
        <StatCard
          icon={Clock}
          label="Sedang Dikerjakan"
          value={orderProses}
          color="234,179,8"
          positive={false}
          sub={`${orderMenunggu} menunggu`}
        />
        <StatCard
          icon={DollarSign}
          label="Total Pendapatan"
          value={fmtShort(totalPendapatan)}
          color="96,165,250"
          positive={revChange === null || revChange >= 0}
          change={
            revChange !== null
              ? `${revChange > 0 ? "+" : ""}${revChange}% minggu ini`
              : undefined
          }
        />
      </div>

      {/* Alert inventory */}
      {(lowStock > 0 || outOfStock > 0) && (
        <Link
          to="/inventory"
          className="flex items-center justify-between p-3.5 rounded-xl transition-all hover:opacity-90"
          style={{
            background: "rgba(234,179,8,0.07)",
            border: "1px solid rgba(234,179,8,0.2)",
          }}
        >
          <div className="flex items-center gap-3 text-yellow-400 text-sm">
            <AlertTriangle size={18} className="flex-shrink-0" />
            <span>
              {outOfStock > 0 && <strong>{outOfStock} barang habis</strong>}
              {outOfStock > 0 && lowStock > 0 && " · "}
              {lowStock > 0 && <strong>{lowStock} barang menipis</strong>}
              {" — klik untuk restock"}
            </span>
          </div>
          <ChevronRight size={18} className="text-yellow-400 flex-shrink-0" />
        </Link>
      )}

      {/* Chart + Jadwal */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-white font-bold text-base">
                Pendapatan 7 Hari Terakhir
              </h3>
              <p className="text-xs text-gray-500 mt-0.5">
                Hanya order berstatus Selesai
              </p>
            </div>
            <div className="text-right">
              <p className="text-green-400 font-black text-lg">
                {fmtShort(thisWeekRev)}
              </p>
              <p className="text-xs text-gray-600">minggu ini</p>
            </div>
          </div>
          {orders.length === 0 ? (
            <div className="h-52 flex items-center justify-center text-gray-600 text-sm">
              Belum ada data order
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart
                data={revenueChart}
                margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22C55E" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#22C55E" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(34,197,94,0.07)"
                />
                <XAxis
                  dataKey="date"
                  tick={{ fill: "#6b7280", fontSize: 11 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tick={{ fill: "#6b7280", fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(v) =>
                    v === 0 ? "0" : `${(v / 1000000).toFixed(0)}jt`
                  }
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22C55E"
                  strokeWidth={2.5}
                  fill="url(#revGrad)"
                  dot={{ fill: "#22C55E", strokeWidth: 2, r: 3 }}
                  activeDot={{
                    r: 5,
                    fill: "#22C55E",
                    stroke: "#041C15",
                    strokeWidth: 2,
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        <div className="glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Antrian Aktif</h3>
            <span
              className="text-xs px-2 py-1 rounded-full font-bold"
              style={{ background: "rgba(34,197,94,0.12)", color: "#22C55E" }}
            >
              {jadwal.length} order
            </span>
          </div>
          {jadwal.length === 0 ? (
            <div className="h-32 flex items-center justify-center text-gray-600 text-sm">
              Tidak ada antrian aktif
            </div>
          ) : (
            <div className="space-y-2.5">
              {jadwal.map((o, i) => {
                const hue = stringToHue(o.customer);
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 p-2.5 rounded-xl transition-all hover:bg-green-500/5"
                    style={{
                      background: "rgba(11,59,46,0.3)",
                      border: "1px solid rgba(34,197,94,0.07)",
                    }}
                  >
                    <div
                      className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 font-bold text-xs"
                      style={{
                        background: `hsl(${hue},55%,18%)`,
                        color: `hsl(${hue},75%,60%)`,
                      }}
                    >
                      {getInitials(o.customer)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-xs font-semibold truncate">
                        {o.customer}
                      </p>
                      <p className="text-gray-500 text-xs truncate">
                        {o.service}
                      </p>
                    </div>
                    <StatusBadge status={o.status} />
                  </div>
                );
              })}
            </div>
          )}
          <Link
            to="/orders"
            className="flex items-center justify-center gap-1 mt-4 text-xs text-green-500 hover:text-green-400 transition-colors"
          >
            Lihat semua order <ChevronRight size={14} />
          </Link>
        </div>
      </div>

      {/* Order terbaru + Ringkasan + Aksi Cepat */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-bold text-base">Order Terbaru</h3>
            <Link
              to="/orders"
              className="text-xs text-green-500 hover:text-green-400 transition-colors flex items-center gap-0.5"
            >
              Lihat semua <ChevronRight size={13} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div className="py-8 text-center text-gray-600 text-sm">
              Belum ada order
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr
                    style={{ borderBottom: "1px solid rgba(34,197,94,0.08)" }}
                  >
                    {[
                      "No. Order",
                      "Pelanggan",
                      "Layanan",
                      "Total",
                      "Status",
                    ].map((h) => (
                      <th
                        key={h}
                        className="text-left py-2 pr-3 text-xs text-gray-600 font-semibold uppercase tracking-wider whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o, i) => (
                    <tr
                      key={i}
                      className="transition-colors hover:bg-green-500/5"
                      style={{ borderBottom: "1px solid rgba(34,197,94,0.05)" }}
                    >
                      <td className="py-2.5 pr-3 text-xs text-green-400 font-mono whitespace-nowrap">
                        {o.id}
                      </td>
                      <td className="py-2.5 pr-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0"
                            style={{
                              background: `hsl(${stringToHue(o.customer)},55%,18%)`,
                              color: `hsl(${stringToHue(o.customer)},75%,60%)`,
                            }}
                          >
                            {getInitials(o.customer)}
                          </div>
                          <span className="text-sm text-white font-medium whitespace-nowrap">
                            {o.customer}
                          </span>
                        </div>
                      </td>
                      <td className="py-2.5 pr-3 text-xs text-gray-400 whitespace-nowrap">
                        {o.service}
                      </td>
                      <td className="py-2.5 pr-3 text-sm text-white font-bold whitespace-nowrap">
                        {fmtShort(Number(o.total))}
                      </td>
                      <td className="py-2.5">
                        <StatusBadge status={o.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Ringkasan Bengkel + Aksi Cepat */}
        <div className="space-y-4">
          <div className="glass-card p-4">
            <h3 className="text-white font-bold text-sm mb-3">
              Ringkasan Bengkel
            </h3>
            <div className="space-y-2">
              {[
                {
                  icon: HardHat,
                  label: "Mekanik Tersedia",
                  value: `${mechAvail} / ${mechanics.length}`,
                  color: "#22C55E",
                },
                {
                  icon: Car,
                  label: "Kendaraan Terdaftar",
                  value: vehicles.length,
                  color: "#60A5FA",
                },
                {
                  icon: Timer,
                  label: "Menunggu Servis",
                  value: orderMenunggu,
                  color: "#FBBF24",
                },
                {
                  icon: Package,
                  label: "Stok Perlu Perhatian",
                  value: lowStock + outOfStock,
                  color: outOfStock > 0 ? "#EF4444" : "#FBBF24",
                },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center justify-between py-2 px-3 rounded-xl"
                  style={{
                    background: "rgba(11,59,46,0.3)",
                    border: "1px solid rgba(34,197,94,0.06)",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <s.icon size={14} style={{ color: s.color }} />
                    <span className="text-xs text-gray-400">{s.label}</span>
                  </div>
                  <span
                    className="text-sm font-bold"
                    style={{ color: s.color }}
                  >
                    {s.value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card p-4">
            <h3 className="text-white font-bold text-sm mb-3">Aksi Cepat</h3>
            <div className="grid grid-cols-3 gap-2">
              {[
                { icon: Plus, label: "Order Baru", to: "/orders" },
                { icon: Users, label: "Pelanggan", to: "/customers" },
                { icon: Car, label: "Kendaraan", to: "/vehicles" },
                { icon: Package, label: "Stok", to: "/inventory" },
                { icon: BarChart3, label: "Laporan", to: "/reports" },
                { icon: HardHat, label: "Jadwal", to: "/schedule" },
              ].map(({ icon: Icon, label, to }) => (
                <Link
                  key={label}
                  to={to}
                  className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl text-center transition-all hover:scale-105"
                  style={{
                    background: "rgba(11,59,46,0.4)",
                    border: "1px solid rgba(34,197,94,0.08)",
                  }}
                >
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center"
                    style={{ background: "rgba(34,197,94,0.1)" }}
                  >
                    <Icon className="text-green-400" size={16} />
                  </div>
                  <span className="text-xs text-gray-500 leading-tight">
                    {label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Floating CRM Menu */}
      <FloatingCRMMenu />
    </div>
  );
}