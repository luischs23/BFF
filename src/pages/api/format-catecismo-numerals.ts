import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

const CATECISMO_DIR = path.join(process.cwd(), 'src', 'content', 'catecismo');

async function findAllMdFiles(dir: string): Promise<string[]> {
  const files: string[] = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...await findAllMdFiles(fullPath));
    } else if (entry.name.endsWith('.md')) {
      files.push(fullPath);
    }
  }
  return files;
}

function formatNumerals(content: string): { result: string; count: number } {
  let count = 0;

  // Separar frontmatter del cuerpo
  const fmMatch = content.match(/^(---[\s\S]*?---\n?)/);
  const frontmatter = fmMatch ? fmMatch[1] : '';
  const body = fmMatch ? content.slice(frontmatter.length) : content;

  const lines = body.split('\n');
  const resultLines = lines.map(line => {
    // Saltar líneas ya formateadas
    if (line.includes('catecismo-num')) return line;
    // Saltar headings, líneas vacías, citas de bloque
    if (line.startsWith('#') || line.startsWith('>') || line.trim() === '') return line;

    // Patrón: 1-4 dígitos, punto opcional, uno o más espacios, luego texto
    const m = line.match(/^(\d{1,4})\.?\s+(\S)/);
    if (m) {
      const num = parseInt(m[1]);
      // Validar rango catecismo (1-2865)
      if (num < 1 || num > 2865) return line;
      const rest = line.replace(/^\d{1,4}\.?\s+/, '');
      count++;
      return `<span class="catecismo-num" id="n-${num}">${num}</span> ${rest}`;
    }
    return line;
  });

  return { result: frontmatter + resultLines.join('\n'), count };
}

export const POST: APIRoute = async () => {
  try {
    const files = await findAllMdFiles(CATECISMO_DIR);
    let totalNumerals = 0;
    let filesChanged = 0;
    const log: string[] = [];

    for (const filePath of files) {
      const content = await fs.readFile(filePath, 'utf-8');
      const { result, count } = formatNumerals(content);
      if (count > 0) {
        await fs.writeFile(filePath, result, 'utf-8');
        totalNumerals += count;
        filesChanged++;
        log.push(`${path.basename(filePath)}: ${count} numerales`);
      }
    }

    return new Response(JSON.stringify({ ok: true, filesChanged, totalNumerals, log }), {
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (err: any) {
    return new Response(JSON.stringify({ ok: false, error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
