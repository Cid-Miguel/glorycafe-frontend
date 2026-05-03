# Fase 5 — Setup del frontend (slice 1)

Esta slice arranca el frontend de Glory Cafe: scaffold de Vite + React +
TypeScript, Tailwind v4, las librerías clave de runtime y un health
check que confirma que el frontend habla bien con la API.

> **Decisiones clave**
>
> - **Vite + React 19 + TypeScript**: Vite por velocidad (HMR < 100 ms),
>   React 19 porque es la versión actual estable, TS porque el backend
>   ya devuelve tipos estructurados — queremos el mismo rigor en el
>   cliente.
> - **Tailwind v4 vía plugin de Vite**: una línea en `vite.config.ts` y
>   un `@import "tailwindcss"` en el CSS. Sin `tailwind.config.js`, sin
>   `postcss.config.js`. Es el setup oficial recomendado de v4.
> - **TanStack Query para fetching/caching**: cualquier fetch al backend
>   pasa por aquí. Cache automático, retries, estados de loading/error
>   gratis. Mejor que `useEffect` + `useState`.
> - **Zustand para estado global del cliente**: para el carrito y el
>   token de admin. Más liviano que Redux, sin boilerplate.
> - **Axios con baseURL desde env**: en dev apunta a
>   `http://localhost:5089`; en prod cambia con `.env.production`.

---

## 1. Estructura del proyecto

```
glory-cafe-web/
├── .env                       ← VITE_API_BASE_URL=http://localhost:5089
├── .env.example               ← versionado, plantilla para otros devs
├── index.html
├── vite.config.ts             ← plugins: react + tailwindcss
├── package.json
├── tsconfig.json + .app.json + .node.json
└── src/
    ├── main.tsx               ← entry: QueryClientProvider + AppRouter
    ├── index.css              ← @import "tailwindcss"
    ├── api/
    │   ├── client.ts          ← axios.create({ baseURL: env })
    │   └── catalog.ts         ← getCategories(), getProducts()
    ├── types/
    │   └── catalog.ts         ← Category, Product
    ├── pages/
    │   ├── public/
    │   │   └── HealthCheck.tsx
    │   └── admin/             ← (vacío hasta slice de auth admin)
    ├── components/            ← (vacío)
    ├── hooks/                 ← (vacío)
    ├── store/                 ← (vacío, Zustand vendrá con carrito)
    └── routes/
        └── AppRouter.tsx      ← BrowserRouter + Routes
```

> **Por qué `pages/public/` y `pages/admin/` separados**: el cliente
> anónimo (QR) y el panel admin son dos productos distintos en una sola
> SPA. Quiero que sea obvio en el árbol qué pertenece a qué.

---

## 2. Dependencias

**Runtime (5)**:
- `react`, `react-dom` — base
- `react-router-dom` — navegación
- `@tanstack/react-query` — server state
- `zustand` — client state
- `axios` — HTTP client
- `@microsoft/signalr` — realtime (lo usaremos en el slice del admin)
- `tailwindcss`, `@tailwindcss/vite` — estilos

**Dev**:
- `typescript`, `@types/react`, `@types/react-dom`, `@types/node`
- `eslint` y plugins
- `@vitejs/plugin-react`

---

## 3. Tailwind v4 — la diferencia con v3

V4 elimina `tailwind.config.js` por defecto. La configuración se hace
desde el CSS con la nueva sintaxis `@theme` (no la usamos aún, pero
quedará así cuando definamos colores de marca).

Hoy nuestra integración es:

`vite.config.ts`:
```ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

`src/index.css`:
```css
@import "tailwindcss";
```

Eso es todo. El plugin escanea automáticamente todos los archivos del
proyecto buscando clases.

---

## 4. Cliente axios — `src/api/client.ts`

```ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: { "Content-Type": "application/json" },
});
```

Vite expone variables de entorno solo si empiezan con `VITE_`. El valor
viene de `.env` (gitignored para prod). `.env.example` queda versionado
como plantilla.

> **Por qué un cliente compartido y no axios suelto en cada lugar**:
> cuando llegue el admin, vamos a meter un interceptor que añade
> `Authorization: Bearer <token>` automáticamente. Tener un único cliente
> centraliza ese cambio.

---

## 5. TanStack Query setup — `main.tsx`

```tsx
const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, staleTime: 30_000 } },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  </StrictMode>,
);
```

- **`retry: 1`**: si falla el fetch, reintenta una vez. Por defecto son 3
  (excesivo para nuestro caso).
- **`staleTime: 30s`**: las respuestas son "frescas" 30 segundos. Útil
  para que cambiar de página no dispare refetch inmediatamente.

---

## 6. El health check — `pages/public/HealthCheck.tsx`

Una página minimalista que:
1. Llama `GET /api/categories` con `useQuery`
2. Renderiza estados: loading, error, success
3. Lista las 3 categorías sembradas

Sirve **en este momento** para verificar la cadena completa:
- Vite arranca correctamente
- TS compila
- Tailwind aplica clases (fondo, sombras, redondeos)
- React Query funciona
- Axios arma bien la URL desde el env
- CORS del backend deja pasar al origen `http://localhost:5173`
- Backend devuelve JSON con la forma esperada

Cuando el frontend crezca, esta página la borraremos o la dejaremos
escondida en `/health` para troubleshooting.

---

## 7. Smoke-tests realizados

**Setup**:
- Backend en `http://localhost:5089` (perfil http)
- Frontend en `http://localhost:5173`

| Caso | Esperado | Resultado |
|---|---|---|
| `npm run dev` arranca sin errores | Vite ready en < 1s | ✅ |
| `tsc -b` (type-check) | Sin errores | ✅ |
| Página `/` carga | Card "Glory Cafe — health check" | ✅ |
| Fetch a `/api/categories` | 3 items: Coffee, Pastries, Cold Drinks | ✅ |
| Tailwind aplica | Fondo stone-50, card blanca con sombra | ✅ |

---

## 8. Cómo correr el frontend

Una vez:
```bash
cd glory-cafe-web
npm install
```

Cada vez:
```bash
npm run dev
```

Abre `http://localhost:5173`. Necesita la API corriendo en
`http://localhost:5089`.

---

## 9. Próxima slice de Fase 5

**Public — Shop**: layout mobile-first con header, lista de productos
agrupados por categoría, botón "add to cart" en cada uno. Aún sin
carrito (eso viene en la slice 3, junto al checkout).
