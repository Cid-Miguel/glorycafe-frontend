# Fase 5 — Refresh visual del frontend público

Esta slice rediseña todo el lado público de la web (Home, Shop,
About, Cart, Checkout, OrderConfirm, NotFound, Header, Footer,
CartBar) para que se sienta como una tienda real de café de
especialidad — manejada por colombianos, en Brisbane — y no como
un esqueleto Tailwind genérico. El admin no se toca: es una
herramienta de empleados, no parte del branding.

> **Decisiones clave**
>
> - **Paleta extraída del logo**: espresso oscuro, cream tibio,
>   terracotta como acento. Reemplaza `stone-*` + `amber-700` solo
>   en las páginas públicas vía `@theme` de Tailwind v4.
> - **Tipografía**: Fraunces (display, variable con axes `opsz` y
>   `SOFT`) para titulares + Inter (body). Combinación común en
>   third-wave coffee — calor artesanal sin ser cursi.
> - **Logo del cliente como hero, no decoración**: se carga desde
>   `public/logocafe.jpg` (un solo archivo, sin builds). Aparece en
>   header, hero de Home, footer y el sitio respira "este café
>   tiene identidad".
> - **Instagram como botón, no link**: los dueños viven en IG; un
>   pill prominente en Home + bloque de gradiente en About + pill
>   en Footer multiplican el contacto sin costo.
> - **Datos reales, no placeholder**: dirección (56 Peel St),
>   horarios y handle de IG vienen del bio actual de los dueños.

---

## 1. Brand tokens (Tailwind v4 `@theme`)

[`src/index.css`](../glory-cafe-web/src/index.css) declara los
tokens como CSS custom properties dentro de `@theme`. Tailwind v4
las convierte automáticamente en utility classes.

```css
@theme {
  --color-espresso: #1c100b;
  --color-coffee: #3d2418;
  --color-coffee-soft: #5a3a2a;
  --color-cream: #f5ebdc;
  --color-cream-200: #efe3d0;
  --color-cream-300: #e4d4ba;
  --color-parchment: #faf6ee;
  --color-terracotta: #c76a4f;
  --color-terracotta-dark: #a8533c;
  --color-clay: #d97757;
  --color-moss: #5a6b47;

  --font-display: "Fraunces", ui-serif, Georgia, serif;
  --font-sans: "Inter", system-ui, -apple-system, sans-serif;
}
```

Uso en JSX:

```tsx
<div className="bg-cream text-espresso">
  <h1 className="font-display text-terracotta">Glory Cafe</h1>
</div>
```

> **Por qué no reemplazar globalmente `amber/stone`**: el admin
> usa esas clases y funciona. Los nuevos tokens conviven con los
> de Tailwind: `text-amber-700` sigue válido en `/admin/*`. Cuando
> llegue el momento de unificar, será un find-replace dirigido.

### Fraunces y sus axes

```css
.font-display {
  font-family: var(--font-display);
  font-variation-settings: "opsz" 96, "SOFT" 50;
  letter-spacing: -0.02em;
}
```

`opsz` (optical size) le dice a la fuente "soy un titular grande",
lo que abre las contraformas y suaviza las curvas. `SOFT` agrega
redondez. Combinados, los headings de Home y About se ven
bastante artesanales sin parecer cursivos.

---

## 2. Páginas

### Home

Hero centrado con:
- **Logo grande** (rounded-full, ring cream)
- **Overline terracotta** "South Brisbane · Specialty Coffee"
- **Headline bilingüe**: "Tinto, pan, *no queue.*" — guiño a la
  cultura colombiana (en Colombia "tinto" = café negro) sin
  alienar al cliente australiano que entiende el resto.
- **CTA terracotta** + **pill Instagram** lado a lado en
  desktop, apilados en mobile.
- **Tres feature cards** con SVG icons (clock, cup, sparkle) en
  vez de emojis para coherencia visual.

### Shop

- Heading central "Pick your cup." en Fraunces.
- Cada categoría tiene un título display con una línea fina cream
  al lado (separator estético, no border completo).
- `ProductCard`:
  - Card en `parchment` con borde `cream-300`.
  - **Precio en Fraunces terracotta** (no negro genérico — le da
    peso visual al precio que es lo que el ojo busca).
  - Botones: terracotta para "Add to cart", **moss** para "In
    cart" (verde discreto, indica éxito sin gritar).
  - Sold out: card opaca + botón gris cream-300.

### About

Tres bloques principales:
1. **Find us**: dirección + link "Open in Maps →" que arma una
   búsqueda en Google Maps (`maps.google.com/...?q=56+Peel+St...`).
