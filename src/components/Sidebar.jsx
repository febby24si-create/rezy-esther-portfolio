import { useState, useEffect, useRef } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import logo from "../assets/logo2.png";
import {
  MdDashboard,
  MdBuild,
  MdPeople,
  MdDirectionsCar,
  MdEngineering,
  MdBarChart,
  MdSettings,
  MdInventory2,
  MdClose,
  MdLogout,
  MdCalendarMonth,
  MdAutoAwesome,
  MdCardMembership,
  MdPhotoCamera,
  MdBookOnline,
  MdLogin,
  MdManageAccounts,
  MdChevronLeft,
  MdShoppingBag,
} from "react-icons/md";
import { bookingAPI } from "../services/bookingAPI";
import { BOOKING_STATUS } from "../constants/statusConstants";

const navItems = [
  { path: "/dashboard", icon: MdDashboard,    label: "Dashboard" },
  { path: "/bookings",  icon: MdBookOnline,   label: "Booking",       badgeKey: "pendingConfirmation" },
  { path: "/checkin",   icon: MdLogin,        label: "Check In" },
  { path: "/orders",    icon: MdBuild,        label: "Order Servis" },
  { path: "/customers", icon: MdPeople,       label: "Pelanggan" },
  { path: "/vehicles",  icon: MdDirectionsCar,label: "Kendaraan" },
  { path: "/mechanics", icon: MdEngineering,  label: "Mekanik" },
  { path: "/schedule",  icon: MdCalendarMonth,label: "Jadwal Mekanik" },
  { path: "/reports",   icon: MdBarChart,     label: "Laporan" },
  { path: "/inventory", icon: MdInventory2,   label: "Stok Barang" },
  { path: "/pesanan-produk", icon: MdShoppingBag, label: "Pesanan Produk", badge: "NEW" },
];

const crmItems = [
  { path: "/crm", icon: MdAutoAwesome, label: "CRM Automation", badge: "NEW" },
  { path: "/membership", icon: MdCardMembership, label: "Membership", badge: "NEW" },
  { path: "/users", icon: MdManageAccounts, label: "Manajemen User", badge: "NEW" },
];

const systemItems = [
  { path: "/settings", icon: MdSettings, label: "Pengaturan" },
];

function getInitials(name) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

// ─── Tooltip untuk collapsed mode ─────────────────────────
function Tooltip({ label, children }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && (
        <div className="absolute left-full ml-3 top-1/2 -translate-y-1/2 z-50 pointer-events-none">
          <div className="flex items-center">
            <div className="w-2 h-2 -mr-[3px] rotate-45" style={{ background: "#1e293b" }} />
            <div className="bg-slate-800 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap shadow-xl border border-white/10"
              style={{ backdropFilter: "blur(8px)" }}>
              {label}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Nav Item ──────────────────────────────────────────────
function NavItem({ path, icon: Icon, label, badge, badgeCount, collapsed, onClick }) {
  return (
    <Tooltip label={collapsed ? label : ""}>
      <NavLink
        to={path}
        end={path === "/"}
        onClick={onClick}
        className={({ isActive }) =>
          `group relative flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all duration-200 ${
            collapsed ? "justify-center px-2" : ""
          } ${
            isActive
              ? "text-blue-400"
              : "text-gray-400 hover:text-gray-200"
          }`
        }
        style={({ isActive }) => ({
          background: isActive
            ? "linear-gradient(135deg, rgba(59,130,246,0.12), rgba(59,130,246,0.04))"
            : "transparent",
          border: isActive ? "1px solid rgba(96,165,250,0.15)" : "1px solid transparent",
        })}
      >
        {/* Active indicator bar */}
        {({ isActive }) => (
          <>
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 rounded-r-full"
                style={{
                  background: "linear-gradient(180deg, #60A5FA, #3B82F6)",
                  boxShadow: "0 0 8px rgba(59,130,246,0.5)",
                }}
              />
            )}
            <div className="relative flex-shrink-0 transition-transform duration-200 group-hover:scale-110">
              <Icon size={collapsed ? 20 : 18} />
              {badgeCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-2 h-2 rounded-full bg-blue-400"
                  style={{ animation: "pulse 2s ease-in-out infinite" }} />
              )}
            </div>
            {!collapsed && (
              <>
                <span className="flex-1 truncate text-sm font-medium">{label}</span>
                {(badgeCount > 0 || badge) && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full min-w-[16px] text-center animate-fade-in"
                    style={{
                      background: badge
                        ? "linear-gradient(135deg, rgba(59,130,246,0.2), rgba(96,165,250,0.1))"
                        : "rgba(96,165,250,0.2)",
                      color: "#60A5FA",
                      border: "1px solid rgba(96,165,250,0.3)",
                    }}>
                    {badge || badgeCount}
                  </span>
                )}
              </>
            )}
            {/* Hover glow effect */}
            <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
              style={{
                background: "radial-gradient(circle at 30% 50%, rgba(59,130,246,0.06) 0%, transparent 70%)",
              }}
            />
          </>
        )}
      </NavLink>
    </Tooltip>
  );
}

