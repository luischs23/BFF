import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
}

function normalizeText(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[,;:.!?¡¿'"«»""'']/g, '')
    .toLowerCase();
}

interface EntryChunk {
  entryNum: string;
  text: string;
}

function parseIntoEntries(body: string): EntryChunk[] {
  const result: EntryChunk[] = [];
  // Detecta <span class="faustina-num">N</span>
  const re = /<span class="faustina-num">(\d+)<\/span>/g;
  let m: RegExpExecArray | null;
  const positions: Array<{ pos: number; end: number; num: string }> = [];

  while ((m = re.exec(body)) !== null) {
    positions.push({ pos: m.index, end: m.index + m[0].length, num: m[1] });
  }

  for (let i = 0; i < positions.length; i++) {
    const start = positions[i].end;
    const end = i + 1 < positions.length ? positions[i + 1].pos : body.length;
    const text = stripHtml(body.slice(start, end)).trim();
    if (text) {
      result.push({ entryNum: positions[i].num, text });
    }
  }

  return result;
}

export const GET: APIRoute = async ({ url }) => {
  const query = url.searchParams.get('q')?.trim() || '';
  const numeralParam = url.searchParams.get('numeral')?.trim() || '';

  const cuadernos = (await getCollection('Sta-Faustina')).sort(
    (a, b) => (a.data.numero ?? 0) - (b.data.numero ?? 0)
  );

  // Búsqueda por numeral exacto
  if (numeralParam !== '') {
    const results: Array<{ title: string; slug: string; entryNum: string; snippet: string }> = [];
    for (const c of cuadernos) {
      const entries = parseIntoEntries(c.body ?? '');
      const found = entries.find(e => e.entryNum === numeralParam);
      if (found) {
        results.push({
          title: c.data.title,
          slug: c.id,
          entryNum: found.entryNum,
          snippet: found.text.slice(0, 200) + (found.text.length > 200 ? '...' : ''),
        });
        break;
      }
    }
    return new Response(JSON.stringify({ results, total: results.length }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // Búsqueda por texto
  if (!query || query.length < 3) {
    return new Response(JSON.stringify({ results: [], total: 0 }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const normalizedQuery = normalizeText(query);
  const results: Array<{ title: string; slug: string; entryNum: string; snippet: string }> = [];

  for (const c of cuadernos) {
    if (results.length >= 100) break;

    const entries = parseIntoEntries(c.body ?? '');

    for (const entry of entries) {
      if (results.length >= 100) break;

      const normalizedText = normalizeText(entry.text);
      const idx = normalizedText.indexOf(normalizedQuery);

      if (idx !== -1) {
        const snippetStart = Math.max(0, idx - 60);
        const snippetEnd = Math.min(entry.text.length, idx + query.length + 60);
        const snippet =
          (snippetStart > 0 ? '...' : '') +
          entry.text.slice(snippetStart, snippetEnd) +
          (snippetEnd < entry.text.length ? '...' : '');

        results.push({
          title: c.data.title,
          slug: c.id,
          entryNum: entry.entryNum,
          snippet,
        });
      }
    }
  }

  return new Response(JSON.stringify({ results, total: results.length }), {
    headers: { 'Content-Type': 'application/json' },
  });
};
