// ─────────────────────────────────────────────────────────────────────────────
// seedLocalStorage.js
// Letakkan file ini di: src/utils/seedLocalStorage.js
//
// Fungsi ini otomatis mengisi localStorage dengan data sample saat pertama kali
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
  if (localStorage.getItem(SEED_KEY)) return;

  try {
    // Orders
    if (!localStorage.getItem("garage_orders")) {
      localStorage.setItem("garage_orders", JSON.stringify(ordersData));
    }

    // Inventory
    if (!localStorage.getItem("garage_inventory")) {
      localStorage.setItem("garage_inventory", JSON.stringify(inventoryData));
    }

    // Mechanics
    if (!localStorage.getItem("garage_mechanics")) {
      localStorage.setItem("garage_mechanics", JSON.stringify(mechanicsData));
    }

    // Vehicles
    if (!localStorage.getItem("garage_vehicles")) {
      localStorage.setItem("garage_vehicles", JSON.stringify(vehiclesData));
    }

    // Customers / Members
    // CustomerAuthContext menyimpan customers dengan key "eg_customers"
    if (!localStorage.getItem("eg_customers")) {
      localStorage.setItem("eg_customers", JSON.stringify(customersData));
    }

    // Tandai sudah di-seed
    localStorage.setItem(SEED_KEY, "true");

    console.log("[Esther Garage] ✅ Demo data loaded to localStorage.");
  } catch (err) {
    console.warn("[Esther Garage] ⚠️ Seed gagal:", err);
  }
}

/**
 * Panggil ini kalau mau reset semua data ke kondisi awal
 * (misal: tombol "Reset Demo Data" di Settings)
 */
export function resetSeed() {
  localStorage.removeItem(SEED_KEY);
  localStorage.removeItem("garage_orders");
  localStorage.removeItem("garage_inventory");
  localStorage.removeItem("garage_mechanics");
  localStorage.removeItem("garage_vehicles");
  localStorage.removeItem("eg_customers");
  seedLocalStorageIfEmpty();
}