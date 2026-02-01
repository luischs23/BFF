import { g as getCollection } from '../../chunks/_astro_content_CiN2HTwc.mjs';
export { renderers } from '../../renderers.mjs';

const prerender = false;
function parseContent(content, targetChapter, startVerse, endVerse) {
  const lines = content.split("\n");
  let currentTitle = "";
  let verses = /* @__PURE__ */ new Map();
  let chapterTitle = "";
  let currentVerseNum = null;
  let currentVerseChapter = null;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (line.startsWith("##")) {
      currentTitle = line.replace(/^##\s*/, "").trim();
      continue;
    }
    const chapterMarkerMatches = [...line.matchAll(/data-chapter="(\d+)"/g)];
    if (chapterMarkerMatches.length > 0) {
      currentVerseChapter = parseInt(chapterMarkerMatches[0][1]);
    }
    const colonVerseMatches = [...line.matchAll(/(\d+):(\d+)/g)];
    const supVerseMatches = [...line.matchAll(/<sup>(\d+)<\/sup>/g)];
    if (colonVerseMatches.length > 0) {
      for (let j = 0; j < colonVerseMatches.length; j++) {
        const match = colonVerseMatches[j];
        const chapterNum = parseInt(match[1]);
        const verseNum = parseInt(match[2]);
        const matchStart = match.index;
        const matchEnd = matchStart + match[0].length;
        let textEnd;
        if (j + 1 < colonVerseMatches.length) {
          textEnd = colonVerseMatches[j + 1].index;
        } else {
          textEnd = line.length;
        }
        const verseText = line.substring(matchEnd, textEnd).trim();
        if (chapterNum === targetChapter) {
          if (verseNum === 1 && currentTitle) {
            chapterTitle = currentTitle;
          }
          verses.set(verseNum, {
            title: !verses.has(verseNum) ? currentTitle : verses.get(verseNum)?.title || "",
            text: verseText
          });
          currentTitle = "";
        }
        currentVerseChapter = chapterNum;
        currentVerseNum = verseNum;
      }
    } else if (supVerseMatches.length > 0) {
      for (let j = 0; j < supVerseMatches.length; j++) {
        const match = supVerseMatches[j];
        const verseNum = parseInt(match[1]);
        const matchStart = match.index;
        const matchEnd = matchStart + match[0].length;
        if (verseNum === 1 && chapterMarkerMatches.length > 0) {
          currentVerseChapter = parseInt(chapterMarkerMatches[0][1]);
        }
        if (currentVerseChapter === null) {
          currentVerseChapter = 1;
        }
        let textEnd;
        if (j + 1 < supVerseMatches.length) {
          textEnd = supVerseMatches[j + 1].index;
        } else {
          textEnd = line.length;
        }
        let verseText = line.substring(matchEnd, textEnd).trim();
        verseText = verseText.replace(/<[^>]*>/g, "").trim();
        if (currentVerseChapter === targetChapter) {
          if (verseNum === 1 && currentTitle) {
            chapterTitle = currentTitle;
          }
          verses.set(verseNum, {
            title: !verses.has(verseNum) ? currentTitle : verses.get(verseNum)?.title || "",
            text: verseText
          });
          currentTitle = "";
        }
        currentVerseNum = verseNum;
      }
    } else if (line && currentVerseNum !== null && currentVerseChapter === targetChapter) {
      const existing = verses.get(currentVerseNum);
      if (existing) {
        const cleanLine = line.replace(/<[^>]*>/g, "").trim();
        verses.set(currentVerseNum, {
          title: existing.title,
          text: existing.text + " " + cleanLine
        });
      }
    }
  }
  if (verses.size === 0) {
    return {
      book: "",
      chapter: targetChapter,
      verses: "",
      content: "",
      title: ""
    };
  }
  if (startVerse !== void 0) {
    const end = endVerse || startVerse;
    const selectedVerses = [];
    let sectionTitle = "";
    for (let v = startVerse; v <= end; v++) {
      const verseData = verses.get(v);
      if (verseData) {
        if (verseData.title && !sectionTitle) {
          sectionTitle = verseData.title;
        }
        if (verseData.title && verseData.title !== sectionTitle && selectedVerses.length > 0) {
          selectedVerses.push(`

<strong>${verseData.title}</strong>

`);
          sectionTitle = verseData.title;
        }
        selectedVerses.push(`<sup>${v}</sup>${verseData.text}`);
      }
    }
    if (selectedVerses.length === 0) {
      return {
        book: "",
        chapter: targetChapter,
        verses: "",
        content: "",
        title: ""
      };
    }
    return {
      book: "",
      chapter: targetChapter,
      verses: endVerse ? `${startVerse}-${endVerse}` : `${startVerse}`,
      content: selectedVerses.join(" "),
      title: sectionTitle || chapterTitle
    };
  }
  const allVerses = [];
  let lastTitle = "";
  Array.from(verses.entries()).sort(([a], [b]) => a - b).forEach(([num, data]) => {
    if (data.title && data.title !== lastTitle) {
      if (allVerses.length > 0) {
        allVerses.push(`

`);
      }
      allVerses.push(`<strong>${data.title}</strong>

`);
      lastTitle = data.title;
    }
    allVerses.push(`<sup>${num}</sup>${data.text}`);
  });
  return {
    book: "",
    chapter: targetChapter,
    verses: "all",
    content: allVerses.join(" "),
    title: chapterTitle
  };
}
const POST = async ({ request }) => {
  try {
    const { query } = await request.json();
    if (!query) {
      return new Response(
        JSON.stringify({ message: "Consulta de búsqueda inválida" }),
        { status: 400 }
      );
    }
    const queryMatch = query.match(/^([a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d]+?)\s+(\d+)(?:,(\d+)(?:-(\d+))?)?$/);
    if (!queryMatch) {
      return new Response(
        JSON.stringify({ message: 'Formato inválido. Use: "Libro Capítulo,Verso" o "Libro Capítulo,Verso-Verso"' }),
        { status: 400 }
      );
    }
    const [, bookName, chapterStr, startVerseStr, endVerseStr] = queryMatch;
    const chapter = parseInt(chapterStr);
    const startVerse = startVerseStr ? parseInt(startVerseStr) : void 0;
    const endVerse = endVerseStr ? parseInt(endVerseStr) : void 0;
    const normalizedBookName = bookName.trim().toLowerCase().replace(/\s+/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const books = await getCollection("sagrada-biblia");
    const file = books.find((b) => {
      const slug = b.slug.toLowerCase().replace(/\s+/g, "").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      return slug === normalizedBookName || slug.includes(normalizedBookName) || normalizedBookName.includes(slug);
    });
    if (!file) {
      return new Response(
        JSON.stringify({ message: `Libro "${bookName}" no encontrado` }),
        { status: 404 }
      );
    }
    const result = parseContent(file.body, chapter, startVerse, endVerse);
    if (!result.content) {
      return new Response(
        JSON.stringify({ message: "Capítulo o versículos no encontrados" }),
        { status: 404 }
      );
    }
    result.book = file.data.title;
    return new Response(
      JSON.stringify({ results: [result] }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" }
      }
    );
  } catch (error) {
    console.error("Error en búsqueda:", error);
    return new Response(
      JSON.stringify({ message: "Ocurrió un error durante la búsqueda" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" }
      }
    );
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  POST,
  prerender
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
