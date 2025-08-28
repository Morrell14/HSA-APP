import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:3001/api",
  headers: { "Content-Type": "application/json" }
});

// Helpers
export const toCents = (dollars: string | number) =>
  Math.round(Number(dollars) * 100);

export const fmt = (cents?: number | null) =>
  typeof cents === "number" ? `$${(cents / 100).toFixed(2)}` : "-";
