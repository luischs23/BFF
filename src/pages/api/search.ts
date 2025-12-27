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
  let inTargetChapter = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    if (!line) continue;

    // Detectar títulos (líneas que empiezan con ##)
    if (line.startsWith('##')) {
      currentTitle = line.replace(/^##\s*/, '').trim();
      continue;
    }

    // Buscar todos los versículos en la línea (puede haber múltiples)
    // Patrón: CAPITULO:VERSO seguido de texto hasta el siguiente CAPITULO:VERSO o fin de línea
    const versePattern = /(\d+):(\d+)\s*([^]*?)(?=\d+:\d+|$)/g;
    let match;
    let foundVerseInLine = false;

    while ((match = versePattern.exec(line)) !== null) {
      const [, chapter, verse, text] = match;
      const chapterNum = parseInt(chapter);
      const verseNum = parseInt(verse);

      if (chapterNum === targetChapter) {
        inTargetChapter = true;
        foundVerseInLine = true;
        
        // Si es el primer verso del capítulo, guardamos el título
        if (verseNum === 1 && currentTitle) {
          chapterTitle = currentTitle;
        }

        // Limpiar el texto (quitar espacios extra)
        const cleanText = text.trim();

        verses.set(verseNum, {
          title: verseNum === 1 || !verses.has(verseNum) ? currentTitle : verses.get(verseNum)?.title || '',
          text: cleanText
        });
      } else if (chapterNum > targetChapter && inTargetChapter) {
        // Ya pasamos el capítulo que buscamos
        break;
      }
    }

    // Reset título solo si encontramos versos en esta línea
    if (foundVerseInLine) {
      currentTitle = '';
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

    const books = await getCollection('blog');
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