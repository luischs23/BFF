// src/pages/api/search.ts
import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

interface SearchResult {
  book: string;
  chapter: number;
  verses: string;
  content: string;
  title: string;
}

function parseContent(content: string, targetChapter: number, startVerse?: number, endVerse?: number): SearchResult {
  const lines = content.split('\n');

  let currentTitle = '';
  let verses = new Map<number, { title: string; text: string }>();
  let chapterTitle = '';
  let currentVerseNum: number | null = null;
  let currentVerseChapter: number | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Detectar títulos (líneas que empiezan con ##)
    if (line.startsWith('##')) {
      currentTitle = line.replace(/^##\s*/, '').trim();
      continue;
    }

    // Buscar si la línea contiene versículos con formato CAPITULO:VERSO
    const verseMatches = [...line.matchAll(/(\d+):(\d+)/g)];

    if (verseMatches.length > 0) {
      // Procesar cada versículo encontrado en la línea
      for (let j = 0; j < verseMatches.length; j++) {
        const match = verseMatches[j];
        const chapterNum = parseInt(match[1]);
        const verseNum = parseInt(match[2]);
        const matchStart = match.index!;
        const matchEnd = matchStart + match[0].length;

        // Determinar dónde termina el texto de este versículo
        let textEnd: number;
        if (j + 1 < verseMatches.length) {
          // Hay otro versículo en la misma línea
          textEnd = verseMatches[j + 1].index!;
        } else {
          // Es el último versículo de la línea
          textEnd = line.length;
        }

        const verseText = line.substring(matchEnd, textEnd).trim();

        if (chapterNum === targetChapter) {
          // Si es el primer verso del capítulo, guardamos el título
          if (verseNum === 1 && currentTitle) {
            chapterTitle = currentTitle;
          }

          verses.set(verseNum, {
            title: !verses.has(verseNum) ? currentTitle : verses.get(verseNum)?.title || '',
            text: verseText
          });

          currentTitle = '';
        }

        // Actualizar el versículo actual para las líneas siguientes
        currentVerseChapter = chapterNum;
        currentVerseNum = verseNum;
      }
    } else if (line && currentVerseNum !== null && currentVerseChapter === targetChapter) {
      // Línea sin número de versículo - es continuación del versículo actual
      const existing = verses.get(currentVerseNum);
      if (existing) {
        verses.set(currentVerseNum, {
          title: existing.title,
          text: existing.text + ' ' + line
        });
      }
    }
  }

  // Si no encontramos versículos
  if (verses.size === 0) {
    return {
      book: '',
      chapter: targetChapter,
      verses: '',
      content: '',
      title: ''
    };
  }

  // Si se especificaron versículos concretos
  if (startVerse !== undefined) {
    const end = endVerse || startVerse;
    const selectedVerses: string[] = [];
    let sectionTitle = '';

    for (let v = startVerse; v <= end; v++) {
      const verseData = verses.get(v);
      if (verseData) {
        // Guardar el título de la primera sección
        if (verseData.title && !sectionTitle) {
          sectionTitle = verseData.title;
        }
        
        // Agregar nuevo título si es diferente y no es el primero
        if (verseData.title && verseData.title !== sectionTitle && selectedVerses.length > 0) {
          selectedVerses.push(`\n\n<strong>${verseData.title}</strong>\n\n`);
          sectionTitle = verseData.title;
        }
        
        selectedVerses.push(`<sup>${v}</sup>${verseData.text}`);
      }
    }

    if (selectedVerses.length === 0) {
      return {
        book: '',
        chapter: targetChapter,
        verses: '',
        content: '',
        title: ''
      };
    }

    return {
      book: '',
      chapter: targetChapter,
      verses: endVerse ? `${startVerse}-${endVerse}` : `${startVerse}`,
      content: selectedVerses.join(' '),
      title: sectionTitle || chapterTitle
    };
  }

  // Si se pide el capítulo completo
  const allVerses: string[] = [];
  let lastTitle = '';
  
  Array.from(verses.entries())
    .sort(([a], [b]) => a - b)
    .forEach(([num, data]) => {
      // Agregar título si es diferente al anterior
      if (data.title && data.title !== lastTitle) {
        if (allVerses.length > 0) {
          allVerses.push(`\n\n`);
        }
        allVerses.push(`<strong>${data.title}</strong>\n\n`);
        lastTitle = data.title;
      }
      allVerses.push(`<sup>${num}</sup>${data.text}`);
    });

  return {
    book: '',
    chapter: targetChapter,
    verses: 'all',
    content: allVerses.join(' '),
    title: chapterTitle
  };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { query } = await request.json();

    if (!query) {
      return new Response(
        JSON.stringify({ message: 'Consulta de búsqueda inválida' }), 
        { status: 400 }
      );
    }

    // Parsear: "1Pedro 1,2-7" o "Genesis 1" o "1 Pedro 1,1"
    const queryMatch = query.match(/^([a-zA-ZáéíóúÁÉÍÓÚñÑ\s\d]+?)\s+(\d+)(?:,(\d+)(?:-(\d+))?)?$/);
    
    if (!queryMatch) {
      return new Response(
        JSON.stringify({ message: 'Formato inválido. Use: "Libro Capítulo,Verso" o "Libro Capítulo,Verso-Verso"' }), 
        { status: 400 }
      );
    }

    const [, bookName, chapterStr, startVerseStr, endVerseStr] = queryMatch;
    const chapter = parseInt(chapterStr);
    const startVerse = startVerseStr ? parseInt(startVerseStr) : undefined;
    const endVerse = endVerseStr ? parseInt(endVerseStr) : undefined;

    // Normalizar nombre del libro
    const normalizedBookName = bookName.trim().toLowerCase()
      .replace(/\s+/g, '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    const books = await getCollection('sagrada-biblia');
    const file = books.find((b) => {
      const slug = b.slug.toLowerCase()
        .replace(/\s+/g, '')
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');
      
      return slug === normalizedBookName || 
             slug.includes(normalizedBookName) ||
             normalizedBookName.includes(slug);
    });

    if (!file) {
      return new Response(
        JSON.stringify({ message: `Libro "${bookName}" no encontrado` }), 
        { status: 404 }
      );
    }

    const result = parseContent(file.body, chapter, startVerse, endVerse);
    
    if (!result.content) {
      return new Response(
        JSON.stringify({ message: 'Capítulo o versículos no encontrados' }), 
        { status: 404 }
      );
    }

    result.book = file.data.title;

    return new Response(
      JSON.stringify({ results: [result] }), 
      { 
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  } catch (error) {
    console.error('Error en búsqueda:', error);
    return new Response(
      JSON.stringify({ message: 'Ocurrió un error durante la búsqueda' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
};