2. **Hours**: filas Mon-Fri / Sat / Sun con divider sutil, Sunday
   en gris para indicar cerrado sin que duela visualmente.
3. **CTA Instagram en gradient terracotta→clay**: ocupa ancho
   completo, con efecto `hover:-translate-y-0.5`. El botón más
   prominente de la página — es el canal oficial de los dueños.

### Cart / Checkout / OrderConfirm

- Cards en parchment con bordes cream-300, sombras suaves.
- Inputs con focus ring terracotta (no amber).
- Total siempre en Fraunces, gives weight to the number.
- En `OrderConfirm`, el `#dailyOrderNumber` ahora vive dentro de
  un card con gradiente terracotta→cream, número en `text-7xl`
  (era `text-5xl`) — es la información que el cliente más necesita
  ver de un vistazo.

### NotFound

Pequeño touch de personalidad: "This page doesn't exist. Maybe it
ran off with our last croissant." — coherente con el negocio.

---

## 3. Header & Footer

**Header** (sticky, blur):
- Logo circular pequeño + wordmark Fraunces a la izquierda.
- Nav: "Menu" / "Visit" (mejor que "Shop"/"About" — más cálido y
  natural en una página de café).
- Borde inferior cream-300 para definir el área sin contraste
  agresivo.

**Footer** (oscuro, **espresso**):
- Bloque centrado con logo, wordmark Fraunces grande, tagline
  uppercase tracking-wide, pill Instagram, copyright con
  dirección.
- Contraste alto (cream sobre espresso) — anclaje visual del
  fondo de la página.

---

## 4. Mobile-first, siempre

- Todo el layout parte de `flex-col` y se promueve a grid/row con
  `sm:` (≥ 640 px).
- Tipografía escala con `text-{size} sm:text-{size-bigger}`.
- Hero del Home: logo 32×32 mobile, 40×40 desktop. CTAs
  apilados verticalmente en mobile.
- About: bloques 1 col mobile, 2 cols desktop. El CTA de
  Instagram siempre full-width.
- Checkout: `first/last name` en una columna mobile, dos en
  desktop.
- Header alto fijo (`h-16`), tamaño de targets táctiles ≥ 44 px.
- Meta `viewport-fit=cover` y `theme-color=#1C100B` para que
  el navegador móvil pinte la barra superior con el espresso del
  branding (iOS Safari + Chrome Android).

---

## 5. Cómo agregar el logo

Los archivos en `public/` se sirven tal cual desde la raíz. Para
reemplazar el logo:

```
glory-cafe-web/public/logocafe.jpg
```

JPG funciona pero **SVG sería mejor** a tamaños grandes (Home
hero 40×40 = 160px en retina). Si los dueños envían el SVG, solo
hay que cambiar la extensión en 4 lugares:

- `src/components/Header.tsx`
- `src/pages/public/Home.tsx`
- `src/components/Footer.tsx`

(Buscar `/logocafe.jpg` y reemplazar.)

---

## 6. Smoke-tests propuestos

| Caso | Esperado |
|---|---|
| Visitar `/` en mobile | Logo grande, headline Fraunces, CTA terracotta, pill IG visible |
| Visitar `/` en desktop | Mismo hero, 3 cards en grid horizontal |
| Click "@glory.cafe.espresso" | Abre IG en pestaña nueva |
| Visitar `/about` | Address + maps link, hours table, CTA gradient IG |
| Click "Open in Maps" | Google Maps con búsqueda de 56 Peel St |
| Visitar `/shop` | Heading "Pick your cup." en Fraunces, cards en parchment, precios en terracotta |
| Add to cart | Botón cambia a moss "In cart · 1" |
| Producto sold out (toggle desde admin) | Card opaca, botón "Sold out" gris |
| Checkout submit | Form con focus terracotta, botón terracotta |
| OrderConfirm tras pedir | Número grande Fraunces dentro de card gradient |
| `/404randompath` | NotFound con copy del croissant |

---

## 7. Lo que queda fuera

- **Animaciones de entrada** (fade-in en scroll): Framer Motion
  añadiría 40-50 KB, lo dejé para después.
- **Modo oscuro**: el café tiene su propia paleta (espresso es
  ya oscuro), no hay caso real para flip de modo.
- **Hero photo de fondo**: si los dueños mandan una foto del
  local o del bar, se puede usar como background con overlay del
  espresso. Por ahora el logo es suficiente.
- **i18n real ES/EN**: el guiño "Tinto, pan, no queue" es
  decorativo. Si quieren toda la web en español, framework
  `react-i18next` + traducciones, otra slice.
- **Mapa embebido**: link a Maps es más liviano que un iframe;
  cuando confirmen address final lo veremos.
