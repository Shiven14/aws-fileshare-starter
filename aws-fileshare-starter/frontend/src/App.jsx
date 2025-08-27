import React, { useEffect, useState } from "react";
import { getToken, login, logout } from "./auth.js";
import { apiPresign, apiList } from "./api.js";

export default function App() {
  const [token, setToken] = useState(null);
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const t = getToken();
    if (t) {
      setToken(t);
      refresh(t);
    }
  }, []);

  async function refresh(tkn = token) {
    try {
      setLoading(true);
      setError("");
      const data = await apiList(tkn);
      setFiles(data.items || []);
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  async function onUpload(e) {
    const file = e.target.files?.[0];
    if (!file || !token) return;
    try {
      setLoading(true);
      setError("");
      const { url } = await apiPresign("PUT", file.name, token, file.type);
      const putRes = await fetch(url, { method: "PUT", body: file });
      if (!putRes.ok) throw new Error("S3 upload failed");
      await new Promise(r => setTimeout(r, 800)); // give postProcess time
      await refresh();
      alert("Uploaded!");
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
      e.target.value = "";
    }
  }

  async function onDownload(key) {
    try {
      setLoading(true);
      const filename = key.split("/").pop();
      const { url } = await apiPresign("GET", filename, token);
      window.open(url, "_blank");
    } catch (e) {
      setError(String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ maxWidth: 720, margin: "40px auto", fontFamily: "system-ui, Arial", padding: "0 16px" }}>
      <h1>Fileshare</h1>
      <p>A tiny Dropbox‑lite on AWS (Cognito + API Gateway + Lambda + S3 + DynamoDB).</p>

      {!token ? (
        <button onClick={login}>Login with Cognito</button>
      ) : (
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <button onClick={logout}>Logout</button>
          <label style={{ border: "1px solid #ccc", padding: "6px 10px", borderRadius: 6, cursor: "pointer" }}>
            Upload file
            <input type="file" onChange={onUpload} style={{ display: "none" }} />
          </label>
          <button onClick={() => refresh()}>Refresh</button>
        </div>
      )}

      {loading && <p>Loading…</p>}
      {error && <p style={{ color: "crimson" }}>{error}</p>}

      <h2 style={{ marginTop: 24 }}>Your files</h2>
      {!token ? <p>Log in to see your files.</p> :
        files.length === 0 ? <p>No files uploaded yet.</p> : (
          <ul>
            {files.map(f => (
              <li key={f.objectKey} style={{ margin: "8px 0" }}>
                <code>{f.objectKey.split("/").slice(2).join("/")}</code>
                {" — "}{(f.size/1024).toFixed(1)} KB
                {" — "}{new Date(f.uploadedAt*1000).toLocaleString()}
                {" "}<button onClick={() => onDownload(f.objectKey)}>Download</button>
              </li>
            ))}
          </ul>
        )
      }
      <footer style={{ marginTop: 32, fontSize: 12, color: "#666" }}>
        <div>Free‑Tier safe: short‑lived presigned URLs, on‑demand DynamoDB, S3 lifecycle recommended.</div>
      </footer>
    </div>
  );
}