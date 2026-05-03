# Fase 5 — Admin login y dashboard de órdenes (slice 4)

Esta slice da vida al panel admin: login con JWT, ruta protegida, lista
de órdenes con tabs por estado y botones para avanzar la state machine.
Todo el plumbing de auth queda listo para que la siguiente slice
enchufe SignalR sin tocar nada de seguridad.

> **Decisiones clave**
>
> - **Token en localStorage vía Zustand persist**: simple para empezar.
>   Sé que tiene riesgos de XSS — está anotado en
>   `project_cafe_deploy_security_todo.md` para hardening pre-deploy
>   (httpOnly cookies + refresh tokens en su momento).
> - **Sin refresh tokens**: la sesión dura `Jwt:AccessTokenMinutes` (60).
>   Cuando expira, el guard manda al login. Aceptable para este caso
>   (un solo admin, una tablet, un turno).
> - **Layout separado**: `AdminLayout` no comparte nada con el público.
>   No queremos que el barista vea "Order now" en su pantalla, y no
>   queremos cargar el carrito ni el footer público en el admin.
> - **Polling cada 15s como fallback**: hasta que la slice 5 enganche
>   SignalR, el dashboard refresca solo cada 15 segundos. Después de
>   SignalR, este polling se mantiene como red de seguridad (si la
>   conexión WS muere, el polling sigue trayendo datos).

---

## 1. authStore — el corazón de la sesión

`src/store/authStore.ts`:

```ts
interface AuthState {
  accessToken: string | null;
  expiresAtUtc: string | null;
  displayName: string | null;
  setSession: (...) => void;
  clear: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist((set) => ({...}), { name: "glorycafe.auth" }),
);

export function isSessionValid(state: AuthState): boolean {
  if (!state.accessToken || !state.expiresAtUtc) return false;
  return new Date(state.expiresAtUtc).getTime() > Date.now();
}
```

Tres responsabilidades:
1. **Persistir** la sesión en `localStorage` con key `glorycafe.auth`.
2. **Saber si la sesión es válida** comparando `expiresAtUtc` contra ahora.
3. **Exponer `getAccessToken()`** que retorna `null` si está expirado —
   el interceptor de axios lo usa para no enviar tokens vencidos.

> **Por qué guardar `expiresAtUtc` separado**: el JWT en sí también lo
> tiene en su `exp` claim, pero parsearlo en cada request sería
> innecesario. El backend nos lo entrega ya extraído al hacer login.

---

## 2. Interceptor de axios — Authorization automático

`src/api/client.ts`:

```ts
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
```

Y en respuestas:
```ts
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const path = error.config?.url ?? "";
      if (path.includes("/api/admin/")) {
        useAuthStore.getState().clear();
      }
    }
    return Promise.reject(error);
  },
);
```

> **Por qué solo limpiar la sesión en 401 de rutas `/api/admin/`**: si
> un endpoint público devuelve 401 por un bug, no queremos cerrar la
> sesión del admin que está mirando otra pestaña. Solo cuando el admin
> intenta usar su token y el backend lo rechaza, el cliente sabe que la
> sesión murió.

---

## 3. RequireAuth — el guard

```tsx
export default function RequireAuth({ children }: Props) {
  const state = useAuthStore();
  const location = useLocation();
  if (!isSessionValid(state)) {
    return <Navigate to="/admin/login" replace state={{ from: location.pathname }} />;
  }
  return <>{children}</>;
}
```

Se monta como wrapper del layout admin en el router:
```tsx
<Route path="/admin" element={<RequireAuth><AdminLayout /></RequireAuth>}>
  <Route index element={<Navigate to="orders" replace />} />
  <Route path="orders" element={<AdminOrders />} />
  <Route path="orders/:id" element={<AdminOrderDetail />} />
</Route>
```

- El guard verifica antes de pintar cualquier ruta admin.
- Pasa `state.from` al login para volver a donde el admin intentaba ir.
- `<Route index>` redirige `/admin` → `/admin/orders` automáticamente.

---

## 4. AdminLogin — manejo de errores específicos

```tsx
onError: (err) => {
  if (err instanceof AxiosError) {
    if (err.response?.status === 401)      setError("Wrong email or password.");
    else if (err.response?.status === 429) setError("Too many attempts...");
    else                                   setError("Could not sign in...");
  }
}
```

