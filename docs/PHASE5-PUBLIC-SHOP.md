# Fase 5 — Tienda pública (slice 2)

Esta slice arma la cara visible del cliente: las páginas Home, Shop y
About que ve cualquiera que escanea el QR. Todo mobile-first, con
estética placeholder hasta que los dueños aprueben el branding.

> **Decisiones clave**
>
> - **Ruta jerárquica con layout**: `<Layout />` envuelve todas las
>   páginas públicas (Header + Outlet + Footer). Cuando llegue el admin,
>   tendrá su propio layout sin compartir nada con el público.
> - **Mobile-first real**: el ancho máximo es `max-w-3xl` (~768px). Todo
>   se diseña primero para móvil; las clases `sm:` añaden el breakpoint
>   solo cuando hace falta.
> - **Paleta amber + stone como placeholder**: tonos cálidos de café sin
>   comprometer una identidad visual. Cuando lleguen los colores reales,
>   se cambian buscando esas dos clases en todo el proyecto.
> - **Sin estado del carrito todavía**: los botones "Add to cart" son
>   visualmente funcionales pero no hacen nada. Esa lógica entra en la
>   slice 3 con Zustand.

---

## 1. Estructura de rutas

```tsx
<BrowserRouter>
  <Routes>
    <Route element={<Layout />}>
      <Route path="/"        element={<Home />} />
      <Route path="/shop"    element={<Shop />} />
      <Route path="/about"   element={<About />} />
      <Route path="/health"  element={<HealthCheck />} />  // debug
      <Route path="*"        element={<NotFound />} />
    </Route>
  </Routes>
</BrowserRouter>
```

`Layout` se monta una vez y los hijos se inyectan via `<Outlet />`. No
re-renderiza Header/Footer al cambiar de página.

> **Por qué `/health` queda accesible**: útil cuando despleguemos para
> verificar que el backend responde sin tener que abrir DevTools.
> Mantener páginas de debug visibles en dev cuesta cero y ayuda mucho.

---

## 2. Componentes nuevos

| Archivo | Rol |
|---|---|
| `components/Layout.tsx` | Shell con Header + main + Footer |
| `components/Header.tsx` | Logo + nav (Shop, About) sticky con backdrop blur |
| `components/Footer.tsx` | Copyright + bajada corta |
| `components/ProductCard.tsx` | Tarjeta unitaria de producto |
| `pages/public/Home.tsx` | Hero + CTA + 3 features |
| `pages/public/Shop.tsx` | Productos agrupados por categoría |
| `pages/public/About.tsx` | Find us / Hours / Contact / Follow |
| `pages/public/NotFound.tsx` | 404 simple con link de regreso |

---

## 3. Cómo carga el menú

```tsx
const categoriesQuery = useQuery({
  queryKey: ["categories"],
  queryFn: getCategories,
});
const productsQuery = useQuery({
  queryKey: ["products"],
  queryFn: () => getProducts(),
});
```

Dos queries paralelas. React Query maneja loading, error y cache. Ambas
arrancan al montar `<Shop />`; cuando llegan los datos, se cruzan en
memoria:

```tsx
categoriesQuery.data.map((category) => {
  const items = productsQuery.data.filter(
    (p) => p.categoryId === category.id,
  );
  // ...
});
```

> **Por qué cruzar client-side y no pedir `/api/products?categoryId=X`
> N veces**: con 3 categorías hoy, el endpoint sin filtro devuelve 8
> productos en una sola request. N requests = N round-trips innecesarios.
> Si el catálogo crece a cientos, la decisión se reevalúa.

---

## 4. ProductCard — anatomía

```
┌──────────────────────────────────────────┐
│  ┌──┐  Flat White            $5.50       │
│  │☕│  Smooth and silky                  │
│  └──┘  ┌──────────────┐                 │
│        │ Add to cart  │                 │
│        └──────────────┘                 │
└──────────────────────────────────────────┘
```

- **Imagen**: si `imageUrl` existe se muestra; si no, emoji ☕ como
  placeholder. Cuando los dueños suban fotos desde el admin, esto cambia
  solo (sin tocar el frontend).
- **`product.isAvailable`**: si es `false`, el botón se deshabilita y
  cambia a "Unavailable". Útil cuando un producto se acabe — el admin
  lo marca y el front responde sin re-deploy.

---

## 5. Diseño mobile-first — patrón aplicado

Ejemplo en Home:
```tsx
<h1 className="text-4xl font-bold sm:text-5xl">
  Good coffee. <br className="sm:hidden" /> No queue.
</h1>
```

- Tipografía base optimizada para móvil (`text-4xl`)
- En pantallas grandes crece (`sm:text-5xl`)
- El `<br />` solo se muestra en móvil (`sm:hidden`) para que el título
  se parta en 2 líneas en celular y en 1 línea en desktop

En Shop:
```tsx
<div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
```

Una columna en móvil, dos a partir de tablet. Sin "lg:grid-cols-3" porque
con `max-w-3xl` el ancho no da para 3 columnas razonables.

---

## 6. Smoke-tests realizados

**Setup**: backend en `:5089`, frontend en `:5173`, en Chrome con
DevTools modo móvil iPhone 12.

| Caso | Esperado | Resultado |
|---|---|---|
| `/` carga | Hero + CTA + 3 features | ✅ |
| Click "Order now" | Navega a `/shop` | ✅ |
| `/shop` carga | 3 secciones, 8 productos en total | ✅ |
| Categorías y productos vienen del backend real | Coffee/Pastries/Cold Drinks | ✅ |
| Precios formateados con 2 decimales | $5.50, $6.00, etc | ✅ |
| Botón "Add to cart" visible | (sin lógica todavía, esperado) | ✅ |
| `/about` carga | 4 bloques con placeholder | ✅ |
| Modo móvil sin scroll horizontal | Layout responsive | ✅ |
| `/loquesea` | Página 404 con link | ✅ |
| Header sticky | Permanece arriba al scrollear Shop | ✅ |

---

## 7. Próxima slice de Fase 5

**Carrito + Checkout**: estado global del carrito con Zustand,
persistencia en `localStorage`, página de carrito con cantidades
ajustables, formulario de checkout (nombre, contacto, hora estimada)
y `POST /api/orders`. Sin pago todavía — el `OrderConfirm` muestra el
id de la orden y un mensaje de "pago pendiente" que será reemplazado
por Stripe en Fase 6.
