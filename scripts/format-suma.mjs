#!/usr/bin/env node
import { readFile, writeFile, readdir } from 'fs/promises';
import { join, relative } from 'path';
import { fileURLToPath } from 'url';

const ROOT = join(fileURLToPath(import.meta.url), '../../src/content/suma-teologica');

async function getFiles(dir) {
	const entries = await readdir(dir, { withFileTypes: true });
	const files = [];
	for (const e of entries) {
		const full = join(dir, e.name);
		if (e.isDirectory()) files.push(...await getFiles(full));
		else if (e.name.endsWith('.md')) files.push(full);
	}
	return files;
}

function formatSuma(content) {
	const match = content.match(/^(---\n[\s\S]*?\n---\n)([\s\S]*)$/);
	if (!match) return content;
	const [, frontmatter, body] = match;

	const lines = body.split('\n');
	let inArticles = false;
	const output = [];

	for (let line of lines) {
		if (line.startsWith('<h2') || line.startsWith('<span class="suma-n"') || line.startsWith('<strong>')) {
			output.push(line); continue;
		}
		const supOld = line.match(/^<sup>(?:<a[^>]*>)?(\d+)(?:<\/a>)?<\/sup>\s*(.*)$/);
		if (supOld) line = `${supOld[1]}. ${supOld[2]}`;

		const boldOld = line.match(/^\*\*([^*]+)\*\*(.*)$/);
		if (boldOld) line = boldOld[1] + boldOld[2];

		const artMatch = line.match(/^Artículo (\d+):\s*(.+)$/);
		if (artMatch) {
			inArticles = true;
			let title = artMatch[2].trim();
			if (title.endsWith('lat')) title = title.slice(0, -3).trim();
			output.push('', `<h2 id="art-${artMatch[1]}">Artículo ${artMatch[1]}: ${title}</h2>`, '');
			continue;
		}
		if (line.match(/^Objeciones por las que parece/)) { output.push('', `<strong>${line}</strong>`, ''); continue; }
		if (line.startsWith('A las objeciones:')) { output.push('', `<strong>A las objeciones:</strong>${line.slice(17)}`, ''); continue; }
		if (line.startsWith('Contra esto:'))      { output.push('', `<strong>Contra esto:</strong>${line.slice(12)}`, ''); continue; }
		if (line.startsWith('Respondo:'))          { output.push('', `<strong>Respondo:</strong>${line.slice(9)}`, ''); continue; }

		const numDot = line.match(/^(\d+)\.\s+(.+)$/);
		if (numDot) {
			const [, num, text] = numDot;
			output.push(inArticles
				? `<span class="suma-n">${num}</span> ${text}`
				: `<span class="suma-n"><a href="#art-${num}">${num}.</a></span> ${text}`, '');
			continue;
		}
		const numParen = line.match(/^(\d+)\)\s+(.+)$/);
		if (numParen) { output.push(`<span class="suma-n">${numParen[1]}</span> ${numParen[2]}`, ''); continue; }

		output.push(line);
	}

	const collapsed = output.reduce((acc, ln) => {
		if (ln === '' && acc.length > 0 && acc[acc.length - 1] === '') return acc;
		acc.push(ln); return acc;
	}, []);

	return frontmatter + collapsed.join('\n');
}

async function main() {
	const files = await getFiles(ROOT);
	let changed = 0, skipped = 0, errors = 0;

	for (const file of files) {
		const rel = relative(ROOT, file);
		try {
			const content = await readFile(file, 'utf-8');
			const formatted = formatSuma(content);
			if (formatted === content) {
				process.stdout.write(`  = ${rel}\n`);
				skipped++;
			} else {
				await writeFile(file, formatted, 'utf-8');
				process.stdout.write(`  ✓ ${rel}\n`);
				changed++;
			}
		} catch (e) {
			process.stdout.write(`  ✗ ${rel}: ${e.message}\n`);
			errors++;
		}
	}

	console.log(`\n${files.length} archivos | ✓ ${changed} formateados | = ${skipped} ya listos | ✗ ${errors} errores`);
}

main();
