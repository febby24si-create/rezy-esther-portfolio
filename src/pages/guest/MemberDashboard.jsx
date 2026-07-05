// ============================================================
// MemberDashboard.jsx — /guest/member
// Halaman Member Dashboard — terintegrasi dengan data Admin
// ============================================================
import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import {
  useCustomerAuth,
  calcLoyaltyProgress,
  calcTier,
  TIER_CONFIG,
  TIER_BENEFITS,
  calcAchievements,
} from "../../context/CustomerAuthContext";
import ordersDataJson from "../../data/ordersData.json";
import { layanan } from "../../data/guestData";
import {
  MdDashboard,
  MdDirectionsCar,
  MdHistory,
  MdStars,
  MdCardGiftcard,
  MdPerson,
  MdNotifications,
  MdLogout,
  MdArrowForward,
  MdCheck,
  MdBuild,
  MdGpsFixed,
  MdCalendarToday,
  MdAttachMoney,
  MdTrendingUp,
  MdEmojiEvents,
  MdLock,
  MdRefresh,
  MdClose,
  MdWhatsapp,
  MdStar,
  MdVerified,
  MdCreditCard,
  MdBarChart,
  MdChevronRight,
} from "react-icons/md";

// ─── Import komponen kartu member ─────────────────────────────
import { CardFront, CARD_THEME } from "../../components/member/MemberCardComponents";

// ─── Tier styling ─────────────────────────────────────────────
const TIER_GRADIENT = {
  Bronze: "from-orange-900/60 to-orange-800/40",
  Silver: "from-slate-800/60 to-slate-700/40",
  Gold: "from-yellow-900/60 to-yellow-800/40",
  Platinum: "from-purple-900/60 to-purple-800/40",
};
const TIER_GLOW = {
  Bronze: "shadow-orange-500/20",
  Silver: "shadow-slate-400/20",
  Gold: "shadow-yellow-500/20",
  Platinum: "shadow-purple-500/20",
};
const TIER_BORDER = {
  Bronze: "border-orange-500/30",
  Silver: "border-slate-400/30",
  Gold: "border-yellow-500/30",
  Platinum: "border-purple-500/30",
};

// ─── Status badge ─────────────────────────────────────────────
const STATUS_STYLE = {
  Selesai: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  Proses: "bg-blue-500/15 text-blue-400 border-blue-500/25",
  Menunggu: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  Dibatalkan: "bg-red-500/15 text-red-400 border-red-500/25",
};

// ─── Tab nav items ────────────────────────────────────────────
const TABS = [
  { id: "overview", label: "Overview", icon: MdDashboard },
  { id: "riwayat", label: "Riwayat", icon: MdHistory },
  { id: "loyalty", label: "Loyalty", icon: MdStars },
  { id: "layanan", label: "Layanan", icon: MdBuild },
  { id: "achievement", label: "Badge", icon: MdEmojiEvents },
];

// ─── Stat Card ────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="group rounded-2xl p-5 bg-white/[0.03] border border-white/8 hover:border-white/20 hover:bg-white/[0.06] transition-all"
    >
      <div className="flex items-center justify-between mb-3">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform"
          style={{ background: `${color}1A` }}
        >
          <Icon size={24} style={{ color }} />
        </div>
      </div>
      <p className="text-white font-extrabold text-2xl md:text-3xl">{value}</p>
      <p className="text-gray-400 text-xs mt-0.5 font-medium uppercase tracking-wider">{label}</p>
      {sub && (
        <p className="text-xs mt-1 font-semibold" style={{ color }}>
          {sub}
        </p>
      )}
    </motion.div>
  );
}