// ─── Section Header ────────────────────────────────────────
function SectionHeader({ label, collapsed }) {
  if (collapsed) {
    return (
      <div className="flex justify-center py-2">
        <div className="w-4 h-px rounded-full" style={{ background: "rgba(96,165,250,0.1)" }} />
      </div>
    );
  }
  return (
    <div className="flex items-center gap-2 px-3 py-2">
      <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg, rgba(96,165,250,0.08), transparent)" }} />
      <span className="text-[9px] text-gray-600 uppercase tracking-[0.2em] font-semibold">{label}</span>
      <div className="flex-1 h-px" style={{ background: "linear-gradient(270deg, rgba(96,165,250,0.08), transparent)" }} />
    </div>
  );
}

export default function Sidebar({ onClose }) {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const [bookingStats, setBookingStats] = useState({});
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("user_profile");
    if (saved) return JSON.parse(saved);
    return { name: "Febby Fahrezyyy", role: "CEO & Founder", email: "rezyadmin@bengkel.id", phone: "", avatar: "minjuu.jpg" };
  });

  useEffect(() => {
    const loadStats = async () => {
      try {
        const bookings = await bookingAPI.fetchAll();
        const pendingConfirmation = (bookings || []).filter(
          (b) => b.status === BOOKING_STATUS.WAITING_CONFIRMATION
        ).length;
        setBookingStats({ pendingConfirmation });
      } catch { /* silent */ }
    };
    loadStats();
    const iv = setInterval(loadStats, 15000);
    return () => clearInterval(iv);
  }, []);

  useEffect(() => {
    sessionStorage.setItem("user_profile", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    const handler = (event) => { if (event.detail) setUser(event.detail); };
    window.addEventListener("userProfileUpdated", handler);
    return () => window.removeEventListener("userProfileUpdated", handler);
  }, []);

  const { logout } = useAuth();

  const handleLogout = () => { logout(); navigate("/login"); };

  const handleAvatarUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Mohon upload file gambar"); return; }
    if (file.size > 2 * 1024 * 1024) { alert("Maksimal 2MB"); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      const updatedUser = { ...user, avatar: e.target.result };
      setUser(updatedUser);
      sessionStorage.setItem("user_profile", JSON.stringify(updatedUser));
      window.dispatchEvent(new CustomEvent("userProfileUpdated", { detail: updatedUser }));
      if (fileInputRef.current) fileInputRef.current.value = "";
    };
    reader.readAsDataURL(file);
  };

  // ─── Render group of items ─────────────────────────────
  const renderGroup = (items, showBadges = false) =>
    items.map((item) => (
      <NavItem
        key={item.path}
        path={item.path}
        icon={item.icon}
        label={item.label}
        badge={showBadges ? item.badge : undefined}
        badgeCount={showBadges && item.badgeKey ? (bookingStats[item.badgeKey] || 0) : 0}
        collapsed={collapsed}
        onClick={onClose}
      />
    ));

  return (
    <aside
      className="flex-shrink-0 flex flex-col h-screen transition-all duration-300 ease-in-out relative"
      style={{
        width: collapsed ? 64 : 224,
        background: "linear-gradient(180deg, #0a1222 0%, #0f172a 100%)",
        borderRight: "1px solid rgba(96,165,250,0.06)",
      }}
    >
      {/* ── Logo ────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between flex-shrink-0 relative"
        style={{ minHeight: 64, padding: collapsed ? "0 12px" : "0 16px", borderBottom: "1px solid rgba(96,165,250,0.06)" }}
      >
        <Link to="/dashboard" className="flex items-center gap-3 overflow-hidden" onClick={onClose}>
          <div className="w-9 h-9 rounded-xl overflow-hidden flex-shrink-0 shadow-lg"
            style={{ border: "1px solid rgba(96,165,250,0.2)" }}>
            <img src={logo} alt="Logo" className="w-full h-full object-cover" />
          </div>
          {!collapsed && (
            <div className="truncate">
              <p className="font-bold text-sm leading-none tracking-wider"
                style={{
                  background: "linear-gradient(90deg, #ffffff, #93C5FD)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}>
                Esther<span style={{ background: "linear-gradient(90deg, #60A5FA, #3B82F6)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Garage</span>
              </p>
              <p className="text-[8px] text-gray-600 tracking-[0.15em] uppercase mt-0.5 font-medium">bengkel terpercaya</p>
            </div>
          )}
        </Link>
        <div className="flex items-center gap-1">
          {onClose && (
            <button onClick={onClose} className="md:hidden w-7 h-7 rounded-lg flex items-center justify-center text-gray-500 hover:text-white transition-colors" style={{ background: "rgba(15,23,42,0.5)" }}>
              <MdClose size={16} />
            </button>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex w-6 h-6 rounded-lg items-center justify-center text-gray-500 hover:text-blue-400 hover:bg-blue-500/10 transition-all flex-shrink-0"
          >
            <MdChevronLeft size={14} className={`transition-transform duration-300 ${collapsed ? "rotate-180" : ""}`} />
          </button>
        </div>
      </div>

      {/* ── Navigation ──────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5 scrollbar-thin"
        style={{
          scrollbarWidth: "thin",
          scrollbarColor: "rgba(96,165,250,0.1) transparent",
        }}>
        <SectionHeader label="Menu" collapsed={collapsed} />
        {renderGroup(navItems, true)}

        <SectionHeader label="CRM" collapsed={collapsed} />
        {renderGroup(crmItems, true)}

        <SectionHeader label="System" collapsed={collapsed} />
        {renderGroup(systemItems)}
      </nav>

      {/* ── User Profile ─────────────────────────────────── */}
      <div className="flex-shrink-0 p-2 border-t" style={{ borderColor: "rgba(96,165,250,0.06)" }}>
        {collapsed ? (
          /* Mini user section when collapsed */
          <div className="flex flex-col items-center gap-2 py-1">
            <Tooltip label={user.name}>
              <div className="relative cursor-pointer"
                onClick={() => fileInputRef.current?.click()}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center text-xs font-bold text-white overflow-hidden transition-all hover:opacity-80"
                  style={{
                    background: user.avatar ? "transparent" : "linear-gradient(135deg, #3B82F6, #60A5FA)",
                    border: user.avatar ? "2px solid rgba(96,165,250,0.3)" : "none",
                  }}>
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; e.target.parentElement.textContent = getInitials(user.name); }} />
                  ) : getInitials(user.name)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-blue-500 flex items-center justify-center border-2 border-[#0a1222]">
                  <MdPhotoCamera size={6} className="text-white" />
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
            </Tooltip>
            <Tooltip label="Keluar">
              <button onClick={handleLogout}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400/60 hover:text-red-400 hover:bg-red-500/10 transition-all">
                <MdLogout size={14} />
              </button>
            </Tooltip>
          </div>
        ) : (
          /* Full user section when expanded */
          <div>
            <div className="flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(15,23,42,0.5)" }}>
              <div className="relative flex-shrink-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold text-white overflow-hidden cursor-pointer transition-all hover:opacity-80"
                  style={{
                    background: user.avatar ? "transparent" : "linear-gradient(135deg, #3B82F6, #60A5FA)",
                    border: user.avatar ? "2px solid rgba(96,165,250,0.3)" : "none",
                  }}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover"
                      onError={(e) => { e.target.style.display = "none"; e.target.parentElement.textContent = getInitials(user.name); }} />
                  ) : getInitials(user.name)}
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center cursor-pointer hover:bg-blue-600 transition-colors border-2 border-[#0a1222]"
                  onClick={() => fileInputRef.current?.click()}>
                  <MdPhotoCamera size={8} className="text-white" />
                </div>
                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white text-xs font-semibold truncate">{user.name}</p>
                <p className="text-gray-500 text-[10px]">{user.role}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-[8px] text-gray-600 font-medium uppercase tracking-wider">Online</span>
                </div>
              </div>
            </div>

            <button onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs text-red-400/70 hover:text-red-300 hover:bg-red-500/10 transition-all mt-2 group"
              style={{ border: "1px solid rgba(239,68,68,0.08)" }}>
              <MdLogout size={15} className="transition-transform group-hover:translate-x-0.5" />
              <span>Keluar</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}