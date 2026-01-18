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

// Mapeo de abreviaturas de libros (del comentario) al formato de data-ref
const bookAbbrevMap: Record<string, string> = {
  'Gn': 'gn', 'Ex': 'ex', 'Lv': 'lv', 'Nm': 'nm', 'Dt': 'dt',
  'Jos': 'jos', 'Jc': 'jc', 'Rt': 'rt', '1S': '1s', '2S': '2s',
  '1R': '1r', '2R': '2r', '1Cro': '1cro', '2Cro': '2cro',
  'Esd': 'esd', 'Ne': 'ne', 'Tb': 'tb', 'Jdt': 'jdt', 'Est': 'est',
  '1M': '1m', '2M': '2m', 'Jb': 'jb', 'Sal': 'sal', 'Ct': 'ct',
  'Lm': 'lm', 'Pr': 'pr', 'Qo': 'qo', 'Sb': 'sb', 'Si': 'si',
  'Is': 'is', 'Jr': 'jr', 'Ba': 'ba', 'Ez': 'ez', 'Dn': 'dn',
  'Os': 'os', 'Jl': 'jl', 'Am': 'am', 'Abd': 'abd', 'Jon': 'jon',
  'Mi': 'mi', 'Na': 'na', 'Ha': 'ha', 'So': 'so', 'Ag': 'ag',
  'Za': 'za', 'Ml': 'ml', 'Mt': 'mt', 'Mc': 'mc', 'Lc': 'lc',
  'Jn': 'jn', 'Hch': 'hch', 'Rm': 'rm', '1Co': '1co', '2Co': '2co',
  'Ga': 'ga', 'Ef': 'ef', 'Flp': 'flp', 'Col': 'col',
  '1Ts': '1ts', '2Ts': '2ts', '1Tm': '1tm', '2Tm': '2tm',
  'Tt': 'tt', 'Flm': 'flm', 'Hb': 'hb', 'St': 'st',
  '1P': '1p', '2P': '2p', '1Jn': '1jn', '2Jn': '2jn', '3Jn': '3jn',
  'Jds': 'jds', 'Ap': 'ap'
};

// Extraer referencias de comentarios del archivo de comentarios
function extractCommentRefs(content: string, bookAbbrev: string): string[] {
  const refs: string[] = [];

  // Patrón para detectar inicio de comentario: "Gn 1 2 (a)" o "Gn 1" o "Gn 1 2"
  // El formato es: ABBREV CAPITULO [VERSICULO] [(LETRA)]
  // Para abreviaturas como "1S", "2S", etc., el archivo puede tener "1 S" con espacio
  // Escapamos caracteres especiales y permitimos espacio opcional después del número inicial
  const escapedAbbrev = bookAbbrev.replace(/([123])([A-Za-z])/, '$1\\s?$2');
  const commentPattern = new RegExp(
    `^${escapedAbbrev}\\s+(\\d+)(?:\\s+(\\d+))?(?:\\s+\\(([a-z])\\))?\\s`,
    'gm'
  );

  let match;
  while ((match = commentPattern.exec(content)) !== null) {
    const chapter = match[1];
    const verse = match[2];
    const letter = match[3];

    const abbrevLower = bookAbbrevMap[bookAbbrev] || bookAbbrev.toLowerCase();

    let ref = `${abbrevLower}-${chapter}`;
    if (verse) {
      ref += `-${verse}`;
    }
    if (letter) {
      ref += `-${letter}`;
    }

    refs.push(ref);
  }

  return refs;
}

