import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import {
  MdAdd,
  MdSearch,
  MdClose,
  MdEdit,
  MdDelete,
  MdFilterList,
  MdUnfoldMore,
  MdExpandLess,
  MdExpandMore,
  MdDownload,
  MdReceipt,
  MdRefresh,
  MdGridView,
  MdTableRows,
  MdPhotoCamera,
  MdEmail,
  MdPhone,
  MdCalendarToday,
  MdShoppingBag,
  MdPerson,
  MdArrowBack,
  MdCheck,
  MdStar,
  MdStarBorder,
  MdTrendingUp,
  MdBarChart,
  MdMessage,
} from "react-icons/md";
import Pagination from "../components/Pagination";
import customersData from "../data/customersData.json";
import { getCustomerAvatar } from "../utils/randomAvatar";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

// ─── Storage helpers ──────────────────────────────────────────────────
const getOrdersFromStorage = () => {
  const stored = localStorage.getItem("garage_orders");
  return stored ? JSON.parse(stored) : [];
};

const saveOrderRating = (orderId, rating) => {
  const orders = getOrdersFromStorage();
  const updated = orders.map((o) =>
    o.id === orderId ? { ...o, rating } : o
  );
  localStorage.setItem("garage_orders", JSON.stringify(updated));
};

// ─── Format currency ─────────────────────────────────────────────────
const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return "Rp 0";
  return "Rp " + num.toLocaleString("id-ID");
};

// ─── Rating helpers ───────────────────────────────────────────────────
const getRatingColor = (rating) => {
  if (!rating) return "#6B7280";
  if (rating >= 4.5) return "#22C55E";
  if (rating >= 3.5) return "#FBBF24";
  if (rating >= 2.5) return "#F97316";
  return "#EF4444";
};

const getRatingLabel = (rating) => {
  if (!rating) return "Belum dinilai";
  if (rating >= 4.5) return "Sangat Puas";
  if (rating >= 3.5) return "Puas";
  if (rating >= 2.5) return "Cukup";
  if (rating >= 1.5) return "Kurang";
  return "Sangat Kurang";
};

// ─── Loyalty config ──────────────────────────────────────────────────
const LOYALTY = {
  Platinum: {
    color: "#A855F7",
    bg: "rgba(168,85,247,0.12)",
    border: "rgba(168,85,247,0.25)",
    dot: "#A855F7",
    icon: "💎",
  },
  Gold: {
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.25)",
    dot: "#FBBF24",
    icon: "🥇",
  },
  Silver: {
    color: "#94A3B8",
    bg: "rgba(148,163,184,0.1)",
    border: "rgba(148,163,184,0.2)",
    dot: "#94A3B8",
    icon: "🥈",
  },
  Bronze: {
    color: "#F97316",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.2)",
    dot: "#F97316",
    icon: "🥉",
  },
};

