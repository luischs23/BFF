import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

// Detecta líneas que empiezan con número + tab (o número + espacios)
// que NO estén ya formateadas con <span class="faustina-num">
function formatNumerals(content: string): { result: string; count: number } {
  let count = 0;

  // Patrón: inicio de línea, dígitos, seguido de tab o espacios, luego texto
  // No tocar líneas que ya tienen <span class="faustina-num">
  const result = content.replace(
    /^(\d+)[\t ]+(?!.*faustina-num)/gm,
    (match, num) => {
      count++;
      return `<span class="faustina-num">${num}</span> `;
    }
  );

  return { result, count };
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { slug } = await request.json();

    if (!slug) {
      return new Response(JSON.stringify({ error: 'Se requiere el slug del cuaderno' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Los archivos están en src/content/Sta-Faustina/
    const contentDir = path.join(process.cwd(), 'src', 'content', 'Sta-Faustina');
    const files = await fs.readdir(contentDir);

    // Buscar el archivo que corresponde al slug
    // El slug es como "01-cuaderno-i", el archivo es "01-cuaderno-i.md"
    const fileName = files.find(f => f.replace('.md', '') === slug);

    if (!fileName) {
      return new Response(JSON.stringify({ error: `Archivo no encontrado para slug: ${slug}` }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const filePath = path.join(contentDir, fileName);
    const original = await fs.readFile(filePath, 'utf-8');

    const { result, count } = formatNumerals(original);

    if (count === 0) {
      return new Response(
        JSON.stringify({ message: 'No se encontraron numerales sin formatear', count: 0 }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    await fs.writeFile(filePath, result, 'utf-8');

    return new Response(
      JSON.stringify({ message: `${count} numeral(es) formateados correctamente`, count }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
