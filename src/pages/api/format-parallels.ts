import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

const FILE_TO_ABBREV: Record<string, string> = {
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

// Comparar referencias (capítulo, versículo)
function cmpRef(a: [number, number], b: [number, number]): number {
  return a[0] !== b[0] ? a[0] - b[0] : a[1] - b[1];
}

// Índices de la subsecuencia estrictamente creciente más larga (LIS)
// Usada para detectar cuáles líneas "Qo X Y" son marcadores Si reales
function lisIndices(values: [number, number][]): Set<number> {
  const n = values.length;
  if (n === 0) return new Set();

  const preds = new Array(n).fill(-1);
  const tails: number[] = []; // índices de los "tails" activos

  for (let i = 0; i < n; i++) {
    let lo = 0, hi = tails.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (cmpRef(values[tails[mid]], values[i]) < 0) lo = mid + 1;
      else hi = mid;
    }
    if (lo > 0) preds[i] = tails[lo - 1];
    tails[lo] = i;
  }

  // Reconstruir la secuencia
  const result = new Set<number>();
  let cur = tails[tails.length - 1];
  while (cur !== -1) {
    result.add(cur);
    cur = preds[cur];
  }
  return result;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const { slug, mode = 'append' } = body;

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Se requiere slug' }), {
        status: 400, headers: { 'Content-Type': 'application/json' }
      });
    }

    const slugParts = slug.split('/');
    const fileName = slugParts[slugParts.length - 1];
    const parallelsPath = path.join(
      process.cwd(), 'src', 'content', 'sagrada-biblia',
      ...slugParts.slice(0, -1),
      `${fileName}-paralelos.md`
    );

    const bookAbbrev = FILE_TO_ABBREV[fileName] || 'Gn';

    // ── MODO: add-headers ──────────────────────────────────────────────────
    // Lee el archivo existente y detecta automáticamente qué líneas
    // "BOOK X Y" actúan como marcadores de versículo Si usando LIS.
    if (mode === 'add-headers') {
      let content: string;
      try {
        content = await fs.readFile(parallelsPath, 'utf-8');
      } catch {
        return new Response(JSON.stringify({ error: 'Archivo de paralelos no encontrado' }), {
          status: 404, headers: { 'Content-Type': 'application/json' }
        });
      }

      const fmMatch = content.match(/^---\n[\s\S]*?\n---\n/);
      const frontmatter = fmMatch ? fmMatch[0] : '';
      const bodyText = fmMatch ? content.slice(fmMatch[0].length) : content;
      const lines = bodyText.split('\n');

      // Recopilar todas las líneas "Qo X Y" (sin texto adicional)
      // que podrían ser marcadores para Si X Y
      type QoCandidate = { lineIdx: number; chapter: number; verse: number };
      const candidates: QoCandidate[] = [];

      // También registrar las cabeceras Si que ya existen
      const existingSiHeaders = new Set<string>();
      for (const line of lines) {
        const mExist = line.match(new RegExp(`^${bookAbbrev}\\s+(\\d+)\\s+(\\d+)\\s*$`));
        if (mExist) existingSiHeaders.add(`${mExist[1]}:${mExist[2]}`);
      }

      for (let i = 0; i < lines.length; i++) {
        // Línea bare "Qo X Y" (o cualquier libro que el usuario haya usado como marcador)
        const m = lines[i].match(/^([A-Za-z]+)\s+(\d+)\s+(\d+)\s*$/);
        if (m) {
          const ch = parseInt(m[2]);
          const vs = parseInt(m[3]);
          // Excluir si ya existe cabecera Si X Y (ya cubierta)
          if (!existingSiHeaders.has(`${ch}:${vs}`)) {
            candidates.push({ lineIdx: i, chapter: ch, verse: vs });
          }
        }
      }

      // Aplicar LIS para encontrar los marcadores reales
      const values: [number, number][] = candidates.map(c => [c.chapter, c.verse]);
      const markerLisIndices = lisIndices(values);
      // Mapear de vuelta a líneas del archivo
      const markerLines = new Set<number>();
      markerLisIndices.forEach(lisI => markerLines.add(candidates[lisI].lineIdx));

      // Reemplazar las líneas marcadoras con cabeceras Si X Y
      const newLines: string[] = [];
      let headersAdded = 0;
      for (let i = 0; i < lines.length; i++) {
        if (markerLines.has(i)) {
          const c = candidates.find(x => x.lineIdx === i)!;
          newLines.push(`${bookAbbrev} ${c.chapter} ${c.verse}`);
          headersAdded++;
          // No empujar la línea original — queda reemplazada
        } else {
          newLines.push(lines[i]);
        }
      }

      await fs.writeFile(parallelsPath, frontmatter + newLines.join('\n'), 'utf-8');

      return new Response(JSON.stringify({
        success: true,
        mode: 'add-headers',
        headersAdded,
        message: `Se insertaron ${headersAdded} cabeceras ${bookAbbrev} en el archivo`
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    // ── MODO: append ──────────────────────────────────────────────────────
    // Agrega entradas estructuradas al final del archivo.
    // Formato de entrada: { entries: [{ siRef: "Si 1 1", parallels: ["Qo 1 1", ...] }] }
    if (mode === 'append' || mode === 'rewrite') {
      const { entries } = body as {
        entries: Array<{ siRef: string; parallels: string[] }>
      };

      if (!entries || !Array.isArray(entries) || entries.length === 0) {
        return new Response(JSON.stringify({ error: 'Se requieren entries[]' }), {
          status: 400, headers: { 'Content-Type': 'application/json' }
        });
      }

      // Construir el bloque de contenido nuevo
      const blocks: string[] = [];
      for (const entry of entries) {
        if (!entry.siRef) continue;
        blocks.push(entry.siRef);
        for (const p of entry.parallels) {
          if (p.trim()) blocks.push(p.trim());
        }
      }
      const newBlock = blocks.join('\n');

      if (mode === 'rewrite') {
        let existing = '';
        try { existing = await fs.readFile(parallelsPath, 'utf-8'); } catch {}
        const fmMatch = existing.match(/^---\n[\s\S]*?\n---\n/);
        const fm = fmMatch
          ? fmMatch[0]
          : `---\ntitle: 'Paralelos'\ntype: 'paralelos'\n---\n`;
        await fs.writeFile(parallelsPath, fm + newBlock + '\n', 'utf-8');
      } else {
        // append
        let existing = '';
        try { existing = await fs.readFile(parallelsPath, 'utf-8'); } catch {}
        const sep = existing.trim().endsWith('\n') ? '\n' : '\n\n';
        await fs.appendFile(parallelsPath, sep + newBlock + '\n', 'utf-8');
      }

      return new Response(JSON.stringify({
        success: true,
        mode,
        entriesAdded: entries.length,
        message: `${entries.length} entrada(s) ${mode === 'rewrite' ? 'escritas' : 'añadidas'}`
      }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({
      error: `Modo desconocido: ${mode}. Usar: add-headers | append | rewrite`
    }), { status: 400, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Error en format-parallels:', error);
    return new Response(JSON.stringify({
      error: 'Error al procesar',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
};
