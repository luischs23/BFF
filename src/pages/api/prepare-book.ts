import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

// Función para encontrar el archivo real basándose en el slug (busca recursivamente)
async function findFileBySlug(baseDir: string, slug: string): Promise<string | null> {
  const slugParts = slug.split('/');
  const fileName = slugParts[slugParts.length - 1];

  async function searchDir(dir: string): Promise<string | null> {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      if (entry.isDirectory()) {
        const found = await searchDir(fullPath);
        if (found) return found;
      } else if (entry.name.endsWith('.md')) {
        const fileSlug = entry.name
          .replace('.md', '')
          .toLowerCase()
          .replace(/\s+/g, '-');

        if (fileSlug === fileName || fileSlug === slug.replace(/\//g, '-')) {
          return fullPath;
        }
      }
    }
    return null;
  }

  return searchDir(baseDir);
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const blogDir = path.join(process.cwd(), 'src', 'content', 'sagrada-biblia');
    const filePath = await findFileBySlug(blogDir, slug);

    if (!filePath) {
      return new Response(JSON.stringify({ error: `Archivo no encontrado para slug: ${slug}` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Leer el archivo y normalizar saltos de línea
    let content = await fs.readFile(filePath, 'utf-8');
    content = content.replace(/\r\n/g, '\n');

    // Separar frontmatter del contenido
    const frontmatterMatch = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/);

    if (!frontmatterMatch) {
      return new Response(JSON.stringify({ error: 'Formato de archivo inválido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const frontmatter = frontmatterMatch[1];
    let body = frontmatterMatch[2];

    // Transformación 1: Convertir el título principal a # (H1)
    body = body.replace(/^([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]+)$/gm, (match) => {
      if (match.trim().length > 5 && match === match.toUpperCase()) {
        return `# ${match}`;
      }
      return match;
    });

    // Transformación 2: Convertir subtítulos a ## (H2)
    body = body.replace(/^(?!#)(?!\d)([A-ZÁÉÍÓÚÑ][^.\n]{2,60}\.\*?)$/gm, '## $1');
    body = body.replace(/^(?!#)([A-Z]\.\s[A-ZÁÉÍÓÚÑa-záéíóúñ][^.\n]{2,60}\.\*?)$/gm, '## $1');
    body = body.replace(/^(?!#)([a-z]\)\s[A-ZÁÉÍÓÚÑa-záéíóúñ][^.\n]{2,60}[\.\*]+)$/gm, '## $1');
    body = body.replace(/^(?!#)(?!\d)([A-ZÁÉÍÓÚÑ][^\n]{2,60}\*:)$/gm, '## $1');
    body = body.replace(/^(?!#)((?:I{1,3}|IV|V|VI{0,3}|IX|X{1,3})\.\s[A-ZÁÉÍÓÚÑa-záéíóúñ][^\n]{2,80})$/gm, '## $1');

    // Transformación 3: Formatear versículos (X Y Texto -> X:Y Texto)
    let currentChapter = '1';
    const lines = body.split('\n');
    const formattedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Detectar si la línea ya tiene versículos formateados (X:Y o X:Ya donde a es letra)
      const existingChapterMatch = line.match(/(\d+):\d+[a-z]?/);
      if (existingChapterMatch) {
        currentChapter = existingChapterMatch[1];
      }

      // Detectar inicio de capítulo nuevo con patrón "X *Y Texto" o "X *Ya Texto" (asterisco antes del versículo)
      const chapterAsteriskVerseMatch = line.match(/^(\d+)\s+\*(\d+[a-z]?)\s+(.+)$/);
      if (chapterAsteriskVerseMatch) {
        currentChapter = chapterAsteriskVerseMatch[1];
        const verse = chapterAsteriskVerseMatch[2];
        const text = chapterAsteriskVerseMatch[3];
        line = `${currentChapter}:${verse} *${text}`;
      }

      // Detectar inicio de capítulo nuevo con patrón "X Y Texto" o "X Ya Texto"
      const chapterVerseMatch = line.match(/^(\d+)\s+(\d+[a-z]?)\s+(.+)$/);
      if (chapterVerseMatch && !chapterAsteriskVerseMatch) {
        currentChapter = chapterVerseMatch[1];
        const verse = chapterVerseMatch[2];
        const text = chapterVerseMatch[3];
        line = `${currentChapter}:${verse} ${text}`;
      } else if (!chapterAsteriskVerseMatch) {
        // Detectar versículos sueltos "Y Texto" o "Ya Texto" (incluyendo ¿¡ al inicio)
        const verseOnlyMatch = line.match(/^(\d+[a-z]?)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ«"'\(\[¿¡\*].+)$/);
        if (verseOnlyMatch) {
          const verse = verseOnlyMatch[1];
          const text = verseOnlyMatch[2];
          if (parseInt(verse) <= 200 && text.length > 10) {
            line = `${currentChapter}:${verse} ${text}`;
          }
        }

        // Detectar versículos con espacio al inicio de línea " Y Texto" o " Ya Texto"
        const verseWithLeadingSpaceMatch = line.match(/^\s+(\d+[a-z]?)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ«"'\(\[¿¡\*].+)$/);
        if (verseWithLeadingSpaceMatch) {
          const verse = verseWithLeadingSpaceMatch[1];
          const text = verseWithLeadingSpaceMatch[2];
          if (parseInt(verse) <= 200 && text.length > 5) {
            line = `${currentChapter}:${verse} ${text}`;
          }
        }
      }

      // Formatear versículos que empiezan con asterisco "* Y Texto" o "* Ya Texto"
      line = line.replace(/^\*\s+(\d+[a-z]?)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ«"'\(\[¿¡].+)$/gm, (match: string, verse: string, text: string) => {
        if (parseInt(verse) <= 200) {
          return `* ${currentChapter}:${verse} ${text}`;
        }
        return match;
      });

      // Formatear versículos inline que empiezan con mayúscula (soporta Ya como 6a)
      line = line.replace(/(\S)\s+(\d+[a-z]?)\s+([A-ZÁÉÍÓÚÑ«"'\(\[])/g, (match: string, before: string, verse: string, textStart: string) => {
        if (parseInt(verse) <= 200) {
          return `${before} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Formatear versículos inline que empiezan con minúscula (soporta Ya como 6a)
      line = line.replace(/([,;.:!?»"'\)])\s+(\d+[a-z]?)\s+([a-záéíóúñ])/g, (match: string, punct: string, verse: string, textStart: string) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Formatear versículos inline que empiezan con número (soporta Ya como 6a)
      line = line.replace(/([:.;,!?])\s+(\d+[a-z]?)\s+(\d)/g, (match: string, punct: string, verse: string, textStart: string) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Formatear versículos que empiezan con * (soporta Ya como 6a)
      line = line.replace(/([:.;,!?»])\s+(\d+[a-z]?)\s+(\*[A-ZÁÉÍÓÚÑ])/g, (match: string, punct: string, verse: string, textStart: string) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Formatear versículos que empiezan con ¡ o ¿ (soporta Ya como 6a)
      line = line.replace(/([:.;,!?»"'\)])\s+(\d+[a-z]?)\s+([¡¿])/g, (match: string, punct: string, verse: string, textStart: string) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Formatear versículos después de guión largo (soporta Ya como 6a)
      line = line.replace(/(—)\s*(\d+[a-z]?)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ«"'\(\[])/g, (match: string, dash: string, verse: string, textStart: string) => {
        if (parseInt(verse) <= 200) {
          return `${dash}${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Formatear versículos seguidos de guión largo (soporta Ya como 6a)
      line = line.replace(/([.;,!?»"'\)])\s+(\d+[a-z]?)\s*—\s*([A-ZÁÉÍÓÚÑa-záéíóúñ«"'\(\[])/g, (match: string, punct: string, verse: string, textStart: string) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} —${textStart}`;
        }
        return match;
      });

      // Formatear versículos después de palabra sin puntuación (soporta Ya como 6a)
      line = line.replace(/([a-záéíóúñ])\s+(\d+[a-z]?)\s+([yoa]\s)/g, (match: string, before: string, verse: string, textStart: string) => {
        if (parseInt(verse) <= 200) {
          return `${before} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Formatear versículos después de palabra (minúscula) seguido de guión largo (soporta Ya como 6a)
      line = line.replace(/([a-záéíóúñ])\s+(\d+[a-z]?)\s+(—[A-ZÁÉÍÓÚÑa-záéíóúñ])/g, (match: string, before: string, verse: string, textStart: string) => {
        if (parseInt(verse) <= 200) {
          return `${before} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      formattedLines.push(line);
    }

    body = formattedLines.join('\n');

    // NO convertir a <sup> - este endpoint solo prepara el formato X:Y

    // Reconstruir el archivo
    const newContent = `---\n${frontmatter}\n---\n${body}`;

    // Guardar el archivo
    await fs.writeFile(filePath, newContent, 'utf-8');

    return new Response(JSON.stringify({
      success: true,
      message: `Archivo ${slug}.md preparado correctamente (formato X:Y)`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al preparar:', error);
    return new Response(JSON.stringify({
      error: 'Error al procesar el archivo',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
