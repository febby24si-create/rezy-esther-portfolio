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
  MdContentCopy,
  MdCheck,
} from "react-icons/md";
import Pagination from "../components/Pagination";
import customersData from "../data/customersData.json";

// ─── Import Shadcn UI Components ─────────────────────────────────────
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

// ─── Helper untuk ambil orders dari localStorage ─────────────────────
const getOrdersFromStorage = () => {
  const stored = localStorage.getItem("garage_orders");
  return stored ? JSON.parse(stored) : [];
};

// ─── Format currency ─────────────────────────────────────────────────
const formatCurrency = (amount) => {
  const num = Number(amount);
  if (isNaN(num)) return "Rp 0";
  return "Rp " + num.toLocaleString("id-ID");
};

// ─── Loyalty config ──────────────────────────────────────────────────
const LOYALTY = {
  Platinum: {
    color: "#A855F7",
    bg: "rgba(168,85,247,0.12)",
    border: "rgba(168,85,247,0.25)",
    dot: "#A855F7",
  },
  Gold: {
    color: "#FBBF24",
    bg: "rgba(251,191,36,0.12)",
    border: "rgba(251,191,36,0.25)",
    dot: "#FBBF24",
  },
  Silver: {
    color: "#94A3B8",
    bg: "rgba(148,163,184,0.1)",
    border: "rgba(148,163,184,0.2)",
    dot: "#94A3B8",
  },
  Bronze: {
    color: "#F97316",
    bg: "rgba(249,115,22,0.1)",
    border: "rgba(249,115,22,0.2)",
    dot: "#F97316",
  },
};

function LoyaltyBadge({ loyalty, size = "md" }) {
  const cfg = LOYALTY[loyalty] || LOYALTY.Bronze;
  const pad = size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-xs";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold ${pad}`}
      style={{
        background: cfg.bg,
        color: cfg.color,
        border: `1px solid ${cfg.border}`,
      }}
    >
      <span
        className="w-1.5 h-1.5 rounded-full flex-shrink-0"
        style={{ background: cfg.dot }}
      />
      {loyalty}
    </span>
  );
}

// ─── Avatar (untuk foto profil atau inisial) ─────────────────────────
function Avatar({ customer, size = 32 }) {
  if (customer.photo) {
    return (
      <img
        src={customer.photo}
        alt={customer.name}
        className="rounded-xl object-cover flex-shrink-0"
        style={{ width: size, height: size }}
      />
    );
  }
  const getInitials = (name) => {
    if (!name) return "?";
    const parts = name.trim().split(/\s+/);
    return parts.length === 1
      ? parts[0][0].toUpperCase()
      : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };
  return (
    <div
      className="rounded-xl flex items-center justify-center font-bold text-white flex-shrink-0"
      style={{
        width: size,
        height: size,
        fontSize: size * 0.35,
        background: "linear-gradient(135deg,#16A34A,#22C55E)",
      }}
    >
      {getInitials(customer.name)}
    </div>
  );
}