// ─── Section heading ─────────────────────────────────────────
function SectionTitle({ children, sub }) {
  return (
    <div className="mb-5">
      <h2 className="text-white font-bold text-xl md:text-2xl">{children}</h2>
      {sub && <p className="text-gray-500 text-sm mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Overview Tab ─────────────────────────────────────────────
function OverviewTab({ customer, orders, loyalty, tierCfg }) {
  const navigate = useNavigate();
  const disc = { Bronze: 0, Silver: 5, Gold: 10, Platinum: 15 };

  return (
    <div className="space-y-8">
      {/* Stat grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard
          icon={MdHistory}
          label="Total Servis"
value={customer.total_orders ?? customer.totalOrders ?? 0}          color="#60A5FA"
          delay={0}
        />
        <StatCard
          icon={MdStars}
          label="Poin Loyalty"
          value={(customer.points || 0).toLocaleString("id-ID")}
          color={tierCfg.color}
          delay={0.05}
        />
        <StatCard
          icon={MdAttachMoney}
          label="Total Belanja"
value={`Rp${(((customer.total_spent ?? customer.totalSpent ?? 0) / 1000000)).toFixed(1)}jt`}          color="#34D399"
          delay={0.1}
        />
        <StatCard
          icon={MdCreditCard}
          label="Diskon Member"
          value={`${disc[loyalty.tier]}%`}
          color="#A855F7"
          delay={0.15}
          sub={`${loyalty.tier} Member`}
        />
      </div>

      {/* Quick actions */}
      <div>
        <SectionTitle>Aksi Cepat</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              icon: MdDirectionsCar,
              label: "Booking Service",
              path: "/member/booking",
              color: "#10B981",
            },
            {
              icon: MdGpsFixed,
              label: "Tracking Status",
              path: "/member/tracking",
              color: "#60A5FA",
            },
            {
              icon: MdCardGiftcard,
              label: "Voucher Saya",
              path: "/member/voucher",
              color: "#A855F7",
            },
            {
              icon: MdPerson,
              label: "Profil Saya",
              path: "/member/profil",
              color: "#F59E0B",
            },
          ].map(({ icon: Icon, label, path, color }) => (
            <Link
              key={path}
              to={path}
              className="rounded-2xl p-4 text-center bg-white/[0.03] border border-white/8 hover:border-white/20 hover:bg-white/[0.06] transition-all group"
            >
              <div
                className="w-14 h-14 rounded-xl mx-auto mb-3 flex items-center justify-center group-hover:scale-110 transition-transform"
                style={{
                  background: `${color}1A`,
                  border: `1px solid ${color}30`,
                }}
              >
                <Icon className="text-2xl" style={{ color }} />
              </div>
              <p className="text-white font-medium text-xs">{label}</p>
            </Link>
          ))}
        </div>
      </div>

      {/* Latest orders */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <SectionTitle>Riwayat Terakhir</SectionTitle>
          <button
            onClick={() => {}}
            className="text-blue-400 text-xs hover:underline font-medium"
          >
            Lihat Semua →
          </button>
        </div>
        <div className="space-y-3">
          {orders.slice(0, 3).length > 0 ? (
            orders.slice(0, 3).map((o, i) => (
              <motion.div
                key={o.id || i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.07 }}
                className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/15 transition-all"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                  <MdBuild className="text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {o.service}
                  </p>
                  <p className="text-gray-500 text-xs">
                    {o.date} · {o.mechanic}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded-full border ${STATUS_STYLE[o.status] || STATUS_STYLE["Selesai"]}`}
                  >
                    {o.status}
                  </span>
                  <p className="text-gray-400 text-xs mt-1">
                    Rp{(o.total || 0).toLocaleString("id-ID")}
                  </p>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              Belum ada riwayat servis.
            </div>
          )}
        </div>
      </div>

      {/* Benefits */}
      <div>
        <SectionTitle sub={`Benefit eksklusif untuk ${loyalty.tier} Member`}>
          Benefit Member Anda
        </SectionTitle>
        <div className="rounded-2xl p-5 bg-white/[0.03] border border-white/8 space-y-2">
          {(TIER_BENEFITS[loyalty.tier] || []).map((b, i) => (
            <div key={i} className="flex items-start gap-2">
              <MdCheck className="text-emerald-400 text-base mt-0.5 flex-shrink-0" />
              <p className="text-gray-300 text-sm">{b}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Riwayat Tab ──────────────────────────────────────────────
function RiwayatTab({ orders }) {
  const [filter, setFilter] = useState("Semua");
  const statuses = ["Semua", "Selesai", "Proses", "Menunggu"];
  const filtered =
    filter === "Semua" ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex gap-2 mb-5 flex-wrap">
        {statuses.map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-xl text-xs font-medium transition-all border ${
              filter === s
                ? "bg-blue-500/20 text-blue-400 border-blue-500/40"
                : "bg-white/5 text-gray-400 border-white/10 hover:text-white hover:bg-white/10"
            }`}
          >
            {s}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((o, i) => (
            <motion.div
              key={o.id || i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-white/15 transition-all"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-white font-bold text-sm">
                      {o.service}
                    </span>
                    <span
                      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${STATUS_STYLE[o.status] || STATUS_STYLE["Selesai"]}`}
                    >
                      {o.status}
                    </span>
                  </div>
                  <p className="text-gray-400 text-xs">{o.vehicle}</p>
                  <p className="text-gray-500 text-xs mt-1">
                    Mekanik: {o.mechanic} · {o.date}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-white font-bold text-sm">
                    Rp{(o.total || 0).toLocaleString("id-ID")}
                  </p>
                  <p className="text-gray-500 text-[10px] mt-0.5">{o.id}</p>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500 text-sm">
            Tidak ada riwayat untuk filter ini.
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Loyalty Tab ──────────────────────────────────────────────
function LoyaltyTab({ customer, loyalty, tierCfg }) {
  const allTiers = ["Bronze", "Silver", "Gold", "Platinum"];
  const history = customer.pointHistory || [];

  return (
    <div className="space-y-8">
      {/* Progress card */}
      <div
        className={`rounded-2xl p-6 bg-gradient-to-r ${TIER_GRADIENT[loyalty.tier]} border ${TIER_BORDER[loyalty.tier]} shadow-xl ${TIER_GLOW[loyalty.tier]}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-gray-300 text-xs uppercase tracking-wider">
              Tier Saat Ini
            </p>
            <p className="text-white font-extrabold text-2xl mt-0.5">
              {tierCfg.icon} {loyalty.tier}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-300 text-xs">Total Poin</p>
            <p
              className="font-extrabold text-2xl"
              style={{ color: tierCfg.color }}
            >
              {(customer.points || 0).toLocaleString("id-ID")}
            </p>
          </div>
        </div>
        {loyalty.nextTier && (
          <>
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span>{loyalty.tier}</span>
              <span>
                {loyalty.pointsToNext} poin lagi ke {loyalty.nextTier}
              </span>
            </div>
            <div className="h-3 rounded-full bg-black/30">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${loyalty.progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{ background: tierCfg.color }}
              />
            </div>
          </>
        )}
        {!loyalty.nextTier && (
          <div className="text-center py-2">
            <span
              className="text-xs font-semibold"
              style={{ color: tierCfg.color }}
            >
              🏆 Anda sudah di tier tertinggi!
            </span>
          </div>
        )}
      </div>

      {/* Tier roadmap */}
      <div>
        <SectionTitle>Roadmap Tier</SectionTitle>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {allTiers.map((t) => {
            const cfg = TIER_CONFIG[t];
            const unlocked =
              ["Bronze", "Silver", "Gold", "Platinum"].indexOf(t) <=
              ["Bronze", "Silver", "Gold", "Platinum"].indexOf(loyalty.tier);
            return (
              <div
                key={t}
                className={`rounded-2xl p-4 text-center border transition-all ${unlocked ? TIER_BORDER[t] : "border-white/8 opacity-50"}`}
                style={{
                  background: unlocked
                    ? `${cfg.color}10`
                    : "rgba(255,255,255,0.02)",
                }}
              >
                <p className="text-2xl mb-1">{cfg.icon}</p>
                <p className="text-white font-bold text-sm">{t}</p>
                <p className="text-gray-500 text-[10px]">
                  ≥ {cfg.min.toLocaleString()} poin
                </p>
                {unlocked && (
                  <p
                    className="text-[10px] font-semibold mt-1"
                    style={{ color: cfg.color }}
                  >
                    ✓ Dicapai
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Point history */}
      <div>
        <SectionTitle>Riwayat Poin</SectionTitle>
        <div className="space-y-2">
          {history.length > 0 ? (
            history.slice(0, 10).map((h, i) => (
              <div
                key={h.id || i}
                className="flex items-center gap-3 p-3.5 rounded-xl bg-white/[0.03] border border-white/8"
              >
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${h.type === "in" ? "bg-emerald-500/15" : "bg-red-500/15"}`}
                >
                  <MdStars
                    className={
                      h.type === "in" ? "text-emerald-400" : "text-red-400"
                    }
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs font-medium truncate">
                    {h.desc}
                  </p>
                  <p className="text-gray-500 text-[10px]">{h.date}</p>
                </div>
                <p
                  className={`text-sm font-bold flex-shrink-0 ${h.type === "in" ? "text-emerald-400" : "text-red-400"}`}
                >
                  {h.type === "in" ? "+" : "-"}
                  {Math.abs(h.points)} poin
                </p>
              </div>
            ))
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              Belum ada riwayat poin.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Layanan Tab ──────────────────────────────────────────────
function LayananTab() {
  const navigate = useNavigate();
  return (
    <div>
      <SectionTitle sub="Klik layanan untuk melihat detail dan booking">
        Layanan Tersedia
      </SectionTitle>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {layanan.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="p-5 rounded-2xl bg-white/[0.03] border border-white/8 hover:border-blue-500/30 transition-all group"
          >
            <div className="flex items-start gap-4">
              <div className="text-3xl flex-shrink-0">{s.icon}</div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-white font-bold text-sm">{s.name}</h3>
                  {s.populer && (
                    <span className="text-[9px] font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/30 px-1.5 py-0.5 rounded-full">
                      Populer
                    </span>
                  )}
                </div>
                <p className="text-gray-400 text-xs leading-relaxed">
                  {s.desc}
                </p>
                <div className="flex items-center gap-3 mt-2">
                  <span className="text-[10px] text-gray-500">
                    ⏱ {s.durasi}
                  </span>
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    Mulai Rp{(s.hargaMulai / 1000).toFixed(0)}rb
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => navigate("/member/booking")}
                className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 transition-all flex items-center justify-center gap-1"
              >
                Booking <MdArrowForward className="text-xs" />
              </button>
              <button
                onClick={() => navigate("/guest/layanan")}
                className="px-3 py-2 rounded-xl text-xs font-semibold text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/8 transition-all"
              >
                Detail
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Achievement Tab ──────────────────────────────────────────
function AchievementTab({ customer }) {
  const achievements = calcAchievements(customer);
  const unlocked = achievements.filter((a) => a.unlocked);
  const locked = achievements.filter((a) => !a.unlocked);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-10 h-10 rounded-xl bg-yellow-500/15 flex items-center justify-center">
          <MdEmojiEvents className="text-yellow-400 text-xl" />
        </div>
        <div>
          <p className="text-white font-bold">
            {unlocked.length} / {achievements.length} Badge
          </p>
          <p className="text-gray-500 text-xs">Kumpulkan semua badge!</p>
        </div>
      </div>

      {unlocked.length > 0 && (
        <div>
          <SectionTitle sub="Badge yang berhasil kamu raih">
            Badge Unlocked
          </SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {unlocked.map((a) => (
              <motion.div
                key={a.id}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-4 rounded-2xl text-center bg-yellow-500/10 border border-yellow-500/30"
              >
                <p className="text-3xl mb-2">{a.icon}</p>
                <p className="text-white font-bold text-xs">{a.label}</p>
                <p className="text-gray-400 text-[10px] mt-0.5">{a.desc}</p>
                <p className="text-yellow-400 text-[10px] mt-1 font-semibold">
                  ✓ Diraih
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {locked.length > 0 && (
        <div>
          <SectionTitle sub="Selesaikan tantangan untuk membuka badge">
            Badge Terkunci
          </SectionTitle>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {locked.map((a) => (
              <div
                key={a.id}
                className="p-4 rounded-2xl text-center bg-white/[0.02] border border-white/8 opacity-60"
              >
                <div className="relative inline-block mb-2">
                  <p className="text-3xl grayscale opacity-40">{a.icon}</p>
                  <MdLock className="absolute -bottom-1 -right-1 text-gray-500 text-xs" />
                </div>
                <p className="text-gray-400 font-bold text-xs">{a.label}</p>
                <p className="text-gray-500 text-[10px] mt-0.5">{a.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────
export default function MemberDashboard() {
  const { customer, logout, refreshCustomer } = useCustomerAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState(null);
  const [orders, setOrders] = useState([]);

  // Load orders dari Supabase by customer_id
  useEffect(() => {
    if (!customer?.id) return;
    import('../../services/orderAPI').then(({ orderAPI }) => {
      orderAPI.fetchByCustomer(customer.id).then(data => {
        setOrders(data.map(o => ({
          ...o,
          customer: o.customer_name,
          vehicle:  o.vehicle_display,
          date:     o.order_date,
        })).sort((a, b) => new Date(b.date) - new Date(a.date)));
      }).catch(() => {});
    });
  }, [customer?.id]);

  const loyalty = customer ? calcLoyaltyProgress(customer.points || 0) : null;
  const tierCfg = loyalty ? TIER_CONFIG[loyalty.tier] : TIER_CONFIG.Bronze;

  // Ambil tema kartu berdasarkan tier
  const cardTheme = loyalty ? CARD_THEME[loyalty.tier] : CARD_THEME.Bronze;

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshCustomer();
    if (customer?.id) {
      const { orderAPI } = await import('../../services/orderAPI');
      const data = await orderAPI.fetchByCustomer(customer.id);
      setOrders(data.map(o => ({ ...o, customer: o.customer_name, vehicle: o.vehicle_display, date: o.order_date })));
    }
    setIsRefreshing(false);
    setToast({ msg: "Data diperbarui!", type: "success" });
  };

  const handleLogout = () => {
    logout();
    navigate("/guest/login");
  };

  if (!customer || !loyalty) {
    return (
      <div className="pt-16 min-h-screen bg-[#080C14] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 rounded-2xl bg-white/5 animate-pulse mx-auto mb-4" />
          <p className="text-gray-400 text-sm">Memuat data member...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 min-h-screen bg-[#080C14]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 lg:py-8">
        {/* ─── HEADER CARD ───────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative rounded-3xl overflow-hidden mb-4 shadow-2xl"
          style={{ height: '220px' }}
        >
          {/* Background image dari Unsplash */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{
              backgroundImage: `url('https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=1200')`,
            }}
          />
          
          {/* Overlay gradien untuk keterbacaan teks */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-black/30" />

          {/* Konten info member */}
          <div className="relative z-10 flex flex-col justify-between h-full p-6 text-white">
            {/* Baris atas: tombol aksi */}
            <div className="flex justify-end gap-2">
              <button
                onClick={handleRefresh}
                className={`p-2 rounded-xl bg-black/30 backdrop-blur-sm hover:bg-black/50 transition ${isRefreshing ? "animate-spin" : ""}`}
                aria-label="Refresh"
              >
                <MdRefresh size={18} />
              </button>
              <Link
                to="/member/profil"
                className="p-2 rounded-xl bg-black/30 backdrop-blur-sm hover:bg-black/50 transition"
                aria-label="Profil"
              >
                <MdPerson size={18} />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 rounded-xl bg-red-500/30 backdrop-blur-sm hover:bg-red-500/50 transition"
                aria-label="Logout"
              >
                <MdLogout size={18} />
              </button>
            </div>

            {/* Info member di kiri bawah */}
            <div>
              <p className="text-xs uppercase tracking-wider text-gray-300">
                Member Dashboard
              </p>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mt-1">
                {customer.name}
              </h1>
              <div className="flex flex-wrap items-center gap-3 mt-2">
                <span
                  className="text-xs font-bold px-3 py-1 rounded-full bg-black/30 backdrop-blur-sm border border-white/30"
                  style={{ color: tierCfg.color }}
                >
                  {tierCfg.icon} {loyalty.tier}
                </span>
                {customer.membershipId && (
                  <span className="text-sm font-mono bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-gray-200">
                    {customer.membershipId}
                  </span>
                )}
                {customer.memberSince && (
                  <span className="text-xs bg-black/30 backdrop-blur-sm px-3 py-1 rounded-full text-gray-300">
                    Bergabung {customer.memberSince}
                  </span>
                )}
              </div>
              <p className="mt-3 text-sm text-gray-200">
                Total Poin:{" "}
                <span
                  className="text-2xl md:text-3xl font-bold"
                  style={{ color: tierCfg.color }}
                >
                  {(customer.points || 0).toLocaleString("id-ID")}
                </span>
              </p>
            </div>
          </div>
        </motion.div>

        {/* ─── Progress Bar ke Tier Berikutnya ── */}
        {loyalty.nextTier && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-400 mb-1.5">
              <span className="font-medium">
                {(customer.points || 0).toLocaleString("id-ID")} poin
              </span>
              <span className="font-medium">
                {loyalty.pointsToNext} poin lagi ke {loyalty.nextTier}{" "}
                {TIER_CONFIG[loyalty.nextTier]?.icon}
              </span>
            </div>
            <div className="h-3 rounded-full bg-black/30 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${loyalty.progress}%` }}
                transition={{ duration: 1.2, ease: "easeOut" }}
                className="h-full rounded-full"
                style={{
                  background: `linear-gradient(90deg, ${tierCfg.color}80, ${tierCfg.color})`,
                }}
              />
            </div>
          </div>
        )}
        {!loyalty.nextTier && (
          <div
            className="mb-6 text-center text-sm font-semibold"
            style={{ color: tierCfg.color }}
          >
            🏆 Platinum — Tier Tertinggi! Nikmati semua benefit eksklusif.
          </div>
        )}

        {/* ─── TAB NAV ─────────────────────────────────────────── */}
        <div className="flex gap-1 mb-6 bg-white/[0.03] border border-white/8 rounded-2xl p-1 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all whitespace-nowrap flex-shrink-0 ${
                activeTab === id
                  ? "bg-white/10 text-white shadow-sm"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/5"
              }`}
            >
              <Icon size={16} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* ─── TAB CONTENT ────────────────────────────────────── */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === "overview" && (
              <OverviewTab
                customer={customer}
                orders={orders}
                loyalty={loyalty}
                tierCfg={tierCfg}
              />
            )}
            {activeTab === "riwayat" && <RiwayatTab orders={orders} />}
            {activeTab === "loyalty" && (
              <LoyaltyTab
                customer={customer}
                loyalty={loyalty}
                tierCfg={tierCfg}
              />
            )}
            {activeTab === "layanan" && <LayananTab />}
            {activeTab === "achievement" && (
              <AchievementTab customer={customer} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* ─── TOAST ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl shadow-2xl bg-emerald-600 text-white font-medium text-sm flex items-center gap-3"
          >
            <MdCheck /> {toast.msg}
            <button
              onClick={() => setToast(null)}
              className="opacity-70 hover:opacity-100"
            >
              <MdClose size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* WhatsApp FAB */}
      <a
        href="https://wa.me/6288708230676"
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 right-6 z-40 w-12 h-12 rounded-full flex items-center justify-center shadow-lg bg-green-500 hover:scale-110 transition-transform"
        aria-label="WhatsApp"
      >
        <MdWhatsapp className="text-white text-2xl" />
      </a>
    </div>
  );
}