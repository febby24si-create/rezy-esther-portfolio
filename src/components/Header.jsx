import { useState, useRef, useEffect, useCallback } from "react";
import { useAdminNotifications } from "../hooks/useNotifications";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { orderAPI } from "../services/orderAPI";
import { customerAPI } from "../services/customerAPI";
import {
  MdNotifications,
  MdSearch,
  MdCalendarToday,
  MdLogout,
  MdMenu,
  MdClose,
  MdDoneAll,
  MdPerson,
  MdSettings,
  MdKeyboardArrowDown,
  MdPhotoCamera,
  MdDeleteOutline,
  MdReceiptLong,
  MdDirectionsCar,
} from "react-icons/md";

function getInitials(name) {
  return name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
}

export default function Header({ onToggleSidebar }) {
  const navigate = useNavigate();
  const { notifs, unreadCount, loading: notifLoading, markRead, markAllRead, dismiss } = useAdminNotifications();
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const fileInputRef = useRef(null);

  // Search
  const searchRef = useRef(null);
  const debounceRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchCache, setSearchCache] = useState(null);
  const [searchResults, setSearchResults] = useState({ orders: [], customers: [] });

  const [user, setUser] = useState(() => {
    const saved = sessionStorage.getItem("user_profile");
    if (saved) return JSON.parse(saved);
    return { name: "Febby Fahrezyyy", role: "CEO & Founder", email: "rezyadmin@bengkel.id", phone: "", avatar: "minju.jpg" };
  });

  useEffect(() => {
    sessionStorage.setItem("user_profile", JSON.stringify(user));
  }, [user]);

  useEffect(() => {
    const handler = (event) => { if (event.detail) setUser(event.detail); };
    window.addEventListener("userProfileUpdated", handler);
    return () => window.removeEventListener("userProfileUpdated", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setShowProfile(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const loadSearchData = useCallback(async () => {
    if (searchCache) return searchCache;
    setSearchLoading(true);
    try {
      const [orders, customers] = await Promise.all([
        orderAPI.fetchAll(),
        customerAPI.fetchAll(),
      ]);
      const data = { orders: orders || [], customers: customers || [] };
      setSearchCache(data);
      return data;
    } catch { return { orders: [], customers: [] }; }
    finally { setSearchLoading(false); }
  }, [searchCache]);

  const runSearch = useCallback(async (rawQuery) => {
    const q = rawQuery.trim().toLowerCase();
    if (q.length < 2) { setSearchResults({ orders: [], customers: [] }); return; }
    const data = await loadSearchData();
    setSearchResults({
      customers: (data.customers || []).filter(c => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q) || c.phone?.toLowerCase().includes(q)).slice(0, 5),
      orders: (data.orders || []).filter(o => o.id?.toLowerCase().includes(q) || o.customer?.toLowerCase().includes(q) || o.vehicle?.toLowerCase().includes(q) || o.service?.toLowerCase().includes(q)).slice(0, 5),
    });
  }, [loadSearchData]);

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    setSearchOpen(true);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => runSearch(value), 300);
  };

  const handleSearchFocus = () => { setSearchOpen(true); loadSearchData(); };
  const clearSearch = () => { setSearchQuery(""); setSearchResults({ orders: [], customers: [] }); };

  const { logout } = useAuth();
  const handleLogout = () => { logout(); navigate("/login"); };

  const handleAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { alert("Hanya file gambar"); return; }
    if (file.size > 2 * 1024 * 1024) { alert("Maksimal 2MB"); return; }
    const reader = new FileReader();
    reader.onloadend = () => setUser(prev => ({ ...prev, avatar: reader.result }));
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    if (window.confirm("Hapus foto profil?")) setUser(prev => ({ ...prev, avatar: null }));
  };

  const today = new Date().toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
  const hasQuery = searchQuery.trim().length >= 2;
  const hasResults = searchResults.orders.length > 0 || searchResults.customers.length > 0;

  return (
    <header
      className="relative z-[1000] flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-3 gap-3"
      style={{ background: "rgba(15,23,42,0.95)", backdropFilter: "blur(12px)", borderBottom: "1px solid rgba(96,165,250,0.06)" }}
    >
      {/* Mobile Menu */}
      <button onClick={onToggleSidebar} aria-label="Buka menu navigasi"
        className="md:hidden flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
        style={{ border: "1px solid rgba(96,165,250,0.1)" }}>
        <MdMenu size={20} />
      </button>

      {/* Search */}
      <div className="relative flex items-center flex-1 max-w-md" ref={searchRef}>
        <div className="relative w-full">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
          <input type="text" value={searchQuery} onChange={handleSearchChange} onFocus={handleSearchFocus}
            placeholder="Cari order, pelanggan, kendaraan..."
            className="w-full pl-10 pr-9 py-2 rounded-xl text-sm text-gray-300 outline-none transition-all"
            style={{ background: "rgba(15,23,42,0.4)", border: "1px solid rgba(96,165,250,0.1)" }} />
          {searchQuery && (
            <button onClick={clearSearch} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white transition-colors">
              <MdClose size={16} />
            </button>
          )}
        </div>

        {searchOpen && searchQuery.length > 0 && (
          <div className="absolute left-0 right-0 top-full mt-2 rounded-2xl overflow-hidden z-[9999]"
            style={{ background: "#0a1222", border: "1px solid rgba(96,165,250,0.15)", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
            {!hasQuery ? (
              <div className="px-4 py-4 text-xs text-gray-600">Ketik minimal 2 karakter untuk mencari...</div>
            ) : searchLoading ? (
              <div className="flex items-center justify-center py-8 text-gray-600 text-xs gap-2">
                <div className="w-4 h-4 border-2 border-blue-500/40 border-t-blue-400 rounded-full animate-spin" /> Mencari...
              </div>
            ) : !hasResults ? (
              <div className="flex flex-col items-center justify-center py-8 text-gray-600">
                <span className="text-2xl mb-2">🔍</span>
                <p className="text-xs">Tidak ada hasil untuk "{searchQuery}"</p>
              </div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {searchResults.customers.length > 0 && (
                  <>
                    <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Pelanggan</p>
                    {searchResults.customers.map((c) => (
                      <div key={c.id} onClick={() => { setSearchOpen(false); clearSearch(); navigate(`/customers/${encodeURIComponent(c.id)}`); }}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-blue-500/5 transition-colors">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(96,165,250,0.12)" }}>
                          <MdPerson className="text-blue-400" size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{c.name}</p>
                          <p className="text-gray-500 text-[11px] truncate">{c.email || c.phone || ""}</p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
                {searchResults.orders.length > 0 && (
                  <>
                    <p className="px-4 pt-3 pb-1 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Order</p>
                    {searchResults.orders.map((o) => (
                      <div key={o.id} onClick={() => { setSearchOpen(false); clearSearch(); navigate(`/orders/${encodeURIComponent(o.id)}`); }}
                        className="flex items-center gap-3 px-4 py-2.5 cursor-pointer hover:bg-blue-500/5 transition-colors">
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: "rgba(96,165,250,0.12)" }}>
                          <MdReceiptLong className="text-blue-400" size={16} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-white text-xs font-semibold truncate">{o.customer} · {o.id}</p>
                          <p className="text-gray-500 text-[11px] truncate flex items-center gap-1">
                            <MdDirectionsCar size={11} /> {o.vehicle?.split(" - ")[0] || o.service || ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Date */}
        <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{ background: "rgba(15,23,42,0.3)", border: "1px solid rgba(96,165,250,0.06)" }}>
          <MdCalendarToday size={14} className="text-blue-400" />
          <span className="text-xs text-gray-300">{today}</span>
        </div>

        {/* Notification */}
        <div className="relative" ref={notifRef}>
          <button onClick={() => setShowNotif(v => !v)}
            className="relative p-2 rounded-xl transition-all hover:bg-blue-500/10"
            style={{ border: "1px solid rgba(96,165,250,0.1)" }}>
            <MdNotifications className="text-gray-400 hover:text-blue-400" size={20} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
                style={{ background: "#3B82F6" }}>
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-[9999]"
              style={{ background: "#0a1222", border: "1px solid rgba(96,165,250,0.15)", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
              <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: "1px solid rgba(96,165,250,0.08)" }}>
                <span className="text-white text-sm font-semibold">Notifikasi</span>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button onClick={markAllRead} className="text-xs text-blue-400 flex items-center gap-1">
                      <MdDoneAll size={14} /> Tandai semua
                    </button>
                  )}
                  <button onClick={() => setShowNotif(false)} className="text-gray-500 hover:text-white"><MdClose size={16} /></button>
                </div>
              </div>
              <div className="max-h-72 overflow-y-auto">
                {notifLoading ? (
                  <div className="flex items-center justify-center py-8 text-gray-600 text-xs gap-2">
                    <div className="w-4 h-4 border-2 border-blue-500/40 border-t-blue-400 rounded-full animate-spin" /> Memuat...
                  </div>
                ) : notifs.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-gray-600">
                    <span className="text-3xl mb-2">🔔</span>
                    <p className="text-xs">Tidak ada notifikasi</p>
                  </div>
                ) : (
                  notifs.map((n) => (
                    <div key={n.id} onClick={() => { markRead(n.id); if (n.link) navigate(n.link); }}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-blue-500/5 transition-colors group ${n.read ? "opacity-50" : ""}`}>
                      <div className="w-8 h-8 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                        style={{ background: "rgba(96,165,250,0.12)" }}>
                        {n.icon || "🔔"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-1">
                          <p className="text-white text-xs font-semibold leading-tight">{n.title}</p>
                          <div className="flex items-center gap-1 flex-shrink-0">
                            {!n.read && <span className="w-1.5 h-1.5 rounded-full bg-blue-400 flex-shrink-0" />}
                            <button onClick={(e) => { e.stopPropagation(); dismiss(n.id); }}
                              className="opacity-0 group-hover:opacity-100 text-gray-600 hover:text-red-400 transition-all">
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

        {/* Profile */}
        <div className="relative" ref={profileRef}>
          <button onClick={() => setShowProfile(v => !v)}
            className="flex items-center gap-2 pl-1 pr-3 py-1 rounded-xl transition-all hover:bg-blue-500/10"
            style={{ border: "1px solid rgba(96,165,250,0.12)", background: "rgba(15,23,42,0.35)" }}>
            <div className="relative w-8 h-8 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-white text-xs font-bold"
              style={{ background: "linear-gradient(135deg,#3B82F6,#60A5FA)", border: "2px solid rgba(96,165,250,0.35)" }}>
              {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : getInitials(user.name)}
              <span className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-blue-400 border border-[#0a1222]" />
            </div>
            <div className="hidden md:block text-left leading-tight">
              <p className="text-xs font-semibold text-gray-200">{user.name}</p>
              <p className="text-[11px] text-gray-500">{user.role}</p>
            </div>
            <MdKeyboardArrowDown size={16} className="hidden md:block text-gray-500 transition-transform"
              style={{ transform: showProfile ? "rotate(180deg)" : "rotate(0deg)" }} />
          </button>

          {showProfile && (
            <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl overflow-hidden z-[9999]"
              style={{ background: "#0a1222", border: "1px solid rgba(96,165,250,0.15)", boxShadow: "0 20px 60px rgba(0,0,0,0.7)" }}>
              <div className="flex items-center gap-3 px-4 py-3" style={{ borderBottom: "1px solid rgba(96,165,250,0.08)" }}>
                <div className="relative w-10 h-10 rounded-full flex-shrink-0 overflow-hidden flex items-center justify-center text-white text-sm font-bold"
                  style={{ background: "linear-gradient(135deg,#3B82F6,#60A5FA)", border: "2px solid rgba(96,165,250,0.4)" }}>
                  {user.avatar ? <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" /> : getInitials(user.name)}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-blue-400 border border-[#0a1222]" />
                </div>
                <div>
                  <p className="text-white text-sm font-semibold">{user.name}</p>
                  <p className="text-gray-500 text-xs">{user.email}</p>
                </div>
              </div>

              <button onClick={() => fileInputRef.current?.click()}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-blue-400 hover:bg-blue-500/5 transition-all text-left">
                <MdPhotoCamera size={16} /> Ganti Foto Profil
              </button>
              {user.avatar && (
                <button onClick={handleRemoveAvatar}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-left">
                  <MdDeleteOutline size={16} /> Hapus Foto
                </button>
              )}
              <button onClick={() => { setShowProfile(false); navigate("/settings"); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-blue-400 hover:bg-blue-500/5 transition-all text-left">
                <MdPerson size={16} /> Kelola Profil
              </button>
              <button onClick={() => { setShowProfile(false); navigate("/settings"); }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-blue-400 hover:bg-blue-500/5 transition-all text-left">
                <MdSettings size={16} /> Pengaturan
              </button>

              <div style={{ height: "1px", background: "rgba(96,165,250,0.06)", margin: "4px 0" }} />
              <button onClick={handleLogout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-red-500/5 transition-all text-left">
                <MdLogout size={16} /> Logout
              </button>
            </div>
          )}

          <input type="file" ref={fileInputRef} accept="image/jpeg,image/png,image/jpg" onChange={handleAvatarUpload} className="hidden" />
        </div>
      </div>
    </header>
  );
}