// ─── Detail Drawer (dengan riwayat order) ───────────────────────────
function DetailDrawer({ customer, onClose, onEdit, onDelete }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const allOrders = getOrdersFromStorage();
    const custOrders = allOrders.filter(
      (order) => order.customer === customer.name,
    );
    setOrders(custOrders);
  }, [customer.name]);

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0);

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end"
      style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md h-full overflow-y-auto flex flex-col"
        style={{
          background: "linear-gradient(160deg,#061a14 0%,#082b1e 100%)",
          borderLeft: "1px solid rgba(34,197,94,0.2)",
          boxShadow: "-20px 0 60px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="h-1 flex-shrink-0"
          style={{
            background: `linear-gradient(90deg,${LOYALTY[customer.loyalty]?.color},${LOYALTY[customer.loyalty]?.color}88)`,
          }}
        />
        <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-white hover:scale-110 transition-all"
            style={{ background: "rgba(255,255,255,0.06)" }}
          >
            <MdArrowBack size={18} />
          </button>
          <div className="flex gap-2">
            <button
              onClick={() => {
                onClose();
                onEdit(customer);
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-yellow-400 hover:scale-110 transition-all"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <MdEdit size={16} />
            </button>
            <button
              onClick={() => {
                onClose();
                onDelete(customer);
              }}
              className="w-9 h-9 rounded-full flex items-center justify-center text-red-400 hover:scale-110 transition-all"
              style={{ background: "rgba(255,255,255,0.06)" }}
            >
              <MdDelete size={16} />
            </button>
          </div>
        </div>
        <div className="px-5 pb-5 flex-shrink-0">
          <div className="flex items-start gap-4 mb-4">
            <Avatar customer={customer} size={64} />
            <div className="flex-1 min-w-0">
              <h2 className="text-xl font-black text-white truncate">
                {customer.name}
              </h2>
              <div className="mt-1">
                <LoyaltyBadge loyalty={customer.loyalty} />
              </div>
            </div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-400">
              <MdEmail size={14} /> {customer.email}
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <MdPhone size={14} /> {customer.phone}
            </div>
            <div className="flex items-center gap-2 text-gray-400">
              <MdCalendarToday size={14} /> Bergabung: {customer.joinDate}
            </div>
          </div>
        </div>
        <div
          className="mx-5 mb-5 rounded-2xl p-4 flex-shrink-0"
          style={{
            background: "rgba(34,197,94,0.06)",
            border: "1px solid rgba(34,197,94,0.15)",
          }}
        >
          <div className="flex justify-between items-center">
            <div>
              <p className="text-xs text-gray-500 mb-1">Total Pesanan</p>
              <p className="text-2xl font-black text-white">{orders.length}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-500 mb-1">Total Belanja</p>
              <p className="text-2xl font-black text-green-400">
                {formatCurrency(totalSpent)}
              </p>
            </div>
          </div>
        </div>
        <div className="mx-5 mb-5">
          <p className="text-xs text-gray-600 uppercase tracking-wider mb-3 flex items-center gap-2">
            <MdReceipt size={14} /> Riwayat Pesanan
          </p>
          {orders.length === 0 ? (
            <p className="text-gray-500 text-sm italic">Belum ada pesanan</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto pr-2">
              {orders.map((order, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl"
                  style={{
                    background: "rgba(11,59,46,0.4)",
                    border: "1px solid rgba(34,197,94,0.1)",
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-green-400 font-mono text-xs">
                        {order.id}
                      </p>
                      <p className="text-white text-sm font-medium">
                        {order.service}
                      </p>
                      <p className="text-gray-500 text-xs">{order.vehicle}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-gray-500 text-xs">{order.date}</p>
                      <span
                        className="inline-flex px-2 py-0.5 rounded-full text-xs"
                        style={{
                          background: "rgba(34,197,94,0.1)",
                          color: "#4ade80",
                        }}
                      >
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Customer Card (grid view) ───────────────────────────────────────
function CustomerCard({ customer, onDetail, onEdit, onDelete }) {
  const cfg = LOYALTY[customer.loyalty] || LOYALTY.Bronze;
  return (
    <div
      onClick={() => onDetail(customer)}
      className="group relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:scale-[1.015] hover:-translate-y-0.5"
      style={{
        background:
          "linear-gradient(145deg,rgba(6,40,31,0.95),rgba(11,59,46,0.8))",
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
            <p className="text-white font-bold text-sm truncate">
              {customer.name}
            </p>
            <p className="text-gray-500 text-xs font-mono">{customer.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 mb-2">
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
          <LoyaltyBadge loyalty={customer.loyalty} size="sm" />
          <div className="text-right">
            <p className="text-white font-black text-sm">
              {customer.totalOrders} order
            </p>
            <p className="text-gray-600 text-xs">{customer.joinDate}</p>
          </div>
        </div>
      </div>
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

// ─── Form Modal ───────────────────────────────────────────────────────
const inputCls =
  "w-full px-4 py-2.5 rounded-xl text-sm text-white outline-none transition-all focus:ring-2 focus:ring-green-500/20";
const inputStyle = {
  background: "rgba(11,59,46,0.5)",
  border: "1px solid rgba(34,197,94,0.15)",
};

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

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(form);
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
        <div
          className="flex items-center justify-between px-5 py-4"
          style={{ borderBottom: "1px solid rgba(34,197,94,0.1)" }}
        >
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center"
              style={{ background: "rgba(34,197,94,0.15)" }}
            >
              {editId ? (
                <MdEdit size={15} className="text-green-400" />
              ) : (
                <MdAdd size={15} className="text-green-400" />
              )}
            </div>
            <h3 className="text-white font-bold">
              {editId ? "Edit Pelanggan" : "Tambah Pelanggan"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5"
          >
            <MdClose size={18} />
          </button>
        </div>
        <form
          id="customer-form"
          onSubmit={handleSubmit}
          className="px-5 py-4 space-y-4 max-h-[70vh] overflow-y-auto"
        >
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">Foto</label>
            <div className="flex items-center gap-3">
              {previewPhoto ? (
                <img
                  src={previewPhoto}
                  alt="Preview"
                  className="w-12 h-12 rounded-xl object-cover border border-green-500/30"
                />
              ) : (
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold text-white"
                  style={{
                    background: "linear-gradient(135deg,#16A34A,#22C55E)",
                  }}
                >
                  {form.name ? form.name[0] : "?"}
                </div>
              )}
              <label className="cursor-pointer flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-green-400 border border-green-500/20 hover:bg-green-500/10">
                <MdPhotoCamera size={14} /> Upload
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Nama Lengkap <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.name || ""}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="Andi Wijaya"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Email <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              required
              value={form.email || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, email: e.target.value }))
              }
              placeholder="andi@email.com"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Telepon <span className="text-red-500">*</span>
            </label>
            <input
              required
              value={form.phone || ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, phone: e.target.value }))
              }
              placeholder="0812-3456-7890"
              className={inputCls}
              style={inputStyle}
            />
          </div>
          <div>
            <label className="block text-xs text-gray-400 mb-1.5">
              Tingkat Loyalitas
            </label>
            <select
              value={form.loyalty || "Bronze"}
              onChange={(e) =>
                setForm((f) => ({ ...f, loyalty: e.target.value }))
              }
              className={inputCls}
              style={inputStyle}
            >
              {["Bronze", "Silver", "Gold", "Platinum"].map((l) => (
                <option key={l}>{l}</option>
              ))}
            </select>
          </div>
        </form>
        <div
          className="flex gap-3 px-5 py-4"
          style={{ borderTop: "1px solid rgba(34,197,94,0.1)" }}
        >
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:text-white transition-all"
            style={{ border: "1px solid rgba(34,197,94,0.12)" }}
          >
            Batal
          </button>
          <button
            type="submit"
            form="customer-form"
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-black transition-all hover:opacity-90 flex items-center justify-center gap-2"
            style={{ background: "linear-gradient(90deg,#22C55E,#16a34a)" }}
          >
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
        style={{
          background: "#06281F",
          border: "1px solid rgba(239,68,68,0.3)",
          boxShadow: "0 20px 50px rgba(0,0,0,0.5)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          className="w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4"
          style={{
            background: "rgba(239,68,68,0.1)",
            border: "2px solid rgba(239,68,68,0.2)",
          }}
        >
          <MdDelete size={26} className="text-red-500" />
        </div>
        <h3 className="text-white font-bold text-lg mb-2">Hapus Pelanggan?</h3>
        <p className="text-gray-400 text-sm mb-6">
          Pelanggan{" "}
          <span className="text-green-400 font-mono font-bold">
            {target?.name}
          </span>{" "}
          akan dihapus permanen.
        </p>
        <div className="flex gap-3">
          <button
            onClick={onCancel}
            className="flex-1 py-2.5 rounded-xl text-sm text-gray-400 hover:bg-white/5 transition-all"
            style={{ border: "1px solid rgba(255,255,255,0.08)" }}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90"
            style={{ background: "linear-gradient(90deg,#ef4444,#dc2626)" }}
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}
// ─── Customer Detail Dialog (menggunakan Dialog + Tabs dari shadcn/ui) ──────
function CustomerDetailDialog({ customer, isOpen, onClose, onEdit, onDelete }) {
  const [orders, setOrders] = useState([])

  useEffect(() => {
    if (!customer) return
    const allOrders = getOrdersFromStorage()
    const custOrders = allOrders.filter(order => order.customer === customer.name)
    setOrders(custOrders)
  }, [customer])

  if (!customer) return null

  const totalSpent = orders.reduce((sum, o) => sum + Number(o.total), 0)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-lg p-0 overflow-hidden border-0"
        style={{
          background: 'linear-gradient(160deg,#061a14 0%,#082b1e 100%)',
          border: '1px solid rgba(34,197,94,0.2)',
          boxShadow: '0 25px 60px rgba(0,0,0,0.6)',
        }}
      >
        {/* Header Strip warna loyalitas */}
        <div className="h-1" style={{ background: LOYALTY[customer.loyalty]?.color || '#22C55E' }} />

        <DialogHeader className="px-5 pt-5 pb-3">
          <div className="flex items-start gap-4">
            <Avatar customer={customer} size={56} />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-xl font-black text-white truncate">
                {customer.name}
              </DialogTitle>
              <DialogDescription className="mt-1 flex items-center gap-2">
                <span className="text-gray-500 font-mono text-xs">{customer.id}</span>
                <LoyaltyBadge loyalty={customer.loyalty} size="sm" />
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Tabs: Info | Riwayat | Statistik */}
        <Tabs defaultValue="info" className="px-5 pb-5">
          <TabsList className="w-full mb-4" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
            <TabsTrigger value="info" className="flex-1 text-xs data-[state=active]:text-green-400 data-[state=active]:bg-green-500/10">
              Info
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 text-xs data-[state=active]:text-green-400 data-[state=active]:bg-green-500/10">
              Riwayat ({orders.length})
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex-1 text-xs data-[state=active]:text-green-400 data-[state=active]:bg-green-500/10">
              Statistik
            </TabsTrigger>
          </TabsList>

          {/* Tab 1: Info */}
          <TabsContent value="info" className="space-y-3 mt-0">
            <div className="rounded-xl p-4 space-y-3" style={{ background: 'rgba(34,197,94,0.04)', border: '1px solid rgba(34,197,94,0.1)' }}>
              <div className="flex items-center gap-3">
                <MdEmail size={14} className="text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600">Email</p>
                  <p className="text-sm text-gray-300">{customer.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MdPhone size={14} className="text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600">Telepon</p>
                  <p className="text-sm text-gray-300">{customer.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MdCalendarToday size={14} className="text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600">Bergabung</p>
                  <p className="text-sm text-gray-300">{customer.joinDate}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MdShoppingBag size={14} className="text-green-500 flex-shrink-0" />
                <div>
                  <p className="text-xs text-gray-600">Total Pesanan</p>
                  <p className="text-sm text-white font-bold">{customer.totalOrders} order</p>
                </div>
              </div>
            </div>

            {/* Tombol Aksi */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => { onClose(); onEdit(customer) }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-yellow-400 transition-all hover:bg-yellow-500/10"
                style={{ border: '1px solid rgba(234,179,8,0.25)' }}
              >
                <MdEdit size={15} /> Edit
              </button>
              <button
                onClick={() => { onClose(); onDelete(customer) }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-medium text-red-400 transition-all hover:bg-red-500/10"
                style={{ border: '1px solid rgba(239,68,68,0.25)' }}
              >
                <MdDelete size={15} /> Hapus
              </button>
            </div>
          </TabsContent>

          {/* Tab 2: Riwayat Order */}
          <TabsContent value="orders" className="mt-0">
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <MdReceipt size={36} className="text-gray-700 mx-auto mb-2" />
                <p className="text-gray-500 text-sm">Belum ada pesanan</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {orders.map((order, idx) => (
                  <div key={idx} className="p-3 rounded-xl" style={{ background: 'rgba(11,59,46,0.4)', border: '1px solid rgba(34,197,94,0.1)' }}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-green-400 font-mono text-xs">{order.id}</p>
                        <p className="text-white text-sm font-medium">{order.service}</p>
                        <p className="text-gray-500 text-xs">{order.vehicle}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-bold text-sm">{formatCurrency(order.total)}</p>
                        <p className="text-gray-500 text-xs">{order.date}</p>
                        <span className="inline-flex px-2 py-0.5 rounded-full text-xs mt-0.5" style={{ background: 'rgba(34,197,94,0.1)', color: '#4ade80' }}>
                          {order.status}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </TabsContent>

          {/* Tab 3: Statistik */}
          <TabsContent value="stats" className="mt-0">
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
                <p className="text-3xl font-black text-white">{orders.length}</p>
                <p className="text-xs text-gray-500 mt-1">Total Pesanan</p>
              </div>
              <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(34,197,94,0.06)', border: '1px solid rgba(34,197,94,0.12)' }}>
                <p className="text-lg font-black text-green-400">{formatCurrency(totalSpent)}</p>
                <p className="text-xs text-gray-500 mt-1">Total Belanja</p>
              </div>
              <div className="col-span-2 rounded-xl p-4 text-center" style={{ background: 'rgba(168,85,247,0.06)', border: '1px solid rgba(168,85,247,0.12)' }}>
                <LoyaltyBadge loyalty={customer.loyalty} />
                <p className="text-xs text-gray-500 mt-2">Level Loyalitas</p>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
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
  useEffect(() => {
    localStorage.setItem("garage_customers", JSON.stringify(customers));
  }, [customers]);

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

  // Pagination state
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
      else {
        setSortColumn(col);
        setSortDir("asc");
      }
    },
    [sortColumn],
  );

  const filtered = useMemo(() => {
    let r = [...customers];
    if (search) {
      const s = search.toLowerCase();
      r = r.filter(
        (c) =>
          c.name.toLowerCase().includes(s) ||
          c.email.toLowerCase().includes(s) ||
          c.phone.includes(s),
      );
    }
    if (filterLoyalty) r = r.filter((c) => c.loyalty === filterLoyalty);
    if (sortColumn) {
      r.sort((a, b) => {
        let av = a[sortColumn],
          bv = b[sortColumn];
        if (sortColumn === "totalOrders") {
          av = Number(av);
          bv = Number(bv);
        }
        if (sortColumn === "joinDate") {
          av = new Date(av);
          bv = new Date(bv);
        }
        if (av < bv) return sortDir === "asc" ? -1 : 1;
        if (av > bv) return sortDir === "asc" ? 1 : -1;
        return 0;
      });
    }
    return r;
  }, [customers, search, filterLoyalty, sortColumn, sortDir]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, filterLoyalty]);

  const totalPages = Math.ceil(filtered.length / itemsPerPage) || 1;
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filtered.slice(start, start + itemsPerPage);
  }, [filtered, currentPage, itemsPerPage]);

  const activeFilters = filterLoyalty ? 1 : 0;
  const resetFilters = () => {
    setFilterLoyalty("");
    setSearch("");
  };

  const handleAdd = () => {
    setEditId(null);
    setShowForm(true);
  };
  const handleEdit = (customer) => {
    setEditId(customer.id);
    setShowForm(true);
  };
  const handleSubmit = useCallback(
    (data) => {
      if (editId) {
        setCustomers((prev) =>
          prev.map((c) => (c.id === editId ? { ...c, ...data } : c)),
        );
      } else {
        const newId = `C-${String(customers.length + 1).padStart(3, "0")}`;
        setCustomers((prev) => [
          {
            ...data,
            id: newId,
            totalOrders: 0,
            joinDate: new Date().toISOString().slice(0, 10),
          },
          ...prev,
        ]);
      }
      setShowForm(false);
      setEditId(null);
    },
    [editId, customers.length],
  );

  const handleDelete = useCallback(() => {
    setCustomers((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    setDeleteTarget(null);
  }, [deleteTarget]);

  const exportCSV = useCallback(() => {
    const rows = [
      ["ID", "Nama", "Email", "Telepon", "Loyalty", "Total Order", "Bergabung"],
      ...filtered.map((c) => [
        c.id,
        c.name,
        c.email,
        c.phone,
        c.loyalty,
        c.totalOrders,
        c.joinDate,
      ]),
    ];
    const csv = rows
      .map((r) => r.map((cell) => `"${cell}"`).join(","))
      .join("\n");
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv" }));
    a.download = `customers_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  }, [filtered]);

  const totalCustomers = customers.length;
  const loyaltyCounts = {
    Platinum: customers.filter((c) => c.loyalty === "Platinum").length,
    Gold: customers.filter((c) => c.loyalty === "Gold").length,
    Silver: customers.filter((c) => c.loyalty === "Silver").length,
    Bronze: customers.filter((c) => c.loyalty === "Bronze").length,
  };

  const thCls =
    "text-left py-3 px-3 text-xs text-gray-600 font-semibold uppercase tracking-wider whitespace-nowrap cursor-pointer select-none hover:text-gray-400 transition-colors";

  return (
    <div className="page-animate">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Data Pelanggan
          </h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {totalCustomers} pelanggan terdaftar
          </p>
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
            style={{
              background: "linear-gradient(90deg,#22C55E,#16a34a)",
              boxShadow: "0 4px 18px rgba(34,197,94,0.35)",
            }}
          >
            <MdAdd size={18} /> Tambah Pelanggan
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {[
          {
            label: "Total Pelanggan",
            value: totalCustomers,
            color: "#94A3B8",
            bg: "rgba(148,163,184,0.08)",
          },
          {
            label: "Platinum",
            value: loyaltyCounts.Platinum,
            color: "#A855F7",
            bg: "rgba(168,85,247,0.08)",
          },
          {
            label: "Gold",
            value: loyaltyCounts.Gold,
            color: "#FBBF24",
            bg: "rgba(251,191,36,0.08)",
          },
          {
            label: "Silver",
            value: loyaltyCounts.Silver,
            color: "#94A3B8",
            bg: "rgba(148,163,184,0.08)",
          },
          {
            label: "Bronze",
            value: loyaltyCounts.Bronze,
            color: "#F97316",
            bg: "rgba(249,115,22,0.08)",
          },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl px-4 py-3 transition-all hover:scale-[1.02]"
            style={{ background: s.bg, border: `1px solid ${s.color}20` }}
          >
            <p className="text-xs text-gray-500 mb-1">{s.label}</p>
            <p className="text-2xl font-black" style={{ color: s.color }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      <div
        className="rounded-2xl overflow-hidden"
        style={{
          background: "rgba(6,28,20,0.8)",
          border: "1px solid rgba(34,197,94,0.1)",
          backdropFilter: "blur(6px)",
        }}
      >
        <div
          className="flex flex-col sm:flex-row gap-3 p-4"
          style={{ borderBottom: "1px solid rgba(34,197,94,0.08)" }}
        >
          <div className="relative flex-1">
            <MdSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-600"
              size={16}
            />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, email, telepon..."
              className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm text-gray-300 outline-none transition-all focus:ring-2 focus:ring-green-500/20"
              style={{
                background: "rgba(11,59,46,0.5)",
                border: "1px solid rgba(34,197,94,0.12)",
              }}
            />
          </div>
          <div className="flex gap-2">
            <div className="relative" ref={filterRef}>
              <button
                onClick={() => setShowFilter((p) => !p)}
                className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm transition-all"
                style={
                  activeFilters > 0
                    ? {
                        background: "rgba(34,197,94,0.15)",
                        color: "#22C55E",
                        border: "1px solid rgba(34,197,94,0.3)",
                      }
                    : {
                        background: "rgba(11,59,46,0.4)",
                        color: "#6B7280",
                        border: "1px solid rgba(34,197,94,0.1)",
                      }
                }
              >
                <MdFilterList size={16} />
                {activeFilters > 0 && (
                  <span
                    className="w-4 h-4 rounded-full text-xs font-bold text-black flex items-center justify-center"
                    style={{ background: "#22C55E" }}
                  >
                    {activeFilters}
                  </span>
                )}
              </button>
              {showFilter && (
                <div
                  className="absolute right-0 top-full mt-2 w-64 rounded-2xl p-4 z-30"
                  style={{
                    background: "#051A0E",
                    border: "1px solid rgba(34,197,94,0.2)",
                    boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
                  }}
                >
                  <p className="text-xs text-gray-500 font-semibold uppercase tracking-wider mb-3">
                    Filter Loyalitas
                  </p>
                  <select
                    value={filterLoyalty}
                    onChange={(e) => setFilterLoyalty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl text-sm text-white outline-none mb-3"
                    style={{
                      background: "rgba(11,59,46,0.5)",
                      border: "1px solid rgba(34,197,94,0.15)",
                    }}
                  >
                    <option value="">Semua</option>
                    {["Platinum", "Gold", "Silver", "Bronze"].map((l) => (
                      <option key={l}>{l}</option>
                    ))}
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
            <div
              className="flex rounded-xl overflow-hidden"
              style={{ border: "1px solid rgba(34,197,94,0.12)" }}
            >
              {[
                { id: "table", icon: <MdTableRows size={16} /> },
                { id: "grid", icon: <MdGridView size={16} /> },
              ].map((v) => (
                <button
                  key={v.id}
                  onClick={() => setViewMode(v.id)}
                  className="w-9 h-9 flex items-center justify-center transition-all"
                  style={
                    viewMode === v.id
                      ? { background: "rgba(34,197,94,0.2)", color: "#22C55E" }
                      : { background: "rgba(11,59,46,0.4)", color: "#4B5563" }
                  }
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
            <table className="w-full" style={{ minWidth: 900 }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(34,197,94,0.08)" }}>
                  {[
                    { key: "id", label: "ID" },
                    { key: "photo", label: "Foto", noSort: true },
                    { key: "name", label: "Nama" },
                    { key: "email", label: "Email" },
                    { key: "phone", label: "Telepon" },
                    { key: "loyalty", label: "Loyalty" },
                    { key: "totalOrders", label: "Total Order" },
                    { key: "joinDate", label: "Bergabung" },
                    { key: "aksi", label: "Aksi", noSort: true },
                  ].map((col) => (
                    <th
                      key={col.key}
                      className={thCls}
                      onClick={() => !col.noSort && handleSort(col.key)}
                    >
                      <span className="flex items-center gap-1">
                        {col.label}
                        {!col.noSort && (
                          <SortIcon
                            column={col.key}
                            sortColumn={sortColumn}
                            sortDirection={sortDir}
                          />
                        )}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {paginatedData.map((customer) => (
                  <tr
                    key={customer.id}
                    onClick={() => setDetailTarget(customer)}
                    className="cursor-pointer transition-colors hover:bg-green-500/[0.04]"
                    style={{ borderBottom: "1px solid rgba(34,197,94,0.05)" }}
                  >
                    <td className="py-3 px-3 text-xs text-green-400 font-mono whitespace-nowrap">
                      {customer.id}
                    </td>
                    <td className="py-3 px-3">
                      {customer.photo ? (
                        <img
                          src={customer.photo}
                          alt={customer.name}
                          className="w-8 h-8 rounded-xl object-cover border border-green-500/30"
                        />
                      ) : (
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white"
                          style={{
                            background:
                              "linear-gradient(135deg,#16A34A,#22C55E)",
                          }}
                        >
                          {customer.name[0]}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3 text-sm text-white font-medium whitespace-nowrap">
                      {customer.name}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-400">
                      {customer.email}
                    </td>
                    <td className="py-3 px-3 text-sm text-gray-400 whitespace-nowrap">
                      {customer.phone}
                    </td>
                    <td className="py-3 px-3">
                      <LoyaltyBadge loyalty={customer.loyalty} size="sm" />
                    </td>
                    <td className="py-3 px-3 text-sm text-white font-semibold">
                      {customer.totalOrders}
                    </td>
                    <td className="py-3 px-3 text-xs text-gray-500 whitespace-nowrap">
                      {customer.joinDate}
                    </td>
                    {/* KODE BARU — GUNAKAN INI */}
                    <td className="py-3 px-3" onClick={e => e.stopPropagation()}>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button
                            className="w-8 h-8 rounded-lg flex items-center justify-center transition-all hover:bg-white/10"
                            style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.15)', color: '#6B7280' }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                              <circle cx="12" cy="5" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="12" cy="19" r="2"/>
                            </svg>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-44" style={{ background: '#061a14', border: '1px solid rgba(34,197,94,0.2)' }}>
                          <DropdownMenuLabel className="text-gray-400 text-xs">Aksi Pelanggan</DropdownMenuLabel>
                          <DropdownMenuSeparator style={{ background: 'rgba(34,197,94,0.1)' }} />
                          <DropdownMenuItem
                            onClick={() => setDetailTarget(customer)}
                            className="cursor-pointer text-gray-300 hover:text-white focus:text-white focus:bg-green-500/10"
                          >
                            <MdPerson size={14} className="mr-2 text-blue-400" />
                            Lihat Detail
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleEdit(customer)}
                            className="cursor-pointer text-gray-300 hover:text-white focus:text-white focus:bg-yellow-500/10"
                          >
                            <MdEdit size={14} className="mr-2 text-yellow-400" />
                            Edit Pelanggan
                          </DropdownMenuItem>
                          <DropdownMenuSeparator style={{ background: 'rgba(34,197,94,0.1)' }} />
                          <DropdownMenuItem
                            onClick={() => setDeleteTarget(customer)}
                            className="cursor-pointer text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-500/10"
                          >
                            <MdDelete size={14} className="mr-2" />
                            Hapus Pelanggan
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="text-center py-16 flex flex-col items-center gap-3">
                <MdPerson size={48} className="text-gray-700" />
                <p className="text-gray-600 text-sm">
                  Tidak ada pelanggan ditemukan
                </p>
                <button
                  onClick={resetFilters}
                  className="text-green-500 text-xs hover:underline flex items-center gap-1"
                >
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
                onDetail={setDetailTarget}
                onEdit={handleEdit}
                onDelete={setDeleteTarget}
              />
            ))}
            {filtered.length === 0 && (
              <div className="col-span-3 text-center py-16 flex flex-col items-center gap-3">
                <MdPerson size={48} className="text-gray-700" />
                <p className="text-gray-600 text-sm">
                  Tidak ada pelanggan ditemukan
                </p>
              </div>
            )}
          </div>
        )}

        {/* Footer dengan Pagination */}
        <div
          className="px-5 py-4 flex flex-col sm:flex-row items-center justify-between gap-4"
          style={{ borderTop: "1px solid rgba(34,197,94,0.06)" }}
        >
          <p className="text-xs text-gray-600">
            Menampilkan{" "}
            <span className="text-gray-300 font-semibold">
              {filtered.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}
            </span>{" "}
            -{" "}
            <span className="text-gray-300 font-semibold">
              {Math.min(currentPage * itemsPerPage, filtered.length)}
            </span>{" "}
            dari{" "}
            <span className="text-green-500 font-semibold">
              {filtered.length}
            </span>{" "}
            pelanggan
            {activeFilters > 0 && " (disaring)"}
          </p>
          {filtered.length > 0 && totalPages > 1 && (
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
            />
          )}
        </div>
      </div>

      {detailTarget && (
        <DetailDrawer
          customer={detailTarget}
          onClose={() => setDetailTarget(null)}
          onEdit={(c) => {
            setDetailTarget(null);
            handleEdit(c);
          }}
          onDelete={(c) => {
            setDetailTarget(null);
            setDeleteTarget(c);
          }}
        />
      )}
      <FormModal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          setEditId(null);
        }}
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
