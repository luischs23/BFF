import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#\d+;/g, '')
    .replace(/&[a-z]+;/g, ' ')
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

function normToOrigIndex(original: string, normIdx: number): number {
  const punc = /[,;:.!?¡¿'"«»""'']/;
  let ni = 0;
  for (let i = 0; i < original.length; i++) {
    if (ni === normIdx) return i;
    const nc = original[i].normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (nc.length > 0 && !punc.test(nc)) ni++;
  }
  return original.length;
}

interface ArticleChunk {
  artNum: number | null;
  artTitle: string;
  text: string;
}

function parseIntoArticles(body: string): ArticleChunk[] {
  const result: ArticleChunk[] = [];
  const h2Re = /<h2[^>]*id="art-(\d+)"[^>]*>([\s\S]*?)<\/h2>/g;
  const markers: { pos: number; end: number; artNum: number; artTitle: string }[] = [];
  let m: RegExpExecArray | null;

  while ((m = h2Re.exec(body)) !== null) {
    markers.push({
      pos: m.index,
      end: m.index + m[0].length,
      artNum: parseInt(m[1]),
      artTitle: stripHtml(m[2]).trim(),
    });
  }

  // Intro de la cuestión (antes del primer artículo)
  const introEnd = markers.length > 0 ? markers[0].pos : body.length;
  const introText = stripHtml(body.slice(0, introEnd)).trim();
  if (introText) result.push({ artNum: null, artTitle: '', text: introText });

  for (let i = 0; i < markers.length; i++) {
    const start = markers[i].end;
    const end = i + 1 < markers.length ? markers[i + 1].pos : body.length;
    const text = stripHtml(body.slice(start, end)).trim();
    if (text) result.push({ artNum: markers[i].artNum, artTitle: markers[i].artTitle, text });
  }

  return result;
}

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q')?.trim() || '';

  if (!query || query.length < 3) {
    return new Response(JSON.stringify({ results: [], total: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const normalizedQuery = normalizeText(query);
  const cuestiones = await getCollection('suma-teologica');

  const results: Array<{
    cuestionTitle: string;
    cuestionNum: number | undefined;
    slug: string;
    artNum: number | null;
    artTitle: string;
    snippet: string;
  }> = [];

  for (const c of cuestiones) {
    if (results.length >= 100) break;

    const articles = parseIntoArticles(c.body ?? '');

    for (const art of articles) {
      if (results.length >= 100) break;

      const normalizedText = normalizeText(art.text);
      const idx = normalizedText.indexOf(normalizedQuery);
      if (idx === -1) continue;

      const origIdx = normToOrigIndex(art.text, idx);
      const snippetStart = Math.max(0, origIdx - 80);
      const snippetEnd = Math.min(art.text.length, origIdx + query.length + 80);
      const snippet =
        (snippetStart > 0 ? '…' : '') +
        art.text.slice(snippetStart, snippetEnd) +
        (snippetEnd < art.text.length ? '…' : '');

      results.push({
        cuestionTitle: c.data.title,
        cuestionNum: c.data.cuestion,
        slug: c.id,
        artNum: art.artNum,
        artTitle: art.artTitle,
        snippet,
      });
    }
  }

  return new Response(JSON.stringify({ results, total: results.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
