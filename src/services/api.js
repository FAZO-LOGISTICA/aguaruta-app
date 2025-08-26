// src/services/api.js
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";

const KEY_BASE = "API_BASE_URL";
const KEY_OUTBOX = "OUTBOX_ENTREGAS";

// ---------------- Base URL ----------------
export async function getBaseUrl() {
  return (await AsyncStorage.getItem(KEY_BASE)) || "";
}
export async function setBaseUrl(url) {
  const clean = String(url || "").replace(/\/+$/, "");
  await AsyncStorage.setItem(KEY_BASE, clean);
}
export async function tryAutoBaseUrl() {
  // opcional: si guardas en AsyncStorage "AUTO_URL_HINT" con una URL que
  // devuelva texto plano con la URL final (url.txt), se autoconfigura.
  try {
    const hint = await AsyncStorage.getItem("AUTO_URL_HINT");
    if (!hint) return false;
    const { data } = await axios.get(`${hint}/url.txt`, { timeout: 6000 });
    if (data && typeof data === "string" && data.startsWith("http")) {
      await setBaseUrl(data.trim());
      return true;
    }
  } catch {}
  return false;
}

async function http() {
  const baseURL = await getBaseUrl();
  if (!baseURL) throw new Error("Configura el servidor en la pantalla 'Servidor'.");
  return axios.create({ baseURL, timeout: 20000 });
}

// ---------------- API ----------------
export async function fetchConductores() {
  try {
    const cli = await http();
    const { data } = await cli.get("/conductores");
    if (data && Array.isArray(data.camiones)) return data.camiones;
  } catch {}
  // fallback
  return ["A1", "A2", "A3", "A4", "A5", "M1", "M2", "M3"];
}

export async function fetchRutas({ camion, dia }) {
  // el backend puede ignorar filtros; en ese caso filtramos en el cliente
  const cli = await http();
  const { data } = await cli.get("/rutas-activas", { params: { camion, dia } });
  return Array.isArray(data) ? data : [];
}

export async function postEntrega(payload, imageUri) {
  const cli = await http();
  const form = new FormData();

  // Campos form-data (convertimos a string por compatibilidad RN)
  Object.entries(payload).forEach(([k, v]) => form.append(k, String(v)));

  if (imageUri) {
    const name = imageUri.split("/").pop() || "evidencia.jpg";
    form.append("foto", { uri: imageUri, name, type: "image/jpeg" });
  }

  const { data } = await cli.post("/entregas-app", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}

// ---------------- Outbox (offline) ----------------
export async function queueEntrega(item) {
  const raw = await AsyncStorage.getItem(KEY_OUTBOX);
  const arr = raw ? JSON.parse(raw) : [];
  arr.push(item);
  await AsyncStorage.setItem(KEY_OUTBOX, JSON.stringify(arr));
}
export async function getOutbox() {
  const raw = await AsyncStorage.getItem(KEY_OUTBOX);
  return raw ? JSON.parse(raw) : [];
}
export async function clearOneFromOutbox(index) {
  const arr = await getOutbox();
  arr.splice(index, 1);
  await AsyncStorage.setItem(KEY_OUTBOX, JSON.stringify(arr));
}
export async function trySendOrQueue(payload, imageUri) {
  try {
    return await postEntrega(payload, imageUri);
  } catch {
    await queueEntrega({ payload, imageUri });
    return { ok: false, queued: true };
  }
}

