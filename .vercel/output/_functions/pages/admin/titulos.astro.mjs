/* empty css                                    */
import { c as createComponent, r as renderTemplate, a as renderComponent } from '../../chunks/astro/server_COE-DgNr.mjs';
import 'kleur/colors';
import { $ as $$Layout } from '../../chunks/Layout_CjyMAS2D.mjs';
import { jsx, jsxs } from 'react/jsx-runtime';
import { useState, useEffect } from 'react';
export { renderers } from '../../renderers.mjs';

function TitleEditor() {
  const [files, setFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState("");
  const [content, setContent] = useState("");
  const [titles, setTitles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);
  useEffect(() => {
    loadFiles();
  }, []);
  const loadFiles = async () => {
    try {
      const res = await fetch("/api/bible-files");
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error("Error loading files:", err);
    }
  };
  const loadFileContent = async (filePath) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/bible-content?file=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      if (data.content) {
        setContent(data.content);
        findTitles(data.content);
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error al cargar el archivo" });
    } finally {
      setLoading(false);
    }
  };
  const formatParallel = (text) => {
    let result = text;
    result = result.replace(/=(\d+)/g, "=<strong>$1</strong>");
    result = result.replace(/^(\d+)(\s+\d)/g, "<strong>$1</strong>$2");
    result = result.replace(/;\s+(\d+)(\s+\d)/g, "; <strong>$1</strong>$2");
    result = result.replace(/([A-Za-z]{1,3})\s+(\d+)(?=\s|;|,|\.|$)/g, (match, book, chapter, offset) => {
      const before = result.substring(0, offset);
      if (before.endsWith("<strong>")) return match;
      return `${book} <strong>${chapter}</strong>`;
    });
    result = result.replace(/↗([A-Za-z]+)\s+(\d+)/g, (match, book, chapter) => {
      if (match.includes("<strong>")) return match;
      return `↗${book} <strong>${chapter}</strong>`;
    });
    result = result.replace(/\|\|\s+(\d+)\s+([A-Za-z]+)\s+(\d+)/g, "|| $1 $2 <strong>$3</strong>");
    result = result.replace(/<strong><strong>/g, "<strong>");
    result = result.replace(/<\/strong><\/strong>/g, "</strong>");
    return result;
  };
  const isParallelLine = (text) => {
    const parallelPatterns = [
      /^=\d+/,
      // Empieza con "=20" o "=26"
      /^\d+\s+\d+/,
      // Empieza con "2 4-25" o "12 2.7"
      /^↗[A-Za-z]+\s+\d+/,
      // Empieza con "↗Jn 1"
      /^\|\|/,
      // Empieza con "||"
      /^[A-Za-z]{1,3}\s+\d+/,
      // Empieza con nombre de libro "Jc 5", "Dt 33"
      /;\s*=?\d+/,
      // Contiene "; 13" o "; =17"
      /↗[A-Za-z]+\s+\d+/
      // Contiene referencia con flecha
    ];
    return parallelPatterns.some((pattern) => pattern.test(text));
  };
  const findTitles = (text) => {
    const lines = text.split("\n");
    const matches = [];
    lines.forEach((line, index) => {
      const h2Match = line.match(/^## (.+)$/);
      if (h2Match) {
        const titleText = h2Match[1];
        if (titleText.includes('class="section-intro"') || titleText.includes('class="subsection-title"') || titleText.includes('class="parallel-ref"') || titleText.startsWith("<div") || titleText.startsWith("<span")) {
          return;
        }
        const isRomanNumeral = /^[IVX]+\.?\s/.test(titleText);
        const isNumberedSubsection = /^\d+\.\s+[A-ZÁÉÍÓÚÑ]/.test(titleText);
        const isParallel = isParallelLine(titleText);
        if (isRomanNumeral) {
          matches.push({
            line: index,
            original: line,
            type: "section-intro",
            converted: `<span class="section-intro">${titleText}</span>`
          });
        } else if (isParallel) {
          const formattedParallel = formatParallel(titleText);
          matches.push({
            line: index,
            original: line,
            type: "parallel",
            converted: `<span class="parallel-ref">${formattedParallel}</span>`
          });
        } else if (isNumberedSubsection) {
          matches.push({
            line: index,
            original: line,
            type: "subsection-title",
            converted: `## <span class="subsection-title">${titleText}</span>`
          });
        } else {
          matches.push({
            line: index,
            original: line,
            type: "subsection-title",
            converted: `## <span class="subsection-title">${titleText}</span>`
          });
        }
      }
    });
    setTitles(matches);
  };
  const applyConversion = (index, newContent) => {
    const title = titles[index];
    const lines = content.split("\n");
    lines[title.line] = newContent;
    const updatedContent = lines.join("\n");
    setContent(updatedContent);
    setTitles((prev) => prev.filter((_, i) => i !== index));
  };
  const convertToSectionIntro = (index) => {
    const title = titles[index];
    const titleText = title.original.replace(/^## /, "");
    applyConversion(index, `<span class="section-intro">${titleText}</span>`);
    setMessage({ type: "success", text: "Convertido a section-intro" });
  };
  const convertToSectionTitle = (index) => {
    const title = titles[index];
    const titleText = title.original.replace(/^## /, "");
    applyConversion(index, `<span class="section-title">${titleText}</span>`);
    setMessage({ type: "success", text: "Convertido a section-title" });
  };
  const convertToSubsectionTitle = (index) => {
    const title = titles[index];
    const titleText = title.original.replace(/^## /, "");
    const hasHashtag = title.original.startsWith("## ");
    const prefix = hasHashtag ? "## " : "";
    applyConversion(index, `${prefix}<span class="subsection-title">${titleText}</span>`);
    setMessage({ type: "success", text: "Convertido a subsection-title" });
  };
  const convertToParallel = (index) => {
    const title = titles[index];
    const titleText = title.original.replace(/^## /, "");
    const formattedParallel = formatParallel(titleText);
    applyConversion(index, `<span class="parallel-ref">${formattedParallel}</span>`);
    setMessage({ type: "success", text: "Convertido a parallel-ref" });
  };
  const saveContent = async () => {
    if (!selectedFile) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch("/api/bible-content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ file: selectedFile, content })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: "Archivo guardado correctamente" });
      } else {
        setMessage({ type: "error", text: data.error || "Error al guardar" });
      }
    } catch (err) {
      setMessage({ type: "error", text: "Error al guardar el archivo" });
    } finally {
      setSaving(false);
    }
  };
  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setMessage({ type: "success", text: "Contenido copiado al portapapeles" });
  };
  const getParallelPreview = (text) => {
    const titleText = text.replace(/^## /, "");
    return formatParallel(titleText);
  };
  return /* @__PURE__ */ jsx("div", { className: "min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8", children: /* @__PURE__ */ jsxs("div", { className: "max-w-6xl mx-auto", children: [
    /* @__PURE__ */ jsx("h1", { className: "text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6", children: "Editor de Títulos - Sagrada Biblia" }),
    /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6", children: [
      /* @__PURE__ */ jsx("label", { className: "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2", children: "Seleccionar archivo:" }),
      /* @__PURE__ */ jsxs(
        "select",
        {
          className: "w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200",
          value: selectedFile,
          onChange: (e) => {
            setSelectedFile(e.target.value);
            if (e.target.value) {
              loadFileContent(e.target.value);
            } else {
              setContent("");
              setTitles([]);
            }
          },
          children: [
            /* @__PURE__ */ jsx("option", { value: "", children: "-- Seleccionar archivo --" }),
            files.map((file) => /* @__PURE__ */ jsx("option", { value: file, children: file.replace("src/content/sagrada-biblia/", "") }, file))
          ]
        }
      )
    ] }),
    message && /* @__PURE__ */ jsx("div", { className: `p-3 rounded-lg mb-4 ${message.type === "success" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"}`, children: message.text }),
    loading && /* @__PURE__ */ jsx("div", { className: "text-center py-8 text-gray-600 dark:text-gray-400", children: "Cargando..." }),
    titles.length > 0 && /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6", children: [
      /* @__PURE__ */ jsxs("h2", { className: "text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4", children: [
        "Títulos encontrados (",
        titles.length,
        ")"
      ] }),
      /* @__PURE__ */ jsx("div", { className: "space-y-3 max-h-[500px] overflow-y-auto", children: titles.map((title, index) => /* @__PURE__ */ jsxs(
        "div",
        {
          className: "flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg",
          children: [
            /* @__PURE__ */ jsxs("div", { className: "flex-1", children: [
              /* @__PURE__ */ jsxs("div", { className: "flex items-center gap-2 mb-1", children: [
                /* @__PURE__ */ jsxs("span", { className: "text-xs text-gray-500 dark:text-gray-400", children: [
                  "Línea ",
                  title.line + 1
                ] }),
                /* @__PURE__ */ jsx("span", { className: `text-xs px-2 py-0.5 rounded ${title.type === "section-intro" ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" : title.type === "parallel" ? "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200" : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"}`, children: title.type === "section-intro" ? "Sección" : title.type === "parallel" ? "Paralelo" : "Subtítulo" })
              ] }),
              /* @__PURE__ */ jsx("code", { className: "text-sm text-gray-800 dark:text-gray-200 block bg-gray-200 dark:bg-gray-600 p-2 rounded", children: title.original }),
              title.type === "parallel" && /* @__PURE__ */ jsxs("div", { className: "mt-2 text-xs text-gray-600 dark:text-gray-400", children: [
                /* @__PURE__ */ jsx("span", { className: "font-medium", children: "Vista previa: " }),
                /* @__PURE__ */ jsx(
                  "span",
                  {
                    className: "font-serif",
                    dangerouslySetInnerHTML: { __html: getParallelPreview(title.original) }
                  }
                )
              ] })
            ] }),
            /* @__PURE__ */ jsxs("div", { className: "flex flex-wrap gap-2", children: [
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => convertToSectionIntro(index),
                  className: "px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition",
                  title: "Convertir a sección intro (para títulos principales con números romanos)",
                  children: "→ section-intro"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => convertToSectionTitle(index),
                  className: "px-3 py-2 bg-teal-600 text-white text-sm rounded hover:bg-teal-700 transition",
                  title: "Convertir a título de sección (tamaño intermedio, centrado, negro)",
                  children: "→ section-title"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => convertToSubsectionTitle(index),
                  className: "px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition",
                  title: "Convertir a subtítulo de subsección",
                  children: "→ subsection-title"
                }
              ),
              /* @__PURE__ */ jsx(
                "button",
                {
                  onClick: () => convertToParallel(index),
                  className: "px-3 py-2 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 transition",
                  title: "Convertir a referencia paralela (capítulos en negrita)",
                  children: "→ parallel-ref"
                }
              )
            ] })
          ]
        },
        `${title.line}-${index}`
      )) })
    ] }),
    content && /* @__PURE__ */ jsxs("div", { className: "bg-white dark:bg-gray-800 rounded-lg shadow p-4", children: [
      /* @__PURE__ */ jsxs("div", { className: "flex justify-between items-center mb-4", children: [
        /* @__PURE__ */ jsx("h2", { className: "text-lg font-semibold text-gray-800 dark:text-gray-100", children: "Contenido del archivo" }),
        /* @__PURE__ */ jsxs("div", { className: "flex gap-2", children: [
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: copyToClipboard,
              className: "px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition",
              children: "Copiar"
            }
          ),
          /* @__PURE__ */ jsx(
            "button",
            {
              onClick: saveContent,
              disabled: saving,
              className: "px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50",
              children: saving ? "Guardando..." : "Guardar"
            }
          )
        ] })
      ] }),
      /* @__PURE__ */ jsx(
        "textarea",
        {
          className: "w-full h-96 p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200",
          value: content,
          onChange: (e) => {
            setContent(e.target.value);
            findTitles(e.target.value);
          }
        }
      )
    ] }),
    /* @__PURE__ */ jsxs("div", { className: "mt-6 bg-amber-50 dark:bg-amber-900/30 rounded-lg p-4", children: [
      /* @__PURE__ */ jsx("h3", { className: "font-semibold text-amber-800 dark:text-amber-200 mb-3", children: "Guía de conversión:" }),
      /* @__PURE__ */ jsxs("ul", { className: "text-sm text-amber-700 dark:text-amber-300 space-y-3", children: [
        /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-blue-700 dark:text-blue-300", children: "section-intro:" }),
          ' Para títulos de sección principal (ej: "II. Historia de Abrahán")',
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("code", { className: "bg-amber-100 dark:bg-amber-800 px-1 rounded text-xs", children: '<span class="section-intro">II. Historia de Abrahán</span>' })
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-teal-700 dark:text-teal-300", children: "section-title:" }),
          ' Título intermedio, centrado y negro (ej: "LIBRO PRIMERO", "PRIMERA PARTE")',
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("code", { className: "bg-amber-100 dark:bg-amber-800 px-1 rounded text-xs", children: '<span class="section-title">LIBRO PRIMERO</span>' })
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-purple-700 dark:text-purple-300", children: "subsection-title:" }),
          ' Para subtítulos (ej: "2. EL DILUVIO", "Vocación de Abrahán")',
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("code", { className: "bg-amber-100 dark:bg-amber-800 px-1 rounded text-xs", children: '## <span class="subsection-title">2. EL DILUVIO</span>' })
        ] }),
        /* @__PURE__ */ jsxs("li", { children: [
          /* @__PURE__ */ jsx("strong", { className: "text-amber-700 dark:text-amber-300", children: "parallel-ref:" }),
          ' Para referencias paralelas (ej: "2 4-25 ↗Jn 1 1-3")',
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("code", { className: "bg-amber-100 dark:bg-amber-800 px-1 rounded text-xs", children: '<span class="parallel-ref"><strong>2</strong> 4-25 ↗Jn <strong>1</strong> 1-3</span>' }),
          /* @__PURE__ */ jsx("br", {}),
          /* @__PURE__ */ jsx("span", { className: "text-xs italic", children: "Los números de capítulo se ponen en negrita automáticamente" })
        ] })
      ] })
    ] })
  ] }) });
}

const $$Titulos = createComponent(($$result, $$props, $$slots) => {
  return renderTemplate`${renderComponent($$result, "Layout", $$Layout, { "title": "Editor de T\xEDtulos - Admin" }, { "default": ($$result2) => renderTemplate` ${renderComponent($$result2, "TitleEditor", TitleEditor, { "client:load": true, "client:component-hydration": "load", "client:component-path": "C:/Users/Usuario/Documents/Platzi/BFF/src/components/TitleEditor", "client:component-export": "default" })} ` })}`;
}, "C:/Users/Usuario/Documents/Platzi/BFF/src/pages/admin/titulos.astro", void 0);

const $$file = "C:/Users/Usuario/Documents/Platzi/BFF/src/pages/admin/titulos.astro";
const $$url = "/admin/titulos";

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  default: $$Titulos,
  file: $$file,
  url: $$url
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
