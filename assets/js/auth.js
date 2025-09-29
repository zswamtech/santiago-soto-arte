/*
 * auth.js - Manejo de access token + refresh para fetch
 *
 * Requisitos esperados del backend:
 *  - Endpoint POST /auth/refresh (envía cookie httpOnly con refresh token) -> { accessToken }
 *  - Respuestas 401 con cuerpo { error: 'token_expired' } cuando el access token caduca
 *  - Opcional: endpoint /auth/login que emite cookie refresh + access inicial
 *
 * NOTA: El refresh token NO se almacena aquí; se asume cookie segura httpOnly.
 */

const TokenStore = (() => {
  let accessToken = null; // Sólo en memoria
  return {
    get: () => accessToken,
    set: (t) => { accessToken = t; },
    clear: () => { accessToken = null; }
  };
})();

let isRefreshing = false;
let refreshPromise = null;
const pendingQueue = []; // { resolve, reject, requestArgs }

function enqueue(requestArgs) {
  return new Promise((resolve, reject) => {
    pendingQueue.push({ resolve, reject, requestArgs });
  });
}

function flushQueue(error, newToken) {
  while (pendingQueue.length) {
    const { resolve, reject, requestArgs } = pendingQueue.shift();
    if (error) {
      reject(error);
    } else {
      resolve(authFetch(...requestArgs));
    }
  }
}

async function performRefresh() {
  if (isRefreshing) return refreshPromise;
  isRefreshing = true;
  refreshPromise = (async () => {
    try {
      const resp = await fetch('/auth/refresh', {
        method: 'POST',
        credentials: 'include'
      });
      if (!resp.ok) throw new Error('REFRESH_FAILED');
      const data = await resp.json();
      if (!data.accessToken) throw new Error('NO_ACCESS_TOKEN');
      TokenStore.set(data.accessToken);
      return data.accessToken;
    } catch (err) {
      TokenStore.clear();
      throw err;
    } finally {
      isRefreshing = false;
    }
  })();
  return refreshPromise;
}

function isProbablyExpired401(status, body) {
  if (status !== 401) return false;
  if (!body) return true; // fallback
  return body.error === 'token_expired' || body.code === 'TOKEN_EXPIRED';
}

export async function authFetch(input, init = {}) {
  const opts = { ...init, headers: { ...(init.headers || {}) } };
  const token = TokenStore.get();
  if (token) {
    opts.headers['Authorization'] = `Bearer ${token}`;
  }

  let response = await fetch(input, opts);

  if (response.status !== 401) {
    return response; // éxito normal o error distinto
  }

  // Intentar parsear body para distinguir causa
  let bodyJson = null;
  try { bodyJson = await response.clone().json(); } catch (_) {}

  if (!isProbablyExpired401(response.status, bodyJson)) {
    return response; // 401 real (no caducidad gestionable)
  }

  // Manejo de refresh
  try {
    if (isRefreshing) {
      // Esperar a que otro refresh termine y reintentar
      return await enqueue([input, init]);
    }
    await performRefresh();
    // Reintentar original con nuevo token
    return await authFetch(input, init);
  } catch (err) {
    flushQueue(err, null);
    // Redirigir a login (ajustar a tu ruta real)
    console.warn('[auth] Refresh falló, redirigiendo a login');
    window.location.href = '/login';
    throw err;
  }
}

// Ejemplo helper de API
export async function getProtectedJson(url) {
  const resp = await authFetch(url);
  if (!resp.ok) throw new Error('Request failed: ' + resp.status);
  return resp.json();
}

// API para inyectar el access token inicial (después de un login)
export function setInitialAccessToken(t) {
  TokenStore.set(t);
}

// API logout
export function logout() {
  TokenStore.clear();
  // Opcional: llamar a /auth/logout si existe
}
