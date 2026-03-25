import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

function seededRand(seed: number): number {
  const x = Math.sin(seed + 1) * 10000;
  return x - Math.floor(x);
}

function getDateSeed(): number {
  const d = new Date();
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate();
}

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/#+\s+[^\n]*/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

interface VerseChunk {
  chapter: number;
  verse: string;
  text: string;
}

function parseIntoVerses(body: string): VerseChunk[] {
  const result: VerseChunk[] = [];
  const markers: { pos: number; end: number; type: 'ch' | 'v'; value: string }[] = [];

  const chRe = /data-chapter="(\d+)"/g;
  let m: RegExpExecArray | null;
  while ((m = chRe.exec(body)) !== null) {
    markers.push({ pos: m.index, end: m.index + m[0].length, type: 'ch', value: m[1] });
  }

  const vRe = /<sup>(\d+[a-z]?)<\/sup>/g;
  while ((m = vRe.exec(body)) !== null) {
    markers.push({ pos: m.index, end: m.index + m[0].length, type: 'v', value: m[1] });
  }

  markers.sort((a, b) => a.pos - b.pos);

  let curChapter = 1;
  let curVerse = '1';
  let textStart = 0;
  let inVerse = false;

  for (const marker of markers) {
    if (marker.type === 'ch') {
      curChapter = parseInt(marker.value);
    } else {
      if (inVerse) {
        const cleanText = stripHtml(body.slice(textStart, marker.pos)).trim();
        if (cleanText) result.push({ chapter: curChapter, verse: curVerse, text: cleanText });
      }
      curVerse = marker.value;
      textStart = marker.end;
      inVerse = true;
    }
  }

  if (inVerse) {
    const cleanText = stripHtml(body.slice(textStart)).trim();
    if (cleanText) result.push({ chapter: curChapter, verse: curVerse, text: cleanText });
  }

  return result;
}

export const GET: APIRoute = async ({ url }) => {
  const books = await getCollection('sagrada-biblia');

  const mainBooks = books.filter(b =>
    !b.data.isIntro &&
    !b.slug.includes('-comentarios') &&
    !b.slug.includes('-paralelos')
  );

  if (!mainBooks.length) {
    return new Response(JSON.stringify({ error: 'No books found' }), { status: 500 });
  }

  const seed = getDateSeed();

  // Si se pasa ?slug=..., usar ese libro; si no, elegir uno aleatorio del día
  const slugParam = url.searchParams.get('slug');
  const saltParam = parseInt(url.searchParams.get('salt') ?? '0');
  let book = slugParam
    ? mainBooks.find(b => b.slug === slugParam)
    : undefined;
  if (!book) {
    const bookIdx = Math.floor(seededRand(seed + 42 + saltParam) * mainBooks.length);
    book = mainBooks[bookIdx];
  }

  // Parsear sus versículos
  const verses = parseIntoVerses(book.body ?? '').filter(v => v.text.length >= 20);

  if (!verses.length) {
    return new Response(JSON.stringify({ error: 'No verses found' }), { status: 500 });
  }

  // Elegir versículo del día (salt para que cada sección tenga uno distinto)
  const verseIdx = Math.floor(seededRand(seed + 99 + saltParam) * verses.length);
  const verse = verses[verseIdx];

  // Derivar la abreviatura del libro desde el slug (ej: "01-genesis" → slug ya incluye el title)
  const verseNum = parseInt(verse.verse);

  return new Response(JSON.stringify({
    text: verse.text,
    chapter: verse.chapter,
    verse: verse.verse,
    verseNum: isNaN(verseNum) ? 1 : verseNum,
    slug: book.slug,
    bookTitle: book.data.title,
  }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