// Obtener la abreviatura del libro para buscar en comentarios
function getCommentBookAbbrev(slug: string): string {
  const slugParts = slug.split('/');
  const fileName = slugParts[slugParts.length - 1];

  const fileToAbbrev: Record<string, string> = {
    '01-genesis': 'Gn', '02-exodo': 'Ex', '03-levitico': 'Lv',
    '04-numeros': 'Nm', '05-deuteronomio': 'Dt',
    '01-josue': 'Jos', '02-jueces': 'Jc', '03-rut': 'Rt',
    '04-1samuel': '1S', '05-2samuel': '2S', '06-1reyes': '1R',
    '07-2reyes': '2R', '08-1cronicas': '1Cro', '09-2cronicas': '2Cro',
    '10-esdras': 'Esd', '11-nehemias': 'Ne', '12-tobias': 'Tb',
    '13-judit': 'Jdt', '14-ester': 'Est', '15-1macabeos': '1M',
    '16-2macabeos': '2M', '01-job': 'Jb', '02-salmos': 'Sal',
    '03-cantar-de-los-cantares': 'Ct', '04-lamentaciones': 'Lm',
    '01-proverbios': 'Pr', '02-eclesiastes': 'Qo', '03-sabiduria': 'Sb',
    '04-eclesiastico': 'Si', '01-isaias': 'Is', '02-jeremias': 'Jr',
    '03-baruc': 'Ba', '04-ezequiel': 'Ez', '05-daniel': 'Dn',
    '06-oseas': 'Os', '07-joel': 'Jl', '08-amos': 'Am',
    '09-abdias': 'Abd', '10-jonas': 'Jon', '11-miqueas': 'Mi',
    '12-nahum': 'Na', '13-habacuc': 'Ha', '14-sofonias': 'So',
    '15-ageo': 'Ag', '16-zacarias': 'Za', '17-malaquias': 'Ml',
    '01-mateo': 'Mt', '02-marcos': 'Mc', '03-lucas': 'Lc',
    '04-juan': 'Jn', '01-hechos': 'Hch', '01-romanos': 'Rm',
    '02-1corintios': '1Co', '03-2corintios': '2Co', '04-galatas': 'Ga',
    '05-efesios': 'Ef', '06-filipenses': 'Flp', '07-colosenses': 'Col',
    '08-1tesalonicenses': '1Ts', '09-2tesalonicenses': '2Ts',
    '10-1timoteo': '1Tm', '11-2timoteo': '2Tm', '12-tito': 'Tt',
    '13-filemon': 'Flm', '01-hebreos': 'Hb', '01-santiago': 'St',
    '02-1pedro': '1P', '03-2pedro': '2P', '04-1juan': '1Jn',
    '05-2juan': '2Jn', '06-3juan': '3Jn', '07-judas': 'Jds',
    '01-apocalipsis': 'Ap',
  };

  return fileToAbbrev[fileName] || 'Gn';
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

    // Construir ruta del archivo de comentarios
    const commentFilePath = filePath.replace('.md', '-comentarios.md');

    // Verificar si existe el archivo de comentarios
    let commentRefs: string[] = [];
    try {
      const commentContent = await fs.readFile(commentFilePath, 'utf-8');
      const bookAbbrev = getCommentBookAbbrev(slug);
      commentRefs = extractCommentRefs(commentContent, bookAbbrev);
    } catch {
      return new Response(JSON.stringify({
        error: 'Archivo de comentarios no encontrado',
        details: `No se encontró: ${commentFilePath}`
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    if (commentRefs.length === 0) {
      return new Response(JSON.stringify({
        error: 'No se encontraron referencias de comentarios',
        details: 'El archivo de comentarios no contiene referencias válidas'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Leer el archivo del libro
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

    // Contador de asteriscos procesados
    let asteriskIndex = 0;
    let notesLinked = 0;

    // Reemplazar cada asterisco secuencialmente con la referencia correspondiente
    // Primero eliminar note-refs existentes y restaurar asteriscos
    body = body.replace(/<span class="note-ref" data-ref="[^"]*" title="Ver comentario">(\*|&#42;)<\/span>/g, '*');

    // Ahora reemplazar cada * con su referencia del archivo de comentarios
    body = body.replace(/\*/g, () => {
      if (asteriskIndex < commentRefs.length) {
        const ref = commentRefs[asteriskIndex];
        asteriskIndex++;
        notesLinked++;
        return `<span class="note-ref" data-ref="${ref}" title="Ver comentario">&#42;</span>`;
      }
      // Si no hay más referencias, dejar el asterisco como está
      return '*';
    });

    // Reconstruir el archivo
    const newContent = `---\n${frontmatter}\n---\n${body}`;

    // Guardar el archivo
    await fs.writeFile(filePath, newContent, 'utf-8');

    const unmatchedAsterisks = asteriskIndex < commentRefs.length
      ? 0
      : (body.match(/\*(?!<\/span>)/g) || []).length;

    return new Response(JSON.stringify({
      success: true,
      book: bookTitle,
      notesLinked,
      totalCommentRefs: commentRefs.length,
      message: `Se vincularon ${notesLinked} notas al pie (de ${commentRefs.length} comentarios disponibles)`,
      unmatchedAsterisks,
      warning: asteriskIndex > commentRefs.length
        ? `Hay más asteriscos (${asteriskIndex}) que comentarios (${commentRefs.length})`
        : asteriskIndex < commentRefs.length
        ? `Hay más comentarios (${commentRefs.length}) que asteriscos (${asteriskIndex})`
        : undefined
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al vincular notas:', error);
    return new Response(JSON.stringify({
      error: 'Error al procesar el archivo',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
