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

    // Procesar línea por línea para corregir versículos
    let currentChapter = '1';
    const lines = body.split('\n');
    const formattedLines: string[] = [];
    let fixedCount = 0;

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i];

      // Saltar líneas de títulos y vacías
      if (line.startsWith('#') || line.trim() === '') {
        formattedLines.push(line);
        continue;
      }

      // Detectar el capítulo actual de versículos ya formateados
      const existingChapterMatch = line.match(/(\d+):\d+/);
      if (existingChapterMatch) {
        currentChapter = existingChapterMatch[1];
      }

      const originalLine = line;

      // Corregir versículos inline que empiezan con mayúscula o caracteres especiales
      // Buscar patrones como "palabra. 2 Siguiente" o "palabra. 10 «Si..."
      line = line.replace(/(\S)\s+(\d+)\s+([A-ZÁÉÍÓÚÑ«"'\(\[])/g, (match, before, verse, textStart) => {
        // Verificar que no sea ya parte de un versículo formateado (X:Y)
        if (before === ':') return match;
        if (parseInt(verse) <= 200) {
          return `${before} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Corregir versículos inline que empiezan con minúscula
      // Buscar patrones como "pasiones, 4 que" o "Dios; 6 y" o "cabeza: 12 se"
      line = line.replace(/([,;.:!?»"'\)])\s+(\d+)\s+([a-záéíóúñ])/g, (match, punct, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Corregir versículos inline que empiezan con número (ej: "guerra: 25 45.650")
      // Buscar patrones como ": 25 45" o ". 26 12" donde el texto empieza con dígito
      line = line.replace(/([:.;,!?])\s+(\d+)\s+(\d)/g, (match, punct, verse, textStart) => {
        // Verificar que el número sea razonable para un versículo
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Corregir versículos que empiezan con * (ej: "34 *La Nube" o "11 *El año")
      line = line.replace(/([:.;,!?»])\s+(\d+)\s+(\*[A-ZÁÉÍÓÚÑ])/g, (match, punct, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Corregir versículos que empiezan con ¡ o ¿ (ej: "5 ¡Cómo")
      line = line.replace(/([:.;,!?»"'\)])\s+(\d+)\s+([¡¿])/g, (match, punct, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Corregir versículos después de guión largo (ej: "» —56 El" o "— 12 Pero")
      line = line.replace(/(—)\s*(\d+)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ«"'\(\[])/g, (match, dash, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${dash}${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Corregir versículos seguidos de guión largo (ej: "diga. 56— El")
      line = line.replace(/([.;,!?»"'\)])\s+(\d+)\s*—\s*([A-ZÁÉÍÓÚÑa-záéíóúñ«"'\(\[])/g, (match, punct, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${punct} ${currentChapter}:${verse} —${textStart}`;
        }
        return match;
      });

      // Corregir versículos después de palabra sin puntuación (ej: "día 7 y les")
      // Buscar: palabra + espacio + número + espacio + palabra minúscula corta (y, o, a, etc.)
      line = line.replace(/([a-záéíóúñ])\s+(\d+)\s+([yoa]\s)/g, (match, before, verse, textStart) => {
        if (parseInt(verse) <= 200) {
          return `${before} ${currentChapter}:${verse} ${textStart}`;
        }
        return match;
      });

      // Corregir versículos al inicio de línea (sin formato X:Y)
      // Solo si la línea empieza con número + espacio + texto (no X Y patrón de capítulo)
      if (!line.match(/^\d+:\d+/) && !line.match(/^\d+\s+\d+\s+/)) {
        const verseStartMatch = line.match(/^(\d+)\s+([A-ZÁÉÍÓÚÑa-záéíóúñ«"'\(\[].+)$/);
        if (verseStartMatch) {
          const verse = verseStartMatch[1];
          const text = verseStartMatch[2];
          if (parseInt(verse) <= 200 && text.length > 10) {
            line = `${currentChapter}:${verse} ${text}`;
          }
        }
      }

      if (line !== originalLine) {
        fixedCount++;
      }

      formattedLines.push(line);
    }

    body = formattedLines.join('\n');

    // NO convertir a <sup> - este endpoint solo prepara el formato X:Y
    // Para convertir a superíndice, usar el botón "Formatear" (F)

    // Reconstruir el archivo
    const newContent = `---\n${frontmatter}\n---\n${body}`;

    // Guardar el archivo
    await fs.writeFile(filePath, newContent, 'utf-8');

    return new Response(JSON.stringify({
      success: true,
      fixedCount,
      message: `Se corrigieron ${fixedCount} líneas con versículos sin formatear`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al corregir:', error);
    return new Response(JSON.stringify({
      error: 'Error al procesar el archivo',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