// ─── StarRating component ─────────────────────────────────────────────
function StarRating({ value = 0, onChange = null, size = 16, readonly = false }) {
  const [hovered, setHovered] = useState(0);
  const display = hovered || value;

  return (
    <div className="flex items-center gap-0.5" style={{ lineHeight: 1 }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className="focus:outline-none transition-transform"
          style={{
            cursor: readonly ? "default" : "pointer",
            transform: !readonly && hovered >= star ? "scale(1.2)" : "scale(1)",
            padding: 1,
          }}
        >
          {display >= star ? (
            <MdStar size={size} style={{ color: "#FBBF24", filter: !readonly && hovered >= star ? "drop-shadow(0 0 4px rgba(251,191,36,0.8))" : "none" }} />
          ) : (
            <MdStarBorder size={size} style={{ color: "#374151" }} />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Avg Stars Display ────────────────────────────────────────────────
function AvgStars({ avg, count, size = 12 }) {
  if (!avg || count === 0) return (
    <span className="text-xs text-gray-600 italic">—</span>
  );
  return (
    <div className="flex items-center gap-1">
      <MdStar size={size} style={{ color: "#FBBF24" }} />
      <span className="text-xs font-bold" style={{ color: getRatingColor(avg) }}>
        {avg.toFixed(1)}
      </span>
      <span className="text-xs text-gray-600">({count})</span>
    </div>
  );
}

// ─── Compute per-customer rating aggregate ────────────────────────────
function computeCustomerRating(customerName, orders) {
  const rated = orders.filter(
    (o) => o.customer === customerName && o.rating > 0
  );
  if (rated.length === 0) return { avg: 0, count: 0 };
  const sum = rated.reduce((s, o) => s + Number(o.rating), 0);
  return { avg: sum / rated.length, count: rated.length };
}

// ─── LoyaltyBadge ────────────────────────────────────────────────────
function LoyaltyBadge({ loyalty, size = "md" }) {
  const cfg = LOYALTY[loyalty] || LOYALTY.Bronze;
  const pad = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${pad}`}
      style={{ background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}
    >
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: cfg.dot }} />
      {cfg.icon} {loyalty}
    </span>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────
function Avatar({ customer, size = 32 }) {
  const [imgError, setImgError] = useState(false);
  const src = customer.photo || getCustomerAvatar(customer.name, Math.max(size * 2, 80));
  const initials = customer.name
    ? customer.name.trim().split(/\s+/).map((w) => w[0]).slice(0, 2).join("").toUpperCase()
    : "?";

  if (imgError || (!customer.photo && false)) {
    return (
      <div
        className="rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0"
        style={{
          width: size, height: size,
          fontSize: size * 0.35,
          background: "linear-gradient(135deg,#16A34A,#22C55E)",
        }}
      >
        {initials}
      </div>
    );
  }

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <img
        src={src}
        alt={customer.name}
        className="rounded-xl object-cover w-full h-full"
        onError={() => setImgError(true)}
      />
    </div>
  );
}

// ─── Sort Icon ────────────────────────────────────────────────────────
const SortIcon = ({ column, sortColumn, sortDirection }) => {
  if (sortColumn !== column)
    return <MdUnfoldMore size={13} className="text-gray-700" />;
  return sortDirection === "asc" ? (
    <MdExpandLess size={13} className="text-green-400" />
  ) : (
    <MdExpandMore size={13} className="text-green-400" />
  );
};

// ─── Order Card (inside detail panel) ────────────────────────────────
function OrderCard({ order, onRate }) {
  const statusColor =
    order.status === "Selesai" ? "#22C55E"
    : order.status === "Sedang Dikerjakan" ? "#FBBF24"
    : "#94A3B8";

  return (
    <div
      className="p-4 rounded-2xl"
      style={{
        background: "rgba(6,26,20,0.8)",
        border: "1px solid rgba(34,197,94,0.1)",
      }}
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1 min-w-0">
          <p className="text-green-400 font-mono text-xs mb-0.5">{order.id}</p>
          <p className="text-white text-sm font-semibold truncate">{order.service}</p>
          <p className="text-gray-500 text-xs">{order.vehicle}</p>
        </div>
        <div className="text-right flex-shrink-0 ml-3">
          <p className="text-white font-bold text-sm">{formatCurrency(order.total)}</p>
          <p className="text-gray-500 text-xs">{order.date}</p>
          <span
            className="inline-flex px-2 py-0.5 rounded-full text-xs mt-1 font-medium"
            style={{ background: `${statusColor}18`, color: statusColor }}
          >
            {order.status}
          </span>
        </div>
      </div>

      {/* Rating section */}
      <div
        className="flex items-center justify-between pt-3"
        style={{ borderTop: "1px solid rgba(34,197,94,0.08)" }}
      >
        <div className="flex flex-col gap-1">
          <span className="text-xs text-gray-600 uppercase tracking-wider">Penilaian Servis</span>
          {order.rating ? (
            <span className="text-xs font-semibold" style={{ color: getRatingColor(order.rating) }}>
              {getRatingLabel(order.rating)}
            </span>
          ) : (
            <span className="text-xs text-gray-600 italic">Klik bintang untuk menilai</span>
          )}
        </div>
        <StarRating
          value={order.rating || 0}
          onChange={(r) => onRate(order.id, r)}
          size={18}
        />
      </div>
    </div>
  );
}

// ─── Customer Detail Dialog ───────────────────────────────────────────
function CustomerDetailDialog({ customer, isOpen, onClose, onEdit, onDelete }) {
  const [orders, setOrders] = useState([]);

  const refreshOrders = useCallback(() => {
    if (!customer) return;
    const all = getOrdersFromStorage();
    setOrders(all.filter((o) => o.customer === customer.name));
  }, [customer]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  if (!customer) return null;

  const totalSpent = orders.reduce((s, o) => s + Number(o.total), 0);
  const { avg: avgRating, count: ratedCount } = computeCustomerRating(customer.name, orders);

  const ratingDist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: orders.filter((o) => Math.round(o.rating) === star).length,
  }));
  const maxDist = Math.max(...ratingDist.map((d) => d.count), 1);

  const handleRate = (orderId, rating) => {
    saveOrderRating(orderId, rating);
    refreshOrders();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-xl p-0 overflow-hidden border-0"
        style={{
          background: "linear-gradient(160deg,#061a14 0%,#082b1e 100%)",
          border: "1px solid rgba(34,197,94,0.2)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        }}
      >
        {/* Loyalty color strip */}
        <div className="h-1" style={{ background: LOYALTY[customer.loyalty]?.color || "#22C55E" }} />

        <DialogHeader className="px-5 pt-5 pb-4">
          <div className="flex items-start gap-4">
            <Avatar customer={customer} size={60} />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-black text-white truncate">
                {customer.name}
              </DialogTitle>
              <DialogDescription className="mt-1.5 flex items-center flex-wrap gap-2">
                <span className="text-gray-500 font-mono text-xs">{customer.id}</span>
                <LoyaltyBadge loyalty={customer.loyalty} size="sm" />
                {avgRating > 0 && (
                  <span
                    className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full font-semibold"
                    style={{
                      background: `${getRatingColor(avgRating)}18`,
                      color: getRatingColor(avgRating),
                      border: `1px solid ${getRatingColor(avgRating)}33`,
                    }}
                  >
                    <MdStar size={11} /> {avgRating.toFixed(1)} avg
                  </span>
                )}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="px-5 pb-5">
          <TabsList
            className="w-full mb-4"
            style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }}
          >
            <TabsTrigger value="info" className="flex-1 text-xs data-[state=active]:text-green-400 data-[state=active]:bg-green-500/10">
              Info
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 text-xs data-[state=active]:text-green-400 data-[state=active]:bg-green-500/10">
              Riwayat ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex-1 text-xs data-[state=active]:text-green-400 data-[state=active]:bg-green-500/10">
              Statistik CRM
            </TabsTrigger>
          </TabsList>

          {/* ── Tab: Info ─────────────────────────────────────────── */}
          <TabsContent value="info" className="space-y-3 mt-0">
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.1)" }}
            >
              {[
                { icon: MdEmail, label: "Email", value: customer.email },
                { icon: MdPhone, label: "Telepon", value: customer.phone },
                { icon: MdCalendarToday, label: "Bergabung", value: customer.joinDate },
                { icon: MdShoppingBag, label: "Total Pesanan", value: `${customer.totalOrders} order`, bold: true },
              ].map(({ icon: Icon, label, value, bold }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon size={14} className="text-green-500 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-gray-600">{label}</p>
                    <p className={`text-sm ${bold ? "text-white font-bold" : "text-gray-300"}`}>{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CRM quick metrics */}
            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.1)" }}>
                <p className="text-lg font-black text-white">{orders.length}</p>
                <p className="text-xs text-gray-500 mt-0.5">Transaksi</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.12)" }}>
                <p className="text-sm font-black text-green-400">{orders.length > 0 ? formatCurrency(totalSpent / orders.length) : "—"}</p>
                <p className="text-xs text-gray-500 mt-0.5">Avg/Order</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: avgRating > 0 ? `${getRatingColor(avgRating)}12` : "rgba(255,255,255,0.03)", border: `1px solid ${avgRating > 0 ? getRatingColor(avgRating) + "25" : "rgba(255,255,255,0.06)"}` }}>
                {avgRating > 0 ? (
                  <>
                    <p className="text-lg font-black" style={{ color: getRatingColor(avgRating) }}>{avgRating.toFixed(1)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">Avg Rating</p>
                  </>
                ) : (
                  <>
                    <p className="text-lg font-black text-gray-700">—</p>
                    <p className="text-xs text-gray-600 mt-0.5">Belum dinilai</p>
                  </>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { onClose(); onEdit(customer); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-yellow-400 transition-all hover:bg-yellow-500/10"
                style={{ border: "1px solid rgba(234,179,8,0.25)" }}
              >
                <MdEdit size={15} /> Edit
              </button>
              <button
                onClick={() => { onClose(); onDelete(customer); }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
                style={{ border: "1px solid rgba(239,68,68,0.25)" }}
              >
                <MdDelete size={15} /> Hapus
              </button>
            </div>
          </TabsContent>

          {/* ── Tab: Riwayat Order + Rating ────────────────────────── */}
          <TabsContent value="orders" className="mt-0">
            {orders.length === 0 ? (
              <div className="text-center py-10">
                <MdReceipt size={40} className="text-gray-700 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Belum ada pesanan</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                <p className="text-xs text-gray-600 flex items-center gap-1.5 mb-2">
                  <MdStar size={12} className="text-yellow-400" />
                  Klik bintang untuk memberi penilaian CRM per transaksi
                </p>
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} onRate={handleRate} />
                ))}
              </div>
            )}
          </TabsContent>

          {/* ── Tab: Statistik CRM ────────────────────────────────── */}
          <TabsContent value="stats" className="mt-0 space-y-4">
            {/* Summary stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 text-center" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }}>
                <p className="text-3xl font-black text-white">{orders.length}</p>
                <p className="text-xs text-gray-500 mt-1">Total Pesanan</p>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }}>
                <p className="text-base font-black text-green-400">{formatCurrency(totalSpent)}</p>
                <p className="text-xs text-gray-500 mt-1">Total Belanja</p>
              </div>
            </div>

            {/* Rating CRM section */}
            <div className="rounded-xl p-4" style={{ background: "rgba(251,191,36,0.04)", border: "1px solid rgba(251,191,36,0.12)" }}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <MdBarChart size={16} className="text-yellow-400" />
                  <p className="text-sm font-bold text-white">Skor Kepuasan CRM</p>
                </div>
                <div className="flex items-center gap-2">
                  <StarRating value={Math.round(avgRating)} readonly size={14} />
                  <span className="text-lg font-black" style={{ color: getRatingColor(avgRating) }}>
                    {avgRating > 0 ? avgRating.toFixed(1) : "—"}
                  </span>
                </div>
              </div>

              {ratedCount > 0 ? (
                <>
                  <p className="text-xs text-gray-500 mb-3">
                    Berdasarkan {ratedCount} dari {orders.length} transaksi dinilai ·{" "}
                    <span style={{ color: getRatingColor(avgRating) }}>{getRatingLabel(avgRating)}</span>
                  </p>
                  {/* Rating distribution bar */}
                  <div className="space-y-2">
                    {ratingDist.map(({ star, count }) => (
                      <div key={star} className="flex items-center gap-2">
                        <span className="text-xs text-gray-500 w-4 text-right">{star}</span>
                        <MdStar size={11} style={{ color: "#FBBF24", flexShrink: 0 }} />
                        <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${(count / maxDist) * 100}%`,
                              background: star >= 4 ? "#22C55E" : star === 3 ? "#FBBF24" : "#EF4444",
                            }}
                          />
                        </div>
                        <span className="text-xs text-gray-600 w-4">{count}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <MdStar size={28} className="text-gray-700 mx-auto mb-2" />
                  <p className="text-gray-500 text-xs">Belum ada penilaian. Buka tab Riwayat untuk memberi rating.</p>
                </div>
              )}
            </div>

            {/* Loyalty */}
            <div className="rounded-xl p-4 text-center" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.12)" }}>
              <LoyaltyBadge loyalty={customer.loyalty} />
              <p className="text-xs text-gray-500 mt-2">Level Loyalitas</p>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ─── Customer Card (grid view) ────────────────────────────────────────
function CustomerCard({ customer, allOrders, onDetail, onEdit, onDelete }) {
  const cfg = LOYALTY[customer.loyalty] || LOYALTY.Bronze;
  const { avg: avgRating, count: ratedCount } = computeCustomerRating(customer.name, allOrders);

  return (
    <div
      onClick={() => onDetail(customer)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:-translate-y-0.5"
      style={{
        background: "linear-gradient(145deg,rgba(6,40,31,0.95),rgba(11,59,46,0.8))",
        border: "1px solid rgba(34,197,94,0.15)",
        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
      }}
    >
      <div className="h-0.5" style={{ background: cfg.color }} />
      <div className="p-4">
        <div
          className="absolute top-4 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(customer)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-yellow-400 hover:bg-yellow-500/15"
            style={{ background: "rgba(0,0,0,0.3)" }}
          >
            <MdEdit size={13} />
          </button>
          <button
            onClick={() => onDelete(customer)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/15"
            style={{ background: "rgba(0,0,0,0.3)" }}
          >
            <MdDelete size={13} />
          </button>
        </div>
        <div className="flex items-center gap-3 mb-3 pr-16">
          <Avatar customer={customer} size={48} />
          <div className="min-w-0">
            <p className="text-white font-bold text-sm truncate">{customer.name}</p>
            <p className="text-gray-500 text-xs font-mono">{customer.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <MdEmail size={12} className="text-gray-600" />
          <p className="text-xs text-gray-400 truncate">{customer.email}</p>
        </div>
        <div className="flex items-center gap-2 mb-3">
          <MdPhone size={12} className="text-gray-600" />
          <p className="text-xs text-gray-400">{customer.phone}</p>
        </div>
        <div
          className="flex items-center justify-between pt-3"
          style={{ borderTop: "1px solid rgba(34,197,94,0.08)" }}
        >
          <div className="flex flex-col gap-1.5">
            <LoyaltyBadge loyalty={customer.loyalty} size="sm" />
            {avgRating > 0 ? (
              <div className="flex items-center gap-1">
                <MdStar size={11} style={{ color: "#FBBF24" }} />
                <span className="text-xs font-bold" style={{ color: getRatingColor(avgRating) }}>
                  {avgRating.toFixed(1)}
                </span>
                <span className="text-xs text-gray-600">({ratedCount} ulasan)</span>
              </div>
            ) : (
              <span className="text-xs text-gray-600 italic">Belum dinilai</span>
            )}
          </div>
          <div className="text-right">
            <p className="text-white font-black text-sm">{customer.totalOrders} order</p>
            <p className="text-gray-600 text-xs">{customer.joinDate}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Form Modal ───────────────────────────────────────────────────────
const inputCls = "w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all focus:ring-2 focus:ring-green-500/20";
const inputStyle = { background: "rgba(11,59,46,0.5)", border: "1px solid rgba(34,197,94,0.15)" };

function FormModal({ isOpen, onClose, onSubmit, initialData, editId }) {
  const [form, setForm] = useState(initialData);
  const [previewPhoto, setPreviewPhoto] = useState(initialData.photo || "");

  useEffect(() => {
    setForm(initialData);
    setPreviewPhoto(initialData.photo || "");
  }, [initialData]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setForm((prev) => ({ ...prev, photo: reader.result }));
      setPreviewPhoto(reader.result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl overflow-hidden"
        style={{
          background: "linear-gradient(160deg,#061a14,#0a2e1e)",
          border: "1px solid rgba(34,197,94,0.2)",
          boxShadow: "0 25px 60px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: "1px solid rgba(34,197,94,0.1)" }}>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: "rgba(34,197,94,0.15)" }}>
              {editId ? <MdEdit size={15} className="text-green-400" /> : <MdAdd size={15} className="text-green-400" />}
            </div>
            <h3 className="text-white font-bold">{editId ? "Edit Pelanggan" : "Tambah Pelanggan"}</h3>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5">
            <MdClose size={18} />
          </button>
        </div>
        <form id="customer-form" onSubmit={(e) => { e.preventDefault(); onSubmit(form); }} className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto">
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Foto</label>
            <div className="flex items-center gap-3">
              {previewPhoto ? (
                <img src={previewPhoto} alt="Preview" className="w-12 h-12 rounded-xl object-cover border border-green-500/30" />
              ) : (
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white" style={{ background: "linear-gradient(135deg,#16A34A,#22C55E)" }}>
                  {form.name ? form.name[0] : "?"}
                </div>
              )}
              <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-green-400 border border-green-500/20 hover:bg-green-500/10">
                <MdPhotoCamera size={14} /> Upload
                <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Nama Lengkap <span className="text-red-500">*</span></label>
            <input required value={form.name || ""} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} placeholder="Andi Wijaya" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Email <span className="text-red-500">*</span></label>
            <input type="email" required value={form.email || ""} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} placeholder="andi@email.com" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Telepon <span className="text-red-500">*</span></label>
            <input required value={form.phone || ""} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} placeholder="0812-3456-7890" className={inputCls} style={inputStyle} />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Tingkat Loyalitas</label>
            <select value={form.loyalty || "Bronze"} onChange={(e) => setForm((f) => ({ ...f, loyalty: e.target.value }))} className={inputCls} style={inputStyle}>
              {["Bronze", "Silver", "Gold", "Platinum"].map((l) => <option key={l}>{l}</option>)}
            </select>
          </div>
        </form>
        <div className="flex gap-3 px-5 py-4" style={{ borderTop: "1px solid rgba(34,197,94,0.1)" }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all" style={{ border: "1px solid rgba(34,197,94,0.12)" }}>
            Batal
          </button>
          <button type="submit" form="customer-form" className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90 flex items-center justify-center gap-2" style={{ background: "linear-gradient(90deg,#22C55E,#16a34a)" }}>
            <MdCheck size={15} /> {editId ? "Simpan" : "Buat Pelanggan"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────
function DeleteConfirm({ target, onConfirm, onCancel }) {
  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
      onClick={onCancel}
    >
      <div
        className="w-full max-w-xs rounded-2xl p-6 text-center"
        style={{ background: "#06281F", border: "1px solid rgba(239,68,68,0.3)", boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.2)" }}>
          <MdDelete size={26} className="text-red-500" />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">Hapus Pelanggan?</h3>
        <p className="text-gray-400 text-sm mb-6">
          Pelanggan <span className="text-green-400 font-mono font-bold">{target?.name}</span> akan dihapus permanen.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5 transition-all" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
            Batal
          </button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ background: "linear-gradient(90deg,#ef4444,#dc2626)" }}>
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Halaman Utama Customers ──────────────────────────────────────────
export default function Customers() {
  const [customers, setCustomers] = useState(() => {
    try {
      const stored = localStorage.getItem("garage_customers");
      return stored ? JSON.parse(stored) : customersData;
    } catch {
      return customersData;
    }
  });
  const [allOrders, setAllOrders] = useState(() => getOrdersFromStorage());

  useEffect(() => {
    localStorage.setItem("garage_customers", JSON.stringify(customers));
  }, [customers]);

  // Refresh orders from storage when rating changes propagate
  const refreshOrders = useCallback(() => {
    setAllOrders(getOrdersFromStorage());
  }, []);

  const [search, setSearch] = useState("");
  const [filterLoyalty, setFilterLoyalty] = useState("");
  const [filterRating, setFilterRating] = useState("");
  const [sortColumn, setSortColumn] = useState("name");
  const [sortDir, setSortDir] = useState("asc");
  const [showFilter, setShowFilter] = useState(false);
  const [viewMode, setViewMode] = useState("table");
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [detailTarget, setDetailTarget] = useState(null);
  const filterRef = useRef(null);

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setShowFilter(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSort = useCallback(
    (col) => {
      if (sortColumn === col) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
      else { setSortColumn(col); setSortDir("asc"); }
    },
    [sortColumn]
  );

  // Precompute ratings per customer
  const customerRatings = useMemo(() => {
    const map = {};
    for (const c of customers) {
      map[c.id] = computeCustomerRating(c.name, allOrders);
    }
    return map;
  }, [customers, allOrders]);

  const globalAvgRating = useMemo(() => {
    const rated = Object.values(customerRatings).filter((r) => r.count > 0);
    if (rated.length === 0) return 0;
    return rated.reduce((s, r) => s + r.avg, 0) / rated.length;
  }, [customerRatings]);

  const filtered = useMemo(() => {
    let r = [...customers];
    if (search) {
      const s = search.toLowerCase();
      r = r.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s) ||
          c.phone.includes(s)
      );
    }
    if (filterLoyalty) r = r.filter((c) => c.loyalty === filterLoyalty);
    if (filterRating) {
      const minRating = Number(filterRating);
      r = r.filter((c) => {
        const { avg } = customerRatings[c.id] || { avg: 0 };
        return avg >= minRating;
      });
    }
    if (sortColumn) {
      r.sort((a, b) => {
        let av = a[sortColumn], bv = b[sortColumn];
        if (sortColumn === "totalOrders") { av = Number(av); bv = Number(bv); }
        if (sortColumn === "joinDate") { av = new Date(av); bv = new Date(bv); }
        if (sortColumn === "rating") {
          av = customerRatings[a.id]?.avg || 0;
          bv = customerRatings[b.id]?.avg || 0;
        }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return r;
  }, [customers, search, filterLoyalty, filterRating, sortColumn, sortDir, customerRatings]);

  useEffect(() => { setCurrentPage(1); }, [search, filterLoyalty, filterRating]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const activeFilters = (filterLoyalty ? 1 : 0) + (filterRating ? 1 : 0);
  const resetFilters = () => { setFilterLoyalty(""); setFilterRating(""); setSearch(""); };

  const handleAdd = () => { setEditId(null); setShowForm(true); };
  const handleEdit = (customer) => { setEditId(customer.id); setShowForm(true); };
  const handleSubmit = useCallback(
    (data) => {
      if (editId) {
        setCustomers((prev) => prev.map((c) => (c.id === editId ? { ...c, ...data } : c)));
      } else {
        const newId = `C-${String(customers.length + 1).padStart(3, "0")}`;
        setCustomers((prev) => [{ ...data, id: newId, totalOrders: 0, joinDate: new Date().toISOString().slice(0, 10) }, ...prev]);
      }
      setShowForm(false);
      setEditId(null);
    },
    [editId, customers.length]
  );

  const handleDelete = useCallback(() => {
    setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  }, [deleteTarget]);

  const exportCSV = useCallback(() => {
    const rows = [
      ["ID", "Nama", "Email", "Telepon", "Loyalty", "Total Order", "Avg Rating", "Bergabung"],
      ...filtered.map((c) => {
        const { avg, count } = customerRatings[c.id] || { avg: 0, count: 0 };
        return [c.id, c.name, c.email, c.phone, c.loyalty, c.totalOrders, avg > 0 ? avg.toFixed(1) : "", c.joinDate];
      }),
    ];
    const csv = rows.map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `customers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }, [filtered, customerRatings]);

  const totalCustomers = customers.length;
  const loyaltyCounts = {
    Platinum: customers.filter((c) => c.loyalty === "Platinum").length,
    Gold: customers.filter((c) => c.loyalty === "Gold").length,
    Silver: customers.filter((c) => c.loyalty === "Silver").length,
    Bronze: customers.filter((c) => c.loyalty === "Bronze").length,
  };

  const thCls = "text-left py-3 px-3 text-xs text-gray-600 font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-gray-400 transition-colors";

  return (
    <div className="page-animate">
      {/* ── Header ─────────────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <span>Data Pelanggan</span>
            <span className="text-sm font-normal text-gray-500 ml-1">CRM</span>
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">{totalCustomers} pelanggan terdaftar</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-green-400 transition-all hover:bg-green-500/10"
            style={{ border: "1px solid rgba(34,197,94,0.2)" }}
          >
            <MdDownload size={16} /> Export
          </button>
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:opacity-90 hover:scale-105"
            style={{ background: "linear-gradient(90deg,#22C55E,#16a34a)", boxShadow: "0 4px 18px rgba(34,197,94,0.35)" }}
          >
            <MdAdd size={18} /> Tambah Pelanggan
          </button>
        </div>
      </div>

      {/* ── Stats Bar ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mb-6">
        {[
          { label: "Total", value: totalCustomers, color: "#94A3B8", bg: "rgba(148,163,184,0.08)" },
          { label: "Platinum", value: loyaltyCounts.Platinum, color: "#A855F7", bg: "rgba(168,85,247,0.08)" },
          { label: "Gold", value: loyaltyCounts.Gold, color: "#FBBF24", bg: "rgba(251,191,36,0.08)" },
          { label: "Silver", value: loyaltyCounts.Silver, color: "#94A3B8", bg: "rgba(148,163,184,0.08)" },
          { label: "Bronze", value: loyaltyCounts.Bronze, color: "#F97316", bg: "rgba(249,115,22,0.08)" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl px-4 py-3 transition-all hover:scale-[1.02]" style={{ background: s.bg, border: `1px solid ${s.color}20` }}>
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-black" style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
        {/* Avg Rating stat */}
        <div
          className="rounded-xl px-4 py-3 transition-all hover:scale-[1.02] col-span-1"
          style={{
            background: globalAvgRating > 0 ? `${getRatingColor(globalAvgRating)}12` : "rgba(251,191,36,0.05)",
            border: `1px solid ${globalAvgRating > 0 ? getRatingColor(globalAvgRating) + "25" : "rgba(251,191,36,0.12)"}`,
          }}
        >
          <p className="text-xs text-gray-500 mb-1 flex items-center gap-1">
            <MdStar size={11} style={{ color: "#FBBF24" }} /> Avg Rating
          </p>
          <p className="text-2xl font-black" style={{ color: globalAvgRating > 0 ? getRatingColor(globalAvgRating) : "#374151" }}>
            {globalAvgRating > 0 ? globalAvgRating.toFixed(1) : "—"}
          </p>
        </div>
      </div>

      {/* ── Main Table Container ───────────────────────────────────── */}
      <div
        className="rounded-2xl overflow-hidden"
        style={{ background: "rgba(6,28,20,0.8)", border: "1px solid rgba(34,197,94,0.1)", backdropFilter: "blur(6px)" }}
      >
        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row gap-3 p-4" style={{ borderBottom: "1px solid rgba(34,197,94,0.08)" }}>
          <div className="relative flex-1">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, telepon..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-300 outline-none transition-all focus:ring-2 focus:ring-green-500/20"
              style={{ background: "rgba(11,59,46,0.5)", border: "1px solid rgba(34,197,94,0.12)" }}
            />
          </div>
          <div className="flex gap-2">
            {/* Filter dropdown */}
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilter((p) => !p)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm transition-all"
                style={
                  activeFilters > 0
                    ? { background: "rgba(34,197,94,0.15)", color: "#22C55E", border: "1px solid rgba(34,197,94,0.3)" }
                    : { background: "rgba(11,59,46,0.4)", color: "#6B7280", border: "1px solid rgba(34,197,94,0.1)" }
                }
              >
                <MdFilterList size={16} />
                {activeFilters > 0 && (
                  <span className="w-4 h-4 rounded-full text-xs font-bold text-black flex items-center justify-center" style={{ background: "#22C55E" }}>
                    {activeFilters}
                  </span>
                )}
              </button>
              {showFilter && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 rounded-2xl p-4 z-30"
                  style={{ background: "#051A0E", border: "1px solid rgba(34,197,94,0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
                >
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Filter Loyalitas</p>
                  <select
                    value={filterLoyalty}
                    onChange={(e) => setFilterLoyalty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none mb-3"
                    style={{ background: "rgba(11,59,46,0.5)", border: "1px solid rgba(34,197,94,0.15)" }}
                  >
                    <option value="">Semua Tier</option>
                    {["Platinum", "Gold", "Silver", "Bronze"].map((l) => <option key={l}>{l}</option>)}
                  </select>
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-2">Filter Rating</p>
                  <select
                    value={filterRating}
                    onChange={(e) => setFilterRating(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none mb-3"
                    style={{ background: "rgba(11,59,46,0.5)", border: "1px solid rgba(34,197,94,0.15)" }}
                  >
                    <option value="">Semua Rating</option>
                    <option value="4.5">⭐ 4.5+ (Sangat Puas)</option>
                    <option value="4">⭐ 4.0+ (Puas)</option>
                    <option value="3">⭐ 3.0+ (Cukup)</option>
                    <option value="2">⭐ 2.0+ (Kurang)</option>
                  </select>
                  <button
                    onClick={resetFilters}
                    className="w-full py-2 rounded-xl text-xs text-red-400 transition-all hover:bg-red-500/10"
                    style={{ border: "1px solid rgba(239,68,68,0.2)" }}
                  >
                    Reset Filter
                  </button>
                </div>
              )}
            </div>

            {/* View toggle */}
            <div className="flex rounded-xl overflow-hidden" style={{ border: "1px solid rgba(34,197,94,0.12)" }}>
              {[
                { id: "table", icon: <MdTableRows size={16} /> },
                { id: "grid", icon: <MdGridView size={16} /> },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setViewMode(v.id)}
                  className="w-9 h-9 flex items-center justify-center transition-all"
                  style={viewMode === v.id ? { background: "rgba(34,197,94,0.2)", color: "#22C55E" } : { background: "rgba(11,59,46,0.4)", color: "#4B5563" }}
                >
                  {v.icon}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── Table View ─────────────────────────────────────────── */}
        {viewMode === "table" && (
          <div className="overflow-x-auto">
            <table className="w-full" style={{ minWidth: 960 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(34,197,94,0.08)" }}>
                  {[
                    { key: "id", label: "ID" },
                    { key: "photo", label: "Foto", noSort: true },
                    { key: "name", label: "Nama" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Telepon" },
                    { key: "loyalty", label: "Loyalty" },
                    { key: "totalOrders", label: "Order" },
                    { key: "rating", label: "Rating CRM" },
                    { key: "joinDate", label: "Bergabung" },
                    { key: "aksi", label: "Aksi", noSort: true },
                  ].map((col) => (
                    <th key={col.key} className={thCls} onClick={() => !col.noSort && handleSort(col.key)}>
                      <span className="flex items-center gap-1">
                        {col.label}
                        {!col.noSort && <SortIcon column={col.key} sortColumn={sortColumn} sortDirection={sortDir} />}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((customer) => {
                  const { avg, count } = customerRatings[customer.id] || { avg: 0, count: 0 };
                  return (
                    <tr
                      key={customer.id}
                      onClick={() => { setDetailTarget(customer); refreshOrders(); }}
                      className="cursor-pointer transition-colors hover:bg-green-500/[0.04]"
                      style={{ borderBottom: "1px solid rgba(34,197,94,0.05)" }}
                    >
                      <td className="py-3 px-3 text-xs text-green-400 font-mono whitespace-nowrap">{customer.id}</td>
                      <td className="py-3 px-3">
                        <Avatar customer={customer} size={34} />
                      </td>
                      <td className="py-3 px-3 text-sm text-white font-medium whitespace-nowrap">{customer.name}</td>
                      <td className="py-3 px-3 text-sm text-gray-400">{customer.email}</td>
                      <td className="py-3 px-3 text-sm text-gray-400 whitespace-nowrap">{customer.phone}</td>
                      <td className="py-3 px-3"><LoyaltyBadge loyalty={customer.loyalty} size="sm" /></td>
                      <td className="py-3 px-3 text-sm text-white font-semibold">{customer.totalOrders}</td>
                      {/* Rating column */}
                      <td className="py-3 px-3">
                        {avg > 0 ? (
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5">
                              <StarRating value={Math.round(avg)} readonly size={12} />
                              <span className="text-xs font-bold" style={{ color: getRatingColor(avg) }}>{avg.toFixed(1)}</span>
                            </div>
                            <span className="text-xs text-gray-600">{count} ulasan</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-700 italic">Belum dinilai</span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">{customer.joinDate}</td>
                      <td className="py-3 px-3" onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                              style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)", color: "#6B7280" }}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                <circle cx="12" cy="5" r="2" /><circle cx="12" cy="12" r="2" /><circle cx="12" cy="19" r="2" />
                              </svg>
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" className="w-44" style={{ background: "#061a14", border: "1px solid rgba(34,197,94,0.2)" }}>
                            <DropdownMenuLabel className="text-gray-400 text-xs">Aksi Pelanggan</DropdownMenuLabel>
                            <DropdownMenuSeparator style={{ background: "rgba(34,197,94,0.1)" }} />
                            <DropdownMenuItem onClick={() => { setDetailTarget(customer); refreshOrders(); }} className="cursor-pointer text-gray-300 hover:text-white focus:text-white focus:bg-green-500/10">
                              <MdPerson size={14} className="mr-2 text-blue-400" /> Lihat Detail
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(customer)} className="cursor-pointer text-gray-300 hover:text-white focus:text-white focus:bg-yellow-500/10">
                              <MdEdit size={14} className="mr-2 text-yellow-400" /> Edit Pelanggan
                            </DropdownMenuItem>
                            <DropdownMenuSeparator style={{ background: "rgba(34,197,94,0.1)" }} />
                            <DropdownMenuItem onClick={() => setDeleteTarget(customer)} className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10">
                              <MdDelete size={14} className="mr-2" /> Hapus Pelanggan
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 flex flex-col items-center gap-3">
                <MdPerson size={48} className="text-gray-700" />
                <p className="text-gray-600 text-sm">Tidak ada pelanggan ditemukan</p>
                <button onClick={resetFilters} className="text-green-500 text-xs hover:underline flex items-center gap-1">
                  <MdRefresh size={13} /> Reset filter
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Grid View ──────────────────────────────────────────── */}
        {viewMode === "grid" && (
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {paginatedData.map((customer) => (
              <CustomerCard
                key={customer.id}
                customer={customer}
                allOrders={allOrders}
                onDetail={(c) => { setDetailTarget(c); refreshOrders(); }}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-16 flex flex-col items-center gap-3">
                <MdPerson size={48} className="text-gray-700" />
                <p className="text-gray-600 text-sm">Tidak ada pelanggan ditemukan</p>
              </div>
            )}
          </div>
        )}

        {/* Pagination footer */}
        <div className="px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4" style={{ borderTop: "1px solid rgba(34,197,94,0.06)" }}>
          <p className="text-xs text-gray-600">
            Menampilkan{" "}
            <span className="text-gray-300 font-semibold">{filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span>
            {" "}–{" "}
            <span className="text-gray-300 font-semibold">{Math.min(currentPage * itemsPerPage, filtered.length)}</span>
            {" "}dari{" "}
            <span className="text-green-500 font-semibold">{filtered.length}</span> pelanggan
            {activeFilters > 0 && " (disaring)"}
          </p>
          {filtered.length > 0 && totalPages > 1 && (
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
          )}
        </div>
      </div>

      {/* Dialogs */}
      {detailTarget && (
        <CustomerDetailDialog
          customer={detailTarget}
          isOpen={!!detailTarget}
          onClose={() => { setDetailTarget(null); refreshOrders(); }}
          onEdit={(c) => { setDetailTarget(null); handleEdit(c); }}
          onDelete={(c) => { setDetailTarget(null); setDeleteTarget(c); }}
        />
      )}

      <FormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditId(null); }}
        onSubmit={handleSubmit}
        initialData={
          editId
            ? customers.find((c) => c.id === editId) || {}
            : { name: "", email: "", phone: "", loyalty: "Bronze", photo: "" }
        }
        editId={editId}
      />

      {deleteTarget && (
        <DeleteConfirm
          target={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
