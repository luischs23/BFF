import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

interface MissingVerse {
  chapter: number;
  verse: number;
  context: string; // Línea anterior y siguiente para contexto
}

interface CheckResult {
  book: string;
  totalChapters: number;
  missingVerses: MissingVerse[];
  unformattedVerses: { line: number; text: string }[];
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

    const books = await getCollection('sagrada-biblia');
    const normalizedSlug = slug.toLowerCase()
      .replace(/\s+/g, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const file = books.find((b) => {
      const bookSlug = b.slug.toLowerCase()
        .replace(/\s+/g, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      return bookSlug === normalizedSlug ||
             bookSlug.includes(normalizedSlug) ||
             normalizedSlug.includes(bookSlug);
    });

    if (!file) {
      return new Response(JSON.stringify({ error: `Libro "${slug}" no encontrado` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    const content = file.body;
    const lines = content.split('\n');

    // Recopilar todos los versículos formateados por capítulo
    const versesByChapter = new Map<number, Set<number>>();
    const unformattedVerses: { line: number; text: string }[] = [];

    // Regex para versículos formateados (CAPITULO:VERSO)
    const formattedVerseRegex = /(\d+):(\d+)/g;

    // Regex para detectar números sueltos que podrían ser versículos sin formatear
    // Busca: puntuación/espacio/guión + número + espacio + texto (letras, números, *, ¡, ¿)
    const unformattedVerseRegex = /(?:^|[.;,:!?»"'\)\s—])(\d{1,3})\s+([A-ZÁÉÍÓÚÑa-záéíóúñ«"'\(\[\d\*¡¿])/g;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const lineNum = i + 1;

      // Saltar líneas de frontmatter, títulos, y líneas vacías
      if (line.startsWith('---') || line.startsWith('#') || line.trim() === '') {
        continue;
      }

      // Encontrar versículos formateados
      let match;
      while ((match = formattedVerseRegex.exec(line)) !== null) {
        const chapter = parseInt(match[1]);
        const verse = parseInt(match[2]);

        if (!versesByChapter.has(chapter)) {
          versesByChapter.set(chapter, new Set());
        }
        versesByChapter.get(chapter)!.add(verse);
      }

      // Buscar posibles versículos sin formatear
      // Primero, extraer todas las posiciones de versículos formateados para excluirlos
      const formattedPositions: number[] = [];
      formattedVerseRegex.lastIndex = 0;
      while ((match = formattedVerseRegex.exec(line)) !== null) {
        formattedPositions.push(match.index);
      }

      // Buscar números que podrían ser versículos sin formatear
      unformattedVerseRegex.lastIndex = 0;
      while ((match = unformattedVerseRegex.exec(line)) !== null) {
        const potentialVerse = parseInt(match[1]);
        const position = match.index;

        // Verificar que no sea parte de un versículo ya formateado
        const isPartOfFormatted = formattedPositions.some(pos =>
          Math.abs(pos - position) < 10
        );

        // Verificar que el número sea razonable para un versículo (1-200)
        // y que no sea parte de un patrón X:Y
        if (!isPartOfFormatted && potentialVerse >= 1 && potentialVerse <= 200) {
          // Verificar que no haya ":" justo antes o después
          const beforeMatch = line.substring(Math.max(0, position - 5), position + match[0].length);
          const afterMatch = line.substring(position, Math.min(line.length, position + match[0].length + 5));

          if (!beforeMatch.includes(':') && !afterMatch.match(/^\D*\d+:/)) {
            // Extraer contexto (20 caracteres antes y después)
            const contextStart = Math.max(0, position - 20);
            const contextEnd = Math.min(line.length, position + match[0].length + 30);
            const context = line.substring(contextStart, contextEnd);

            unformattedVerses.push({
              line: lineNum,
              text: `...${context}...`
            });
          }
        }
      }
    }

    // Encontrar versículos faltantes en la secuencia
    const missingVerses: MissingVerse[] = [];

    versesByChapter.forEach((verses, chapter) => {
      const sortedVerses = Array.from(verses).sort((a, b) => a - b);

      if (sortedVerses.length > 0) {
        // Verificar desde 1 hasta el máximo versículo encontrado
        const maxVerse = sortedVerses[sortedVerses.length - 1];

        for (let v = 1; v <= maxVerse; v++) {
          if (!verses.has(v)) {
            // Encontrar contexto: versículo anterior y siguiente
            const prevVerse = sortedVerses.filter(x => x < v).pop();
            const nextVerse = sortedVerses.find(x => x > v);

            missingVerses.push({
              chapter,
              verse: v,
              context: `Entre ${chapter}:${prevVerse || '?'} y ${chapter}:${nextVerse || '?'}`
            });
          }
        }
      }
    });

    // Ordenar por capítulo y versículo
    missingVerses.sort((a, b) => {
      if (a.chapter !== b.chapter) return a.chapter - b.chapter;
      return a.verse - b.verse;
    });

    const result: CheckResult = {
      book: file.data.title,
      totalChapters: versesByChapter.size,
      missingVerses,
      unformattedVerses
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al verificar:', error);
    return new Response(JSON.stringify({
      error: 'Error al procesar el archivo',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
