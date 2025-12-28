/* empty css                                 */
import { c as createComponent, r as renderTemplate, a as renderComponent, b as renderScript, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_DHA3jqpl.mjs';
import 'kleur/colors';
import { g as getCollection } from '../chunks/_astro_content_BwHVpSEe.mjs';
import { $ as $$Layout } from '../chunks/Layout_DuPppsrF.mjs';
/* empty css                                 */
export { renderers } from '../renderers.mjs';

const $$Index = createComponent(async ($$result, $$props, $$slots) => {
  const libros = await getCollection("sagrada-biblia");
  const estructura = {
    "antiguo-testamento": {
      titulo: "Antiguo Testamento",
      secciones: {
        "01-pentateuco": { titulo: "El Pentateuco", libros: [] },
        "02-libros-historicos": { titulo: "Libros Hist\xF3ricos", libros: [] },
        "03-lirica": { titulo: "L\xEDrica", libros: [] },
        "04-libros-sapienciales": { titulo: "Libros Sapienciales", libros: [] },
        "05-libros-profeticos": { titulo: "Libros Prof\xE9ticos", libros: [] }
      }
    },
    "nuevo-testamento": {
      titulo: "Nuevo Testamento",
      secciones: {
        "01-evangelios": { titulo: "Evangelios", libros: [] },
        "02-hechos": { titulo: "Hechos", libros: [] },
        "03-epistolas-pablo": { titulo: "Ep\xEDstolas de Pablo", libros: [] },
        "04-hebreos": { titulo: "Hebreos", libros: [] },
        "05-epistolas-catolicas": { titulo: "Ep\xEDstolas Cat\xF3licas", libros: [] },
        "06-apocalipsis": { titulo: "Apocalipsis", libros: [] }
      }
    }
  };
  libros.forEach((libro) => {
    const slugParts = libro.slug.split("/");
    if (slugParts.length >= 2) {
      const testamento = slugParts[0];
      const seccion = slugParts[1];
      if (estructura[testamento]?.secciones?.[seccion]) {
        estructura[testamento].secciones[seccion].libros.push(libro);
      }
    }
  });
  Object.values(estructura).forEach((testamento) => {
    Object.values(testamento.secciones).forEach((seccion) => {
      seccion.libros.sort((a, b) => a.slug.localeCompare(b.slug));
    });
  });
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Sagrada Biblia", "data-astro-cid-fpxq2pdv": true }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<div class="flex h-[calc(100vh-64px)] relative" data-astro-cid-fpxq2pdv> <!-- Overlay para móvil --> <div id="sidebarOverlay" class="fixed inset-0 bg-black/50 z-40 hidden md:hidden" data-astro-cid-fpxq2pdv></div> <!-- Botón menú móvil --> <button id="menuToggle" class="md:hidden fixed top-20 left-4 z-50 bg-amber-700 text-white p-3 rounded-lg shadow-lg hover:bg-amber-800 transition" aria-label="Abrir menú" data-astro-cid-fpxq2pdv> <svg id="menuIcon" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-astro-cid-fpxq2pdv> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" data-astro-cid-fpxq2pdv></path> </svg> <svg id="closeIcon" xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 hidden" fill="none" viewBox="0 0 24 24" stroke="currentColor" data-astro-cid-fpxq2pdv> <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" data-astro-cid-fpxq2pdv></path> </svg> </button> <!-- Sidebar --> <aside id="sidebar" class="fixed md:relative w-72 h-full bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0 z-50 transform -translate-x-full md:translate-x-0 transition-transform duration-300 ease-in-out" data-astro-cid-fpxq2pdv> <div class="p-4" data-astro-cid-fpxq2pdv> <a href="/" class="text-amber-700 hover:underline text-sm mb-4 block" data-astro-cid-fpxq2pdv>&larr; Inicio</a> <h2 class="text-xl font-bold mb-4" data-astro-cid-fpxq2pdv>Sagrada Biblia</h2> ${Object.entries(estructura).map(([_, testamento]) => renderTemplate`<div class="mb-6" data-astro-cid-fpxq2pdv> <h3 class="font-bold text-gray-800 mb-2 text-sm uppercase tracking-wide" data-astro-cid-fpxq2pdv> ${testamento.titulo} </h3> ${Object.entries(testamento.secciones).map(([__, seccion]) => seccion.libros.length > 0 && renderTemplate`<div class="mb-3" data-astro-cid-fpxq2pdv> <h4 class="text-xs font-semibold text-gray-500 mb-1 pl-2" data-astro-cid-fpxq2pdv> ${seccion.titulo} </h4> <ul class="space-y-1" data-astro-cid-fpxq2pdv> ${seccion.libros.map((libro) => renderTemplate`<li data-astro-cid-fpxq2pdv> <a${addAttribute(`/biblia/${libro.slug}`, "href")} class="block px-3 py-1.5 text-sm text-gray-700 hover:bg-amber-100 hover:text-amber-800 rounded transition" data-astro-cid-fpxq2pdv> ${libro.data.title} </a> </li>`)} </ul> </div>`)} </div>`)} </div> </aside> <!-- Contenido principal --> <main class="flex-1 overflow-y-auto p-4 md:p-8" data-astro-cid-fpxq2pdv> <div class="max-w-3xl mx-auto pt-12 md:pt-0" data-astro-cid-fpxq2pdv> <h1 class="text-3xl md:text-4xl font-bold mb-6" data-astro-cid-fpxq2pdv>Bienvenido a la Sagrada Biblia</h1> <p class="text-gray-600 mb-8" data-astro-cid-fpxq2pdv> <span class="hidden md:inline" data-astro-cid-fpxq2pdv>Selecciona un libro del menú lateral para comenzar a leer.</span> <span class="md:hidden" data-astro-cid-fpxq2pdv>Toca el botón del menú para seleccionar un libro.</span> </p> <div class="grid md:grid-cols-2 gap-4 md:gap-6" data-astro-cid-fpxq2pdv> <div class="bg-amber-50 border border-amber-200 rounded-lg p-4 md:p-6" data-astro-cid-fpxq2pdv> <h2 class="text-lg md:text-xl font-bold text-amber-800 mb-2" data-astro-cid-fpxq2pdv>Antiguo Testamento</h2> <p class="text-amber-700 text-sm mb-4" data-astro-cid-fpxq2pdv>
Los libros de la antigua alianza, desde el Génesis hasta los Profetas.
</p> <p class="text-xl md:text-2xl font-bold text-amber-800" data-astro-cid-fpxq2pdv> ${Object.values(estructura["antiguo-testamento"].secciones).reduce((acc, s) => acc + s.libros.length, 0)} libros disponibles
</p> </div> <div class="bg-blue-50 border border-blue-200 rounded-lg p-4 md:p-6" data-astro-cid-fpxq2pdv> <h2 class="text-lg md:text-xl font-bold text-blue-800 mb-2" data-astro-cid-fpxq2pdv>Nuevo Testamento</h2> <p class="text-blue-700 text-sm mb-4" data-astro-cid-fpxq2pdv>
Los Evangelios, Hechos, Epístolas y el Apocalipsis.
</p> <p class="text-xl md:text-2xl font-bold text-blue-800" data-astro-cid-fpxq2pdv> ${Object.values(estructura["nuevo-testamento"].secciones).reduce((acc, s) => acc + s.libros.length, 0)} libros disponibles
</p> </div> </div> </div> </main> </div> ` })}  ${renderScript($$result, "C:/Users/Usuario/Documents/Platzi/BFF/src/pages/biblia/index.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Usuario/Documents/Platzi/BFF/src/pages/biblia/index.astro", void 0);

const $$file = "C:/Users/Usuario/Documents/Platzi/BFF/src/pages/biblia/index.astro";
const $$url = "/biblia";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Index,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
