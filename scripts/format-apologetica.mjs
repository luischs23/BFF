#!/usr/bin/env node
/**
 * format-apologetica.mjs
 * Formatea archivos .md de contenido apologético (notas sin formato):
 *
 *   1. Líneas sueltas que parecen títulos → ## (numeradas) o ### (subsecciones)
 *   2. Añade línea en blanco solo ANTES del primer guion de un bloque de lista
 *   3. "Frase clave: ..." multilinea → > **Frase clave: ...**
 *   4. Elimina espacios al final de línea
 *   5. Colapsa múltiples líneas en blanco consecutivas a una sola
 *
 * Reglas para detectar títulos (heurístico):
 *   - Línea sola: rodeada de líneas en blanco (o inicio/fin de cuerpo)
 *   - NO termina en punto "."
 *   - NO supera 75 caracteres
 *   - NO empieza con minúscula (fragmento de párrafo)
 *   - NO empieza con artículo/demostrativo/nexo español habitual
 *   - NO contiene verbo conjugado tras sujeto (Subject + está/son/tiene…)
 *   - NO empieza con emoji (👉 📖 ✅ …)
 *
 * Uso:
 *   node scripts/format-apologetica.mjs <archivo.md>
 *   node scripts/format-apologetica.mjs src/content/apologetica/catequesis/
 *   node scripts/format-apologetica.mjs --dry-run <archivo.md>
 */

import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join, extname } from 'path';

const args  = process.argv.slice(2);
const dryRun  = args.includes('--dry-run');
const targets = args.filter(a => !a.startsWith('--'));

if (!targets.length) {
  console.error('Uso: node scripts/format-apologetica.mjs [--dry-run] <archivo.md|carpeta>');
  process.exit(1);
}

// ─── Recolectar archivos .md ──────────────────────────────────────────────────

async function collectFiles(target) {
  const s = await stat(target);
  if (s.isDirectory()) {
    const entries = await readdir(target, { withFileTypes: true });
    const files   = [];
    for (const e of entries) {
      const full = join(target, e.name);
      if (e.isDirectory()) files.push(...await collectFiles(full));
      else if (extname(e.name) === '.md') files.push(full);
    }
    return files;
  }
  return extname(target) === '.md' ? [target] : [];
}

// ─── Heurístico: ¿parece un título de sección? ───────────────────────────────

function looksLikeHeading(line) {
  const t = line.trim();

  // Demasiado larga para ser título
  if (t.length > 75) return false;

  // Termina en punto → oración completa
  if (t.endsWith('.')) return false;

  // Ítem de lista → NUNCA es título
  if (/^[-*+] /.test(t)) return false;

  // Empieza con emoji (👉 📖 ✅ ⚠️ …)
  if (/^\p{Emoji}/u.test(t)) return false;

  // Empieza con minúscula → fragmento de párrafo
  if (/^[a-záéíóúüñ]/u.test(t)) return false;

  // Artículos + palabra en minúscula → inicio de oración
  // Artículos + palabra en MAYÚSCULA → puede ser título (ej: "La Flagelación de Jesús")
  if (/^(La|El|Lo|Los|Las) [a-záéíóúüñ]/u.test(t)) return false;
  // Indefinidos → casi siempre oración
  if (/^(Un|Una|Unos|Unas) /u.test(t)) return false;

  // Demostrativos y adverbios locativos
  if (/^(Esa|Ese|Eso|Esta|Este|Esto|Estos|Estas|Esos|Esas|Aquí|Allí|Ahí) /u.test(t)) return false;

  // Verbos copulativos o presentativos al inicio
  if (/^(Es |Son |Fue |Era |Hay |Están |Tenía |Tiene ) /u.test(t)) return false;
  // "Es como", "Es decir", "Es que"…
  if (/^Es /u.test(t)) return false;

  // Nexos, preposiciones y conjunciones típicas de inicio de oración
  if (/^(No |Se |Por |Desde |Para |Pero |Sin |Como |Cuando |Si |Aunque |Que |Mientras |Pues |Así ) /u.test(t)) return false;

  // Pronombres personales
  if (/^(Yo |Tú |Él |Ella |Nosotros |Vosotros |Ellos |Ellas ) /u.test(t)) return false;

  // Palabras que típicamente inician una oración explicativa
  if (/^(Comparación|Implica|Significa|Desde |Volver |Esto |Eso |Por tanto|Por eso|Por lo|Así que|De hecho)/u.test(t)) return false;

  // Patrón "Sujeto + verbo conjugado" → oración, no título
  // e.g. "Dios está esperando…", "Cristo llama a…", "El padre sale…"
  if (/^[A-ZÁÉÍÓÚÜ][a-záéíóúüñA-ZÁÉÍÓÚÜ]+ (está|están|es |son |fue |era |tiene |tienen |da |hace |llama|sale|viene|pide|exige|envía)/u.test(t)) return false;

  return true;
}

// ─── Lógica de formato ────────────────────────────────────────────────────────

