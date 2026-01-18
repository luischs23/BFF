import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

// Mapa de abreviaturas de libros a sus rutas
const BOOK_PATHS: Record<string, string> = {
  'gn': 'antiguo-testamento/01-pentateuco/01-genesis',
  'ex': 'antiguo-testamento/01-pentateuco/02-exodo',
  'lv': 'antiguo-testamento/01-pentateuco/03-levitico',
  'nm': 'antiguo-testamento/01-pentateuco/04-numeros',
  'dt': 'antiguo-testamento/01-pentateuco/05-deuteronomio',
  // Históricos
  'jos': 'antiguo-testamento/02-libros-historicos/01-josue',
  'jc': 'antiguo-testamento/02-libros-historicos/02-jueces',
  'rt': 'antiguo-testamento/02-libros-historicos/03-rut',
  '1s': 'antiguo-testamento/02-libros-historicos/04-1samuel',
  '2s': 'antiguo-testamento/02-libros-historicos/05-2samuel',
  '1r': 'antiguo-testamento/02-libros-historicos/06-1reyes',
  '2r': 'antiguo-testamento/02-libros-historicos/07-2reyes',
  '1cro': 'antiguo-testamento/02-libros-historicos/08-1cronicas',
  '2cro': 'antiguo-testamento/02-libros-historicos/09-2cronicas',
  'esd': 'antiguo-testamento/02-libros-historicos/10-esdras',
  'ne': 'antiguo-testamento/02-libros-historicos/11-nehemias',
  'tb': 'antiguo-testamento/02-libros-historicos/12-tobias',
  'jdt': 'antiguo-testamento/02-libros-historicos/13-judit',
  'est': 'antiguo-testamento/02-libros-historicos/14-ester',
  '1m': 'antiguo-testamento/02-libros-historicos/15-1macabeos',
  '2m': 'antiguo-testamento/02-libros-historicos/16-2macabeos',
  // Lírica
  'jb': 'antiguo-testamento/03-lirica/01-job',
  'sal': 'antiguo-testamento/03-lirica/02-salmos',
  'ct': 'antiguo-testamento/03-lirica/03-cantar-de-los-cantares',
  'lm': 'antiguo-testamento/03-lirica/04-lamentaciones',
  // Sapienciales
  'pr': 'antiguo-testamento/04-libros-sapienciales/01-proverbios',
  'qo': 'antiguo-testamento/04-libros-sapienciales/02-eclesiastes',
  'sb': 'antiguo-testamento/04-libros-sapienciales/03-sabiduria',
  'si': 'antiguo-testamento/04-libros-sapienciales/04-eclesiastico',
  // Proféticos
  'is': 'antiguo-testamento/05-libros-profeticos/01-isaias',
  'jr': 'antiguo-testamento/05-libros-profeticos/02-jeremias',
  'ba': 'antiguo-testamento/05-libros-profeticos/03-baruc',
  'ez': 'antiguo-testamento/05-libros-profeticos/04-ezequiel',
  'dn': 'antiguo-testamento/05-libros-profeticos/05-daniel',
  'os': 'antiguo-testamento/05-libros-profeticos/06-oseas',
  'jl': 'antiguo-testamento/05-libros-profeticos/07-joel',
  'am': 'antiguo-testamento/05-libros-profeticos/08-amos',
  'abd': 'antiguo-testamento/05-libros-profeticos/09-abdias',
  'jon': 'antiguo-testamento/05-libros-profeticos/10-jonas',
  'mi': 'antiguo-testamento/05-libros-profeticos/11-miqueas',
  'na': 'antiguo-testamento/05-libros-profeticos/12-nahum',
  'ha': 'antiguo-testamento/05-libros-profeticos/13-habacuc',
  'so': 'antiguo-testamento/05-libros-profeticos/14-sofonias',
  'ag': 'antiguo-testamento/05-libros-profeticos/15-ageo',
  'za': 'antiguo-testamento/05-libros-profeticos/16-zacarias',
  'ml': 'antiguo-testamento/05-libros-profeticos/17-malaquias',
  // Nuevo Testamento
  'mt': 'nuevo-testamento/01-evangelios/01-mateo',
  'mc': 'nuevo-testamento/01-evangelios/02-marcos',
  'lc': 'nuevo-testamento/01-evangelios/03-lucas',
  'jn': 'nuevo-testamento/01-evangelios/04-juan',
  'hch': 'nuevo-testamento/02-hechos/01-hechos',
  'rm': 'nuevo-testamento/03-epistolas-pablo/01-romanos',
  '1co': 'nuevo-testamento/03-epistolas-pablo/02-1corintios',
  '2co': 'nuevo-testamento/03-epistolas-pablo/03-2corintios',
  'ga': 'nuevo-testamento/03-epistolas-pablo/04-galatas',
  'ef': 'nuevo-testamento/03-epistolas-pablo/05-efesios',
  'flp': 'nuevo-testamento/03-epistolas-pablo/06-filipenses',
  'col': 'nuevo-testamento/03-epistolas-pablo/07-colosenses',
  '1ts': 'nuevo-testamento/03-epistolas-pablo/08-1tesalonicenses',
  '2ts': 'nuevo-testamento/03-epistolas-pablo/09-2tesalonicenses',
  '1tm': 'nuevo-testamento/03-epistolas-pablo/10-1timoteo',
  '2tm': 'nuevo-testamento/03-epistolas-pablo/11-2timoteo',
  'tt': 'nuevo-testamento/03-epistolas-pablo/12-tito',
  'flm': 'nuevo-testamento/03-epistolas-pablo/13-filemon',
  'hb': 'nuevo-testamento/04-hebreos/01-hebreos',
  'st': 'nuevo-testamento/05-epistolas-catolicas/01-santiago',
  '1p': 'nuevo-testamento/05-epistolas-catolicas/02-1pedro',
  '2p': 'nuevo-testamento/05-epistolas-catolicas/03-2pedro',
  '1jn': 'nuevo-testamento/05-epistolas-catolicas/04-1juan',
  '2jn': 'nuevo-testamento/05-epistolas-catolicas/05-2juan',
  '3jn': 'nuevo-testamento/05-epistolas-catolicas/06-3juan',
  'jds': 'nuevo-testamento/05-epistolas-catolicas/07-judas',
  'ap': 'nuevo-testamento/06-apocalipsis/01-apocalipsis',
};

