// src/api.js
const API_BASE = import.meta.env.VITE_API_BASE;

export async function apiPresign(op, key, token, contentType) {
  const res = await fetch(`${API_BASE}/presign`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${token}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ op, key, contentType })
  });
  if (!res.ok) throw new Error(`presign failed: ${res.status}`);
  return res.json();
}

export async function apiList(token) {
  const res = await fetch(`${API_BASE}/list`, {
    headers: { "Authorization": `Bearer ${token}` }
  });
  if (!res.ok) throw new Error(`list failed: ${res.status}`);
  return res.json();
}