function formatApologetica(content) {
  const fmMatch = content.match(/^(---\n[\s\S]*?\n---\n)([\s\S]*)$/);
  const fm      = fmMatch ? fmMatch[1] : '';
  const body    = fmMatch ? fmMatch[2] : content;

  const lines = body.split('\n');
  const out   = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trimEnd();

    // ── Línea vacía ──────────────────────────────────────────────────────────
    if (line.trim() === '') {
      if (out.length > 0 && out[out.length - 1].trim() !== '') {
        out.push('');
      }
      i++;
      continue;
    }

    // ── Separadores y blockquotes: pasar tal cual ───────────────────────────
    if (line.startsWith('>') || /^---+$/.test(line.trim())) {
      out.push(line);
      i++;
      continue;
    }

    // ── Headings corruptos: "### - ítem" o "### 👉 texto" → desenvuelve ─────
    // Ocurre cuando el script convirtió por error ítems de lista en títulos
    if (/^#+\s+/.test(line) && /^#+\s+[-*+]/.test(line)) {
      // "### - item" → "- item"
      out.push(line.replace(/^#+\s+/, ''));
      i++;
      continue;
    }
    if (/^#+\s+\p{Emoji}/u.test(line)) {
      // "### 👉 texto" → "👉 texto"
      out.push(line.replace(/^#+\s+/, ''));
      i++;
      continue;
    }

    // ── Títulos válidos: pasar tal cual ──────────────────────────────────────
    if (line.startsWith('#')) {
      out.push(line);
      i++;
      continue;
    }

    // ── Etiquetas de bloque → negrita (Profecía:, Cumplimiento:, Reflexión:…) ─
    if (/^(Profecía|Profecías|Profecía adicional|Cumplimiento|Reflexión|Resumen):$/.test(line.trim())) {
      out.push(`**${line.trim()}**`);
      i++;
      continue;
    }

    const prevLine  = out.length > 0 ? out[out.length - 1] : '';
    const prevBlank = prevLine.trim() === '';
    const nextRaw   = (lines[i + 1] ?? '').trimEnd();
    const nextBlank = nextRaw.trim() === '';

    // ── Detectar encabezado ──────────────────────────────────────────────────
    // Condición: línea sola (prev y next vacíos) + heurístico de título
    if (prevBlank && nextBlank && looksLikeHeading(line)) {
      if (/^\d+\. /.test(line.trim())) {
        out.push(`## ${line.trim()}`);
      } else {
        out.push(`### ${line.trim()}`);
      }
      i++;
      continue;
    }

    // ── "Frase clave: ..." multilinea → blockquote ──────────────────────────
    if (/^Frase clave:/i.test(line.trim()) && !nextBlank) {
      let text = line.trim();
      while (i + 1 < lines.length && lines[i + 1].trim() !== '') {
        i++;
        text += ' ' + lines[i].trim();
      }
      if (!prevBlank) out.push('');
      out.push(`> **${text}**`);
      i++;
      continue;
    }

    // ── Blank line antes del PRIMER guion de un bloque de lista ─────────────
    // Solo si la línea previa NO es ya otro ítem de lista (evita separar ítems)
    const prevIsListItem = /^\s*[-*+] /.test(prevLine);
    if (/^[-*+] /.test(line) && !prevBlank && !prevIsListItem) {
      out.push('');
    }

    // ── Si es ítem de lista y la línea previa es un blanco pero antes había
    //    otro ítem de lista → eliminar ese blanco (colapsar ítems consecutivos)
    if (/^[-*+] /.test(line) && prevBlank && out.length >= 2) {
      const beforeBlank = out[out.length - 2];
      if (/^\s*[-*+] /.test(beforeBlank)) {
        out.pop(); // quitar el blanco entre ítems
      }
    }

    out.push(line);
    i++;
  }

  // Quitar blancos al final del archivo
  while (out.length && out[out.length - 1].trim() === '') out.pop();

  return fm + out.join('\n') + '\n';
}

// ─── Procesar un archivo ──────────────────────────────────────────────────────

async function processFile(filePath) {
  const original  = await readFile(filePath, 'utf8');
  const formatted = formatApologetica(original);

  if (original === formatted) {
    console.log(`  sin cambios   ${filePath}`);
    return;
  }

  if (dryRun) {
    console.log(`  [dry-run] cambios en ${filePath}:`);
    const oLines = original.split('\n');
    const fLines = formatted.split('\n');
    let shown = 0;
    for (let j = 0; j < Math.max(oLines.length, fLines.length) && shown < 30; j++) {
      if (oLines[j] !== fLines[j]) {
        if (oLines[j] !== undefined) console.log(`    - ${oLines[j]}`);
        if (fLines[j] !== undefined) console.log(`    + ${fLines[j]}`);
        shown++;
      }
    }
    if (shown >= 30) console.log('    ... (más cambios omitidos)');
    return;
  }

  await writeFile(filePath, formatted, 'utf8');
  console.log(`  ✓ formateado  ${filePath}`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

const files = (await Promise.all(targets.map(collectFiles))).flat();

if (!files.length) {
  console.error('No se encontraron archivos .md en los destinos indicados.');
  process.exit(1);
}

console.log(`${dryRun ? '[dry-run] ' : ''}Procesando ${files.length} archivo(s)...\n`);
for (const f of files) await processFile(f);
console.log('\nHecho.');