// Mapa de abreviaturas en comentarios a las claves de BOOK_PATHS
const ABBREV_TO_KEY: Record<string, string> = {
  'Gn': 'gn', 'Ex': 'ex', 'Lv': 'lv', 'Nm': 'nm', 'Dt': 'dt',
  'Jos': 'jos', 'Jc': 'jc', 'Rt': 'rt',
  '1 S': '1s', '2 S': '2s', '1 R': '1r', '2 R': '2r',
  '1 Cro': '1cro', '2 Cro': '2cro', 'Esd': 'esd', 'Ne': 'ne',
  'Tb': 'tb', 'Jdt': 'jdt', 'Est': 'est', '1 M': '1m', '2 M': '2m',
  'Jb': 'jb', 'Sal': 'sal', 'Ct': 'ct', 'Lm': 'lm',
  'Pr': 'pr', 'Qo': 'qo', 'Sb': 'sb', 'Si': 'si',
  'Is': 'is', 'Jr': 'jr', 'Ba': 'ba', 'Ez': 'ez', 'Dn': 'dn',
  'Os': 'os', 'Jl': 'jl', 'Am': 'am', 'Abd': 'abd', 'Jon': 'jon',
  'Mi': 'mi', 'Na': 'na', 'Ha': 'ha', 'So': 'so', 'Ag': 'ag', 'Za': 'za', 'Ml': 'ml',
  'Mt': 'mt', 'Mc': 'mc', 'Lc': 'lc', 'Jn': 'jn', 'Hch': 'hch',
  'Rm': 'rm', '1 Co': '1co', '2 Co': '2co', 'Ga': 'ga', 'Ef': 'ef',
  'Flp': 'flp', 'Col': 'col', '1 Ts': '1ts', '2 Ts': '2ts',
  '1 Tm': '1tm', '2 Tm': '2tm', 'Tt': 'tt', 'Flm': 'flm',
  'Hb': 'hb', 'St': 'st', '1 P': '1p', '2 P': '2p',
  '1 Jn': '1jn', '2 Jn': '2jn', '3 Jn': '3jn', 'Jds': 'jds', 'Ap': 'ap',
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const { ref, bookSlug } = await request.json();

    if (!ref) {
      return new Response(JSON.stringify({ error: 'Referencia requerida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parsear la referencia: "gn-1-1" o "gn-1-2-a" o "gn-1"
    const parts = ref.toLowerCase().split('-');
    const bookKey = parts[0];
    const chapter = parts[1];
    const verse = parts[2] || null;
    const letter = parts[3] || null;

    // Determinar la ruta del archivo de comentarios
    let commentsPath: string;

    if (bookSlug) {
      // Usar el slug del libro actual para construir la ruta
      const slugParts = bookSlug.split('/');
      const fileName = slugParts[slugParts.length - 1];
      commentsPath = path.join(
        process.cwd(),
        'src', 'content', 'sagrada-biblia',
        ...slugParts.slice(0, -1),
        `${fileName}-comentarios.md`
      );
    } else if (BOOK_PATHS[bookKey]) {
      commentsPath = path.join(
        process.cwd(),
        'src', 'content', 'sagrada-biblia',
        `${BOOK_PATHS[bookKey]}-comentarios.md`
      );
    } else {
      return new Response(JSON.stringify({ error: `Libro no encontrado: ${bookKey}` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Leer el archivo de comentarios
    let content: string;
    try {
      content = await fs.readFile(commentsPath, 'utf-8');
    } catch {
      return new Response(JSON.stringify({ error: 'Archivo de comentarios no encontrado' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Separar frontmatter del contenido
    const frontmatterMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
    const body = frontmatterMatch ? frontmatterMatch[1] : content;

    // Construir el patrón de búsqueda
    // Buscar la abreviatura correcta del libro en los comentarios
    let bookAbbrev = '';
    for (const [abbrev, key] of Object.entries(ABBREV_TO_KEY)) {
      if (key === bookKey) {
        bookAbbrev = abbrev;
        break;
      }
    }

    if (!bookAbbrev) {
      return new Response(JSON.stringify({ error: `Abreviatura no encontrada para: ${bookKey}` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Construir el patrón de búsqueda para el comentario específico
    let searchPattern: string;
    let searchTitle: string;

    if (letter) {
      // Buscar: "Gn 1 2 (a)" o similar
      searchPattern = `${bookAbbrev} ${chapter} ${verse} (${letter})`;
      searchTitle = `${bookAbbrev} ${chapter},${verse}${letter}`;
    } else if (verse) {
      // Buscar: "Gn 1 1" (sin letra)
      searchPattern = `${bookAbbrev} ${chapter} ${verse}`;
      searchTitle = `${bookAbbrev} ${chapter},${verse}`;
    } else {
      // Buscar comentario del capítulo: "Gn 1 " seguido de texto (no número)
      searchPattern = `${bookAbbrev} ${chapter} `;
      searchTitle = `${bookAbbrev} ${chapter}`;
    }

    // Dividir en párrafos y buscar el comentario
    const paragraphs = body.split('\n\n');
    let foundComment = '';

    for (const paragraph of paragraphs) {
      const trimmed = paragraph.trim();

      if (letter) {
        // Búsqueda exacta con letra
        if (trimmed.startsWith(searchPattern)) {
          foundComment = trimmed;
          break;
        }
      } else if (verse) {
        // Búsqueda de versículo sin letra
        // Debe coincidir exactamente "Gn 1 1 " pero no "Gn 1 1 (a)"
        const versePattern = `${bookAbbrev} ${chapter} ${verse} `;
        const versePatternNoSpace = `${bookAbbrev} ${chapter} ${verse}`;
        if (trimmed.startsWith(versePattern) && !trimmed.match(new RegExp(`^${bookAbbrev} ${chapter} ${verse} \\([a-z]\\)`))) {
          foundComment = trimmed;
          break;
        }
        // También verificar si el párrafo es exactamente el patrón seguido de texto
        if (trimmed.startsWith(versePatternNoSpace) && trimmed.charAt(versePatternNoSpace.length) === ' ') {
          const afterPattern = trimmed.substring(versePatternNoSpace.length + 1);
          if (!afterPattern.startsWith('(')) {
            foundComment = trimmed;
            break;
          }
        }
      } else {
        // Búsqueda de comentario de capítulo (sin versículo específico)
        // Debe ser "Gn 1 " seguido de una letra mayúscula (inicio de texto), no un número
        if (trimmed.startsWith(searchPattern)) {
          const afterPattern = trimmed.substring(searchPattern.length);
          if (afterPattern && /^[A-ZÁÉÍÓÚÑ]/.test(afterPattern)) {
            foundComment = trimmed;
            break;
          }
        }
      }
    }

    if (!foundComment) {
      return new Response(JSON.stringify({
        error: 'Comentario no encontrado',
        searchPattern,
        ref
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Remover el prefijo del comentario (ej: "Gn 1 1 ")
    const commentText = foundComment.replace(/^[A-Za-z0-9\s]+(\([a-z]\)\s*)?/, '').trim();

    return new Response(JSON.stringify({
      success: true,
      title: searchTitle,
      comment: foundComment,
      text: commentText
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al obtener comentario:', error);
    return new Response(JSON.stringify({
      error: 'Error al procesar la solicitud',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
