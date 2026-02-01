/* empty css                                 */
import { c as createComponent, r as renderTemplate, a as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_COE-DgNr.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_BvS_D2fV.mjs';
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Sagrada Biblia" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="min-h-screen flex flex-col items-center justify-center"> <h1 class="text-center text-5xl font-bold mb-8">Sagrada Biblia</h1> <p class="text-gray-600 text-center mb-12 max-w-md">
Biblia Jerusalén - Explora las Sagradas Escrituras
</p> <div class="flex flex-col sm:flex-row gap-4"> <a href="/biblia" class="px-8 py-4 bg-amber-700 text-white rounded-lg hover:bg-amber-800 transition text-lg font-semibold text-center">
Leer la Biblia
</a> <a href="/buscar" class="px-8 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-lg font-semibold text-center">
Buscar Pasajes
</a> <a href="/admin" class="px-8 py-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-lg font-semibold text-center">
Administrar
</a> </div> </main> ` })}`;
}, "C:/Users/Usuario/Documents/Platzi/BFF/src/pages/index.astro", void 0);

const $$file = "C:/Users/Usuario/Documents/Platzi/BFF/src/pages/index.astro";
const $$url = "";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
