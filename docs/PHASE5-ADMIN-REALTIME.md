# Fase 5 — Admin realtime (slice 5)

Esta slice cierra la Fase 5 conectando el dashboard admin al hub de
SignalR `/hubs/orders`. Cuando llega una orden nueva al backend, el
barista escucha un beep y la lista de órdenes se refresca al instante.
El polling de 15s queda como red de seguridad: si el WebSocket cae, el
dashboard sigue trayendo datos cada 15 segundos.

> **Decisiones clave**
>
> - **Hook único `useOrderNotifications()`**: una sola conexión vive en
>   `AdminLayout`. Detalle e índice comparten esa conexión vía la cache
>   de React Query — no hace falta abrir un WS por página.
> - **Token vía `accessTokenFactory`**: SignalR lee el token con un
>   callback en cada (re)conexión. Si la sesión expiró,
>   `getAccessToken()` retorna `null` y el handshake falla con 401, lo
>   que dispara `onclose` y la UI cae a "Offline".
> - **Beep sintetizado con Web Audio**: cero assets extra, un oscilador
>   de 880 Hz por 0.4s. Si el navegador bloquea el `AudioContext` por
>   falta de gesto del usuario, el `try/catch` traga la excepción y la
>   notificación visual sigue funcionando.
> - **Auto-reconnect built-in**: `withAutomaticReconnect()` con la
>   política por defecto (0s, 2s, 10s, 30s). Suficiente para reconnects
>   por WiFi flaky en la cafetería.
> - **Polling no se quita**: cinturón y tirantes. Con 4 req/min al
>   backend admin no hay carga real, y si SignalR muere silenciosamente
>   (proxy intermedio, etc.) los datos siguen frescos en 15s.

---

## 1. Hook `useOrderNotifications`

`src/hooks/useOrderNotifications.ts`:

```ts
const connection = new HubConnectionBuilder()
  .withUrl(HUB_URL, { accessTokenFactory: () => getAccessToken() ?? "" })
  .withAutomaticReconnect()
  .configureLogging(LogLevel.Warning)
  .build();

connection.on("orderCreated", () => {
  playBeep();
  queryClient.invalidateQueries({ queryKey: ["admin", "orders"] });
});
```

Retorna el `HubConnectionState` actual (`Connected`, `Reconnecting`,
`Disconnected`) para que el layout pinte un indicador "Live" / "Offline".

> **Por qué ignoramos el payload**: el hub envía
> `OrderCreatedNotification(id, names, total, itemCount, createdAt)`,
> pero el dashboard solo necesita saber que *algo* cambió para
> invalidar la query. El payload completo lo trae la siguiente
> request HTTP. Si en el futuro queremos un toast con el nombre del
> cliente, ya tenemos la forma tipada en `OrderCreatedPayload`.

---

## 2. Beep sin assets

```ts
const osc = ctx.createOscillator();
const gain = ctx.createGain();
osc.connect(gain).connect(ctx.destination);
osc.frequency.value = 880;
gain.gain.linearRampToValueAtTime(0.15, ctx.currentTime + 0.01);
gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
```

880 Hz (un La) con envelope corto: arriba en 10ms, decay exponencial
hasta 400ms. Suena como un *ding* discreto, no como una alarma de
hospital. El `AudioContext` se crea perezoso y se reutiliza entre
notificaciones.

> **Por qué Web Audio y no `<audio>`**: un `<audio>` requiere cargar un
> archivo (mp3/ogg) y tiene la misma restricción de gesto del usuario.
> Web Audio nos ahorra el asset y el round-trip. La primera vez que el
> barista hace click en cualquier cosa de la página (por ejemplo, abrir
> una tab), el `AudioContext` queda autorizado para reproducir.

---

## 3. `LiveIndicator` en el header

```tsx
<LiveIndicator state={hubState} />
```

Punto de color al lado del nombre del barista:
- 🟢 verde + "Live" → conectado
- 🟡 ámbar pulsante + "Reconnecting…" → reintentando
- ⚪ gris + "Offline" → desconectado (polling sigue funcionando)

Da feedback visual sin meter ruido. Si está en "Offline" más de unos
minutos y empiezan a llegar órdenes, el barista las ve igual gracias
al polling.

---

## 4. Auth en el handshake

El backend ya está configurado en `Program.cs`:

```csharp
o.Events = new JwtBearerEvents
{
  OnMessageReceived = ctx =>
  {
    if (ctx.Request.Path.StartsWithSegments("/hubs"))
    {
      ctx.Token = ctx.Request.Query["access_token"];
    }
    return Task.CompletedTask;
  }
};
```

SignalR no puede mandar `Authorization: Bearer` en el handshake WS
(los browsers no permiten headers custom en WebSocket). En su lugar,
el cliente pasa el token en `?access_token=...`, y el backend lo
acepta solo en rutas `/hubs/*`. El cliente lo hace automáticamente vía
`accessTokenFactory`.

---

## 5. Lifecycle

- **Mount**: `AdminLayout` monta → hook crea conexión → `connection.start()`.
- **Re-render**: el `useRef` mantiene la misma conexión, no se reconecta.
- **Unmount** (logout o navegación fuera de `/admin`): `connection.stop()` en cleanup del effect.
- **Reconexión**: si el WS cae por red, SignalR reintenta solo. La UI
  pinta "Reconnecting…" mientras dura.

---

## 6. Smoke-tests propuestos

| Caso | Esperado |
|---|---|
| Login admin con backend corriendo | Indicador pasa a "Live" |
| Crear orden desde otra pestaña como cliente | Beep + lista refresca |
| Bajar el backend (`Ctrl+C`) | Indicador a "Offline" |
| Volver a levantar backend | "Reconnecting…" → "Live" |
| Logout | Conexión se cierra (ver Network tab) |
| Sesión expira mid-session | Hub se desconecta al próximo retry |
| 4 órdenes seguidas | 4 beeps, 4 invalidaciones |

---

## 7. Lo que queda fuera de esta slice

- **Notificación de transición de estado**: por ahora el hub solo emite
  `orderCreated`. Si el barista A marca "Preparing" y el barista B está
  mirando la misma tablet en otra ventana, B se entera por polling de
  15s. Aceptable: en este negocio hay un solo turno y una sola tablet.
- **Toast con datos de la orden**: el payload llega tipado en el hook
  pero no se renderiza. Si el dueño pide un preview ("New order from
  Maria — $24.50"), está a una línea de implementar.
- **Trigger desde Stripe webhook**: hoy `OrderCreatedNotification` se
  emite al `CreateOrderCommandHandler` (orden en estado `Pending`,
  antes del pago). Cuando Stripe esté integrado, mover el emit a
  `payment_intent.succeeded` para no notificar órdenes abandonadas.
  Está anotado en `project_cafe_deploy_security_todo.md`.
