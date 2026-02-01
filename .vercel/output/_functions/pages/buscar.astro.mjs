/* empty css                                 */
import { c as createComponent, r as renderTemplate, a as renderComponent } from '../chunks/astro/server_COE-DgNr.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../chunks/Layout_CjyMAS2D.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState } from 'react';
export { renderers } from '../renderers.mjs';

const BibleSearch = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSearch = async (e) => {
    e.preventDefault();
    setError("");
    setSearchResults([]);
    setLoading(true);
    try {
      const response = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || "Error en la búsqueda");
      }
      setSearchResults(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al buscar");
    } finally {
      setLoading(false);
    }
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 p-4", children: /* @__PURE__ */ jsxs("div", { className: "max-w-4xl mx-auto", children: [
    /* @__PURE__ */ jsxs("div", { className: "text-center mb-8 pt-8", children: [
      /* @__PURE__ */ jsx("h1", { className: "text-4xl font-bold text-amber-900 mb-2", children: "Biblia Jerusalén" }),
      /* @__PURE__ */ jsx("p", { className: "text-amber-700", children: "Busca pasajes bíblicos" })
    ] }),
    /* @__PURE__ */ jsx("div", { className: "bg-white rounded-lg shadow-lg p-6 mb-8", children: /* @__PURE__ */ jsxs("form", { onSubmit: handleSearch, className: "space-y-4", children: [
      /* @__PURE__ */ jsxs("div", { children: [
        /* @__PURE__ */ jsx(
          "input",
          {
            type: "text",
            value: searchQuery,
            onChange: (e) => setSearchQuery(e.target.value),
            placeholder: "Ej: Genesis 1,1-3 o 1Pedro 2,5",
            className: "w-full px-4 py-3 border-2 border-amber-200 rounded-lg focus:outline-none focus:border-amber-500 transition-colors"
          }
        ),
        /* @__PURE__ */ jsx("p", { className: "text-sm text-gray-500 mt-2", children: 'Formatos: "Libro Capítulo" • "Libro Capítulo,Verso" • "Libro Capítulo,Verso-Verso"' })
      ] }),
      /* @__PURE__ */ jsx(
        "button",
        {
          type: "submit",
          disabled: loading,
          className: "w-full bg-amber-600 hover:bg-amber-700 disabled:bg-amber-400 text-white font-semibold py-3 px-6 rounded-lg transition-colors",
          children: loading ? "Buscando..." : "Buscar"
        }
      )
    ] }) }),
    error && /* @__PURE__ */ jsx("div", { className: "bg-red-50 border-l-4 border-red-500 p-4 mb-8 rounded", children: /* @__PURE__ */ jsx("p", { className: "text-red-700", children: error }) }),
    searchResults.length > 0 && /* @__PURE__ */ jsx("div", { className: "space-y-6", children: searchResults.map((result, index) => /* @__PURE__ */ jsxs("div", { className: "bg-white rounded-lg shadow-lg overflow-hidden", children: [
      /* @__PURE__ */ jsxs("div", { className: "bg-gradient-to-r from-amber-600 to-orange-600 text-white p-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-2xl font-bold mb-1", children: result.title || `Capítulo ${result.chapter}` }),
        /* @__PURE__ */ jsxs("p", { className: "text-amber-100", children: [
          result.book,
          " ",
          result.chapter,
          result.verses !== "all" && `,${result.verses}`
        ] })
      ] }),
      /* @__PURE__ */ jsx("div", { className: "p-6", children: /* @__PURE__ */ jsx(
        "div",
        {
          className: "prose prose-amber max-w-none leading-relaxed text-justify",
          style: { fontSize: "1.05rem", lineHeight: "1.8" },
          dangerouslySetInnerHTML: {
            __html: result.content.replace(/<sup>/g, '<sup class="text-amber-600 font-semibold mr-1">').replace(/<strong>/g, '<strong class="block text-amber-800 text-lg mt-4 mb-2">')
          }
        }
      ) }),
      /* @__PURE__ */ jsxs("div", { className: "bg-gray-50 px-6 py-3 flex justify-between items-center text-sm text-gray-600", children: [
        /* @__PURE__ */ jsx("span", { children: "Biblia de Jerusalén" }),
        /* @__PURE__ */ jsx(
          "button",
          {
            onClick: () => {
              const text = result.content.replace(/<[^>]*>/g, "");
              navigator.clipboard.writeText(text);
            },
            className: "text-amber-600 hover:text-amber-700 font-medium",
            children: "Copiar texto"
          }
        )
      ] })
    ] }, index)) }),
    !loading && searchResults.length === 0 && !error && /* @__PURE__ */ jsxs("div", { className: "text-center py-12", children: [
      /* @__PURE__ */ jsx(
        "svg",
        {
          className: "mx-auto h-16 w-16 text-amber-400 mb-4",
          fill: "none",
          viewBox: "0 0 24 24",
          stroke: "currentColor",
          children: /* @__PURE__ */ jsx(
            "path",
            {
              strokeLinecap: "round",
              strokeLinejoin: "round",
              strokeWidth: 2,
              d: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            }
          )
        }
      ),
      /* @__PURE__ */ jsx("p", { className: "text-gray-500", children: "Ingresa una referencia bíblica para comenzar" })
    ] })
  ] }) });
};

const prerender = false;
const $$Buscar = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Buscar Pasajes" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "BibleSearch", BibleSearch, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Documents/Platzi/BFF/src/components/BibleSearch", "client:component-export": "default" })} ` })}`;
}, "C:/Users/Usuario/Documents/Platzi/BFF/src/pages/buscar.astro", void 0);

const $$file = "C:/Users/Usuario/Documents/Platzi/BFF/src/pages/buscar.astro";
const $$url = "/buscar";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Buscar,
  file: $$file,
  prerender,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
