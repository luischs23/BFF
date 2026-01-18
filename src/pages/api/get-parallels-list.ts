import type { APIRoute } from 'astro';
import fs from 'fs/promises';
import path from 'path';

export const prerender = false;

// Parsear el archivo de paralelos y devolver lista de versículos que tienen paralelos
function parseParallelsFile(content: string, bookAbbrev: string): Set<string> {
  const versesWithParallels = new Set<string>();

  // Quitar frontmatter
  const frontmatterMatch = content.match(/^---\n[\s\S]*?\n---\n([\s\S]*)$/);
  const body = frontmatterMatch ? frontmatterMatch[1] : content;

  const lines = body.split('\n').map(l => l.trim()).filter(l => l);

  for (const line of lines) {
    // Detectar si es una referencia de origen del libro actual
    // Formatos: "Gn 1 1", "Gn 1 1-2", "Gn 1 1 - 2 4"
    const mainRefMatch = line.match(new RegExp(`^${bookAbbrev}\\s+(\\d+)\\s+(\\d+)(?:-(\\d+))?(?:\\s+-\\s+(\\d+)\\s+(\\d+))?$`));

    if (mainRefMatch) {
      const chapter = mainRefMatch[1];
      const startVerse = parseInt(mainRefMatch[2]);
      const endVerseInChapter = mainRefMatch[3] ? parseInt(mainRefMatch[3]) : null;
      const endChapter = mainRefMatch[4] ? parseInt(mainRefMatch[4]) : null;
      const endVerse = mainRefMatch[5] ? parseInt(mainRefMatch[5]) : null;

      if (endChapter && endVerse) {
        // Rango entre capítulos - agregar todos los versículos del rango
        // Por simplicidad, solo marcamos el versículo inicial
        versesWithParallels.add(`${chapter}:${startVerse}`);
      } else if (endVerseInChapter) {
        // Rango en mismo capítulo - agregar todos los versículos del rango
        for (let v = startVerse; v <= endVerseInChapter; v++) {
          versesWithParallels.add(`${chapter}:${v}`);
        }
      } else {
        // Versículo único
        versesWithParallels.add(`${chapter}:${startVerse}`);
      }
    }
  }

  return versesWithParallels;
}

export const POST: APIRoute = async ({ request }) => {
  try {
    const { bookSlug } = await request.json();

    if (!bookSlug) {
      return new Response(JSON.stringify({
        error: 'Se requiere bookSlug'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Construir ruta del archivo de paralelos
    const slugParts = bookSlug.split('/');
    const fileName = slugParts[slugParts.length - 1];
    const parallelsPath = path.join(
      process.cwd(),
      'src', 'content', 'sagrada-biblia',
      ...slugParts.slice(0, -1),
      `${fileName}-paralelos.md`
    );

    // Determinar la abreviatura del libro
    const fileToAbbrev: Record<string, string> = {
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

    const bookAbbrev = fileToAbbrev[fileName] || 'Gn';

    // Leer archivo de paralelos
    let content: string;
    try {
      content = await fs.readFile(parallelsPath, 'utf-8');
    } catch {
      return new Response(JSON.stringify({
        success: true,
        verses: []
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Parsear y obtener lista de versículos con paralelos
    const versesWithParallels = parseParallelsFile(content, bookAbbrev);

    return new Response(JSON.stringify({
      success: true,
      verses: Array.from(versesWithParallels)
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error al obtener lista de paralelos:', error);
    return new Response(JSON.stringify({
      error: 'Error al procesar la solicitud',
      details: error instanceof Error ? error.message : 'Error desconocido'
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};
