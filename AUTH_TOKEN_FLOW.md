# Flujo de Autenticación y Refresh Tokens

Este proyecto incluye un módulo ligero (`assets/js/auth.js`) para manejar **access tokens de vida corta** y su **renovación automática** mediante un refresh token almacenado en una **cookie httpOnly** (servida por el backend). Este documento describe el flujo esperado y cómo integrar un backend.

## Objetivos

- Minimizar re-inicios de sesión.
- Mantener tokens de acceso con vida corta (mejor seguridad).
- Refrescar en segundo plano cuando el access token expira.
- Evitar tormentas de peticiones de refresh (un solo refresh concurrente).

## Requisitos del Backend

| Endpoint | Método | Descripción | Respuesta esperada |
|----------|--------|-------------|--------------------|
| `/auth/login` | POST | Autentica credenciales iniciales. | `{ accessToken }` + Set-Cookie refresh_token (httpOnly, Secure) |
| `/auth/refresh` | POST | Retorna nuevo access token si refresh token válido. | `{ accessToken }` |
| `/auth/logout` | POST | Invalida el refresh token (opcional). | 204 o `{ ok: true }` |
| `/api/...` | GET/POST | Endpoints protegidos con `Authorization: Bearer <token>` | 200 / 401 |

### Respuestas de Error Recomendadas

- Access token expirado: **401** `{ "error": "token_expired" }`
- Refresh inválido/revocado: **401** `{ "error": "refresh_invalid" }`

## Ciclo de Vida de Tokens

1. Usuario hace login → backend responde con:
   - accessToken (payload corto: sub, exp ~15m) en JSON
   - refresh_token en Cookie httpOnly (HttpOnly; Secure; SameSite=Lax/Strict)
2. Frontend guarda solo el access token en memoria (`TokenStore`).
3. Cada petición protegida usa `authFetch` que añade `Authorization`.
4. Si recibe 401 + `token_expired` → dispara refresh:
   - Llama a `/auth/refresh` (envía cookie refresh automáticamente por `credentials: 'include'`).
   - Backend valida refresh token y retorna nuevo `accessToken`.
   - Reintenta automáticamente la petición original.
5. Si el refresh falla → se limpia token y se redirige a `/login`.

## Ejemplo Backend (Pseudo Node/Express)

```js
app.post('/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await findUser(email);
  if (!user || !verifyPass(password, user.hash)) {
    return res.status(401).json({ error: 'invalid_credentials' });
  }
  const accessToken = signAccess(user); // exp corto
  const refreshToken = signRefresh(user); // exp largo
  await storeRefresh(refreshToken, user.id);
  res.cookie('refresh_token', refreshToken, {
    httpOnly: true,
    secure: true,
    sameSite: 'Lax',
    path: '/auth'
  });
  res.json({ accessToken });
});

app.post('/auth/refresh', async (req, res) => {
  const token = req.cookies.refresh_token;
  if (!token) return res.status(401).json({ error: 'refresh_missing' });
  try {
    const payload = verifyRefresh(token);
    const stored = await isRefreshValid(token, payload.sub);
    if (!stored) return res.status(401).json({ error: 'refresh_invalid' });
    const newAccess = signAccess({ id: payload.sub });
    res.json({ accessToken: newAccess });
  } catch (e) {
    return res.status(401).json({ error: 'refresh_invalid' });
  }
});
```

## Uso en el Frontend

```html
<script src="/assets/js/auth.js"></script>
<script>
  // Después de login exitoso:
  // setInitialAccessToken(data.accessToken);

  // Llamada protegida:
  // getProtectedJson('/api/perfil')
  //   .then(perfil => console.log(perfil))
  //   .catch(err => console.error(err));
</script>
```

## Decodificar Exp y Refresh Proactivo (Opcional)

Puedes añadir lógica para refrescar 60s antes de expirar el token decodificando el JWT (`exp`).

## Errores Comunes

| Problema | Causa | Solución |
|---------|-------|----------|
| Loop infinito de refresh | Backend siempre responde 401 | Asegurar que `/auth/refresh` emita 200 con nuevo token válido |
| 401 tras refresh | Access token no se actualiza en memoria | Verificar `TokenStore.set()` se ejecuta |
| Refresh no se manda | Falta `credentials: 'include'` | Añadir en fetch refresh |

## Seguridad

- Access token en memoria → mitiga robo por XSS persistente (aunque no elimina riesgos).
- Refresh en cookie httpOnly: no accesible por JS.
- Rotación de refresh tokens al usarlos (opcional) mejora seguridad.
- Incluir `SameSite=Lax` (o Strict) reduce CSRF básico.
- Para CSRF más fuerte: token anti-CSRF adicional en encabezado custom.

## Próximos Pasos (si se implementa backend)

- Añadir endpoint `/auth/me` para obtener perfil al cargar.
- Añadir revocación de refresh tokens (lista negra o rotating tokens).
- Implementar `logout` que invalida refresh + limpia cookie.

---

**Resumen**: `authFetch` centraliza la lógica, mantiene UX fluida y limita la exposición de credenciales. Ajusta nombres de endpoints según tu backend real.
