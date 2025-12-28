/* empty css                                 */
import { c as createComponent, r as renderTemplate, a as renderComponent, m as maybeRenderHead } from '../chunks/astro/server_DHA3jqpl.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_DuPppsrF.mjs';
export { renderers } from '../renderers.mjs';

const $$404 = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "404: Not Found" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex flex-col items-center justify-center min-h-screen text-center"> <h1 class="text-6xl font-bold mb-4">404</h1> <p class="text-xl mb-8">Oops! The page you're looking for doesn't exist.</p> <a href="/" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
Go Home
</a> </div> ` })}`;
}, "C:/Users/Usuario/Documents/Platzi/BFF/src/pages/404.astro", void 0);

const $$file = "C:/Users/Usuario/Documents/Platzi/BFF/src/pages/404.astro";
const $$url = "/404";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
    __proto__: null,
    default: $$404,
    file: $$file,
    url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
