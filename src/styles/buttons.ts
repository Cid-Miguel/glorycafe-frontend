/**
 * Button class strings for the public storefront.
 *
 * Centralised so every CTA on the site reads the same: terracotta
 * gradient with a solid darker border, soft warm shadow, and a tiny
 * lift on hover. Keep these strings as the single source of truth —
 * if a future tweak needs to land everywhere (e.g. focus-visible
 * styles, reduced-motion fallback) it changes once here.
 *
 * Sizes share most of the look; padding and text size differ.
 *
 * `BTN_PRIMARY_LG`  → main CTAs ("Order now", "Place order", "Checkout")
 * `BTN_PRIMARY_MD`  → in-row CTAs ("Add to cart", "View cart", Footer IG)
 * `BTN_PRIMARY_SM`  → tight pills inside cards ("Open in Maps")
 * `BTN_DARK_LG`     → dark variant for the Instagram pill on Home
 * `BTN_SUCCESS_MD`  → green moss variant for "In cart" state
 */

// `gap-2` lives on BASE so any button with an icon spaces it from the
// label automatically; buttons without an icon are unaffected.
const BASE =
  "inline-flex items-center justify-center gap-2 rounded-full border-2 font-semibold shadow-lg transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:translate-y-0 disabled:shadow-none";

const TERRACOTTA_FILL =
  "border-terracotta-dark bg-gradient-to-br from-clay via-terracotta to-terracotta-dark text-white shadow-terracotta/30";

const DARK_FILL =
  "border-espresso/80 bg-gradient-to-br from-coffee-soft via-coffee to-espresso text-cream shadow-espresso/30";

const SUCCESS_FILL =
  "border-moss/70 bg-gradient-to-br from-moss/90 via-moss to-moss text-white shadow-moss/30";

const DISABLED =
  "disabled:border-cream-300 disabled:from-cream-300 disabled:via-cream-300 disabled:to-cream-300 disabled:text-coffee-soft";

export const BTN_PRIMARY_LG = `${BASE} ${TERRACOTTA_FILL} ${DISABLED} px-8 py-3 text-base`;
export const BTN_PRIMARY_MD = `${BASE} ${TERRACOTTA_FILL} ${DISABLED} px-6 py-2.5 text-sm`;
export const BTN_PRIMARY_SM = `${BASE} ${TERRACOTTA_FILL} ${DISABLED} px-4 py-1.5 text-xs`;
export const BTN_DARK_LG = `${BASE} ${DARK_FILL} px-7 py-3 text-base`;
export const BTN_SUCCESS_MD = `${BASE} ${SUCCESS_FILL} px-6 py-2.5 text-sm`;
