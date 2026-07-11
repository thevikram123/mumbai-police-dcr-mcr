import { stations } from "./data/reportData.js";

const SESSION_KEY = "mp-session";
export const STATION_PASSWORD = "station@123";
export const ADMIN_PASSWORD = "admin@123";

export function getSession() {
  try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch { return null; }
}

export function isAdmin() { return getSession()?.role === "admin"; }

export function sessionStation() {
  const session = getSession();
  if (!session || session.role !== "station") return null;
  return stations.find(s => s.name === session.station) || null;
}

export function loginStation(stationName, password) {
  const station = stations.find(s => s.name === stationName);
  if (!station) return { ok: false, error: "Please select your police station." };
  if (password !== STATION_PASSWORD) return { ok: false, error: "Incorrect password for station login." };
  localStorage.setItem(SESSION_KEY, JSON.stringify({ role: "station", station: station.name, loginAt: Date.now() }));
  return { ok: true };
}

export function loginAdmin(username, password) {
  if (username.trim().toLowerCase() !== "admin") return { ok: false, error: "Unknown administrator username." };
  if (password !== ADMIN_PASSWORD) return { ok: false, error: "Incorrect administrator password." };
  localStorage.setItem(SESSION_KEY, JSON.stringify({ role: "admin", loginAt: Date.now() }));
  return { ok: true };
}

export function logout() {
  localStorage.removeItem(SESSION_KEY);
}
