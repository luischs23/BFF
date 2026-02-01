import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';
export { renderers } from '../../renderers.mjs';

const GET = async ({ url }) => {
  try {
    const filePath = url.searchParams.get("file");
    if (!filePath) {
      return new Response(JSON.stringify({ error: "Archivo no especificado" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!filePath.startsWith("src/content/sagrada-biblia/")) {
      return new Response(JSON.stringify({ error: "Ruta no permitida" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const fullPath = join(process.cwd(), filePath);
    const content = await readFile(fullPath, "utf-8");
    return new Response(JSON.stringify({ content }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error reading file:", error);
    return new Response(JSON.stringify({ error: "Error al leer archivo" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const { file, content } = body;
    if (!file || content === void 0) {
      return new Response(JSON.stringify({ error: "Datos incompletos" }), {
        status: 400,
        headers: { "Content-Type": "application/json" }
      });
    }
    if (!file.startsWith("src/content/sagrada-biblia/")) {
      return new Response(JSON.stringify({ error: "Ruta no permitida" }), {
        status: 403,
        headers: { "Content-Type": "application/json" }
      });
    }
    const fullPath = join(process.cwd(), file);
    await writeFile(fullPath, content, "utf-8");
    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error writing file:", error);
    return new Response(JSON.stringify({ error: "Error al guardar archivo" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
