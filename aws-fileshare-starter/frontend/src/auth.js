// src/auth.js
const domain = import.meta.env.VITE_COGNITO_DOMAIN;
const clientId = import.meta.env.VITE_USER_POOL_CLIENT_ID;
const redirectUri = encodeURIComponent(import.meta.env.VITE_REDIRECT_URI);
const logoutUri = encodeURIComponent(import.meta.env.VITE_LOGOUT_URI);
const region = import.meta.env.VITE_REGION;

export function getToken() {
  // Priority: sessionStorage -> URL fragment -> null
  const existing = sessionStorage.getItem("id_token");
  if (existing) return existing;

  const hash = window.location.hash;
  if (hash && hash.includes("id_token=")) {
    const params = new URLSearchParams(hash.substring(1));
    const idToken = params.get("id_token");
    if (idToken) {
      sessionStorage.setItem("id_token", idToken);
      // cleanup URL
      history.replaceState({}, document.title, window.location.pathname);
      return idToken;
    }
  }
  return null;
}

export function login() {
  const url = `https://${domain}/login?client_id=${clientId}&response_type=token&scope=openid+email+profile&redirect_uri=${redirectUri}`;
  window.location.href = url;
}

export function logout() {
  sessionStorage.removeItem("id_token");
  const url = `https://${domain}/logout?client_id=${clientId}&logout_uri=${logoutUri}&response_type=token`;
  window.location.href = url;
}