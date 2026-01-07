import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

// Función para encontrar el archivo real basándose en el slug (busca recursivamente)
async function findFileBySlug(baseDir: string, slug: string): Promise<string | null> {
  // El slug de Astro para carpetas anidadas es: "antiguo-testamento/01-pentateuco/01-genesis"
  // Extraemos solo el nombre del archivo del final
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
    content = content.replace(/\r\n/g, '\n'); // Normalizar Windows a Unix

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
    // Busca líneas que empiezan con texto en mayúsculas que parecen títulos principales
    // Por ejemplo: "SEGUNDA EPÍSTOLA DE SAN PEDRO" -> "# SEGUNDA EPÍSTOLA DE SAN PEDRO"
    body = body.replace(/^([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]+)$/gm, (match) => {
      // Solo si la línea está completamente en mayúsculas y parece un título
      if (match.trim().length > 5 && match === match.toUpperCase()) {
        return `# ${match}`;
      }
      return match;
    });

    // Transformación 2: Convertir subtítulos a ## (H2)
    // Detecta varios formatos de subtítulos:
    // - "Saludo." -> termina en punto
    // - "D. El sacrificio de reparación." -> empieza con letra y punto
    // - "a) sacrificio en alabanza *." -> empieza con letra minúscula y paréntesis
    // - "El sacerdocio y los sacrificios*:" -> termina en *:
    // - "Sanciones*:" -> termina en *:
    // - "A. El holocausto." -> letra mayúscula, punto, espacio, texto

    // Subtítulos que terminan en . o .*  (formato clásico)
    body = body.replace(/^(?!#)(?!\d)([A-ZÁÉÍÓÚÑ][^.\n]{2,60}\.\*?)$/gm, '## $1');

    // Subtítulos que empiezan con letra mayúscula + punto + espacio (ej: "A. El holocausto.")
    body = body.replace(/^(?!#)([A-Z]\.\s[A-ZÁÉÍÓÚÑa-záéíóúñ][^.\n]{2,60}\.\*?)$/gm, '## $1');

    // Subtítulos que empiezan con letra minúscula + paréntesis (ej: "a) sacrificio en alabanza *.")
    body = body.replace(/^(?!#)([a-z]\)\s[A-ZÁÉÍÓÚÑa-záéíóúñ][^.\n]{2,60}[\.\*]+)$/gm, '## $1');

    // Subtítulos que terminan en *: (ej: "Sanciones*:" o "El sacerdocio*:")
    body = body.replace(/^(?!#)(?!\d)([A-ZÁÉÍÓÚÑ][^\n]{2,60}\*:)$/gm, '## $1');

    // Subtítulos que empiezan con números romanos (ej: "II. La investidura...", "I. Caminar en la luz")
    body = body.replace(/^(?!#)((?:I{1,3}|IV|V|VI{0,3}|IX|X{1,3})\.\s[A-ZÁÉÍÓÚÑa-záéíóúñ][^\n]{2,80})$/gm, '## $1');

    // Transformación 3: Formatear versículos
    // Cambiar "1 1 Texto" o "2 1 Texto" a "1:1 Texto" o "2:1 Texto"
    // También manejar versículos subsecuentes como "2 Texto" -> añadir capítulo actual

    let currentChapter = '1';
    const lines = body.split('\n');
    const formattedLines: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Primero, detectar si la línea ya tiene versículos formateados (X:Y) para obtener el capítulo actual
      const existingChapterMatch = line.match(/(\d+):\d+/);
      if (existingChapterMatch) {
        currentChapter = existingChapterMatch[1];
      }

      // Detectar inicio de capítulo nuevo con patrón "X Y Texto" donde X es capítulo y Y es versículo
      const chapterVerseMatch = line.match(/^(\d+)\s+(\d+)\s+(.+)$/);
      if (chapterVerseMatch) {
        currentChapter = chapterVerseMatch[1];
        const verse = chapterVerseMatch[2];
        const text = chapterVerseMatch[3];
        line = `${currentChapter}:${verse} ${text}`;
      } else {
        // Detectar versículos sueltos "Y Texto" y añadir capítulo actual
        // Solo si la línea empieza con un número seguido de espacio y texto
        // Acepta mayúsculas, «, ", ', (, [, etc.
        const verseOnlyMatch = line.match(/^(\d+)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ«"'\(\[].+)$/);
        if (verseOnlyMatch) {
          const verse = verseOnlyMatch[1];
          const text = verseOnlyMatch[2];
          // Solo formatear si parece un versículo (número <= 200, texto largo)
          if (parseInt(verse) <= 200 && text.length > 10) {
            line = `${currentChapter}:${verse} ${text}`;
          }
        }
      }

      // Formatear versículos inline que empiezan con mayúscula o caracteres especiales
      // Buscar patrones como "palabra. 2 Siguiente" o "palabra. 10 «Si..."
      line = line.replace(/(\S)\s+(\d+)\s+([A-ZÁÉÍÓÚÑ«"'\(\[])/g, (match, before, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${before} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Formatear versículos inline que empiezan con minúscula
      // Buscar patrones como "pasiones, 4 que" o "Dios; 6 y" o "cabeza: 12 se"
      // Detecta: puntuación + espacio + número + espacio + palabra minúscula
      line = line.replace(/([,;.:!?»"'\)])\s+(\d+)\s+([a-záéíóúñ])/g, (match, punct, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Formatear versículos inline que empiezan con número (ej: "guerra: 25 45.650")
      // Buscar patrones como ": 25 45" o ". 26 12" donde el texto empieza con dígito
      line = line.replace(/([:.;,!?])\s+(\d+)\s+(\d)/g, (match, punct, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Formatear versículos que empiezan con * (ej: "34 *La Nube" o "11 *El año")
      line = line.replace(/([:.;,!?»])\s+(\d+)\s+(\*[A-ZÁÉÍÓÚÑ])/g, (match, punct, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Formatear versículos que empiezan con ¡ o ¿ (ej: "5 ¡Cómo")
      line = line.replace(/([:.;,!?»"'\)])\s+(\d+)\s+([¡¿])/g, (match, punct, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Formatear versículos después de guión largo (ej: "» —56 El" o "— 12 Pero")
      line = line.replace(/(—)\s*(\d+)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ«"'\(\[])/g, (match, dash, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${dash}${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Formatear versículos seguidos de guión largo (ej: "diga. 56— El")
      line = line.replace(/([.;,!?»"'\)])\s+(\d+)\s*—\s*([A-ZÁÉÍÓÚÑa-záéíóúñ«"'\(\[])/g, (match, punct, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} —${textStart}`;
        }
        return match;
      });

      // Formatear versículos después de palabra sin puntuación (ej: "día 7 y les")
      // Buscar: palabra + espacio + número + espacio + palabra minúscula corta (y, o, a, etc.)
      line = line.replace(/([a-záéíóúñ])\s+(\d+)\s+([yoa]\s)/g, (match, before, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${before} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      formattedLines.push(line);
    }

    body = formattedLines.join('\n');

    // Transformación 4: Agregar marcadores de capítulo antes del primer versículo de cada capítulo
    // Esto permite identificar fácilmente el inicio de cada capítulo para la búsqueda
    // El número del capítulo se muestra visible dentro del span
    // Ahora también soporta versículos con letras como 6a, 10b, etc.
    let lastChapterMarked = '';
    body = body.replace(/(\d+):(\d+[a-z]?)\s+/g, (match, chapter, verse) => {
      // Solo agregar marcador si es el versículo 1 (o 1a, 1b, etc.) y si es un capítulo nuevo
      if (verse.startsWith('1') && verse.length <= 2 && chapter !== lastChapterMarked) {
        lastChapterMarked = chapter;
        return `<span id="chapter-${chapter}" class="chapter-marker" data-chapter="${chapter}">${chapter}</span><sup>${verse}</sup> `;
      }
      return `<sup>${verse}</sup> `;
    });

    // Reconstruir el archivo
    const newContent = `---\n${frontmatter}\n---\n${body}`;

    // Guardar el archivo
    await fs.writeFile(filePath, newContent, 'utf-8');

    return new Response(JSON.stringify({
      success: true,
      message: `Archivo ${slug}.md formateado correctamente`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al formatear:', error);
    return new Response(JSON.stringify({
      error: 'Error al procesar el archivo',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
