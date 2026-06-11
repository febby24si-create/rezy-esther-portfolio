import { useState, useMemo } from "react";
import {
  calcTier,
  TIER_CONFIG,
  calcLoyaltyProgress,
} from "../context/CustomerAuthContext";
import { getAllCustomersFromStore } from "../hooks/useCustomerStore";
import {
  MdSend,
  MdNotifications,
  MdPeople,
  MdEmojiEvents,
  MdCake,
  MdBuild,
  MdWarning,
  MdCheck,
  MdRefresh,
} from "react-icons/md";

const fmt = (n) => "Rp " + Number(n).toLocaleString("id-ID");

function daysSince(dateStr) {
  if (!dateStr) return 9999;
  return Math.floor((new Date() - new Date(dateStr)) / 86400000);
}

function daysUntilBirthday(birthDate) {
  if (!birthDate) return null;
  const today = new Date();
  const birth = new Date(birthDate);
  const thisYear = today.getFullYear();
  let bday = new Date(thisYear, birth.getMonth(), birth.getDate());
  if (bday < today)
    bday = new Date(thisYear + 1, birth.getMonth(), birth.getDate());
  return Math.ceil((bday - today) / 86400000);
}

const SEGMENT_DEFS = [
  {
    key: "new",
    label: "Member Baru",
    color: "#60A5FA",
    icon: "🆕",
    desc: "Bergabung < 30 hari",
    filter: (c) => daysSince(c.joinDate) < 30,
  },
  {
    key: "active",
    label: "Aktif",
    color: "#22C55E",
    icon: "✅",
    desc: "Servis dalam 60 hari",
    filter: (c) => daysSince(c.lastOrderDate) <= 60,
  },
  {
    key: "at_risk",
    label: "At Risk",
    color: "#FBBF24",
    icon: "⚠️",
    desc: "Tidak servis 61–90 hari",
    filter: (c) => {
      const d = daysSince(c.lastOrderDate);
      return d > 60 && d <= 90;
    },
  },
  {
    key: "inactive",
    label: "Tidak Aktif (3 bln)",
    color: "#F97316",
    icon: "😴",
    desc: "Tidak servis 91–180 hari",
    filter: (c) => {
      const d = daysSince(c.lastOrderDate);
      return d > 90 && d <= 180;
    },
  },
  {
    key: "churned",
    label: "Churned (6 bln+)",
    color: "#EF4444",
    icon: "🚨",
    desc: "Tidak servis > 180 hari",
    filter: (c) => daysSince(c.lastOrderDate) > 180,
  },
  {
    key: "birthday",
    label: "Ulang Tahun 30 hari",
    color: "#A855F7",
    icon: "🎂",
    desc: "Ultah dalam 30 hari",
    filter: (c) => {
      const d = daysUntilBirthday(c.birthDate);
      return d !== null && d <= 30;
    },
  },
];

const REMINDER_TEMPLATES = [
  {
    id: "oli",
    icon: "🛢️",
    title: "Reminder Ganti Oli",
    segment: "active",
    message:
      "Halo {name}! Sudah waktunya ganti oli kendaraan Anda. Booking sekarang dan dapatkan poin loyalty extra!",
  },
  {
    id: "stnk",
    icon: "📋",
    title: "Reminder STNK",
    segment: "active",
    message:
      "Halo {name}! Jangan lupa perpanjang STNK kendaraan Anda sebelum kadaluarsa ya.",
  },
  {
    id: "bday",
    icon: "🎂",
    title: "Voucher Ulang Tahun",
    segment: "birthday",
    message:
      "Selamat ulang tahun {name}! 🎉 Kami hadiahkan voucher diskon 20% untuk servis di bulan spesial Anda.",
  },
  {
    id: "followup",
    icon: "💬",
    title: "Follow Up Setelah Servis",
    segment: "active",
    message:
      "Halo {name}! Bagaimana kondisi kendaraan Anda setelah servis kemarin? Beri rating dan dapatkan +50 poin!",
  },
  {
    id: "winback",
    icon: "🚨",
    title: "Win Back Customer Tidak Aktif",
    segment: "inactive",
    message:
      "Kami rindu {name}! Sudah lama tidak servis di Esther Garage. Dapatkan diskon 15% untuk kunjungan berikutnya.",
  },
  {
    id: "churned",
    icon: "💔",
    title: "Re-engagement Churned",
    segment: "churned",
    message:
      "Halo {name}! Kami ingin tahu apakah ada yang bisa diperbaiki. Yuk balik ke Esther Garage, ada hadiah menanti!",
  },
  {
    id: "tier",
    icon: "🏆",
    title: "Naik Tier Loyalty",
    segment: "active",
    message:
      "Selamat {name}! Anda hampir naik tier. Servis sekali lagi untuk membuka benefit eksklusif member {nextTier}.",
  },
];

