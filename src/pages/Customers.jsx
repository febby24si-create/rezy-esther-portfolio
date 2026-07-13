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
  MdOpenInNew,
  MdPeople,
  MdWorkspacePremium,
  MdEmojiEvents,
  MdMilitaryTech,
  MdVerified,
} from "react-icons/md";
import { motion, AnimatePresence } from "framer-motion";
import Pagination from "../components/Pagination";
import customersData from "../data/customersData.json";
import { getCustomerAvatar } from "../utils/randomAvatar";
import { useCustomerStore } from "../hooks/useCustomerStore";
import { calcTier } from "../lib/loyaltyConstants";
import { orderAPI } from "../services/orderAPI";
import CustomerDetail from "./CustomerDetail";

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

// ─── Loyalty & Points helpers ──────────────────────────────────────
// PERBAIKAN BUG: sebelumnya file ini punya logika tier SENDIRI, terpisah
// dari calcTier() asli (lib/loyaltyConstants.js) yang dipakai di
// MembershipAdmin.jsx & seluruh member area. Threshold-nya juga beda jauh
// (25/50/80 di sini vs 500/1500/3000 yang asli), DAN "points" dihitung
// ulang dari jumlah order yang diambil dari sessionStorage('garage_orders')
// — key yang sudah tidak pernah diisi lagi sejak Orders.jsx pindah ke
// Supabase. Hasilnya: totalOrders selalu 0 -> points selalu 0 -> SEMUA
// customer selalu "Bronze", padahal customer.points asli di Supabase
// sudah bervariasi sehat (2 - 4948 poin di data production).
//
// Sekarang getLoyaltyFromPoints cuma alias tipis ke calcTier() asli,
// dan "points" yang dipakai adalah customer.points langsung dari Supabase
// (lihat customerPoints useMemo & CustomerCard di bawah).
const getLoyaltyFromPoints = calcTier;

const getLoyaltyConfig = (loyalty) => {
  const configs = {
    Platinum: {
      color: "#A855F7",
      bg: "rgba(168,85,247,0.12)",
      border: "rgba(168,85,247,0.25)",
      dot: "#A855F7",
      icon: "💎",
      gradient: "linear-gradient(135deg, #A855F7, #7C3AED)"
    },
    Gold: {
      color: "#FBBF24",
      bg: "rgba(251,191,36,0.12)",
      border: "rgba(251,191,36,0.25)",
      dot: "#FBBF24",
      icon: "🥇",
      gradient: "linear-gradient(135deg, #FBBF24, #F59E0B)"
    },
    Silver: {
      color: "#94A3B8",
      bg: "rgba(148,163,184,0.1)",
      border: "rgba(148,163,184,0.2)",
      dot: "#94A3B8",
      icon: "🥈",
      gradient: "linear-gradient(135deg, #94A3B8, #64748B)"
    },
    Bronze: {
      color: "#F97316",
      bg: "rgba(249,115,22,0.1)",
      border: "rgba(249,115,22,0.2)",
      dot: "#F97316",
      icon: "🥉",
      gradient: "linear-gradient(135deg, #F97316, #EA580C)"
    },
  };
  return configs[loyalty] || configs.Bronze;
};

// ─── Format currency ─────────────────────────────────────────────────
const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return "Rp 0";
  return "Rp " + num.toLocaleString("id-ID");
};

// ─── LoyaltyBadge ────────────────────────────────────────────────────
function LoyaltyBadge({ loyalty, size = "md" }) {
  const cfg = getLoyaltyConfig(loyalty);
  const pad = size === "sm" ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";
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
        className="rounded-xl object-cover w-full h-full border border-green-500/20"
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

// ─── Order Card ────────────────────────────────────────────────────────
function OrderCard({ order }) {
  const statusColor =
    order.status === "Selesai" ? "#22C55E"
    : order.status === "Sedang Dikerjakan" ? "#FBBF24"
    : "#94A3B8";

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-4 rounded-2xl hover:scale-[1.01] transition-all"
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
    </motion.div>
  );
}

