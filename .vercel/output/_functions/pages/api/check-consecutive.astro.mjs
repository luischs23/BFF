import { g as getCollection } from '../../chunks/_astro_content_B7cWur3-.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const POST = async ({ request }) => {
  try {
    const { slug } = await request.json();
    if (!slug) {
      return new Response(JSON.stringify({ error: "Slug requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const books = await getCollection("sagrada-biblia");
    const normalizedSlug = slug.toLowerCase().replace(/\s+/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const file = books.find((b) => {
      const bookSlug = b.slug.toLowerCase().replace(/\s+/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return bookSlug === normalizedSlug || bookSlug.includes(normalizedSlug) || normalizedSlug.includes(bookSlug);
    });
    if (!file) {
      return new Response(JSON.stringify({ error: `Libro "${slug}" no encontrado` }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    const content = file.body;
    const lines = content.split("\n");
    const versesByChapter = /* @__PURE__ */ new Map();
    const unformattedVerses = [];
    const formattedVerseRegex = /(\d+):(\d+)/g;
    const unformattedVerseRegex = /(?:^|[.;,:!?»"'\)\s—])(\d{1,3})\s+([A-ZÁÉÍÓÚÑa-záéíóúñ«"'\(\[\d\*¡¿])/g;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;
      if (line.startsWith("---") || line.startsWith("#") || line.trim() === "") {
        continue;
      }
      let match;
      while ((match = formattedVerseRegex.exec(line)) !== null) {
        const chapter = parseInt(match[1]);
        const verse = parseInt(match[2]);
        if (!versesByChapter.has(chapter)) {
          versesByChapter.set(chapter, /* @__PURE__ */ new Set());
        }
        versesByChapter.get(chapter).add(verse);
      }
      const formattedPositions = [];
      formattedVerseRegex.lastIndex = 0;
      while ((match = formattedVerseRegex.exec(line)) !== null) {
        formattedPositions.push(match.index);
      }
      unformattedVerseRegex.lastIndex = 0;
      while ((match = unformattedVerseRegex.exec(line)) !== null) {
        const potentialVerse = parseInt(match[1]);
        const position = match.index;
        const isPartOfFormatted = formattedPositions.some(
          (pos) => Math.abs(pos - position) < 10
        );
        if (!isPartOfFormatted && potentialVerse >= 1 && potentialVerse <= 200) {
          const beforeMatch = line.substring(Math.max(0, position - 5), position + match[0].length);
          const afterMatch = line.substring(position, Math.min(line.length, position + match[0].length + 5));
          if (!beforeMatch.includes(":") && !afterMatch.match(/^\D*\d+:/)) {
            const contextStart = Math.max(0, position - 20);
            const contextEnd = Math.min(line.length, position + match[0].length + 30);
            const context = line.substring(contextStart, contextEnd);
            unformattedVerses.push({
              line: lineNum,
              text: `...${context}...`
            });
          }
        }
      }
    }
    const missingVerses = [];
    versesByChapter.forEach((verses, chapter) => {
      const sortedVerses = Array.from(verses).sort((a, b) => a - b);
      if (sortedVerses.length > 0) {
        const maxVerse = sortedVerses[sortedVerses.length - 1];
        for (let v = 1; v <= maxVerse; v++) {
          if (!verses.has(v)) {
            const prevVerse = sortedVerses.filter((x) => x < v).pop();
            const nextVerse = sortedVerses.find((x) => x > v);
            missingVerses.push({
              chapter,
              verse: v,
              context: `Entre ${chapter}:${prevVerse || "?"} y ${chapter}:${nextVerse || "?"}`
            });
          }
        }
      }
    });
    missingVerses.sort((a, b) => {
      if (a.chapter !== b.chapter) return a.chapter - b.chapter;
      return a.verse - b.verse;
    });
    const result = {
      book: file.data.title,
      totalChapters: versesByChapter.size,
      missingVerses,
      unformattedVerses
    };
    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error al verificar:", error);
    return new Response(JSON.stringify({
      error: "Error al procesar el archivo",
      details: error instanceof Error ? error.message : "Error desconocido"
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
