import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

// Función para encontrar el archivo real basándose en el slug
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

// Regex para detectar inicio de un comentario bíblico
// Patrones: "Gn 1", "Gn 1 1", "Gn 1 2 (a)", "Ex 20 11", "Is 11 6-8", etc.
// También soporta otros libros: Ex, Lv, Nm, Dt, Jos, Jc, Rt, 1 S, 2 S, 1 R, 2 R, etc.
const BOOK_ABBREVS = [
  // Pentateuco
  'Gn', 'Ex', 'Lv', 'Nm', 'Dt',
  // Históricos
  'Jos', 'Jc', 'Rt', '1 S', '2 S', '1 R', '2 R', '1 Cro', '2 Cro', 'Esd', 'Ne', 'Tb', 'Jdt', 'Est', '1 M', '2 M',
  // Lírica
  'Jb', 'Sal', 'Ct', 'Lm',
  // Sapienciales
  'Pr', 'Qo', 'Sb', 'Si',
  // Proféticos
  'Is', 'Jr', 'Ba', 'Ez', 'Dn', 'Os', 'Jl', 'Am', 'Abd', 'Jon', 'Mi', 'Na', 'Ha', 'So', 'Ag', 'Za', 'Ml',
  // Evangelios
  'Mt', 'Mc', 'Lc', 'Jn',
  // Hechos
  'Hch',
  // Epístolas Pablo
  'Rm', '1 Co', '2 Co', 'Ga', 'Ef', 'Flp', 'Col', '1 Ts', '2 Ts', '1 Tm', '2 Tm', 'Tt', 'Flm',
  // Hebreos
  'Hb',
  // Católicas
  'St', '1 P', '2 P', '1 Jn', '2 Jn', '3 Jn', 'Jds',
  // Apocalipsis
  'Ap'
];

function createCommentStartRegex(): RegExp {
  // Escapar caracteres especiales en las abreviaturas
  const escapedAbbrevs = BOOK_ABBREVS.map(abbrev => abbrev.replace(/\s/g, '\\s'));
  // Patrón: Abreviatura + espacio + número(s) + opcionalmente más números, letras, paréntesis
  // Ejemplo: "Gn 1", "Gn 1 1", "Gn 1 2 (a)", "Gn 2 4 b", "Is 11 6-8"
  return new RegExp(`^(${escapedAbbrevs.join('|')})\\s+\\d+`, 'i');
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

    const commentStartRegex = createCommentStartRegex();

    // Dividir el contenido en líneas
    const lines = body.split('\n');
    const paragraphs: string[] = [];
    let currentParagraph: string[] = [];
    let commentsFound = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const trimmedLine = line.trim();

      // Si la línea está vacía, ignorarla (estamos uniendo todo)
      if (trimmedLine === '') {
        continue;
      }

      // Si la línea empieza con una referencia bíblica, es el inicio de un nuevo comentario
      if (commentStartRegex.test(trimmedLine)) {
        // Guardar el párrafo anterior si existe
        if (currentParagraph.length > 0) {
          paragraphs.push(currentParagraph.join(' '));
          commentsFound++;
        }
        // Iniciar nuevo párrafo
        currentParagraph = [trimmedLine];
      } else {
        // Continuar el párrafo actual
        currentParagraph.push(trimmedLine);
      }
    }

    // No olvidar el último párrafo
    if (currentParagraph.length > 0) {
      paragraphs.push(currentParagraph.join(' '));
      commentsFound++;
    }

    // Unir los párrafos con doble salto de línea
    body = paragraphs.join('\n\n');

    // Reconstruir el archivo
    const newContent = `---\n${frontmatter}\n---\n${body}\n`;

    // Guardar el archivo
    await fs.writeFile(filePath, newContent, 'utf-8');

    return new Response(JSON.stringify({
      success: true,
      book: bookTitle,
      comments: commentsFound,
      message: `Se formatearon ${commentsFound} comentarios`
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al formatear comentarios:', error);
    return new Response(JSON.stringify({
      error: 'Error al procesar el archivo',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