// ─── Customer Detail Dialog ───────────────────────────────────────────
function CustomerDetailDialog({ customer, isOpen, onClose, onEdit, onDelete }) {
  const [orders, setOrders] = useState([]);

  const refreshOrders = useCallback(() => {
    if (!customer) return;
    orderAPI.fetchByCustomer(customer.id)
      .then(data => setOrders((data || []).map(o => ({ ...o, date: o.order_date }))))
      .catch(() => setOrders([]));
  }, [customer]);

  useEffect(() => {
    refreshOrders();
  }, [refreshOrders]);

  if (!customer) return null;

  // Pakai statistik ASLI dari Supabase (customer.total_spent/total_orders/points),
  // bukan dihitung ulang dari `orders` — lebih akurat karena mencakup seluruh
  // riwayat customer, bukan cuma order yang kebetulan ter-fetch di sesi ini.
  const totalSpent = customer.total_spent || 0;
  const totalOrders = customer.total_orders || orders.length;
  const points = customer.points || 0;
  const loyalty = getLoyaltyFromPoints(points);
  const cfg = getLoyaltyConfig(loyalty);

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
        <div className="h-1" style={{ background: cfg.gradient }} />

        <DialogHeader className="px-5 pt-5 pb-4">
          <div className="flex items-start gap-4">
            <Avatar customer={customer} size={60} />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-black text-white truncate">
                {customer.name}
              </DialogTitle>
              <DialogDescription className="mt-1.5 flex items-center flex-wrap gap-2">
                <span className="text-gray-500 font-mono text-xs">{customer.id}</span>
                <LoyaltyBadge loyalty={loyalty} size="sm" />
                <span className="text-xs text-gray-400 flex items-center gap-1">
                  <span className="text-yellow-400">★</span> {points} poin
                </span>
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <Tabs defaultValue="info" className="px-5 pb-5">
          <TabsList
            className="w-full mb-4 p-0.5"
            style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }}
          >
            {[
              { id: "info", label: "ℹ️ Info" },
              { id: "orders", label: `📦 Riwayat (${orders.length})` },
              { id: "stats", label: "📊 Statistik" },
            ].map((tab) => (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex-1 text-xs py-2 data-[state=active]:text-green-400 data-[state=active]:bg-green-500/10 data-[state=active]:font-semibold"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="info" className="space-y-3 mt-0">
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.1)" }}
            >
              {[
                { icon: MdEmail, label: "Email", value: customer.email },
                { icon: MdPhone, label: "Telepon", value: customer.phone },
                { icon: MdCalendarToday, label: "Bergabung", value: customer.joinDate },
                { icon: MdShoppingBag, label: "Total Pesanan", value: `${totalOrders} order`, bold: true },
                { icon: MdStar, label: "Poin Loyalitas", value: `${points} poin`, bold: true },
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

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(34,197,94,0.05)", border: "1px solid rgba(34,197,94,0.1)" }}>
                <p className="text-lg font-black text-white">{totalOrders}</p>
                <p className="text-xs text-gray-500 mt-0.5">Transaksi</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.12)" }}>
                <p className="text-sm font-black text-green-400">{totalOrders > 0 ? formatCurrency(totalSpent / totalOrders) : "—"}</p>
                <p className="text-xs text-gray-500 mt-0.5">Avg/Order</p>
              </div>
              <div className="rounded-xl p-3 text-center" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.2)" }}>
                <p className="text-lg font-black text-white">{points}</p>
                <p className="text-xs text-gray-500 mt-0.5">Total Poin</p>
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

          <TabsContent value="orders" className="mt-0">
            {orders.length === 0 ? (
              <div className="text-center py-10">
                <MdReceipt size={40} className="text-gray-700 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Belum ada pesanan</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
                {orders.map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="stats" className="mt-0 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 text-center" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }}>
                <p className="text-3xl font-black text-white">{totalOrders}</p>
                <p className="text-xs text-gray-500 mt-1">Total Pesanan</p>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.12)" }}>
                <p className="text-base font-black text-green-400">{formatCurrency(totalSpent)}</p>
                <p className="text-xs text-gray-500 mt-1">Total Belanja</p>
              </div>
            </div>

            <div className="rounded-xl p-4 text-center" style={{ background: "rgba(168,85,247,0.06)", border: "1px solid rgba(168,85,247,0.15)" }}>
              <div className="flex items-center justify-center gap-3">
                <span className="text-2xl">{cfg.icon}</span>
                <div>
                  <p className="text-lg font-black text-white">{loyalty}</p>
                  <p className="text-xs text-gray-500">{points} poin loyalitas</p>
                </div>
              </div>
              <div className="mt-3 h-2 w-full rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.05)" }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${Math.min((points / 100) * 100, 100)}%`,
                    background: cfg.gradient,
                  }}
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {points < 25 ? "25 poin untuk Silver" :
                 points < 50 ? "50 poin untuk Gold" :
                 points < 80 ? "80 poin untuk Platinum" :
                 "Level tertinggi! 🎉"}
              </p>
            </div>

            <div className="rounded-xl p-4" style={{ background: "rgba(34,197,94,0.04)", border: "1px solid rgba(34,197,94,0.1)" }}>
              <p className="text-xs text-gray-500 uppercase tracking-wider mb-3">Level Loyalitas</p>
              {["Platinum", "Gold", "Silver", "Bronze"].map((level) => {
                const lvlCfg = getLoyaltyConfig(level);
                return (
                  <div key={level} className="flex items-center gap-3 py-1.5">
                    <span className="w-20 text-xs font-medium" style={{ color: lvlCfg.color }}>
                      {lvlCfg.icon} {level}
                    </span>
                    <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.04)" }}>
                      <div
                        className="h-full rounded-full transition-all duration-600"
                        style={{
                          width: `${level === loyalty ? 100 : 0}%`,
                          background: lvlCfg.gradient,
                        }}
                      />
                    </div>
                    <span className="text-xs text-gray-500">
                      {level === loyalty ? "✔️" : "—"}
                    </span>
                  </div>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

// ─── Customer Card ──────────────────────────────────────────────────
function CustomerCard({ customer, onDetail, onEdit, onDelete, onProfile }) {
  const points = customer.points || 0;
  const totalOrders = customer.total_orders || customer.totalOrders || 0;
  const loyalty = getLoyaltyFromPoints(points);
  const cfg = getLoyaltyConfig(loyalty);

  const isNew = customer.joinDate && (new Date() - new Date(customer.joinDate)) < 7 * 24 * 60 * 60 * 1000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      onClick={() => onDetail(customer)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer"
      style={{
        background: "linear-gradient(145deg,rgba(6,40,31,0.95),rgba(11,59,46,0.8))",
        border: `1px solid ${cfg.border}`,
        boxShadow: "0 4px 24px rgba(0,0,0,0.2)",
      }}
    >
      <div className="h-0.5" style={{ background: cfg.gradient }} />
      
      {isNew && (
        <div className="absolute top-3 right-3 z-10">
          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-green-500/20 text-green-400 border border-green-500/30">
            ✦ Baru
          </span>
        </div>
      )}

      <div className="p-4">
        <div
          className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={() => onEdit(customer)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-yellow-400 hover:bg-yellow-500/15 transition-all"
            style={{ background: "rgba(0,0,0,0.3)" }}
          >
            <MdEdit size={13} />
          </button>
          <button
            onClick={() => onDelete(customer)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-500/15 transition-all"
            style={{ background: "rgba(0,0,0,0.3)" }}
          >
            <MdDelete size={13} />
          </button>
          {onProfile && (
            <button
              onClick={() => onProfile(customer)}
              className="w-7 h-7 rounded-lg flex items-center justify-center text-blue-400 hover:bg-blue-500/15 transition-all"
              style={{ background: "rgba(0,0,0,0.3)" }}
            >
              <MdOpenInNew size={13} />
            </button>
          )}
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
            <LoyaltyBadge loyalty={loyalty} size="sm" />
            <div className="flex items-center gap-1">
              <span className="text-xs text-yellow-400">★</span>
              <span className="text-xs font-bold text-white">{points}</span>
              <span className="text-xs text-gray-500">poin</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-white font-black text-sm">{totalOrders} order</p>
            <p className="text-gray-600 text-xs">{customer.joinDate}</p>
          </div>
        </div>
      </div>
    </motion.div>
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
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(6px)" }}
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
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
            <button onClick={onClose} className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 transition-all">
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
                <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-green-400 border border-green-500/20 hover:bg-green-500/10 transition-all">
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
            <div className="flex items-center gap-2 p-3 rounded-xl" style={{ background: "rgba(251,191,36,0.05)", border: "1px solid rgba(251,191,36,0.1)" }}>
              <MdStar size={14} className="text-yellow-500/60 flex-shrink-0" />
              <p className="text-xs text-gray-400">Level loyalitas dan poin dihitung otomatis berdasarkan riwayat order.</p>
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
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Delete Confirm ───────────────────────────────────────────────────
function DeleteConfirm({ target, onConfirm, onCancel }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[60] flex items-center justify-center p-4"
        style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
        onClick={onCancel}
      >
        <motion.div
          initial={{ scale: 0.9, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.9, y: 20 }}
          className="w-full max-w-xs rounded-2xl p-6 text-center"
          style={{ background: "linear-gradient(160deg, #0a2a1f, #061a14)", border: "1px solid rgba(239,68,68,0.3)", boxShadow: "0 30px 80px rgba(0,0,0,0.6)" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239,68,68,0.1)", border: "2px solid rgba(239,68,68,0.2)" }}>
            <MdDelete size={28} className="text-red-500" />
          </div>
          <h3 className="text-white font-bold text-lg mb-2">Hapus Pelanggan?</h3>
          <p className="text-gray-400 text-sm mb-6">
            Pelanggan <span className="text-green-400 font-mono font-bold">{target?.name}</span> akan dihapus permanen.
          </p>
          <div className="flex gap-3">
            <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all" style={{ border: "1px solid rgba(255,255,255,0.06)" }}>
              Batal
            </button>
            <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg,#ef4444,#dc2626)" }}>
              Hapus
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Halaman Utama ──────────────────────────────────────────────────
export default function Customers() {
  const { customers, setCustomers, addCustomer, updateCustomer, deleteCustomer } = useCustomerStore();
  const [profileTarget, setProfileTarget] = useState(null);

  const [search, setSearch] = useState("");
  const [filterLoyalty, setFilterLoyalty] = useState("");
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

  const customerPoints = useMemo(() => {
    const map = {};
    for (const c of customers) {
      const points = c.points || 0;
      const totalOrders = c.total_orders || c.totalOrders || 0;
      const loyalty = getLoyaltyFromPoints(points);
      map[c.id] = { points, loyalty, totalOrders };
    }
    return map;
  }, [customers]);

  const globalAvgPoints = useMemo(() => {
    const allPoints = Object.values(customerPoints).map(p => p.points);
    if (allPoints.length === 0) return 0;
    return allPoints.reduce((a, b) => a + b, 0) / allPoints.length;
  }, [customerPoints]);

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
    if (filterLoyalty) r = r.filter((c) => {
      const { loyalty } = customerPoints[c.id] || { loyalty: "Bronze" };
      return loyalty === filterLoyalty;
    });
    if (sortColumn) {
      r.sort((a, b) => {
        let av = a[sortColumn], bv = b[sortColumn];
        if (sortColumn === "totalOrders") { av = Number(av); bv = Number(bv); }
        if (sortColumn === "joinDate") { av = new Date(av); bv = new Date(bv); }
        if (sortColumn === "points") {
          av = customerPoints[a.id]?.points || 0;
          bv = customerPoints[b.id]?.points || 0;
        }
        if (sortColumn === "loyalty") {
          const order = { Platinum: 4, Gold: 3, Silver: 2, Bronze: 1 };
          av = order[customerPoints[a.id]?.loyalty || "Bronze"];
          bv = order[customerPoints[b.id]?.loyalty || "Bronze"];
        }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return r;
  }, [customers, search, filterLoyalty, sortColumn, sortDir, customerPoints]);

  useEffect(() => { setCurrentPage(1); }, [search, filterLoyalty]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const activeFilters = filterLoyalty ? 1 : 0;
  const resetFilters = () => { setFilterLoyalty(""); setSearch(""); };

  const handleAdd = () => { setEditId(null); setShowForm(true); };
  const handleEdit = (customer) => { setEditId(customer.id); setShowForm(true); };
  const handleSubmit = useCallback(
    async (data) => {
      if (editId) {
        await updateCustomer(editId, data);
      } else {
        await addCustomer({
          ...data,
          total_orders: 0,
          join_date: new Date().toISOString().slice(0, 10),
          points: 0,
          membership_status: 'non-member',
          is_active: true,
        });
      }
      setShowForm(false);
      setEditId(null);
    },
    [editId, addCustomer, updateCustomer]
  );

  const handleDelete = useCallback(async () => {
    await deleteCustomer(deleteTarget.id);
    setDeleteTarget(null);
  }, [deleteTarget, deleteCustomer]);

  const exportCSV = useCallback(() => {
    const rows = [
      ["ID", "Nama", "Email", "Telepon", "Level", "Poin", "Total Order", "Bergabung"],
      ...filtered.map((c) => {
        const { points, loyalty, totalOrders } = customerPoints[c.id] || { points: 0, loyalty: "Bronze", totalOrders: 0 };
        return [c.id, c.name, c.email, c.phone, loyalty, points, totalOrders, c.joinDate];
      }),
    ];
    const csv = rows.map((r) => r.map((cell) => `"${cell}"`).join(",")).join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `customers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }, [filtered, customerPoints]);

  const totalCustomers = customers.length;
  const loyaltyCounts = {
    Platinum: customers.filter(c => customerPoints[c.id]?.loyalty === "Platinum").length,
    Gold: customers.filter(c => customerPoints[c.id]?.loyalty === "Gold").length,
    Silver: customers.filter(c => customerPoints[c.id]?.loyalty === "Silver").length,
    Bronze: customers.filter(c => customerPoints[c.id]?.loyalty === "Bronze").length,
  };

  const thCls = "text-left py-3 px-3 text-xs text-gray-600 font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-gray-400 transition-colors";

  return (
    <div className="min-h-screen" style={{ background: 'radial-gradient(circle at 10% 20%, #072e1f, #03120c)' }}>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
              <span className="bg-gradient-to-r from-green-300 to-emerald-500 bg-clip-text text-transparent">
                Data Pelanggan
              </span>
              <span className="text-sm font-normal text-gray-500 bg-white/5 px-3 py-1 rounded-full">
                {totalCustomers} terdaftar
              </span>
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <MdPeople size={14} className="text-green-600" />
              {loyaltyCounts.Platinum} Platinum · {loyaltyCounts.Gold} Gold · {loyaltyCounts.Silver} Silver · {loyaltyCounts.Bronze} Bronze
            </p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={exportCSV}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-green-400 transition-all hover:bg-green-500/10"
              style={{ border: "1px solid rgba(34,197,94,0.2)" }}
            >
              <MdDownload size={16} /> Export
            </button>
            <button
              onClick={handleAdd}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-black transition-all hover:scale-105 active:scale-95"
              style={{ background: "linear-gradient(135deg,#22C55E,#16a34a)", boxShadow: "0 8px 24px rgba(34,197,94,0.35)" }}
            >
              <MdAdd size={18} /> Tambah Pelanggan
            </button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4 mb-8">
          {[
            { label: "Total", value: totalCustomers, icon: <MdPeople size={18}/>, color: "#94A3B8", bg: "rgba(148,163,184,0.06)" },
            { label: "Platinum", value: loyaltyCounts.Platinum, icon: <MdWorkspacePremium size={18}/>, color: "#A855F7", bg: "rgba(168,85,247,0.06)" },
            { label: "Gold", value: loyaltyCounts.Gold, icon: <MdEmojiEvents size={18}/>, color: "#FBBF24", bg: "rgba(251,191,36,0.06)" },
            { label: "Silver", value: loyaltyCounts.Silver, icon: <MdMilitaryTech size={18}/>, color: "#94A3B8", bg: "rgba(148,163,184,0.06)" },
            { label: "Bronze", value: loyaltyCounts.Bronze, icon: <MdVerified size={18}/>, color: "#F97316", bg: "rgba(249,115,22,0.06)" },
            { 
              label: "Rata-rata Poin", 
              value: globalAvgPoints > 0 ? Math.round(globalAvgPoints) : "—", 
              icon: <MdStar size={18}/>, 
              color: "#FBBF24", 
              bg: "rgba(251,191,36,0.05)" 
            },
          ].map((s) => (
            <motion.div
              key={s.label}
              whileHover={{ scale: 1.02 }}
              className="rounded-2xl px-4 py-3 transition-all"
              style={{ background: s.bg, border: `1px solid ${s.color}15` }}
            >
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-500">{s.label}</p>
                <span style={{ color: s.color, opacity: 0.6 }}>{s.icon}</span>
              </div>
              <p className="text-2xl font-black mt-1" style={{ color: s.color }}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Container */}
        <div
          className="rounded-2xl overflow-hidden"
          style={{ background: "rgba(6,28,20,0.7)", border: "1px solid rgba(34,197,94,0.1)", backdropFilter: "blur(8px)" }}
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
                style={{ background: "rgba(11,59,46,0.4)", border: "1px solid rgba(34,197,94,0.12)" }}
              />
            </div>
            <div className="flex gap-2">
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
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-full mt-2 w-64 rounded-2xl p-4 z-30"
                    style={{ background: "#051A0E", border: "1px solid rgba(34,197,94,0.2)", boxShadow: "0 20px 40px rgba(0,0,0,0.4)" }}
                  >
                    <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">Filter Level</p>
                    <select
                      value={filterLoyalty}
                      onChange={(e) => setFilterLoyalty(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none mb-3"
                      style={{ background: "rgba(11,59,46,0.5)", border: "1px solid rgba(34,197,94,0.15)" }}
                    >
                      <option value="">Semua Level</option>
                      {["Platinum", "Gold", "Silver", "Bronze"].map((l) => <option key={l}>{l}</option>)}
                    </select>
                    <button
                      onClick={resetFilters}
                      className="w-full py-2 rounded-xl text-xs text-red-400 transition-all hover:bg-red-500/10"
                      style={{ border: "1px solid rgba(239,68,68,0.2)" }}
                    >
                      Reset Filter
                    </button>
                  </motion.div>
                )}
              </div>

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

          {/* Table View */}
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
                      { key: "loyalty", label: "Level" },
                      { key: "points", label: "Poin" },
                      { key: "totalOrders", label: "Order" },
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
                    const { points, loyalty, totalOrders } = customerPoints[customer.id] || { points: 0, loyalty: "Bronze", totalOrders: 0 };
                    const isNew = customer.joinDate && (new Date() - new Date(customer.joinDate)) < 7 * 24 * 60 * 60 * 1000;
                    return (
                      <motion.tr
                        key={customer.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        onClick={() => setDetailTarget(customer)}
                        className="cursor-pointer transition-colors hover:bg-green-500/[0.04]"
                        style={{ borderBottom: "1px solid rgba(34,197,94,0.05)" }}
                      >
                        <td className="py-3 px-3 text-xs text-green-400 font-mono whitespace-nowrap">{customer.id}</td>
                        <td className="py-3 px-3">
                          <Avatar customer={customer} size={34} />
                        </td>
                        <td className="py-3 px-3 text-sm text-white font-medium whitespace-nowrap flex items-center gap-1.5">
                          {customer.name}
                          {isNew && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-green-500/20 text-green-400 border border-green-500/30">New</span>}
                        </td>
                        <td className="py-3 px-3 text-sm text-gray-400">{customer.email}</td>
                        <td className="py-3 px-3 text-sm text-gray-400 whitespace-nowrap">{customer.phone}</td>
                        <td className="py-3 px-3"><LoyaltyBadge loyalty={loyalty} size="sm" /></td>
                        <td className="py-3 px-3 text-sm font-bold text-yellow-400">{points}</td>
                        <td className="py-3 px-3 text-sm text-white font-semibold">{totalOrders}</td>
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
                              <DropdownMenuItem onClick={() => setDetailTarget(customer)} className="cursor-pointer text-gray-300 hover:text-white focus:text-white focus:bg-green-500/10">
                                <MdPerson size={14} className="mr-2 text-blue-400" /> Lihat Detail
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setProfileTarget(customer)} className="cursor-pointer text-gray-300 hover:text-white focus:text-white focus:bg-blue-500/10">
                                <MdOpenInNew size={14} className="mr-2 text-green-400" /> Profil Lengkap
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
                      </motion.tr>
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

          {/* Grid View */}
          {viewMode === "grid" && (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginatedData.map((customer) => (
                <CustomerCard
                  key={customer.id}
                  customer={customer}
                  onDetail={(c) => setDetailTarget(c)}
                  onProfile={(c) => setProfileTarget(c)}
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

          {/* Pagination */}
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
      </div>

      {/* Profil lengkap (CustomerDetail) */}
      {profileTarget && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end"
          style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
          onClick={(e) => { if (e.target === e.currentTarget) setProfileTarget(null) }}
        >
          <div
            className="h-full w-full max-w-2xl overflow-y-auto"
            style={{ background: '#041C15', borderLeft: '1px solid rgba(34,197,94,0.15)' }}
          >
            <CustomerDetail
              customerId={profileTarget.id}
              onClose={() => setProfileTarget(null)}
            />
          </div>
        </div>
      )}

      {/* Detail Dialog */}
      {detailTarget && (
        <CustomerDetailDialog
          customer={detailTarget}
          isOpen={!!detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={(c) => { setDetailTarget(null); handleEdit(c); }}
          onDelete={(c) => { setDetailTarget(null); setDeleteTarget(c); }}
        />
      )}

      {/* Form Modal */}
      <FormModal
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditId(null); }}
        onSubmit={handleSubmit}
        initialData={
          editId
            ? customers.find((c) => c.id === editId) || {}
            : { name: "", email: "", phone: "", photo: "" }
        }
        editId={editId}
      />

      {/* Delete Confirm */}
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