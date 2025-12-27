import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Slug requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const filePath = path.join(process.cwd(), 'src', 'content', 'blog', `${slug}.md`);

    // Leer el archivo
    let content = await fs.readFile(filePath, 'utf-8');

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
    // Busca líneas que terminan en punto y son cortas (subtítulos)
    // Por ejemplo: "Saludo." -> "## Saludo."
    // Pero solo si no empiezan con número (no son versículos)
    body = body.replace(/^(?!#)(?!\d)([A-ZÁÉÍÓÚÑ][^.\n]{2,50}\.\*?)$/gm, '## $1');

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
        const verseOnlyMatch = line.match(/^(\d+)\s+([A-ZÁÉÍÓÚÑ].+)$/);
        if (verseOnlyMatch) {
          const verse = verseOnlyMatch[1];
          const text = verseOnlyMatch[2];
          // Solo formatear si parece un versículo (número bajo, texto largo)
          if (parseInt(verse) <= 50 && text.length > 10) {
            line = `${currentChapter}:${verse} ${text}`;
          }
        }
      }

      // Formatear versículos inline que empiezan con mayúscula
      // Buscar patrones como "palabra. 2 Siguiente"
      line = line.replace(/(\S)\s+(\d+)\s+([A-ZÁÉÍÓÚÑ])/g, (match, before, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${before} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Formatear versículos inline que empiezan con minúscula
      // Buscar patrones como "pasiones, 4 que" o "Dios; 6 y"
      // Detecta: puntuación + espacio + número + espacio + palabra minúscula
      line = line.replace(/([,;.!?»"'])\s+(\d+)\s+([a-záéíóúñ])/g, (match, punct, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      formattedLines.push(line);
    }

    body = formattedLines.join('\n');

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
