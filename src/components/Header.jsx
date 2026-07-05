import { useState, useRef, useEffect } from "react";
import { useAdminNotifications } from "../hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import {
  MdNotifications,
  MdSearch,
  MdCalendarToday,
  MdLogout,
  MdMenu,
  MdAdd,
  MdCheckCircle,
  MdSchedule,
  MdClose,
  MdDoneAll,
  MdPerson,
  MdSettings,
  MdKeyboardArrowDown,
  MdPhotoCamera,
  MdDeleteOutline,
} from "react-icons/md";

// Notifikasi sekarang dari Supabase via useAdminNotifications

function getInitials(name) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export default function Header({ onToggleSidebar }) {
  const navigate = useNavigate();
  const {
    notifs, unreadCount, loading: notifLoading,
    markRead, markAllRead, dismiss,
  } = useAdminNotifications();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const fileInputRef = useRef(null);

  // Data user dari sessionStorage (sama dengan yang dipakai Settings)
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("user_profile");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      name: "Febby Fahrezyyy",
      role: "CEO & Founder",
      email: "rezyadmin@bengkel.id",
      phone: "",
      avatar: 'minju.jpg', // PATH DEFAULT DARI PUBLIC
    };
  });

  // Simpan user ke sessionStorage setiap ada perubahan
  useEffect(() => {
    sessionStorage.setItem("user_profile", JSON.stringify(user));
  }, [user]);

  // Dengarkan event dari halaman Settings (update real-time)
  useEffect(() => {
    const handleUserUpdate = (event) => {
      const updatedUser = event.detail;
      if (updatedUser) setUser(updatedUser);
    };
    window.addEventListener("userProfileUpdated", handleUserUpdate);
    return () => window.removeEventListener("userProfileUpdated", handleUserUpdate);
  }, []);

  // Click outside untuk dropdown
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const notifColors = { booking_success: "#22C55E", service_done: "#16A34A", new_booking: "#EAB308", new_order: "#3B82F6", low_stock: "#EF4444" };

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });

  const handleLogout = () => {
    sessionStorage.removeItem("eg_token");
    navigate("/login");
  };

  // Upload foto profil
  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Hanya file gambar yang diperbolehkan");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      alert("Ukuran maksimal 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setUser((prev) => ({ ...prev, avatar: reader.result }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    if (window.confirm("Hapus foto profil?")) {
      setUser((prev) => ({ ...prev, avatar: null }));
    }
  };

  return (
    <header
      className="relative z-[1000] flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-3 gap-3"
      style={{ background: "rgba(4,28,21,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(34,197,94,0.08)" }}
    >
      {/* Mobile Menu */}
      <button
        onClick={onToggleSidebar}
        aria-label="Buka menu navigasi"
        className="md:hidden flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all"
        style={{ border: "1px solid rgba(34,197,94,0.1)" }}
      >
        <MdMenu size={20} />
      </button>

      {/* Search */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input
            type="text"
            placeholder="Cari order, pelanggan, kendaraan..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm text-gray-300 outline-none transition-all"
            style={{ background: "rgba(11,59,46,0.4)", border: "1px solid rgba(34,197,94,0.1)" }}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Date */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "rgba(11,59,46,0.3)", border: "1px solid rgba(34,197,94,0.08)" }}
        >
          <MdCalendarToday size={14} className="text-green-500" />
          <span className="text-xs text-gray-300">{today}</span>
        </div>

        {/* Notification */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif((v) => !v)}
            className="relative p-2 rounded-xl transition-all hover:bg-green-500/10"
            style={{ border: "1px solid rgba(34,197,94,0.1)" }}
          >
            <MdNotifications className="text-gray-400 hover:text-green-400" size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white" style={{ background: "#16A34A" }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-[9999]"
              style={{ background: "#051a0e", border: "1px solid rgba(34,197,94,0.2)", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}
            >
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(34,197,94,0.1)" }}>
                <span className="text-white text-sm font-semibold">Notifikasi</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-green-400 flex items-center gap-1">
                      <MdDoneAll size={14} /> Tandai semua
                    </button>
                  )}
                  <button onClick={() => setShowNotif(false)} className="text-gray-500 hover:text-white">
                    <MdClose size={16} />
                  </button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifLoading ? (
                  <div className="flex items-center justify-center py-8 text-gray-600 text-xs gap-2">
                    <div className="w-4 h-4 border-2 border-green-500/40 border-t-green-400 rounded-full animate-spin" />
                    Memuat notifikasi...
                  </div>
                ) : notifs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-600">
                    <span className="text-3xl mb-2">🔔</span>
                    <p className="text-xs">Tidak ada notifikasi</p>
                  </div>
                ) : (
                  notifs.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => { markRead(n.id); if (n.link) navigate(n.link); }}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-green-500/5 transition-colors group ${n.read ? "opacity-50" : ""}`}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: "rgba(34,197,94,0.12)" }}
                      >
                        {n.icon || "🔔"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-white text-xs font-semibold leading-tight">{n.title}</p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-green-400 flex-shrink-0" />}
                            <button
                              onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                              className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all"
                            >
                              <MdClose size={12} />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-500 text-xs mt-0.5 line-clamp-2">{n.message}</p>
                        <p className="text-gray-700 text-[10px] mt-1">
                          {n.created_at ? new Date(n.created_at).toLocaleString("id-ID", { dateStyle: "short", timeStyle: "short" }) : ""}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* ===== PROFILE + DROPDOWN ===== */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfile((v) => !v)}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl transition-all hover:bg-green-500/10"
            style={{ border: "1px solid rgba(34,197,94,0.15)", background: "rgba(11,59,46,0.35)" }}
          >
            {/* Avatar */}
            <div
              className="relative w-8 h-8 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg,#16a34a,#4ade80)", border: "2px solid rgba(34,197,94,0.35)" }}
            >
              {user.avatar ? (
                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
              ) : (
                getInitials(user.name)
              )}
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-green-400 border border-[#041c15]" />
            </div>

            {/* Name & Role */}
            <div className="hidden md:block text-left leading-tight">
              <p className="text-xs font-semibold text-gray-200">{user.name}</p>
              <p className="text-[11px] text-gray-500">{user.role}</p>
            </div>

            <MdKeyboardArrowDown
              size={16}
              className="hidden md:block text-gray-500 transition-transform"
              style={{ transform: showProfile ? "rotate(180deg)" : "rotate(0deg)" }}
            />
          </button>

          {/* Dropdown menu */}
          {showProfile && (
            <div
              className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-[9999]"
              style={{ background: "#051a0e", border: "1px solid rgba(34,197,94,0.2)", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}
            >
              {/* Header user */}
              <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid rgba(34,197,94,0.1)" }}>
                <div
                  className="relative w-10 h-10 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: "linear-gradient(135deg,#16a34a,#4ade80)", border: "2px solid rgba(34,197,94,0.4)" }}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    getInitials(user.name)
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-green-400 border border-[#041c15]" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{user.name}</p>
                  <p className="text-gray-500 text-xs">{user.email}</p>
                </div>
              </div>

              {/* Ubah foto */}
              <button
                onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-green-400 hover:bg-green-500/5 transition-all text-left"
              >
                <MdPhotoCamera size={16} /> Ganti Foto Profil
              </button>

              {user.avatar && (
                <button
                  onClick={handleRemoveAvatar}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-left"
                >
                  <MdDeleteOutline size={16} /> Hapus Foto
                </button>
              )}

              {/* Menu ke Settings (profil & pengaturan) */}
              <button
                onClick={() => {
                  setShowProfile(false);
                  navigate("/settings");
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-green-400 hover:bg-green-500/5 transition-all text-left"
              >
                <MdPerson size={16} /> Kelola Profil
              </button>

              <button
                onClick={() => {
                  setShowProfile(false);
                  navigate("/settings");
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-green-400 hover:bg-green-500/5 transition-all text-left"
              >
                <MdSettings size={16} /> Pengaturan
              </button>

              <div style={{ height: "1px", background: "rgba(34,197,94,0.08)", margin: "4px 0" }} />

              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-left"
              >
                <MdLogout size={16} /> Logout
              </button>
            </div>
          )}

          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/jpg"
            onChange={handleAvatarUpload}
            className="hidden"
          />
        </div>
      </div>
    </header>
  );
}