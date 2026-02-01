import { c as createComponent, r as renderTemplate, d as addAttribute, b as renderScript, e as createAstro, f as renderSlot, g as renderHead, a as renderComponent } from './astro/server_COE-DgNr.mjs';
import 'kleur/colors';
/* empty css                        */
import 'clsx';

const $$Astro$1 = createAstro();
const $$ClientRouter = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro$1, $$props, $$slots);
  Astro2.self = $$ClientRouter;
  const { fallback = "animate" } = Astro2.props;
  return renderTemplate`<meta name="astro-view-transitions-enabled" content="true"><meta name="astro-view-transitions-fallback"${addAttribute(fallback, "content")}>${renderScript($$result, "C:/Users/Usuario/Documents/Platzi/BFF/node_modules/astro/components/ClientRouter.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Usuario/Documents/Platzi/BFF/node_modules/astro/components/ClientRouter.astro", void 0);

var __freeze = Object.freeze;
var __defProp = Object.defineProperty;
var __template = (cooked, raw) => __freeze(__defProp(cooked, "raw", { value: __freeze(cooked.slice()) }));
var _a;
const $$Astro = createAstro();
const $$Layout = createComponent(($$result, $$props, $$slots) => {
  const Astro2 = $$result.createAstro($$Astro, $$props, $$slots);
  Astro2.self = $$Layout;
  const { title } = Astro2.props;
  return renderTemplate(_a || (_a = __template(['<html lang="es"> <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width"><meta name="theme-color" content="#0f172a"><meta name="description" content="Lee la Biblia en cualquier momento y lugar"><link rel="icon" type="image/svg+xml" href="/favicon.svg"><link rel="apple-touch-icon" href="/icons/apple-touch-icon.png"><link rel="manifest" href="/manifest.json"><title>', "</title>", "<script>\n			// Aplicar dark mode antes de que se renderice la p\xE1gina para evitar flash\n			const darkMode = localStorage.getItem('biblia-dark-mode');\n			if (darkMode === 'true' || (darkMode === null && window.matchMedia('(prefers-color-scheme: dark)').matches)) {\n				document.documentElement.classList.add('dark');\n			}\n		<\/script>", '</head> <body class="bg-amber-50/70 dark:bg-gray-900 min-h-screen transition-colors duration-300"> ', " <script>\n			if ('serviceWorker' in navigator) {\n				navigator.serviceWorker.register('/sw.js');\n			}\n		<\/script> </body> </html>"])), title, renderComponent($$result, "ClientRouter", $$ClientRouter, {}), renderHead(), renderSlot($$result, $$slots["default"]));
}, "C:/Users/Usuario/Documents/Platzi/BFF/src/layouts/Layout.astro", void 0);

export { $$Layout as $ };
