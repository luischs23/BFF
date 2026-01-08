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

    // Extraer título del libro del frontmatter
    const titleMatch = frontmatter.match(/title:\s*["']?([^"'\n]+)["']?/);
    const bookTitle = titleMatch ? titleMatch[1] : slug;

    // Contador de correcciones y ejemplos
    let fixedCount = 0;
    const examples: string[] = [];

    // Regex para detectar versículos con letras en formato "47:5a", "47:6b", etc.
    // que NO están dentro de un <sup> ya
    // Patrón: número:número+letra(s) seguido de espacio y texto
    // Excluye los que ya están formateados como <sup>
    const letterVerseRegex = /(?<!<sup>)(\d+):(\d+[a-z]+)\s+/g;

    body = body.replace(letterVerseRegex, (match, chapter, verseWithLetter) => {
      fixedCount++;
      if (examples.length < 10) {
        examples.push(`${chapter}:${verseWithLetter} → <sup>${verseWithLetter}</sup>`);
      }
      return `<sup>${verseWithLetter}</sup> `;
    });

    // También buscar al inicio de línea con formato "» 47:5a" o similar
    // donde hay un caracter especial antes del versículo
    const lineStartRegex = /^(»\s*)(\d+):(\d+[a-z]+)\s+/gm;

    body = body.replace(lineStartRegex, (match, prefix, chapter, verseWithLetter) => {
      fixedCount++;
      if (examples.length < 10) {
        examples.push(`${prefix}${chapter}:${verseWithLetter} → ${prefix}<sup>${verseWithLetter}</sup>`);
      }
      return `${prefix}<sup>${verseWithLetter}</sup> `;
    });

    // Buscar versículos con letras después de ## (subtítulos)
    const afterHeaderRegex = /(##[^\n]*\n)(\d+):(\d+[a-z]+)\s+/g;

    body = body.replace(afterHeaderRegex, (match, header, chapter, verseWithLetter) => {
      fixedCount++;
      if (examples.length < 10) {
        examples.push(`${chapter}:${verseWithLetter} (después de subtítulo) → <sup>${verseWithLetter}</sup>`);
      }
      return `${header}<sup>${verseWithLetter}</sup> `;
    });

    // Reconstruir el archivo
    const newContent = `---\n${frontmatter}\n---\n${body}`;

    // Guardar el archivo
    await fs.writeFile(filePath, newContent, 'utf-8');

    return new Response(JSON.stringify({
      success: true,
      book: bookTitle,
      fixed: fixedCount,
      examples: examples.length > 0 ? examples : null,
      message: fixedCount > 0
        ? `Se corrigieron ${fixedCount} versículos con letras`
        : 'No se encontraron versículos con letras para corregir'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al corregir versículos con letras:', error);
    return new Response(JSON.stringify({
      error: 'Error al procesar el archivo',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
