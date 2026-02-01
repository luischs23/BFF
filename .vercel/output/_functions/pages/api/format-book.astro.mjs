import fs from 'fs/promises';
import path from 'path';
export { renderers } from '../../renderers.mjs';

const prerender = false;
async function findFileBySlug(baseDir, slug) {
  const slugParts = slug.split("/");
  const fileName = slugParts[slugParts.length - 1];
  async function searchDir(dir) {
    const entries = await fs.readdir(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        const found = await searchDir(fullPath);
        if (found) return found;
      } else if (entry.name.endsWith(".md")) {
        const fileSlug = entry.name.replace(".md", "").toLowerCase().replace(/\s+/g, "-");
        if (fileSlug === fileName || fileSlug === slug.replace(/\//g, "-")) {
          return fullPath;
        }
      }
    }
    return null;
  }
  return searchDir(baseDir);
}
const POST = async ({ request }) => {
  try {
    const { slug } = await request.json();
    if (!slug) {
      return new Response(JSON.stringify({ error: "Slug requerido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const blogDir = path.join(process.cwd(), "src", "content", "sagrada-biblia");
    const filePath = await findFileBySlug(blogDir, slug);
    if (!filePath) {
      return new Response(JSON.stringify({ error: `Archivo no encontrado para slug: ${slug}` }), {
        status: 404,
        headers: { "Content-Type": "application/json" }
      });
    }
    let content = await fs.readFile(filePath, "utf-8");
    content = content.replace(/\r\n/g, "\n");
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);
    if (!frontmatterMatch) {
      return new Response(JSON.stringify({ error: "Formato de archivo inválido" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    const frontmatter = frontmatterMatch[1];
    let body = frontmatterMatch[2];
    body = body.replace(/^([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]+)$/gm, (match) => {
      if (match.trim().length > 5 && match === match.toUpperCase()) {
        return `# ${match}`;
      }
      return match;
    });
    body = body.replace(/^(?!#)(?!\d)([A-ZÁÉÍÓÚÑ][^.\n]{2,60}\.\*?)$/gm, "## $1");
    body = body.replace(/^(?!#)([A-Z]\.\s[A-ZÁÉÍÓÚÑa-záéíóúñ][^.\n]{2,60}\.\*?)$/gm, "## $1");
    body = body.replace(/^(?!#)([a-z]\)\s[A-ZÁÉÍÓÚÑa-záéíóúñ][^.\n]{2,60}[\.\*]+)$/gm, "## $1");
    body = body.replace(/^(?!#)(?!\d)([A-ZÁÉÍÓÚÑ][^\n]{2,60}\*:)$/gm, "## $1");
    body = body.replace(/^(?!#)((?:I{1,3}|IV|V|VI{0,3}|IX|X{1,3})\.\s[A-ZÁÉÍÓÚÑa-záéíóúñ][^\n]{2,80})$/gm, "## $1");
    let currentChapter = "1";
    const lines = body.split("\n");
    const formattedLines = [];
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];
      const existingChapterMatch = line.match(/(\d+):\d+/);
      if (existingChapterMatch) {
        currentChapter = existingChapterMatch[1];
      }
      const chapterVerseMatch = line.match(/^(\d+)\s+(\d+)\s+(.+)$/);
      if (chapterVerseMatch) {
        currentChapter = chapterVerseMatch[1];
        const verse = chapterVerseMatch[2];
        const text = chapterVerseMatch[3];
        line = `${currentChapter}:${verse} ${text}`;
      } else {
        const verseOnlyMatch = line.match(/^(\d+)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ«"'\(\[].+)$/);
        if (verseOnlyMatch) {
          const verse = verseOnlyMatch[1];
          const text = verseOnlyMatch[2];
          if (parseInt(verse) <= 200 && text.length > 10) {
            line = `${currentChapter}:${verse} ${text}`;
          }
        }
      }
      line = line.replace(/(\S)\s+(\d+)\s+([A-ZÁÉÍÓÚÑ«"'\(\[])/g, (match, before, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${before} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });
      line = line.replace(/([,;.:!?»"'\)])\s+(\d+)\s+([a-záéíóúñ])/g, (match, punct, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });
      line = line.replace(/([:.;,!?])\s+(\d+)\s+(\d)/g, (match, punct, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });
      line = line.replace(/([:.;,!?»])\s+(\d+)\s+(\*[A-ZÁÉÍÓÚÑ])/g, (match, punct, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });
      line = line.replace(/([:.;,!?»"'\)])\s+(\d+)\s+([¡¿])/g, (match, punct, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });
      line = line.replace(/(—)\s*(\d+)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ«"'\(\[])/g, (match, dash, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${dash}${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });
      line = line.replace(/([.;,!?»"'\)])\s+(\d+)\s*—\s*([A-ZÁÉÍÓÚÑa-záéíóúñ«"'\(\[])/g, (match, punct, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} —${textStart}`;
        }
        return match;
      });
      line = line.replace(/([a-záéíóúñ])\s+(\d+)\s+([yoa]\s)/g, (match, before, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${before} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });
      formattedLines.push(line);
    }
    body = formattedLines.join("\n");
    let lastChapterMarked = "";
    body = body.replace(/(\d+):(\d+[a-z]?)\s+/g, (match, chapter, verse) => {
      if (verse.startsWith("1") && verse.length <= 2 && chapter !== lastChapterMarked) {
        lastChapterMarked = chapter;
        return `<span id="chapter-${chapter}" class="chapter-marker" data-chapter="${chapter}">${chapter}</span><sup>${verse}</sup> `;
      }
      return `<sup>${verse}</sup> `;
    });
    const newContent = `---
${frontmatter}
---
${body}`;
    await fs.writeFile(filePath, newContent, "utf-8");
    return new Response(JSON.stringify({
      success: true,
      message: `Archivo ${slug}.md formateado correctamente`
    }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error al formatear:", error);
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
