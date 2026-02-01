import { readdir } from 'fs/promises';
import { join } from 'path';
export { renderers } from '../../renderers.mjs';

async function getFilesRecursively(dir, baseDir = "") {
  const files = [];
  const entries = await readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    const relativePath = baseDir ? `${baseDir}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      const subFiles = await getFilesRecursively(fullPath, relativePath);
      files.push(...subFiles);
    } else if (entry.name.endsWith(".md") && !entry.name.startsWith("_") && !entry.name.endsWith("-comentarios.md") && !entry.name.endsWith("-paralelos.md")) {
      files.push(`src/content/sagrada-biblia/${relativePath}`);
    }
  }
  return files;
}
const GET = async () => {
  try {
    const bibleDir = join(process.cwd(), "src/content/sagrada-biblia");
    const files = await getFilesRecursively(bibleDir);
    files.sort();
    return new Response(JSON.stringify({ files }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error reading bible files:", error);
    return new Response(JSON.stringify({ error: "Error al leer archivos", files: [] }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
