import type { APIRoute } from "astro";
import { readFile, writeFile } from "fs/promises";
import { join } from "path";

export const POST: APIRoute = async ({ request }) => {
	const body = await request.json();

	// Modo batch: { slugs: string[] }
	if (Array.isArray(body.slugs)) {
		const results: { slug: string; changed: boolean; error?: string }[] = [];
		for (const slug of body.slugs) {
			const filePath = join(process.cwd(), "src/content/suma-teologica", slug + ".md");
			try {
				const content = await readFile(filePath, "utf-8");
				const formatted = formatSuma(content);
				if (formatted === content) {
					results.push({ slug, changed: false });
				} else {
					await writeFile(filePath, formatted, "utf-8");
					results.push({ slug, changed: true });
				}
			} catch (e) {
				results.push({ slug, changed: false, error: String(e) });
			}
		}
		return new Response(JSON.stringify({ ok: true, results }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	}

	// Modo individual: { slug: string }
	const { slug } = body;
	if (!slug) return new Response(JSON.stringify({ error: "Missing slug" }), { status: 400 });

	const filePath = join(process.cwd(), "src/content/suma-teologica", slug + ".md");
	try {
		const content = await readFile(filePath, "utf-8");
		const formatted = formatSuma(content);
		const changed = formatted !== content;
		if (changed) await writeFile(filePath, formatted, "utf-8");
		return new Response(JSON.stringify({ ok: true, changed }), {
			status: 200,
			headers: { "Content-Type": "application/json" },
		});
	} catch (e) {
		return new Response(JSON.stringify({ error: String(e) }), {
			status: 500,
			headers: { "Content-Type": "application/json" },
		});
	}
};

function formatSuma(content: string): string {
	const match = content.match(/^(---\n[\s\S]*?\n---\n)([\s\S]*)$/);
	if (!match) return content;
	const [, frontmatter, body] = match;

	const lines = body.split('\n');
	let inArticles = false;
	const output: string[] = [];

	for (let line of lines) {
		// ── Nuevo formato → idempotente ─────────────────────────────────────────
		if (line.startsWith('<h2') || line.startsWith('<span class="suma-n"') || line.startsWith('<strong>')) {
			output.push(line);
			continue;
		}

		// ── Normalizar formato viejo: <sup>N</sup> → "N. texto" ─────────────────
		const supOld = line.match(/^<sup>(?:<a[^>]*>)?(\d+)(?:<\/a>)?<\/sup>\s*(.*)$/);
		if (supOld) {
			line = `${supOld[1]}. ${supOld[2]}`;
			// cae al procesamiento de numerales
		}

		// ── Normalizar formato viejo: **texto** o **Label:** resto ───────────────
		const boldOld = line.match(/^\*\*([^*]+)\*\*(.*)$/);
		if (boldOld) {
			line = boldOld[1] + boldOld[2]; // quita los **, cae al procesamiento normal
		}

		// ── Título de artículo: "Artículo N: Título[lat]" ───────────────────────
		const artMatch = line.match(/^Artículo (\d+):\s*(.+)$/);
		if (artMatch) {
			inArticles = true;
			let title = artMatch[2].trim();
			if (title.endsWith('lat')) title = title.slice(0, -3).trim();
			output.push('');
			output.push(`<h2 id="art-${artMatch[1]}">Artículo ${artMatch[1]}: ${title}</h2>`);
			output.push('');
			continue;
		}

		// ── Cabeceras de sección → <strong> con párrafos propios ────────────────
		if (line.match(/^Objeciones por las que parece/)) {
			output.push('');
			output.push(`<strong>${line}</strong>`);
			output.push('');
			continue;
		}
		if (line.startsWith('A las objeciones:')) {
			const rest = line.slice('A las objeciones:'.length);
			output.push('');
			output.push(`<strong>A las objeciones:</strong>${rest}`);
			output.push('');
			continue;
		}
		if (line.startsWith('Contra esto:')) {
			const rest = line.slice('Contra esto:'.length);
			output.push('');
			output.push(`<strong>Contra esto:</strong>${rest}`);
			output.push('');
			continue;
		}
		if (line.startsWith('Respondo:')) {
			const rest = line.slice('Respondo:'.length);
			output.push('');
			output.push(`<strong>Respondo:</strong>${rest}`);
			output.push('');
			continue;
		}

		// ── Numerales "N. texto" → <span> + párrafo separado ───────────────────
		const numDot = line.match(/^(\d+)\.\s+(.+)$/);
		if (numDot) {
			const [, num, text] = numDot;
			if (!inArticles) {
				// Índice inicial: número enlaza al artículo
				output.push(`<span class="suma-n"><a href="#art-${num}">${num}.</a></span> ${text}`);
			} else {
				output.push(`<span class="suma-n">${num}</span> ${text}`);
			}
			output.push(''); // línea vacía → párrafo separado
			continue;
		}

		// ── Numerales "N) texto" → <span> + párrafo separado ───────────────────
		const numParen = line.match(/^(\d+)\)\s+(.+)$/);
		if (numParen) {
			const [, num, text] = numParen;
			output.push(`<span class="suma-n">${num}</span> ${text}`);
			output.push('');
			continue;
		}

		output.push(line);
	}

	// Colapsar líneas vacías consecutivas (máximo 1)
	const collapsed = output.reduce((acc: string[], ln: string) => {
		if (ln === '' && acc.length > 0 && acc[acc.length - 1] === '') return acc;
		acc.push(ln);
		return acc;
	}, []);

	return frontmatter + collapsed.join('\n');
}