El backend tiene rate limit de 5 intentos por minuto en `/api/admin/auth/login`.
Cuando se dispara, el servidor responde 429. La UI lo distingue de un
401 normal para que el barista no piense que su contraseña está mal.

Hay también un atajo: si ya hay sesión válida cuando alguien navega a
`/admin/login`, redirige automáticamente a `/admin/orders`.

---

## 5. AdminOrders — la pantalla central

### Tabs por estado

```ts
const TABS = [
  { label: "Pending",   value: "Pending"   },
  { label: "Preparing", value: "Preparing" },
  { label: "Ready",     value: "Ready"     },
  { label: "Completed", value: "Completed" },
  { label: "All",       value: "all"       },
];
```

Cada tab dispara una query con su filtro de status (o sin filtro para
"All"). El backend ya soporta `?status=Pending` (recibe el enum como
string gracias al `JsonStringEnumConverter` global).

### Auto-refresh

```tsx
useQuery({
  queryKey: ["admin", "orders", tab],
  queryFn: () => getAdminOrders(...),
  refetchInterval: 15_000,
});
```

15 segundos es el sweet spot:
- Suficientemente frecuente para que el barista no se preocupe
- No carga indebidamente al backend (polling de 4 req/min vs SignalR push)
- Si SignalR cae, esto sigue funcionando

### Botones de transición

```ts
const NEXT_STATUS = {
  Pending:   "Preparing",
  Preparing: "Ready",
  Ready:     "Completed",
};
```

Tabla que refleja la state machine del backend
(`UpdateOrderStatusCommandHandler`). Si una orden está en `Completed`,
no aparece botón. Si el backend rechaza una transición (409 Conflict),
el componente muestra "Invalid status transition" inline.

> **Por qué duplicar la state machine en el frontend**: la fuente de
> verdad sigue siendo el backend (validación, persistencia). El cliente
> solo necesita saber qué botón pintar. Si quisiera ser puritano,
> podría exponer un endpoint `/api/admin/orders/{id}/allowed-transitions`
> — overkill por ahora.

### Optimización del re-render

Después de un PATCH exitoso:
```tsx
queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
queryClient.invalidateQueries({ queryKey: ["admin", "order", order.id] });
```

Invalida la lista (todos los tabs) y el detalle de esa orden si está
abierto en otra pestaña. React Query refetch automáticamente.

---

## 6. AdminOrderDetail

Página simple con la información completa de una orden:
- Datos del cliente (nombre, teléfono, email)
- Hora de pickup y hora en que se creó
- Items con `productNameSnapshot` y `unitPrice` históricos
- Total

> **Por qué mostrar snapshots y no datos en vivo del producto actual**:
> si los dueños cambian un precio mañana, queremos que esa orden vieja
> conserve el precio que el cliente pagó. El backend ya guarda
> `ProductNameSnapshot` y `UnitPrice` en `OrderItem` por esto mismo.

---

## 7. Smoke-tests realizados

| Caso | Esperado | Resultado |
|---|---|---|
| `/admin/orders` sin sesión | Redirige a `/admin/login` | ✅ |
| Login con credenciales correctas | Redirige a `/admin/orders` | ✅ |
| Login con password incorrecto | "Wrong email or password" | ✅ |
| Lista en tab "Pending" | Muestra órdenes con status=Pending | ✅ |
| Click "Mark as Preparing" | Orden desaparece de Pending, aparece en Preparing | ✅ |
| Tab "Ready" tras 2 transiciones | Muestra la orden ahí | ✅ |
| Click en una fila | Abre detalle con items y snapshots | ✅ |
| Refresh manual | "Refreshing…" + datos frescos | ✅ |
| Auto-refresh cada 15s | Datos se actualizan sin acción del usuario | ✅ |
| Logout | Limpia store, redirige a login | ✅ |
| Refresh con sesión activa | Sigue logueado (localStorage) | ✅ |

---

## 8. Próxima slice de Fase 5

**Admin realtime**: hook `useOrderNotifications()` que conecta al hub
`/hubs/orders` con el token del admin, reproduce un sonido al recibir
`orderCreated`, e invalida la query de `["admin", "orders"]` para que
la nueva orden aparezca instantáneamente en el dashboard. Cuando esa
slice esté lista, la sensación pasa de "tablet con polling" a "tablet
que reacciona como un POS de verdad".
