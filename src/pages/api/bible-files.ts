import type { APIRoute } from 'astro';
import { readdir } from 'fs/promises';
import { join } from 'path';

async function getFilesRecursively(dir: string, baseDir: string = ''): Promise<string[]> {
  const files: string[] = [];
  const entries = await readdir(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = baseDir ? `${baseDir}/${entry.name}` : entry.name;

    if (entry.isDirectory()) {
      const subFiles = await getFilesRecursively(fullPath, relativePath);
      files.push(...subFiles);
    } else if (entry.name.endsWith('.md') && !entry.name.startsWith('_')) {
      files.push(`src/content/sagrada-biblia/${relativePath}`);
    }
  }

  return files;
}

export const GET: APIRoute = async () => {
  try {
    const bibleDir = join(process.cwd(), 'src/content/sagrada-biblia');
    const files = await getFilesRecursively(bibleDir);

    // Ordenar archivos alfabéticamente
    files.sort();

    return new Response(JSON.stringify({ files }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error reading bible files:', error);
    return new Response(JSON.stringify({ error: 'Error al leer archivos', files: [] }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
