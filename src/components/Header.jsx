import { useState, useRef, useEffect } from "react";
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
} from "react-icons/md";

const initialNotifs = [
  {
    id: 1,
    type: "order",
    icon: MdAdd,
    title: "Order baru masuk",
    desc: "Rahmat Hidayat — Tune Up NMAX",
    time: "2 menit lalu",
    read: false,
  },
  {
    id: 2,
    type: "done",
    icon: MdCheckCircle,
    title: "Servis selesai",
    desc: "Andi Wijaya — Servis Berkala Avanza",
    time: "15 menit lalu",
    read: false,
  },
  {
    id: 3,
    type: "schedule",
    icon: MdSchedule,
    title: "Jadwal mendesak",
    desc: "Dewi Lestari jam 13:30 — Servis Rem",
    time: "1 jam lalu",
    read: false,
  },
];

export default function Header({ onToggleSidebar }) {
  const navigate = useNavigate();

  const [notifs, setNotifs] = useState(initialNotifs);
  const [showNotif, setShowNotif] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifs.filter((n) => !n.read).length;

  const notifColors = {
    order: "#22C55E",
    done: "#16A34A",
    schedule: "#EAB308",
  };

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };

    document.addEventListener("mousedown", handler);

    return () => {
      document.removeEventListener("mousedown", handler);
    };
  }, []);

  const markAllRead = () =>
    setNotifs((prev) => prev.map((n) => ({ ...n, read: true })));

  const markRead = (id) =>
    setNotifs((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );

  const today = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const handleLogout = () => {
    localStorage.removeItem("eg_token");
    navigate("/login");
  };

  return (
    <header
      className="relative z-[1000] flex-shrink-0 flex items-center justify-between px-4 md:px-6 py-3 gap-3"
      style={{
        background: "rgba(4,28,21,0.95)",
        backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(34,197,94,0.08)",
      }}
    >
      {/* Mobile Menu */}
      <button
        onClick={onToggleSidebar}
        aria-label="Buka menu navigasi"
        className="md:hidden flex-shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-green-400 hover:bg-green-500/10 transition-all"
        style={{
          border: "1px solid rgba(34,197,94,0.1)",
        }}
      >
        <MdMenu size={20} />
      </button>

      {/* Search */}
      <div className="flex items-center flex-1 max-w-md">
        <div className="relative w-full">
          <MdSearch
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
            size={18}
          />

          <input
            type="text"
            placeholder="Cari order, pelanggan, kendaraan..."
            className="w-full pl-10 pr-4 py-2 rounded-xl text-sm text-gray-300 outline-none transition-all"
            style={{
              background: "rgba(11,59,46,0.4)",
              border: "1px solid rgba(34,197,94,0.1)",
            }}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        {/* Date */}
        <div
          className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-xl"
          style={{
            background: "rgba(11,59,46,0.3)",
            border: "1px solid rgba(34,197,94,0.08)",
          }}
        >
          <MdCalendarToday size={14} className="text-green-500" />
          <span className="text-xs text-gray-300">{today}</span>
        </div>

        {/* Notification */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotif((v) => !v)}
            className="relative p-2 rounded-xl transition-all hover:bg-green-500/10"
            style={{
              border: "1px solid rgba(34,197,94,0.1)",
            }}
          >
            <MdNotifications
              className="text-gray-400 hover:text-green-400"
              size={20}
            />

            {unreadCount > 0 && (
              <span
                className="absolute -top-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-xs font-bold text-white"
                style={{ background: "#16A34A" }}
              >
                {unreadCount}
              </span>
            )}
          </button>

          {showNotif && (
            <div
              className="absolute right-0 top-full mt-2 w-80 rounded-2xl overflow-hidden z-[9999]"
              style={{
                background: "#051a0e",
                border: "1px solid rgba(34,197,94,0.2)",
                boxShadow: "0 20px 60px rgba(0,0,0,0.7)",
              }}
            >
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{
                  borderBottom: "1px solid rgba(34,197,94,0.1)",
                }}
              >
                <span className="text-white text-sm font-semibold">
                  Notifikasi
                </span>

                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllRead}
                      className="text-xs text-green-400 flex items-center gap-1"
                    >
                      <MdDoneAll size={14} />
                      Tandai semua
                    </button>
                  )}

                  <button
                    onClick={() => setShowNotif(false)}
                    className="text-gray-500 hover:text-white"
                  >
                    <MdClose size={16} />
                  </button>
                </div>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {notifs.map((n) => {
                  const Icon = n.icon;

                  return (
                    <div
                      key={n.id}
                      onClick={() => markRead(n.id)}
                      className={`flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-green-500/5 ${
                        n.read ? "opacity-50" : ""
                      }`}
                    >
                      <div
                        className="w-8 h-8 rounded-xl flex items-center justify-center"
                        style={{
                          background: "rgba(34,197,94,0.12)",
                        }}
                      >
                        <Icon
                          size={15}
                          style={{
                            color: notifColors[n.type],
                          }}
                        />
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-white text-xs font-semibold">
                            {n.title}
                          </p>

                          {!n.read && (
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{
                                background: "#22C55E",
                              }}
                            />
                          )}
                        </div>

                        <p className="text-gray-500 text-xs">{n.desc}</p>

                        <p className="text-gray-600 text-xs mt-1">{n.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-gray-400 hover:text-red-400 transition-all"
          style={{
            border: "1px solid rgba(34,197,94,0.08)",
          }}
        >
          <MdLogout size={16} />
          <span className="hidden md:block">Logout</span>
        </button>
      </div>
    </header>
  );
}
