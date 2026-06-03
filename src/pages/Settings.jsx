import { useState, useEffect, useRef } from "react";
import {
  MdBusiness,
  MdPerson,
  MdLock,
  MdNotifications,
  MdSave,
  MdPhotoCamera,
  MdDeleteOutline,
} from "react-icons/md";
import PageHeader from "../components/PageHeader";

export default function Settings() {
  const [activeTab, setActiveTab] = useState("profile");

  // Data user (sama dengan yang dipakai di Header)
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem("user_profile");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      name: "Admin Workshop",
      role: "Manajer",
      email: "admin@bengkel.id",
      phone: "0812-9999-0000",
      avatar: null,
    };
  });

  const [business, setBusiness] = useState(() => {
    const saved = localStorage.getItem("eg_business");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      name: "EstherGarage",
      address: "Jl. Otomotif No. 1, Jakarta",
      hours: "08:00 - 17:00",
    };
  });

  const [security, setSecurity] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem("eg_notifications");
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      orderBaru: true,
      servisSelesai: true,
      stokMenipis: false,
      laporanHarian: true,
    };
  });

  // Untuk menghindari event di render pertama
  const isFirstRender = useRef(true);

  // Kirim event ke Header setiap user berubah (kecuali pertama kali)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.dispatchEvent(new CustomEvent("userProfileUpdated", { detail: user }));
  }, [user]);

  // Simpan user ke localStorage setiap berubah
  useEffect(() => {
    localStorage.setItem("user_profile", JSON.stringify(user));
  }, [user]);

  // Simpan business
  useEffect(() => {
    localStorage.setItem("eg_business", JSON.stringify(business));
  }, [business]);

  // Simpan notifikasi
  useEffect(() => {
    localStorage.setItem("eg_notifications", JSON.stringify(notifications));
  }, [notifications]);

  const tabs = [
    { id: "profile", icon: MdPerson, label: "Profil" },
    { id: "business", icon: MdBusiness, label: "Bengkel" },
    { id: "security", icon: MdLock, label: "Keamanan" },
    { id: "notif", icon: MdNotifications, label: "Notifikasi" },
  ];

  const handleSaveProfile = () => {
    // Event sudah otomatis terkirim lewat useEffect, tinggal notifikasi
    alert("Profil berhasil disimpan!");
  };

  const handleSaveBusiness = () => {
    alert("Data bengkel berhasil disimpan!");
  };

  const handleSaveSecurity = () => {
    if (security.newPassword !== security.confirmPassword) {
      alert("Konfirmasi password tidak cocok!");
      return;
    }
    // Di sini nanti panggil API ganti password
    alert("Password berhasil diperbarui!");
    setSecurity({
      oldPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const handleSaveNotif = () => {
    alert("Pengaturan notifikasi berhasil disimpan!");
  };

  // Handler upload foto profil
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
    <div className="page-animate">
      <PageHeader title="Pengaturan" breadcrumb={["Pengaturan"]} />

      <div className="glass-card overflow-hidden">
        {/* Tabs */}
        <div
          className="flex border-b"
          style={{ borderColor: "rgba(34,197,94,0.1)" }}
        >
          {tabs.map(({ id, icon: Icon, label }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center gap-2 px-5 py-3.5 text-sm font-medium transition-all ${
                activeTab === id
                  ? "text-green-400 border-b-2 border-green-400"
                  : "text-gray-500 hover:text-gray-300"
              }`}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>

        <div className="p-6 max-w-xl">
          {/* PROFILE (dengan upload foto) */}
          {activeTab === "profile" && (
            <div className="space-y-5">
              <h3 className="text-white font-semibold">Foto Profil</h3>

              <div className="flex items-center gap-4">
                {/* Preview Avatar */}
                <div
                  className="relative w-20 h-20 rounded-full overflow-hidden flex items-center justify-center text-white text-2xl font-bold"
                  style={{
                    background: "linear-gradient(135deg,#16a34a,#4ade80)",
                    border: "2px solid rgba(34,197,94,0.4)",
                  }}
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span>
                      {user.name
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </span>
                  )}
                  <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-400 border-2 border-[#041c15]" />
                </div>

                <div className="flex gap-2">
                  <label className="cursor-pointer bg-green-500/10 hover:bg-green-500/20 text-green-400 px-3 py-1.5 rounded-xl text-sm flex items-center gap-1 transition-all">
                    <MdPhotoCamera size={16} />
                    Pilih Foto
                    <input
                      type="file"
                      accept="image/jpeg,image/png,image/jpg"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </label>

                  {user.avatar && (
                    <button
                      onClick={handleRemoveAvatar}
                      className="bg-red-500/10 hover:bg-red-500/20 text-red-400 px-3 py-1.5 rounded-xl text-sm flex items-center gap-1 transition-all"
                    >
                      <MdDeleteOutline size={16} />
                      Hapus
                    </button>
                  )}
                </div>
              </div>

              <hr style={{ borderColor: "rgba(34,197,94,0.1)" }} />

              <h3 className="text-white font-semibold pt-2">
                Informasi Profil
              </h3>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Nama Lengkap
                </label>
                <input
                  value={user.name}
                  onChange={(e) => setUser({ ...user, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-white"
                  style={{
                    background: "rgba(11,59,46,0.4)",
                    border: "1px solid rgba(34,197,94,0.12)",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Email
                </label>
                <input
                  value={user.email}
                  onChange={(e) => setUser({ ...user, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-white"
                  style={{
                    background: "rgba(11,59,46,0.4)",
                    border: "1px solid rgba(34,197,94,0.12)",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Telepon
                </label>
                <input
                  value={user.phone || ""}
                  onChange={(e) => setUser({ ...user, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl text-white"
                  style={{
                    background: "rgba(11,59,46,0.4)",
                    border: "1px solid rgba(34,197,94,0.12)",
                  }}
                />
              </div>

              <button
                onClick={handleSaveProfile}
                className="btn-primary flex items-center gap-2"
              >
                <MdSave />
                Simpan Perubahan
              </button>
            </div>
          )}

          {/* BENGKEL */}
          {activeTab === "business" && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Informasi Bengkel</h3>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Nama Bengkel
                </label>
                <input
                  value={business.name}
                  onChange={(e) =>
                    setBusiness({ ...business, name: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl text-white"
                  style={{
                    background: "rgba(11,59,46,0.4)",
                    border: "1px solid rgba(34,197,94,0.12)",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Alamat
                </label>
                <input
                  value={business.address}
                  onChange={(e) =>
                    setBusiness({ ...business, address: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl text-white"
                  style={{
                    background: "rgba(11,59,46,0.4)",
                    border: "1px solid rgba(34,197,94,0.12)",
                  }}
                />
              </div>

              <div>
                <label className="block text-sm text-gray-400 mb-2">
                  Jam Operasional
                </label>
                <input
                  value={business.hours}
                  onChange={(e) =>
                    setBusiness({ ...business, hours: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl text-white"
                  style={{
                    background: "rgba(11,59,46,0.4)",
                    border: "1px solid rgba(34,197,94,0.12)",
                  }}
                />
              </div>

              <button
                onClick={handleSaveBusiness}
                className="btn-primary flex items-center gap-2"
              >
                <MdSave />
                Simpan Perubahan
              </button>
            </div>
          )}

          {/* KEAMANAN */}
          {activeTab === "security" && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold">Ubah Password</h3>

              <input
                type="password"
                placeholder="Password Lama"
                value={security.oldPassword}
                onChange={(e) =>
                  setSecurity({ ...security, oldPassword: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl text-white"
                style={{
                  background: "rgba(11,59,46,0.4)",
                  border: "1px solid rgba(34,197,94,0.12)",
                }}
              />

              <input
                type="password"
                placeholder="Password Baru"
                value={security.newPassword}
                onChange={(e) =>
                  setSecurity({ ...security, newPassword: e.target.value })
                }
                className="w-full px-4 py-3 rounded-xl text-white"
                style={{
                  background: "rgba(11,59,46,0.4)",
                  border: "1px solid rgba(34,197,94,0.12)",
                }}
              />

              <input
                type="password"
                placeholder="Konfirmasi Password Baru"
                value={security.confirmPassword}
                onChange={(e) =>
                  setSecurity({
                    ...security,
                    confirmPassword: e.target.value,
                  })
                }
                className="w-full px-4 py-3 rounded-xl text-white"
                style={{
                  background: "rgba(11,59,46,0.4)",
                  border: "1px solid rgba(34,197,94,0.12)",
                }}
              />

              <button
                onClick={handleSaveSecurity}
                className="btn-primary flex items-center gap-2"
              >
                <MdSave />
                Ubah Password
              </button>
            </div>
          )}

          {/* NOTIFIKASI */}
          {activeTab === "notif" && (
            <div className="space-y-4">
              <h3 className="text-white font-semibold">
                Pengaturan Notifikasi
              </h3>

              {Object.entries(notifications).map(([key, value]) => (
                <label
                  key={key}
                  className="flex items-center justify-between p-3 rounded-xl"
                  style={{
                    background: "rgba(11,59,46,0.3)",
                    border: "1px solid rgba(34,197,94,0.1)",
                  }}
                >
                  <span className="text-gray-300 capitalize">
                    {key.replace(/([A-Z])/g, " $1")}
                  </span>

                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() =>
                      setNotifications({
                        ...notifications,
                        [key]: !value,
                      })
                    }
                  />
                </label>
              ))}

              <button
                onClick={handleSaveNotif}
                className="btn-primary flex items-center gap-2"
              >
                <MdSave />
                Simpan Pengaturan
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}