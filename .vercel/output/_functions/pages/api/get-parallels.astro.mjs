import fs from 'fs/promises';
import path from 'path';
export { renderers } from '../../renderers.mjs';

const prerender = false;
const BOOK_PATHS = {
  "gn": "antiguo-testamento/01-pentateuco/01-genesis",
  "ex": "antiguo-testamento/01-pentateuco/02-exodo",
  "lv": "antiguo-testamento/01-pentateuco/03-levitico",
  "nm": "antiguo-testamento/01-pentateuco/04-numeros",
  "dt": "antiguo-testamento/01-pentateuco/05-deuteronomio",
  "jos": "antiguo-testamento/02-libros-historicos/01-josue",
  "jc": "antiguo-testamento/02-libros-historicos/02-jueces",
  "rt": "antiguo-testamento/02-libros-historicos/03-rut",
  "1s": "antiguo-testamento/02-libros-historicos/04-1samuel",
  "2s": "antiguo-testamento/02-libros-historicos/05-2samuel",
  "1r": "antiguo-testamento/02-libros-historicos/06-1reyes",
  "2r": "antiguo-testamento/02-libros-historicos/07-2reyes",
  "1cro": "antiguo-testamento/02-libros-historicos/08-1cronicas",
  "2cro": "antiguo-testamento/02-libros-historicos/09-2cronicas",
  "esd": "antiguo-testamento/02-libros-historicos/10-esdras",
  "ne": "antiguo-testamento/02-libros-historicos/11-nehemias",
  "tb": "antiguo-testamento/02-libros-historicos/12-tobias",
  "jdt": "antiguo-testamento/02-libros-historicos/13-judit",
  "est": "antiguo-testamento/02-libros-historicos/14-ester",
  "1m": "antiguo-testamento/02-libros-historicos/15-1macabeos",
  "2m": "antiguo-testamento/02-libros-historicos/16-2macabeos",
  "jb": "antiguo-testamento/03-lirica/01-job",
  "sal": "antiguo-testamento/03-lirica/02-salmos",
  "ct": "antiguo-testamento/03-lirica/03-cantar-de-los-cantares",
  "lm": "antiguo-testamento/03-lirica/04-lamentaciones",
  "pr": "antiguo-testamento/04-libros-sapienciales/01-proverbios",
  "qo": "antiguo-testamento/04-libros-sapienciales/02-eclesiastes",
  "sb": "antiguo-testamento/04-libros-sapienciales/03-sabiduria",
  "si": "antiguo-testamento/04-libros-sapienciales/04-eclesiastico",
  "is": "antiguo-testamento/05-libros-profeticos/01-isaias",
  "jr": "antiguo-testamento/05-libros-profeticos/02-jeremias",
  "ba": "antiguo-testamento/05-libros-profeticos/03-baruc",
  "ez": "antiguo-testamento/05-libros-profeticos/04-ezequiel",
  "dn": "antiguo-testamento/05-libros-profeticos/05-daniel",
  "os": "antiguo-testamento/05-libros-profeticos/06-oseas",
  "jl": "antiguo-testamento/05-libros-profeticos/07-joel",
  "am": "antiguo-testamento/05-libros-profeticos/08-amos",
  "abd": "antiguo-testamento/05-libros-profeticos/09-abdias",
  "jon": "antiguo-testamento/05-libros-profeticos/10-jonas",
  "mi": "antiguo-testamento/05-libros-profeticos/11-miqueas",
  "na": "antiguo-testamento/05-libros-profeticos/12-nahum",
  "ha": "antiguo-testamento/05-libros-profeticos/13-habacuc",
  "so": "antiguo-testamento/05-libros-profeticos/14-sofonias",
  "ag": "antiguo-testamento/05-libros-profeticos/15-ageo",
  "za": "antiguo-testamento/05-libros-profeticos/16-zacarias",
  "ml": "antiguo-testamento/05-libros-profeticos/17-malaquias",
  "mt": "nuevo-testamento/01-evangelios/01-mateo",
  "mc": "nuevo-testamento/01-evangelios/02-marcos",
  "lc": "nuevo-testamento/01-evangelios/03-lucas",
  "jn": "nuevo-testamento/01-evangelios/04-juan",
  "hch": "nuevo-testamento/02-hechos/01-hechos",
  "rm": "nuevo-testamento/03-epistolas-pablo/01-romanos",
  "1co": "nuevo-testamento/03-epistolas-pablo/02-1corintios",
  "2co": "nuevo-testamento/03-epistolas-pablo/03-2corintios",
  "ga": "nuevo-testamento/03-epistolas-pablo/04-galatas",
  "ef": "nuevo-testamento/03-epistolas-pablo/05-efesios",
  "flp": "nuevo-testamento/03-epistolas-pablo/06-filipenses",
  "col": "nuevo-testamento/03-epistolas-pablo/07-colosenses",
  "1ts": "nuevo-testamento/03-epistolas-pablo/08-1tesalonicenses",
  "2ts": "nuevo-testamento/03-epistolas-pablo/09-2tesalonicenses",
  "1tm": "nuevo-testamento/03-epistolas-pablo/10-1timoteo",
  "2tm": "nuevo-testamento/03-epistolas-pablo/11-2timoteo",
  "tt": "nuevo-testamento/03-epistolas-pablo/12-tito",
  "flm": "nuevo-testamento/03-epistolas-pablo/13-filemon",
  "hb": "nuevo-testamento/04-hebreos/01-hebreos",
  "st": "nuevo-testamento/05-epistolas-catolicas/01-santiago",
  "1p": "nuevo-testamento/05-epistolas-catolicas/02-1pedro",
  "2p": "nuevo-testamento/05-epistolas-catolicas/03-2pedro",
  "1jn": "nuevo-testamento/05-epistolas-catolicas/04-1juan",
  "2jn": "nuevo-testamento/05-epistolas-catolicas/05-2juan",
  "3jn": "nuevo-testamento/05-epistolas-catolicas/06-3juan",
  "jds": "nuevo-testamento/05-epistolas-catolicas/07-judas",
  "ap": "nuevo-testamento/06-apocalipsis/01-apocalipsis"
};
const BOOK_NAMES = {
  "Gn": "Génesis",
  "Ex": "Éxodo",
  "Lv": "Levítico",
  "Nm": "Números",
  "Dt": "Deuteronomio",
  "Jos": "Josué",
  "Jc": "Jueces",
  "Rt": "Rut",
  "1S": "1 Samuel",
  "2S": "2 Samuel",
  "1R": "1 Reyes",
  "2R": "2 Reyes",
  "1Cro": "1 Crónicas",
  "2Cro": "2 Crónicas",
  "Esd": "Esdras",
  "Ne": "Nehemías",
  "Tb": "Tobías",
  "Jdt": "Judit",
  "Est": "Ester",
  "1M": "1 Macabeos",
  "2M": "2 Macabeos",
  "Jb": "Job",
  "Sal": "Salmos",
  "Ct": "Cantar",
  "Lm": "Lamentaciones",
  "Pr": "Proverbios",
  "Qo": "Eclesiastés",
  "Sb": "Sabiduría",
  "Si": "Eclesiástico",
  "Is": "Isaías",
  "Jr": "Jeremías",
  "Ba": "Baruc",
  "Ez": "Ezequiel",
  "Dn": "Daniel",
  "Os": "Oseas",
  "Jl": "Joel",
  "Am": "Amós",
  "Abd": "Abdías",
  "Jon": "Jonás",
  "Mi": "Miqueas",
  "Na": "Nahúm",
  "Ha": "Habacuc",
  "So": "Sofonías",
  "Ag": "Ageo",
  "Za": "Zacarías",
  "Ml": "Malaquías",
  "Mt": "Mateo",
  "Mc": "Marcos",
  "Lc": "Lucas",
  "Jn": "Juan",
  "Hch": "Hechos",
  "Rm": "Romanos",
  "1Co": "1 Corintios",
  "2Co": "2 Corintios",
  "Ga": "Gálatas",
  "Ef": "Efesios",
  "Flp": "Filipenses",
  "Col": "Colosenses",
  "1Ts": "1 Tesalonicenses",
  "2Ts": "2 Tesalonicenses",
  "1Tm": "1 Timoteo",
  "2Tm": "2 Timoteo",
  "Tt": "Tito",
  "Flm": "Filemón",
  "Hb": "Hebreos",
  "St": "Santiago",
  "1P": "1 Pedro",
  "2P": "2 Pedro",
  "1Jn": "1 Juan",
  "2Jn": "2 Juan",
  "3Jn": "3 Juan",
  "Jds": "Judas",
  "Ap": "Apocalipsis"
};
const BOOK_ABBREVS = /* @__PURE__ */ new Set([
  "Gn",
  "Ex",
  "Lv",
  "Nm",
  "Dt",
  "Jos",
  "Jc",
  "Rt",
  "1S",
  "2S",
  "1R",
  "2R",
  "1Cro",
  "2Cro",
  "Esd",
  "Ne",
  "Tb",
  "Jdt",
  "Est",
  "1M",
  "2M",
  "Jb",
  "Sal",
  "Ct",
  "Lm",
  "Pr",
  "Qo",
  "Sb",
  "Si",
  "Is",
  "Jr",
  "Ba",
  "Ez",
  "Dn",
  "Os",
  "Jl",
  "Am",
  "Abd",
  "Jon",
  "Mi",
  "Na",
  "Ha",
  "So",
  "Ag",
  "Za",
  "Ml",
  "Mt",
  "Mc",
  "Lc",
  "Jn",
  "Hch",
  "Rm",
  "1Co",
  "2Co",
  "Ga",
  "Ef",
  "Flp",
  "Col",
  "1Ts",
  "2Ts",
  "1Tm",
  "2Tm",
  "Tt",
  "Flm",
  "Hb",
  "St",
  "1P",
  "2P",
  "1Jn",
  "2Jn",
  "3Jn",
  "Jds",
  "Ap"
]);
function parseParallelsFile(content, bookAbbrev) {
  const parallelsMap = /* @__PURE__ */ new Map();
  const frontmatterMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  const body = frontmatterMatch ? frontmatterMatch[1] : content;
  const lines = body.split("\n").map((l) => l.trim()).filter((l) => l);
  let currentRef = null;
  let currentChapter = null;
  for (const line of lines) {
    const escapedAbbrev = bookAbbrev.replace(/([123])([A-Za-z])/, "$1\\s?$2");
    const mainRefMatch = line.match(new RegExp(`^${escapedAbbrev}\\s+(\\d+)\\s+(\\d+)(?:-(\\d+))?(?:\\s+-\\s+(\\d+)\\s+(\\d+))?$`));
    if (mainRefMatch) {
      const chapter = mainRefMatch[1];
      const startVerse = mainRefMatch[2];
      const endVerseInChapter = mainRefMatch[3];
      const endChapter = mainRefMatch[4];
      const endVerse = mainRefMatch[5];
      currentChapter = chapter;
      if (endChapter && endVerse) {
        currentRef = `${chapter}:${startVerse}`;
      } else if (endVerseInChapter) {
        currentRef = `${chapter}:${startVerse}`;
      } else {
        currentRef = `${chapter}:${startVerse}`;
      }
      if (!parallelsMap.has(currentRef)) {
        parallelsMap.set(currentRef, []);
      }
      continue;
    }
    if (!currentRef || !currentChapter) continue;
    const isNT = line.startsWith("↑");
    const cleanLine = line.replace(/^↑\s*/, "");
    const refs = cleanLine.split(";").map((r) => r.trim());
    for (const ref of refs) {
      if (!ref) continue;
      const parsed = parseParallelReference(ref, currentChapter, bookAbbrev);
      if (parsed) {
        parsed.isNT = isNT || parsed.isNT;
        parallelsMap.get(currentRef).push(parsed);
      }
    }
  }
  return parallelsMap;
}
function parseParallelReference(ref, currentChapter, currentBookAbbrev) {
  const isNT = ref.startsWith("↑");
  let cleanRef = ref.replace(/^↑\s*/, "").trim();
  cleanRef = cleanRef.replace(/[+sp]+$/, "").trim();
  let bookAbbrev = "";
  let restRef = cleanRef;
  const bookMatch = cleanRef.match(/^(\d?\s*[A-Za-z]+)\s+(.*)$/);
  if (bookMatch) {
    const possibleAbbrev = bookMatch[1].replace(/\s+/g, "");
    if (BOOK_ABBREVS.has(possibleAbbrev)) {
      bookAbbrev = possibleAbbrev;
      restRef = bookMatch[2];
    } else {
      const numMatch = cleanRef.match(/^(\d)\s+([A-Za-z]+)\s+(.*)$/);
      if (numMatch) {
        const combined = numMatch[1] + numMatch[2];
        if (BOOK_ABBREVS.has(combined)) {
          bookAbbrev = combined;
          restRef = numMatch[3];
        }
      }
    }
  }
  if (!bookAbbrev) {
    bookAbbrev = currentBookAbbrev;
  }
  let chapter = "";
  let verses = "";
  const parts = restRef.trim().split(/\s+/);
  if (parts.length >= 2) {
    chapter = parts[0];
    verses = parts.slice(1).join(" ");
  } else if (parts.length === 1) {
    const singlePart = parts[0];
    if (singlePart.includes("-") && !singlePart.match(/^\d+-\d+$/)) {
      chapter = singlePart;
      verses = "";
    } else if (singlePart.match(/^\d+$/)) {
      if (bookAbbrev !== currentBookAbbrev) {
        chapter = singlePart;
      } else {
        chapter = currentChapter;
        verses = singlePart;
      }
    } else {
      chapter = currentChapter;
      verses = singlePart;
    }
  }
  if (!chapter) return null;
  const ntBooks = /* @__PURE__ */ new Set([
    "Mt",
    "Mc",
    "Lc",
    "Jn",
    "Hch",
    "Rm",
    "1Co",
    "2Co",
    "Ga",
    "Ef",
    "Flp",
    "Col",
    "1Ts",
    "2Ts",
    "1Tm",
    "2Tm",
    "Tt",
    "Flm",
    "Hb",
    "St",
    "1P",
    "2P",
    "1Jn",
    "2Jn",
    "3Jn",
    "Jds",
    "Ap"
  ]);
  const bookName = BOOK_NAMES[bookAbbrev] || bookAbbrev;
  const bookKey = bookAbbrev.toLowerCase();
  const bookPath = BOOK_PATHS[bookKey];
  const chapterMatch = chapter.match(/^(\d+)/);
  const firstChapter = chapterMatch ? chapterMatch[1] : chapter;
  let firstVerse = "";
  if (verses) {
    const verseMatch = verses.match(/^(\d+)/);
    firstVerse = verseMatch ? verseMatch[1] : "";
  }
  return {
    reference: verses ? `${bookAbbrev} ${chapter},${verses}` : `${bookAbbrev} ${chapter}`,
    bookAbbrev,
    bookName,
    chapter,
    verses,
    isNT: isNT || ntBooks.has(bookAbbrev),
    bookPath: bookPath ? `/biblia/${bookPath}` : void 0,
    firstChapter,
    firstVerse
  };
}
function getParallelsForVerse(parallelsMap, chapter, verse) {
  const results = [];
  const seen = /* @__PURE__ */ new Set();
  for (const [refKey, parallels] of parallelsMap) {
    const simpleMatch = refKey.match(/^(\d+):(\d+)$/);
    if (!simpleMatch) continue;
    const refChapter = parseInt(simpleMatch[1]);
    const refVerse = parseInt(simpleMatch[2]);
    if (chapter === refChapter && verse === refVerse) {
      for (const parallel of parallels) {
        const key = `${parallel.bookAbbrev}-${parallel.chapter}-${parallel.verses}`;
        if (!seen.has(key)) {
          seen.add(key);
          results.push(parallel);
        }
      }
    }
  }
  return results;
}
const POST = async ({ request }) => {
  try {
    const { bookSlug, chapter, verse } = await request.json();
    if (!bookSlug || !chapter || !verse) {
      return new Response(JSON.stringify({
        error: "Se requiere bookSlug, chapter y verse"
      }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const slugParts = bookSlug.split("/");
    const fileName = slugParts[slugParts.length - 1];
    const parallelsPath = path.join(
      process.cwd(),
      "src",
      "content",
      "sagrada-biblia",
      ...slugParts.slice(0, -1),
      `${fileName}-paralelos.md`
    );
    const fileToAbbrev = {
      "01-genesis": "Gn",
      "02-exodo": "Ex",
      "03-levitico": "Lv",
      "04-numeros": "Nm",
      "05-deuteronomio": "Dt",
      "01-josue": "Jos",
      "02-jueces": "Jc",
      "03-rut": "Rt",
      "04-1samuel": "1S",
      "05-2samuel": "2S",
      "06-1reyes": "1R",
      "07-2reyes": "2R",
      "08-1cronicas": "1Cro",
      "09-2cronicas": "2Cro",
      "10-esdras": "Esd",
      "11-nehemias": "Ne",
      "12-tobias": "Tb",
      "13-judit": "Jdt",
      "14-ester": "Est",
      "15-1macabeos": "1M",
      "16-2macabeos": "2M",
      "01-job": "Jb",
      "02-salmos": "Sal",
      "03-cantar-de-los-cantares": "Ct",
      "04-lamentaciones": "Lm",
      "01-proverbios": "Pr",
      "02-eclesiastes": "Qo",
      "03-sabiduria": "Sb",
      "04-eclesiastico": "Si",
      "01-isaias": "Is",
      "02-jeremias": "Jr",
      "03-baruc": "Ba",
      "04-ezequiel": "Ez",
      "05-daniel": "Dn",
      "06-oseas": "Os",
      "07-joel": "Jl",
      "08-amos": "Am",
      "09-abdias": "Abd",
      "10-jonas": "Jon",
      "11-miqueas": "Mi",
      "12-nahum": "Na",
      "13-habacuc": "Ha",
      "14-sofonias": "So",
      "15-ageo": "Ag",
      "16-zacarias": "Za",
      "17-malaquias": "Ml",
      "01-mateo": "Mt",
      "02-marcos": "Mc",
      "03-lucas": "Lc",
      "04-juan": "Jn",
      "01-hechos": "Hch",
      "01-romanos": "Rm",
      "02-1corintios": "1Co",
      "03-2corintios": "2Co",
      "04-galatas": "Ga",
      "05-efesios": "Ef",
      "06-filipenses": "Flp",
      "07-colosenses": "Col",
      "08-1tesalonicenses": "1Ts",
      "09-2tesalonicenses": "2Ts",
      "10-1timoteo": "1Tm",
      "11-2timoteo": "2Tm",
      "12-tito": "Tt",
      "13-filemon": "Flm",
      "01-hebreos": "Hb",
      "01-santiago": "St",
      "02-1pedro": "1P",
      "03-2pedro": "2P",
      "04-1juan": "1Jn",
      "05-2juan": "2Jn",
      "06-3juan": "3Jn",
      "07-judas": "Jds",
      "01-apocalipsis": "Ap"
    };
    const bookAbbrev = fileToAbbrev[fileName] || "Gn";
    const bookName = BOOK_NAMES[bookAbbrev] || "Génesis";
    let content;
    try {
      content = await fs.readFile(parallelsPath, "utf-8");
    } catch {
      return new Response(JSON.stringify({
        success: true,
        title: `${bookAbbrev} ${chapter},${verse}`,
        parallels: [],
        message: "No hay paralelos disponibles para este libro"
      }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    const parallelsMap = parseParallelsFile(content, bookAbbrev);
    const parallels = getParallelsForVerse(parallelsMap, parseInt(chapter), parseInt(verse));
    return new Response(JSON.stringify({
      success: true,
      title: `${bookName} ${chapter},${verse}`,
      reference: `${bookAbbrev} ${chapter},${verse}`,
      parallels,
      count: parallels.length
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error al obtener paralelos:", error);
    return new Response(JSON.stringify({
      error: "Error al procesar la solicitud",
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
