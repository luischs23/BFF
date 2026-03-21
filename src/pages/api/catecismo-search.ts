import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

function stripMarkdown(text: string): string {
  return text
    .replace(/^---[\s\S]*?---/, '')       // frontmatter
    .replace(/#{1,6}\s+/g, '')            // headings
    .replace(/\*\*([^*]+)\*\*/g, '$1')   // bold
    .replace(/\*([^*]+)\*/g, '$1')       // italic
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
    .replace(/`[^`]+`/g, '')             // inline code
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

function getSnippet(text: string, query: string, snippetLen = 160): string {
  const normText = normalizeText(text);
  const normQuery = normalizeText(query);
  const idx = normText.indexOf(normQuery);
  if (idx === -1) return text.slice(0, snippetLen);
  const start = Math.max(0, idx - 60);
  const end = Math.min(text.length, idx + query.length + 100);
  return (start > 0 ? '…' : '') + text.slice(start, end) + (end < text.length ? '…' : '');
}

// "27-49" → [27, 49]; "50" → [50, 50]
function parseNumeracion(num: string): [number, number] | null {
  const m = num.match(/^(\d+)(?:-(\d+))?/);
  if (!m) return null;
  const lo = parseInt(m[1]);
  const hi = m[2] ? parseInt(m[2]) : lo;
  return [lo, hi];
}

// Extrae el snippet del párrafo que comienza con el numeral dado
function getNumeralSnippet(text: string, numeral: number): string {
  const re = new RegExp(`(?:^|\\n)${numeral}\\s+([^\\n]{0,200})`);
  const m = text.match(re);
  return m ? m[1].trim() : text.slice(0, 160);
}

export const GET: APIRoute = async ({ url }) => {
  const q = url.searchParams.get('q')?.trim() ?? '';
  const numeralParam = url.searchParams.get('numeral')?.trim() ?? '';

  // Búsqueda por numeral
  if (numeralParam !== '') {
    const n = parseInt(numeralParam);
    if (isNaN(n) || n < 1) {
      return new Response(JSON.stringify({ results: [] }), { headers: { 'Content-Type': 'application/json' } });
    }
    const entries = await getCollection('catecismo');
    const results: { title: string; slug: string; numeracion?: string; snippet: string; matchedNumeral?: number }[] = [];
    for (const entry of entries) {
      if (!entry.data.numeracion) continue;
      const range = parseNumeracion(entry.data.numeracion);
      if (!range) continue;
      if (n >= range[0] && n <= range[1]) {
        const plainText = stripMarkdown(entry.body ?? '');
        results.push({
          title: entry.data.title,
          slug: entry.slug,
          numeracion: entry.data.numeracion,
          snippet: getNumeralSnippet(plainText, n),
          matchedNumeral: n,
        });
      }
    }
    return new Response(JSON.stringify({ results }), { headers: { 'Content-Type': 'application/json' } });
  }

  // Búsqueda por texto
  if (q.length < 3) {
    return new Response(JSON.stringify({ results: [], error: 'Query too short' }), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  const entries = await getCollection('catecismo');
  const normQ = normalizeText(q);
  const results: { title: string; slug: string; numeracion?: string; snippet: string }[] = [];

  for (const entry of entries) {
    const plainText = stripMarkdown(entry.body ?? '');
    const titleAndText = entry.data.title + ' ' + plainText;

    if (normalizeText(titleAndText).includes(normQ)) {
      results.push({
        title: entry.data.title,
        slug: entry.slug,
        numeracion: entry.data.numeracion,
        snippet: getSnippet(plainText, q),
      });
    }

    if (results.length >= 80) break;
  }

  return new Response(JSON.stringify({ results }), {
    headers: { 'Content-Type': 'application/json' }
  });
};
