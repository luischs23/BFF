import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/&[a-z]+;/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[,;:.!?¡¿'"«»""'']/g, '')
    .toLowerCase();
}

interface Marker {
  pos: number;
  end: number;
  type: 'ch' | 'v';
  value: string;
}

interface VerseChunk {
  chapter: number;
  verse: string;
  text: string;
}

function parseIntoVerses(body: string): VerseChunk[] {
  const result: VerseChunk[] = [];
  const markers: Marker[] = [];

  // Chapter markers: data-chapter="N"
  const chRe = /data-chapter="(\d+)"/g;
  let m: RegExpExecArray | null;
  while ((m = chRe.exec(body)) !== null) {
    markers.push({ pos: m.index, end: m.index + m[0].length, type: 'ch', value: m[1] });
  }

  // Verse markers: <sup>N</sup> or <sup>Na</sup>
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
        if (cleanText) {
          result.push({ chapter: curChapter, verse: curVerse, text: cleanText });
        }
      }
      curVerse = marker.value;
      textStart = marker.end;
      inVerse = true;
    }
  }

  if (inVerse) {
    const cleanText = stripHtml(body.slice(textStart)).trim();
    if (cleanText) {
      result.push({ chapter: curChapter, verse: curVerse, text: cleanText });
    }
  }

  return result;
}

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q')?.trim() || '';

  if (!query || query.length < 3) {
    return new Response(JSON.stringify({ results: [], total: 0 }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const normalizedQuery = normalizeText(query);
  const books = await getCollection('sagrada-biblia');

  const mainBooks = books.filter(b =>
    !b.data.isIntro &&
    !b.id.includes('-comentarios') &&
    !b.id.includes('-paralelos')
  );

  const results: Array<{
    title: string;
    slug: string;
    chapter: number;
    verse: string;
    snippet: string;
  }> = [];

  for (const book of mainBooks) {
    if (results.length >= 150) break;

    const verses = parseIntoVerses(book.body);

    for (const v of verses) {
      if (results.length >= 150) break;

      const normalizedText = normalizeText(v.text);
      const idx = normalizedText.indexOf(normalizedQuery);

      if (idx !== -1) {
        const snippetStart = Math.max(0, idx - 70);
        const snippetEnd = Math.min(v.text.length, idx + query.length + 70);
        const snippet =
          (snippetStart > 0 ? '...' : '') +
          v.text.slice(snippetStart, snippetEnd) +
          (snippetEnd < v.text.length ? '...' : '');

        results.push({
          title: book.data.title,
          slug: book.id,
          chapter: v.chapter,
          verse: v.verse,
          snippet
        });
      }
    }
  }

  return new Response(JSON.stringify({ results, total: results.length }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
