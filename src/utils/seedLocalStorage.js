// ─────────────────────────────────────────────────────────────────────────────
// seedLocalStorage.js
// Letakkan file ini di: src/utils/seedLocalStorage.js
//
// Fungsi ini otomatis mengisi sessionStorage dengan data sample saat pertama kali
// dibuka, sehingga Dashboard tidak kosong waktu presentasi / deploy.
// ─────────────────────────────────────────────────────────────────────────────

import ordersData     from "../data/ordersData.json";
import inventoryData  from "../data/inventoryData.json";
import mechanicsData  from "../data/mechanicsData.json";
import vehiclesData   from "../data/vehiclesData.json";
import customersData  from "../data/customersData.json";

const SEED_KEY = "eg_seeded_v1"; // ganti versi kalau mau reset ulang

export function seedLocalStorageIfEmpty() {
  // Jangan seed kalau sudah pernah di-seed sebelumnya
  if (sessionStorage.getItem(SEED_KEY)) return;

  try {
    // Orders
    if (!sessionStorage.getItem("garage_orders")) {
      sessionStorage.setItem("garage_orders", JSON.stringify(ordersData));
    }

    // Inventory
    if (!sessionStorage.getItem("garage_inventory")) {
      sessionStorage.setItem("garage_inventory", JSON.stringify(inventoryData));
    }

    // Mechanics
    if (!sessionStorage.getItem("garage_mechanics")) {
      sessionStorage.setItem("garage_mechanics", JSON.stringify(mechanicsData));
    }

    // Vehicles
    if (!sessionStorage.getItem("garage_vehicles")) {
      sessionStorage.setItem("garage_vehicles", JSON.stringify(vehiclesData));
    }

    // Customers / Members
    // CustomerAuthContext menyimpan customers dengan key "eg_customers"
    if (!sessionStorage.getItem("eg_customers")) {
      sessionStorage.setItem("eg_customers", JSON.stringify(customersData));
    }

    // Tandai sudah di-seed
    sessionStorage.setItem(SEED_KEY, "true");

    console.log("[Esther Garage] ✅ Demo data loaded to sessionStorage.");
  } catch (err) {
    console.warn("[Esther Garage] ⚠️ Seed gagal:", err);
  }
}

/**
 * Panggil ini kalau mau reset semua data ke kondisi awal
 * (misal: tombol "Reset Demo Data" di Settings)
 */
export function resetSeed() {
  sessionStorage.removeItem(SEED_KEY);
  sessionStorage.removeItem("garage_orders");
  sessionStorage.removeItem("garage_inventory");
  sessionStorage.removeItem("garage_mechanics");
  sessionStorage.removeItem("garage_vehicles");
  sessionStorage.removeItem("eg_customers");
  seedLocalStorageIfEmpty();
}