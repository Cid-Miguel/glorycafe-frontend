# Fase 5 — Inventario admin (slice B)

Esta slice da al admin una UI para mantener el catálogo: marcar items
como "out of stock" cuando se acaban, crear productos nuevos, editar
precios/descripciones, subir imágenes, y administrar categorías. El
backend ya tenía los endpoints (commands/handlers de `Admin.Products`
y `Admin.Categories` desde fases anteriores); esta slice es 100%
frontend más cableado al router/nav.

> **Decisiones clave**
>
> - **Toggle de disponibilidad como acción de un solo clic**: el caso
>   urgente del negocio. Un switch al lado del nombre del producto que
>   dispara `PUT /api/admin/products/{id}` con todos los campos
>   actuales y `IsAvailable` flippeado. El backend ya rechaza órdenes
>   de productos no disponibles desde Slice anterior, así que cliente
>   no puede comprar lo que no hay.
> - **Reutilizar los queries públicos** (`GET /api/products`,
>   `GET /api/categories`) en lugar de crear endpoints admin separados:
>   los públicos ya retornan todos los productos (no filtran por
>   `IsAvailable`), así que admin ve lo mismo. Cuando llegue el
>   momento de filtrar el público, el admin tendrá su propio GET.
> - **Modal con `key` para reset, no `useEffect`**: el formulario
>   se monta fresco al abrir y se desmonta al cerrar. React maneja
>   el reset de estado por nosotros — no `useEffect`/`setState` que
>   ESLint rechaza con `react-hooks/set-state-in-effect`.
> - **Imagen separada del save**: el upload usa `multipart/form-data`
>   y solo está disponible en modo edit (cuando el producto ya
>   existe). El form de "create" no pide imagen — se sube después.

---

## 1. Componentes nuevos

### `Modal` — base reutilizable

[`components/admin/Modal.tsx`](../glory-cafe-web/src/components/admin/Modal.tsx)
es un wrapper liviano sobre `createPortal`:

- **Cierra con Escape** y con clic en backdrop.
- **Lock de scroll del body** mientras está abierto.
- **Slot de footer** para los botones — el body es libre.

Lo usan tanto `AdminProductForm` como `CategoryFormModal`. Mantener
un solo modal canónico evita inconsistencias y deja un único lugar
para mejorar accesibilidad (focus trap, etc.) cuando llegue.

### `AdminProductForm`

[`components/admin/AdminProductForm.tsx`](../glory-cafe-web/src/components/admin/AdminProductForm.tsx)
es el form de create/edit. Detalles:

- **`mode = product === null ? "create" : "edit"`** — sin prop
  separado, el `product` mismo lo dice.
- **Validación cliente espejo de la del backend**: name no vacío,
  price > 0, ≤ 9999.99. Si el backend devuelve un 400 con
  `ValidationProblemDetails`, se traduce a un mensaje legible.
- **Imagen solo en edit**: en create no la pedimos porque el endpoint
  de upload requiere el `id`. El admin guarda primero, entra al edit,
  y sube la foto. UX simple, una operación por vez.
- **Invalidación cruzada**: al guardar invalida tanto
  `["admin", "products"]` (la lista admin) como `["products"]` (el
  shop público). Si el admin tiene la tienda abierta en otra pestaña
  del mismo navegador, también refetcha.

### `AdminProducts`

[`pages/admin/AdminProducts.tsx`](../glory-cafe-web/src/pages/admin/AdminProducts.tsx):

- Lista agrupada por categoría con thumbnail, precio, switch de
  disponibilidad (verde/gris), botón Edit y botón Delete.
- **Filtro pills**: All / Available / Out of stock — el caso de uso
  típico es "qué está agotado ahora mismo".
- **Toggle inline**: clic en el switch llama a `updateProduct` con
  el resto de campos intactos. Si la red falla, mensaje rojo en la
  fila y el switch vuelve a su estado real (porque la query no se
  invalidó hasta el success).
- **Delete con confirm**: el backend rechaza con 409 si el producto
  tiene historial de órdenes (snapshots de `OrderItem`). El mensaje
  de error sugiere usar el toggle.
- **Estado vacío contextual**: si no hay categorías, redirige a
  `/admin/categories` para crear una primero.

### `AdminCategories`