function useAllCustomers() {
  // Baca dari garage_customers (sumber yang sama dengan halaman Customers & Orders)
  const raw = useMemo(() => getAllCustomersFromStore(), []);
  return useMemo(
    () =>
      raw.map((c) => ({
        ...c,
        lastOrderDate: c.lastOrderDate || c.joinDate,
      })),
    [raw],
  );
}

// ── Customer of the Month ─────────────────────────────────────
function CustomerOfTheMonth({ customers }) {
  const thisMonth = new Date().getMonth();
  const thisYear = new Date().getFullYear();

  const cotm = useMemo(() => {
    if (!customers.length) return null;
    return [...customers].sort((a, b) => (b.points || 0) - (a.points || 0))[0];
  }, [customers]);

  const mostActive = useMemo(() => {
    if (!customers.length) return null;
    return [...customers].sort(
      (a, b) => (b.totalOrders || 0) - (a.totalOrders || 0),
    )[0];
  }, [customers]);

  const highestSpend = useMemo(() => {
    if (!customers.length) return null;
    return [...customers].sort(
      (a, b) => (b.totalSpent || 0) - (a.totalSpent || 0),
    )[0];
  }, [customers]);

  if (!cotm)
    return (
      <div className="rounded-2xl p-6 border border-white/8 text-gray-500 text-center">
        Belum ada data customer.
      </div>
    );

  const getInitials = (name) =>
    name
      ?.trim()
      .split(/\s+/)
      .map((w) => w[0])
      .slice(0, 2)
      .join("")
      .toUpperCase() || "?";

  const cards = [
    {
      label: "Point Tertinggi",
      customer: cotm,
      icon: "⭐",
      value: `${(cotm.points || 0).toLocaleString("id-ID")} poin`,
      color: "#FBBF24",
    },
    {
      label: "Paling Aktif",
      customer: mostActive,
      icon: "🔧",
      value: `${mostActive?.totalOrders || 0}× servis`,
      color: "#22C55E",
    },
    {
      label: "Pengeluaran Tertinggi",
      customer: highestSpend,
      icon: "💰",
      value: fmt(highestSpend?.totalSpent || 0),
      color: "#A855F7",
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MdEmojiEvents className="text-yellow-400 text-xl" />
        <h2 className="text-white font-bold">Customer of the Month</h2>
        <span className="text-xs text-gray-500 ml-1">
          {new Date().toLocaleDateString("id-ID", {
            month: "long",
            year: "numeric",
          })}
        </span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ label, customer: c, icon, value, color }) => {
          if (!c) return null;
          const tier = calcTier(c.points || 0);
          const tierCfg = TIER_CONFIG[tier];
          return (
            <div
              key={label}
              className="p-5 rounded-2xl border hover:border-white/15 transition-all"
              style={{
                background: "rgba(255,255,255,0.03)",
                borderColor: "rgba(255,255,255,0.08)",
              }}
            >
              <div className="text-2xl mb-3">{icon}</div>
              <div className="flex items-center gap-2.5 mb-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-sm font-extrabold text-white flex-shrink-0"
                  style={{ background: tierCfg.color }}
                >
                  {getInitials(c.name)}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">
                    {c.name}
                  </p>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: tierCfg.color }}
                  >
                    {tierCfg.icon} {tier}
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500">{label}</p>
              <p className="font-extrabold text-base mt-0.5" style={{ color }}>
                {value}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Segmentation Panel ─────────────────────────────────────────
function SegmentationPanel({ customers }) {
  const [selected, setSelected] = useState("active");
  const [sentMap, setSentMap] = useState({});

  const segments = useMemo(
    () =>
      SEGMENT_DEFS.map((def) => ({
        ...def,
        customers: customers.filter(def.filter),
      })),
    [customers],
  );

  const current = segments.find((s) => s.key === selected);

  const handleSend = (segKey) => {
    setSentMap((m) => ({ ...m, [segKey]: true }));
    setTimeout(() => setSentMap((m) => ({ ...m, [segKey]: false })), 3000);
  };

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MdPeople className="text-blue-400 text-xl" />
        <h2 className="text-white font-bold">Customer Segmentation</h2>
      </div>

      {/* Segment tabs */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mb-5">
        {segments.map((s) => (
          <button
            key={s.key}
            onClick={() => setSelected(s.key)}
            className={`p-3 rounded-xl border text-center transition-all ${selected === s.key ? "border-white/25 bg-white/8" : "border-white/6 bg-white/3 hover:bg-white/5"}`}
          >
            <div className="text-xl mb-1">{s.icon}</div>
            <div className="text-white font-bold text-lg">
              {s.customers.length}
            </div>
            <div className="text-gray-500 text-xs leading-tight">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Selected segment */}
      {current && (
        <div
          className="rounded-2xl border p-5"
          style={{
            borderColor: "rgba(255,255,255,0.08)",
            background: "rgba(255,255,255,0.02)",
          }}
        >
          <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
            <div>
              <h3 className="text-white font-bold flex items-center gap-2">
                {current.icon} {current.label}{" "}
                <span className="text-gray-400 text-sm font-normal">
                  ({current.customers.length} customer)
                </span>
              </h3>
              <p className="text-gray-500 text-xs mt-0.5">{current.desc}</p>
            </div>
            <button
              onClick={() => handleSend(current.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${sentMap[current.key] ? "bg-green-500/20 text-green-400 border border-green-500/25" : "text-white border border-white/15 hover:bg-white/8"}`}
              style={
                sentMap[current.key]
                  ? {}
                  : { background: "rgba(255,255,255,0.06)" }
              }
              disabled={current.customers.length === 0}
            >
              {sentMap[current.key] ? (
                <>
                  <MdCheck /> Terkirim!
                </>
              ) : (
                <>
                  <MdSend /> Kirim Broadcast ({current.customers.length})
                </>
              )}
            </button>
          </div>

          {current.customers.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-6">
              Tidak ada customer di segmen ini.
            </p>
          ) : (
            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {current.customers.map((c) => {
                const tier = calcTier(c.points || 0);
                const tierCfg = TIER_CONFIG[tier];
                return (
                  <div
                    key={c.id}
                    className="flex items-center gap-3 p-2.5 rounded-lg"
                    style={{ background: "rgba(255,255,255,0.03)" }}
                  >
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white flex-shrink-0"
                      style={{ background: tierCfg.color }}
                    >
                      {c.name
                        ?.trim()
                        .split(/\s+/)
                        .map((w) => w[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <span className="text-white text-sm flex-1 truncate">
                      {c.name}
                    </span>
                    <span className="text-xs" style={{ color: tierCfg.color }}>
                      {tier}
                    </span>
                    <span className="text-xs text-gray-500">
                      {(c.points || 0).toLocaleString("id-ID")} pt
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Reminder Engine ────────────────────────────────────────────
function ReminderEngine({ customers }) {
  const [sentSet, setSentSet] = useState(new Set());

  const handleSend = (id) => {
    setSentSet((s) => new Set([...s, id]));
    setTimeout(
      () =>
        setSentSet((s) => {
          const n = new Set(s);
          n.delete(id);
          return n;
        }),
      3000,
    );
  };

  const enriched = useMemo(() => {
    return REMINDER_TEMPLATES.map((tmpl) => {
      const segDef = SEGMENT_DEFS.find((s) => s.key === tmpl.segment);
      const targets = segDef ? customers.filter(segDef.filter) : [];
      return { ...tmpl, targets };
    });
  }, [customers]);

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <MdNotifications className="text-orange-400 text-xl" />
        <h2 className="text-white font-bold">Reminder & Broadcast Engine</h2>
      </div>
      <div className="space-y-3">
        {enriched.map((r) => (
          <div
            key={r.id}
            className="p-4 rounded-2xl border hover:border-white/15 transition-all"
            style={{
              background: "rgba(255,255,255,0.03)",
              borderColor: "rgba(255,255,255,0.08)",
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl flex-shrink-0 mt-0.5">{r.icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <p className="text-white font-semibold text-sm">{r.title}</p>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/8 text-gray-400">
                    {r.targets.length} target
                  </span>
                </div>
                <p className="text-gray-400 text-xs leading-relaxed mb-3 italic">
                  "
                  {r.message
                    .replace("{name}", "Customer")
                    .replace("{nextTier}", "Gold")}
                  "
                </p>
                <div className="flex items-center gap-3 flex-wrap">
                  <span className="text-xs text-gray-600 flex items-center gap-1">
                    📱 WhatsApp · ✉️ Email
                  </span>
                  <button
                    onClick={() => handleSend(r.id)}
                    disabled={r.targets.length === 0 || sentSet.has(r.id)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                      sentSet.has(r.id)
                        ? "bg-green-500/20 text-green-400 border border-green-500/25"
                        : r.targets.length === 0
                          ? "bg-white/5 text-gray-600 cursor-not-allowed"
                          : "bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/20"
                    }`}
                  >
                    {sentSet.has(r.id) ? (
                      <>
                        <MdCheck className="text-sm" /> Terkirim!
                      </>
                    ) : (
                      <>
                        <MdSend className="text-sm" /> Kirim Sekarang
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Reviews Summary ────────────────────────────────────────────
function ReviewsSummary() {
  const reviews = useMemo(
    () => JSON.parse(localStorage.getItem("garage_reviews") || "[]"),
    [],
  );

  if (reviews.length === 0) return null;

  const avgRating =
    reviews.reduce((a, b) => a + (b.rating || 0), 0) / reviews.length;
  const dist = [5, 4, 3, 2, 1].map((n) => ({
    star: n,
    count: reviews.filter((r) => r.rating === n).length,
  }));

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-yellow-400 text-xl">⭐</span>
        <h2 className="text-white font-bold">Rating & Review</h2>
      </div>
      <div
        className="rounded-2xl border p-5 grid grid-cols-1 sm:grid-cols-2 gap-6"
        style={{
          background: "rgba(255,255,255,0.03)",
          borderColor: "rgba(255,255,255,0.08)",
        }}
      >
        {/* Average */}
        <div className="text-center">
          <p className="text-6xl font-extrabold text-yellow-400">
            {avgRating.toFixed(1)}
          </p>
          <div className="flex justify-center gap-0.5 my-2">
            {[1, 2, 3, 4, 5].map((s) => (
              <span
                key={s}
                className={`text-xl ${s <= Math.round(avgRating) ? "text-yellow-400" : "text-gray-600"}`}
              >
                ★
              </span>
            ))}
          </div>
          <p className="text-gray-400 text-sm">{reviews.length} review</p>
        </div>
        {/* Distribution */}
        <div className="space-y-2">
          {dist.map(({ star, count }) => (
            <div key={star} className="flex items-center gap-2">
              <span className="text-xs text-gray-400 w-3">{star}</span>
              <span className="text-yellow-400 text-xs">★</span>
              <div className="flex-1 h-2 rounded-full bg-white/8 overflow-hidden">
                <div
                  className="h-full rounded-full bg-yellow-400"
                  style={{
                    width: reviews.length
                      ? `${(count / reviews.length) * 100}%`
                      : "0%",
                  }}
                />
              </div>
              <span className="text-xs text-gray-500 w-4">{count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Latest reviews */}
      {reviews.length > 0 && (
        <div className="mt-4 space-y-3">
          {reviews.slice(0, 3).map((r) => (
            <div
              key={r.id}
              className="p-4 rounded-xl border"
              style={{
                background: "rgba(255,255,255,0.02)",
                borderColor: "rgba(255,255,255,0.06)",
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-white font-semibold text-sm">
                  {r.customerName}
                </p>
                <div className="flex gap-0.5">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <span
                      key={s}
                      className={`text-sm ${s <= r.rating ? "text-yellow-400" : "text-gray-600"}`}
                    >
                      ★
                    </span>
                  ))}
                </div>
              </div>
              {r.reviewText && (
                <p className="text-gray-400 text-sm">{r.reviewText}</p>
              )}
              <p className="text-gray-600 text-xs mt-2">
                {new Date(r.date).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}{" "}
                · {r.mechanic}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
// ── Panduan CRM Accordion (DaisyUI) ───────────────────────────
function PanduanCRM() {
  const items = [
    {
      id: "segmentasi",
      title: "📊 Apa itu Customer Segmentasi?",
      content:
        "Segmentasi membagi pelanggan berdasarkan perilaku terakhir mereka. Member Baru (<30 hari), Aktif (servis <60 hari), At Risk (61–90 hari), Tidak Aktif (91–180 hari), dan Churned (>180 hari). Gunakan ini untuk menentukan siapa yang perlu dihubungi lebih dulu.",
    },
    {
      id: "reminder",
      title: "🔔 Cara Kerja Reminder & Broadcast",
      content:
        'Pilih template pesan yang sudah tersedia, sistem akan otomatis mencocokkan dengan segmen pelanggan yang relevan. Klik "Kirim Sekarang" untuk mengirim notifikasi via WhatsApp dan Email ke semua pelanggan di segmen tersebut.',
    },
    {
      id: "loyalty",
      title: "🏆 Sistem Poin & Tier Loyalitas",
      content:
        "Pelanggan mendapat poin setiap kali servis. Bronze (0–499 poin), Silver (500–1499 poin), Gold (1500–2999 poin), Platinum (3000+ poin). Tier lebih tinggi mendapat diskon dan benefit eksklusif yang otomatis diterapkan saat booking.",
    },
    {
      id: "cotm",
      title: "⭐ Customer of the Month",
      content:
        "Menampilkan 3 pelanggan terbaik bulan ini berdasarkan poin tertinggi, frekuensi servis terbanyak, dan total pengeluaran tertinggi. Data diperbarui otomatis setiap awal bulan.",
    },
    {
      id: "tips",
      title: "💡 Tips Meningkatkan Retensi Pelanggan",
      content:
        'Fokus pada segmen "At Risk" — mereka masih bisa diselamatkan dengan satu broadcast yang tepat. Kirim voucher ulang tahun H-7 untuk konversi lebih tinggi. Pelanggan yang tidak aktif >6 bulan butuh penawaran lebih agresif seperti diskon 20–30%.',
    },
  ];

  return (
    <div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-blue-400 text-xl">📖</span>
        <h2 className="text-white font-bold">Panduan Penggunaan CRM</h2>
        <span className="text-xs text-gray-500 ml-1">— klik untuk buka</span>
      </div>

      <div className="space-y-2">
        {items.map((item) => (
          <div
            key={item.id}
            className="collapse collapse-arrow"
            style={{
              background: "rgba(255,255,255,0.03)",
              border: "1px solid rgba(34,197,94,0.12)",
              borderRadius: "12px",
            }}
          >
            <input type="checkbox" />
            <div
              className="collapse-title text-sm font-semibold text-white"
              style={{ minHeight: "unset", padding: "14px 16px" }}
            >
              {item.title}
            </div>
            <div
              className="collapse-content text-gray-400 text-sm leading-relaxed"
              style={{ paddingLeft: "16px", paddingRight: "16px" }}
            >
              <p className="pb-3">{item.content}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
// ── Main Page ──────────────────────────────────────────────────
export default function CRMAutomation() {
  const [tab, setTab] = useState("cotm");
  const customers = useAllCustomers();

  const tabs = [
    { key: "cotm", label: "Customer of the Month", icon: MdEmojiEvents },
    { key: "segment", label: "Segmentasi", icon: MdPeople },
    { key: "reminder", label: "Reminder & Broadcast", icon: MdNotifications },
    { key: "review", label: "Rating & Review", icon: null, emoji: "⭐" },
    { key: "panduan", label: "Panduan CRM", icon: null, emoji: "📖" }, // ← tambah ini
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-green-400">🤖</span> CRM Automation
        </h1>
        <p className="text-gray-400 text-sm mt-1">
          Kelola customer segmentation, reminder otomatis, dan monitoring
          loyalitas.
          <span className="ml-2 text-green-400 font-medium">
            {customers.length} customer terdaftar
          </span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        {tabs.map(({ key, label, icon: Icon, emoji }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
              tab === key
                ? "bg-green-500/20 text-green-400 border border-green-500/25"
                : "text-gray-400 hover:text-white border border-white/8 hover:bg-white/5"
            }`}
          >
            {Icon ? <Icon className="text-base" /> : <span>{emoji}</span>}
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div
        className="rounded-2xl border p-6"
        style={{
          background: "rgba(4,28,21,0.6)",
          borderColor: "rgba(34,197,94,0.12)",
        }}
      >
        {tab === "cotm" && <CustomerOfTheMonth customers={customers} />}
        {tab === "segment" && <SegmentationPanel customers={customers} />}
        {tab === "reminder" && <ReminderEngine customers={customers} />}
        {tab === "review" && <ReviewsSummary />}
        {tab === 'panduan'  && <PanduanCRM />}   {/* ← tambah ini */}
      </div>
    </div>
  );
}
