/* empty css                                 */
import { c as createComponent, r as renderTemplate, a as renderComponent, b as renderScript, m as maybeRenderHead, d as addAttribute } from '../chunks/astro/server_COE-DgNr.mjs';
import 'kleur/colors';
import { g as getCollection } from '../chunks/_astro_content_CiN2HTwc.mjs';
import { $ as $$Layout } from '../chunks/Layout_CjyMAS2D.mjs';
export { renderers } from '../renderers.mjs';

const $$Admin = createComponent(async ($$result, $$props, $$slots) => {
  const libros = await getCollection("sagrada-biblia");
  const estructura = {
    "antiguo-testamento": {
      titulo: "Antiguo Testamento",
      color: "amber",
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
      color: "blue",
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
  const librosprincipales = libros.filter(
    (libro) => !libro.slug.includes("-comentarios") && !libro.slug.includes("-paralelos")
  );
  const comentarios = libros.filter((libro) => libro.slug.includes("-comentarios"));
  const comentariosPorLibro = /* @__PURE__ */ new Map();
  comentarios.forEach((comentario) => {
    const slugBase = comentario.slug.replace("-comentarios", "");
    comentariosPorLibro.set(slugBase, comentario);
  });
  librosprincipales.forEach((libro) => {
    const slugParts = libro.slug.split("/");
    if (slugParts.length >= 2) {
      const testamento = slugParts[0];
      const seccion = slugParts[1];
      if (estructura[testamento]?.secciones?.[seccion]) {
        const libroConComentario = {
          ...libro,
          comentario: comentariosPorLibro.get(libro.slug)
        };
        estructura[testamento].secciones[seccion].libros.push(libroConComentario);
      }
    }
  });
  Object.values(estructura).forEach((testamento) => {
    Object.values(testamento.secciones).forEach((seccion) => {
      seccion.libros.sort((a, b) => a.slug.localeCompare(b.slug));
    });
  });
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Administrar - Sagrada Biblia" }, { "default": ($$result2) => renderTemplate` ${maybeRenderHead()}<main class="p-4 md:p-8"> <div class="max-w-screen-xl mx-auto"> <a href="/" class="text-amber-700 hover:underline text-sm mb-4 block">&larr; Inicio</a> <h1 class="text-3xl md:text-4xl font-bold mb-6">Administrar Libros</h1> ${Object.entries(estructura).map(([testamentoKey, testamento]) => renderTemplate`<div class="mb-10"> <h2${addAttribute(`text-2xl font-bold mb-4 pb-2 border-b-2 ${testamentoKey === "antiguo-testamento" ? "text-amber-800 border-amber-300" : "text-blue-800 border-blue-300"}`, "class")}> ${testamento.titulo} </h2> ${Object.entries(testamento.secciones).map(([_, seccion]) => seccion.libros.length > 0 && renderTemplate`<div class="mb-6"> <h3 class="text-lg font-semibold text-gray-700 mb-3 pl-2 border-l-4 border-gray-300"> ${seccion.titulo} </h3> <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"> ${seccion.libros.map((libro) => {
    const { slug, data, comentario } = libro;
    const { title } = data;
    return renderTemplate`<article class="bg-white border rounded-lg p-3 shadow-sm hover:shadow-md transition">  <div class="flex items-center justify-between gap-2"> <h4 class="font-medium text-gray-800 truncate flex-1">${title}</h4> <div class="flex gap-1 flex-shrink-0"> <button${addAttribute(slug, "data-slug")} class="prepare-btn px-2 py-1 bg-purple-600 text-white rounded hover:bg-purple-700 transition text-xs" title="Preparar (X Y → X:Y)">
P
</button> <button${addAttribute(slug, "data-slug")} class="format-btn px-2 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition text-xs" title="Formatear (X:Y → superíndice)">
F
</button> <button${addAttribute(slug, "data-slug")} class="check-btn px-2 py-1 bg-amber-600 text-white rounded hover:bg-amber-700 transition text-xs" title="Verificar">
V
</button> <button${addAttribute(slug, "data-slug")} class="letter-btn px-2 py-1 bg-pink-600 text-white rounded hover:bg-pink-700 transition text-xs" title="Corregir versículos con letras (47:5a → <sup>5a</sup>)">
L
</button> <button${addAttribute(slug, "data-slug")} class="link-notes-btn px-2 py-1 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition text-xs" title="Vincular notas (* → clicable)">
N
</button> </div> </div>  ${comentario && renderTemplate`<div class="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between gap-2"> <span class="text-xs text-gray-500 italic truncate flex-1">Comentarios</span> <div class="flex gap-1 flex-shrink-0"> <button${addAttribute(comentario.slug, "data-slug")} class="format-comments-btn px-2 py-1 bg-teal-600 text-white rounded hover:bg-teal-700 transition text-xs" title="Formatear párrafos de comentarios">
FC
</button> </div> </div>`} </article>`;
  })} </div> </div>`)} </div>`)} </div> <!-- Dialog para mostrar resultados --> <dialog id="consecutiveDialog" class="p-0 rounded-lg shadow-xl backdrop:bg-black/50 max-w-2xl w-full mx-4"> <div class="bg-white rounded-lg"> <div class="flex justify-between items-center p-4 border-b"> <h3 id="dialogTitle" class="text-xl font-bold">Verificación de Versículos</h3> <button id="closeDialog" class="text-gray-500 hover:text-gray-700 text-2xl leading-none">&times;</button> </div> <div id="dialogContent" class="p-4 max-h-[60vh] overflow-y-auto"> <!-- Contenido dinámico --> </div> <div class="p-4 border-t bg-gray-50 rounded-b-lg flex gap-2"> <button id="fixVersesBtn" class="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition hidden">
Corregir Versículos
</button> <button id="closeDialogBtn" class="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition">
Cerrar
</button> </div> </div> </dialog> </main> ` })} ${renderScript($$result, "C:/Users/Usuario/Documents/Platzi/BFF/src/pages/admin.astro?astro&type=script&index=0&lang.ts")}`;
}, "C:/Users/Usuario/Documents/Platzi/BFF/src/pages/admin.astro", void 0);

const $$file = "C:/Users/Usuario/Documents/Platzi/BFF/src/pages/admin.astro";
const $$url = "/admin";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
	__proto__: null,
	default: $$Admin,
	file: $$file,
	url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
