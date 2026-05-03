# Fase 5 — Carrito y Checkout (slice 3)

Esta slice cierra el flujo de compra del cliente: agregar productos al
carrito, ajustar cantidades, llenar un formulario de pickup y enviar la
orden al backend. La pieza que falta es el pago — eso es Fase 6 (Stripe).

> **Decisiones clave**
>
> - **Zustand con `persist`**: el carrito sobrevive a refrescos y
>   navegaciones. Se guarda en `localStorage` con la key
>   `glorycafe.cart`. Se limpia automáticamente al crear orden exitosa.
> - **Snapshots de precio y nombre**: el `CartItem` guarda `name` y
>   `price` del producto al momento de agregarlo. Si los dueños cambian
>   un precio en el admin mientras el cliente está navegando, el carrito
>   no se rompe — el backend re-cotiza con su propio snapshot al
>   `POST /api/orders`.
> - **Validación en dos capas**: HTML5 (`required`, `type=email`,
>   `min/max` en datetime-local) bloquea errores triviales antes del
>   submit. El backend (FluentValidation) sigue siendo la fuente de
>   verdad — sus errores se renderizan inline por campo.
> - **Pago pendiente**: la página de confirmación dice explícitamente
>   "payment pending" y "pay at the counter". Cuando llegue Stripe, esa
>   tarjeta amarilla se reemplaza por el componente Stripe Elements.

---

## 1. El store del carrito

`src/store/cartStore.ts`:

```ts
export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (product) => set(...),
      updateQuantity: (productId, quantity) => set(...),
      removeItem: (productId) => set(...),
      clear: () => set({ items: [] }),
    }),
    { name: "glorycafe.cart" },
  ),
);
```

**Reglas de cantidad** dentro del store, no en los componentes:
- `addItem` con producto ya presente → suma 1, capeado a 99
- `updateQuantity` capea a [0, 99]; si cae a 0, elimina el item del array
- `removeItem` lo borra explícitamente

> **Por qué encapsular las reglas en el store**: si la UI cambia (por
> ejemplo, agregamos otro botón "+5" en algún lado), no se duplica
> lógica de capping. El store es la fuente de verdad.

**Selectores derivados**:
```ts
export const selectItemCount = (s) => s.items.reduce(...);
export const selectSubtotal  = (s) => s.items.reduce(...);
```

Se exportan como funciones puras para usarse con `useCartStore(selector)`.
Zustand re-renderiza solo cuando cambia el valor que retorna el selector
— performance gratis.

---

## 2. CartBar — el sticky bar inferior

`src/components/CartBar.tsx`:

- Aparece en el `Layout` (entre `<main>` y `<Footer>`)
- Se oculta si: carrito vacío, ruta es `/cart`, `/checkout` o `/order/...`
- Muestra: cantidad de items + subtotal + botón "View cart"

```tsx
if (count === 0) return null;
if (location.pathname.startsWith("/cart")) return null;
// ...
```

> **Por qué ocultarlo en `/cart` y `/checkout`**: en esas pantallas el
> carrito ya es el centro de la atención. Mostrar el bar arriba sería
> ruido visual redundante.

---

## 3. Página `/cart`

Estados:
- **Carrito vacío** → mensaje + CTA a `/shop`
- **Con items** → lista de filas con +/− y "Remove", subtotal y botón "Checkout"

Cada fila usa los métodos del store directamente:
```tsx
<button onClick={() => onUpdate(item.quantity - 1)}>−</button>
```

Si la cantidad cae a 0, el filtro del `updateQuantity` la quita del
carrito. Sin lógica adicional en el componente.

---

## 4. Página `/checkout`

Formulario controlado con `useState` por campo. Ejecuta una mutation de
React Query:

```tsx
const mutation = useMutation({
  mutationFn: createOrder,
  onSuccess: (data) => {
    clearCart();
    navigate(`/order/${data.orderId}/confirm`, {
      state: { totalAmount: data.totalAmount },
    });
  },
  onError: (err) => {
    if (err instanceof AxiosError && err.response?.status === 400) {
      const data = err.response.data as ApiValidationProblem;
      setErrors(data.errors ?? {});
    } else {
      setErrors({ _: ["Something went wrong..."] });
    }
  },
});
```

### Conversión de la hora de pickup

El input `datetime-local` da la hora en zona local (`YYYY-MM-DDTHH:mm`
sin timezone). El backend espera UTC ISO. Conversión:

```ts
estimatedPickupTime: new Date(pickup).toISOString()
```

`new Date("2026-04-29T15:00")` interpreta el string como local; al
serializar con `.toISOString()` sale en UTC. Compatible con la
expectativa del `CreateOrderCommandValidator`.

### Bordes

- **`min` y `max` del input**: pickup debe ser entre +10 min y +24h.
  Match con la validación del backend.
- **Default**: +15 min (suficiente buffer para que no rebote por estar
  muy cerca del límite mínimo si el cliente tarda en llenar el form).
- **Carrito vacío**: si el usuario aterriza en `/checkout` directo (link
  pegado, navegación rota), muestra el mensaje "empty cart" en lugar de
  un form sin sentido.

### Errores del backend

`ProblemDetails` con `errors` dict de FluentValidation. Las claves son
los nombres de los campos en PascalCase: `customerFirstName`, `Items`,
`Contact`. La función `Field` busca `errors[name]` y pinta el primer
mensaje en rojo bajo el input.

> **Por qué solo el primer mensaje y no toda la lista**: por simplicidad
> visual. Si un mismo campo tiene varios errores, el primero suele ser
> el más útil. Si crece el dominio, se itera.

---

## 5. Página `/order/:id/confirm`

Punto final del flujo. Recibe el `id` por URL y el `totalAmount` por
React Router state (sin segundo fetch):

```tsx
const state = useLocation().state as LocationState | null;
const totalAmount = state?.totalAmount;
```

Si el usuario refresca la página, el `state` se pierde, pero el id sigue
en la URL — la página renderiza igual sin el total. No es ideal pero es
aceptable en esta etapa: la única forma "correcta" de llegar es desde
checkout.

> **Cuando llegue Stripe**: este `state` también traerá el `clientSecret`
> y se montará el `<PaymentElement />`. La página cambia de "payment
> pending" a "complete payment".

---

## 6. Smoke-tests realizados

| Caso | Esperado | Resultado |
|---|---|---|
| Add to cart desde Shop | Botón cambia a "In cart · N" | ✅ |
| Bar inferior aparece con items | "N items · $X" + "View cart" | ✅ |
| Cart page: +/− y Remove | Cantidades se actualizan, items se eliminan | ✅ |
| Refresh con items en carrito | Carrito persiste (localStorage) | ✅ |
| Checkout caso feliz | 201, OrderConfirm con id y total | ✅ |
| Checkout sin contacto | 400 con error "At least one contact" inline | ✅ |
| Checkout campos vacíos | HTML5 bloquea antes de submit | ✅ |
| Tras orden exitosa | Carrito vacío, bar desaparece | ✅ |
| Mobile (DevTools iPhone) | Todos los pasos legibles, sin scroll horizontal | ✅ |
| SignalR listener (si activo) | Notificación llega al hub admin | ✅ |

---

## 7. Próxima slice de Fase 5

**Admin auth y dashboard**: pantalla de login admin, ruta protegida con
JWT en localStorage, layout admin propio (separado del público), página
de órdenes pendientes con polling o refetch manual. La conexión SignalR
para notificaciones realtime es la slice siguiente.
