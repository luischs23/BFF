import React, { useState, useEffect } from 'react';

interface TitleMatch {
  line: number;
  original: string;
  type: 'section-intro' | 'subsection-title' | 'parallel';
  converted: string;
}

export default function TitleEditor() {
  const [files, setFiles] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [titles, setTitles] = useState<TitleMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadFiles();
  }, []);

  const loadFiles = async () => {
    try {
      const res = await fetch('/api/bible-files');
      const data = await res.json();
      setFiles(data.files || []);
    } catch (err) {
      console.error('Error loading files:', err);
    }
  };

  const loadFileContent = async (filePath: string) => {
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/bible-content?file=${encodeURIComponent(filePath)}`);
      const data = await res.json();
      if (data.content) {
        setContent(data.content);
        findTitles(data.content);
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al cargar el archivo' });
    } finally {
      setLoading(false);
    }
  };

  // Función para formatear paralelos con números de capítulo en negrita
  const formatParallel = (text: string): string => {
    let result = text;

    // 1. Números después de = (ej: =20, =26 1-11, =17)
    result = result.replace(/=(\d+)/g, '=<strong>$1</strong>');

    // 2. Número al inicio seguido de espacio y versículos (ej: "12 2.7" -> capítulo 12)
    result = result.replace(/^(\d+)(\s+\d)/g, '<strong>$1</strong>$2');

    // 3. Números después de ; y espacio, seguido de versículos (ej: "; 13 14-17" -> capítulo 13)
    result = result.replace(/;\s+(\d+)(\s+\d)/g, '; <strong>$1</strong>$2');

    // 4. Números después de ; y espacio solos (ej: "; 50 6." -> capítulo 50)
    // Ya cubierto por el anterior

    // 5. Número después de nombre de libro (letras) - capítulo después de libro
    // Ej: "Cro 1 32-33" -> el 1 es capítulo
    // Ej: "Jn 1 1-3" -> el primer 1 es capítulo
    // Ej: "Jc 5" -> el 5 es capítulo
    // Ej: "Dt 33" -> el 33 es capítulo
    // Patrón: [letras mayúsculas/minúsculas] [espacio] [número]
    result = result.replace(/([A-Za-z]{1,3})\s+(\d+)(?=\s|;|,|\.|$)/g, (match, book, chapter, offset) => {
      // Verificar que no esté ya en negrita
      const before = result.substring(0, offset);
      if (before.endsWith('<strong>')) return match;
      return `${book} <strong>${chapter}</strong>`;
    });

    // 6. Referencias con ↗ (ej: "↗Jn 1 1-3", "↗Col 1 15-17")
    result = result.replace(/↗([A-Za-z]+)\s+(\d+)/g, (match, book, chapter) => {
      // Evitar doble negrita
      if (match.includes('<strong>')) return match;
      return `↗${book} <strong>${chapter}</strong>`;
    });

    // 7. Referencias con || (ej: "|| 1 Cro 1 32-33")
    result = result.replace(/\|\|\s+(\d+)\s+([A-Za-z]+)\s+(\d+)/g, '|| $1 $2 <strong>$3</strong>');

    // Limpiar posibles dobles negritas
    result = result.replace(/<strong><strong>/g, '<strong>');
    result = result.replace(/<\/strong><\/strong>/g, '</strong>');

    return result;
  };

  // Detectar si es una línea de paralelos
  const isParallelLine = (text: string): boolean => {
    // Paralelos típicamente tienen referencias bíblicas con:
    // - Números con = (ej: "=20", "=26 1-11")
    // - Empiezan con número seguido de versículos (ej: "2 4-25", "12 2.7")
    // - Referencias con ↗ (ej: "↗Jn 1 1-3")
    // - Referencias con || (ej: "|| 1 Cro 1 32-33")
    // - Nombres de libros seguidos de capítulos (ej: "Jc 5", "Dt 33")

    const parallelPatterns = [
      /^=\d+/, // Empieza con "=20" o "=26"
      /^\d+\s+\d+/, // Empieza con "2 4-25" o "12 2.7"
      /^↗[A-Za-z]+\s+\d+/, // Empieza con "↗Jn 1"
      /^\|\|/, // Empieza con "||"
      /^[A-Za-z]{1,3}\s+\d+/, // Empieza con nombre de libro "Jc 5", "Dt 33"
      /;\s*=?\d+/, // Contiene "; 13" o "; =17"
      /↗[A-Za-z]+\s+\d+/, // Contiene referencia con flecha
    ];

    return parallelPatterns.some(pattern => pattern.test(text));
  };

  const findTitles = (text: string) => {
    const lines = text.split('\n');
    const matches: TitleMatch[] = [];

    lines.forEach((line, index) => {
      const h2Match = line.match(/^## (.+)$/);
      if (h2Match) {
        const titleText = h2Match[1];

        // Ignorar si ya tiene el formato convertido
        if (titleText.includes('class="section-intro"') ||
            titleText.includes('class="subsection-title"') ||
            titleText.includes('class="parallel-ref"') ||
            titleText.startsWith('<div') ||
            titleText.startsWith('<span')) {
          return;
        }

        // Detectar tipo de título
        const isRomanNumeral = /^[IVX]+\.?\s/.test(titleText);
        const isNumberedSubsection = /^\d+\.\s+[A-ZÁÉÍÓÚÑ]/.test(titleText); // "2. EL DILUVIO"
        const isParallel = isParallelLine(titleText);

        if (isRomanNumeral) {
          // Sección principal con números romanos
          // Incluye línea en blanco después para que el siguiente ## funcione
          matches.push({
            line: index,
            original: line,
            type: 'section-intro',
            converted: `<span class="section-intro">${titleText}</span>` 
          });
        } else if (isParallel) {
          // Referencias paralelas
          const formattedParallel = formatParallel(titleText);
          matches.push({
            line: index,
            original: line,
            type: 'parallel',
            converted: `<span class="parallel-ref">${formattedParallel}</span>`
          });
        } else if (isNumberedSubsection) {
          // Subsección numerada como "2. EL DILUVIO"
          matches.push({
            line: index,
            original: line,
            type: 'subsection-title',
            converted: `## <span class="subsection-title">${titleText}</span>`
          });
        } else {
          // Título normal - ofrecer opciones
          matches.push({
            line: index,
            original: line,
            type: 'subsection-title',
            converted: `## <span class="subsection-title">${titleText}</span>`
          });
        }
      }
    });

    setTitles(matches);
  };

  const applyConversion = (index: number, newContent: string) => {
    const title = titles[index];
    const lines = content.split('\n');
    lines[title.line] = newContent;
    const updatedContent = lines.join('\n');
    setContent(updatedContent);
    setTitles(prev => prev.filter((_, i) => i !== index));
  };

  const convertToSectionIntro = (index: number) => {
  const title = titles[index];
  const titleText = title.original.replace(/^## /, '');
  // NO incluir línea en blanco extra, solo reemplazar el contenido
    applyConversion(index, `<span class="section-intro">${titleText}</span>`);
    setMessage({ type: 'success', text: 'Convertido a section-intro' });
  };

  const convertToSubsectionTitle = (index: number) => {
    const title = titles[index];
    const titleText = title.original.replace(/^## /, '');
    // Mantener el ## solo si no está presente ya
    const hasHashtag = title.original.startsWith('## ');
    const prefix = hasHashtag ? '## ' : '';
    applyConversion(index, `${prefix}<span class="subsection-title">${titleText}</span>`);
    setMessage({ type: 'success', text: 'Convertido a subsection-title' });
  };

  const convertToParallel = (index: number) => {
    const title = titles[index];
    const titleText = title.original.replace(/^## /, '');
    const formattedParallel = formatParallel(titleText);
    applyConversion(index, `<span class="parallel-ref">${formattedParallel}</span>`);
    setMessage({ type: 'success', text: 'Convertido a parallel-ref' });
  };

  const saveContent = async () => {
    if (!selectedFile) return;
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch('/api/bible-content', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file: selectedFile, content })
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: 'success', text: 'Archivo guardado correctamente' });
      } else {
        setMessage({ type: 'error', text: data.error || 'Error al guardar' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Error al guardar el archivo' });
    } finally {
      setSaving(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(content);
    setMessage({ type: 'success', text: 'Contenido copiado al portapapeles' });
  };

  // Vista previa del formato parallel
  const getParallelPreview = (text: string): string => {
    const titleText = text.replace(/^## /, '');
    return formatParallel(titleText);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-6">
          Editor de Títulos - Sagrada Biblia
        </h1>

        {/* Selector de archivo */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Seleccionar archivo:
          </label>
          <select
            className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200"
            value={selectedFile}
            onChange={(e) => {
              setSelectedFile(e.target.value);
              if (e.target.value) {
                loadFileContent(e.target.value);
              } else {
                setContent('');
                setTitles([]);
              }
            }}
          >
            <option value="">-- Seleccionar archivo --</option>
            {files.map((file) => (
              <option key={file} value={file}>
                {file.replace('src/content/sagrada-biblia/', '')}
              </option>
            ))}
          </select>
        </div>

        {/* Mensaje de estado */}
        {message && (
          <div className={`p-3 rounded-lg mb-4 ${
            message.type === 'success'
              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {loading && (
          <div className="text-center py-8 text-gray-600 dark:text-gray-400">
            Cargando...
          </div>
        )}

        {/* Lista de títulos encontrados */}
        {titles.length > 0 && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">
              Títulos encontrados ({titles.length})
            </h2>
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {titles.map((title, index) => (
                <div
                  key={`${title.line}-${index}`}
                  className="flex flex-col gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Línea {title.line + 1}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        title.type === 'section-intro'
                          ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          : title.type === 'parallel'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                          : 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                      }`}>
                        {title.type === 'section-intro' ? 'Sección' :
                         title.type === 'parallel' ? 'Paralelo' : 'Subtítulo'}
                      </span>
                    </div>
                    <code className="text-sm text-gray-800 dark:text-gray-200 block bg-gray-200 dark:bg-gray-600 p-2 rounded">
                      {title.original}
                    </code>

                    {/* Vista previa para paralelos */}
                    {title.type === 'parallel' && (
                      <div className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                        <span className="font-medium">Vista previa: </span>
                        <span
                          className="font-serif"
                          dangerouslySetInnerHTML={{ __html: getParallelPreview(title.original) }}
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => convertToSectionIntro(index)}
                      className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition"
                      title="Convertir a sección intro (para títulos principales con números romanos)"
                    >
                      → section-intro
                    </button>
                    <button
                      onClick={() => convertToSubsectionTitle(index)}
                      className="px-3 py-2 bg-purple-600 text-white text-sm rounded hover:bg-purple-700 transition"
                      title="Convertir a subtítulo de subsección"
                    >
                      → subsection-title
                    </button>
                    <button
                      onClick={() => convertToParallel(index)}
                      className="px-3 py-2 bg-amber-600 text-white text-sm rounded hover:bg-amber-700 transition"
                      title="Convertir a referencia paralela (capítulos en negrita)"
                    >
                      → parallel-ref
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Editor de contenido */}
        {content && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                Contenido del archivo
              </h2>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition"
                >
                  Copiar
                </button>
                <button
                  onClick={saveContent}
                  disabled={saving}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50"
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </div>
            <textarea
              className="w-full h-96 p-4 font-mono text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 text-gray-800 dark:text-gray-200"
              value={content}
              onChange={(e) => {
                setContent(e.target.value);
                findTitles(e.target.value);
              }}
            />
          </div>
        )}

        {/* Leyenda */}
        <div className="mt-6 bg-amber-50 dark:bg-amber-900/30 rounded-lg p-4">
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-3">
            Guía de conversión:
          </h3>
          <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-3">
            <li>
              <strong className="text-blue-700 dark:text-blue-300">section-intro:</strong> Para títulos de sección principal (ej: "II. Historia de Abrahán")
              <br />
              <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded text-xs">
                {'<span class="section-intro">II. Historia de Abrahán</span>'}
              </code>
            </li>
            <li>
              <strong className="text-purple-700 dark:text-purple-300">subsection-title:</strong> Para subtítulos (ej: "2. EL DILUVIO", "Vocación de Abrahán")
              <br />
              <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded text-xs">
                {'## <span class="subsection-title">2. EL DILUVIO</span>'}
              </code>
            </li>
            <li>
              <strong className="text-amber-700 dark:text-amber-300">parallel-ref:</strong> Para referencias paralelas (ej: "2 4-25 ↗Jn 1 1-3")
              <br />
              <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded text-xs">
                {'<span class="parallel-ref"><strong>2</strong> 4-25 ↗Jn <strong>1</strong> 1-3</span>'}
              </code>
              <br />
              <span className="text-xs italic">Los números de capítulo se ponen en negrita automáticamente</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