[`pages/admin/AdminCategories.tsx`](../glory-cafe-web/src/pages/admin/AdminCategories.tsx):

- Lista ordenada por `displayOrder`. Edit y delete con el mismo
  patrón. El form es lo bastante chiquito para vivir en el mismo
  archivo (`CategoryFormModal` interno).
- Delete devuelve 409 si hay productos asociados — mensaje sugiere
  mover los productos primero.

---

## 2. Cableado

[`AppRouter.tsx`](../glory-cafe-web/src/routes/AppRouter.tsx) tiene
dos rutas nuevas dentro del `RequireAuth + AdminLayout`:

```tsx
<Route path="products" element={<AdminProducts />} />
<Route path="categories" element={<AdminCategories />} />
```

[`AdminLayout`](../glory-cafe-web/src/components/admin/AdminLayout.tsx)
ahora tiene un `NavLink` "Products" al lado de "Orders". "Categories"
queda como link secundario desde la página de productos — es un menú
de configuración, no un destino diario.

---

## 3. ¿Por qué reutilizar el query público?

`GET /api/products` no requiere auth y devuelve todos los productos
(disponibles o no). El admin necesita exactamente eso. Los queryKeys
están separados (`["products"]` vs `["admin", "products"]`) para
poder invalidarlos independientemente, pero el endpoint y la forma de
los datos son los mismos.

> **Cuándo separar**: cuando filtremos `IsAvailable=true` en el GET
> público (probable antes de producción para no exponer en el menú
> items agotados ni siquiera con el botón disabled), se creará un
> `GetAdminProductsQueryHandler` que retorne todo. Cambio aislado al
> handler, los componentes ni se enteran.

---

## 4. ¿Por qué `key` y no `useEffect` para reset del form?

ESLint con `react-hooks/set-state-in-effect` rechaza:

```tsx
useEffect(() => {
  if (open) setForm(toFormState(product, categories));
}, [open, product, categories]);
```

La regla tiene razón: el patrón causa cascading renders y es difícil
de razonar. La alternativa idiomática es **dejar que React desmonte
y remonte el componente**:

```tsx
{editing && (
  <AdminProductForm
    key={editing.id}
    product={editing}
    onClose={() => setEditing(null)}
  />
)}
```

Cuando `editing` cambia de `null` a `{id: 5}`, el form se monta
fresco con `useState(() => toFormState(product, ...))`. Cuando se
cierra (`editing = null`), se desmonta. Sin efectos, sin sincronía
manual.

---

## 5. Smoke-tests propuestos

| Caso | Esperado |
|---|---|
| Login admin → click "Products" en nav | Lista con todos los productos |
| Click switch verde de "Long Black" | Switch va a gris, en `/shop` el botón muestra "Unavailable" |
| Cliente intenta confirmar carrito con item agotado | API retorna 400 con mensaje de Producto no disponible |
| "+ New product" sin categorías | Botón disabled, copy guía a crear categoría |
| "+ New product" con categorías | Modal con campos vacíos, guarda, aparece en lista |
| Edit existing → cambiar precio → save | Lista refleja nuevo precio inmediatamente |
| Edit → upload imagen JPG | Thumbnail aparece en lista admin y en `/shop` |
| Edit → "Remove image" | Vuelve al placeholder ☕ |
| Delete producto sin órdenes | Lista lo quita |
| Delete producto con órdenes | Mensaje "Has order history — toggle off instead" |
| Delete categoría con productos | Mensaje "Move or remove the products in this category first" |
| Filter "Out of stock" | Solo lo que está apagado |

---

## 6. Lo que queda fuera

- **Drag & drop para reordenar `displayOrder` de categorías**: por
  ahora se edita numéricamente. Cuando haya 6+ categorías y mover una
  al medio sea molesto, un sortable.
- **Bulk actions** (apagar varias a la vez): no es el caso real;
  generalmente solo un item se acaba al tiempo.
- **Historial de cambios de stock**: el negocio quizás quiera saber
  "¿cuándo apagué la torta de zanahoria la semana pasada?". Audit
  log, posible Fase futura.
- **Validaciones de imagen en el cliente** (peso/tipo previo al
  upload): el backend valida; sumar feedback frontend es UX nice-to-
  have.
- **Tests E2E**: cubierto por smoke manual de momento.
