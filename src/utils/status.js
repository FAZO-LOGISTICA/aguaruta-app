// src/utils/status.js
export const ESTADOS = {
  1: { label: "Entregado", photo: "optional" },             // foto opcional
  2: { label: "No hay moradores (con foto)", photo: "required" },
  3: { label: "Dirección no existe (sin foto)", photo: "forbidden" },
  4: { label: "Camino malo (con foto)", photo: "required" },
};

export const CAMIONES = ["A1", "A2", "A3", "A4", "A5", "M1", "M2", "M3"];

export function hoyNombreDia() {
  const d = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
  return d[new Date().getDay()];
}

export const norm = (s) =>
  String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

