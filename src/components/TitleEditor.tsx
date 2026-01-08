import React, { useState, useEffect } from 'react';

interface TitleMatch {
  line: number;
  original: string;
  type: 'section-intro' | 'subsection-title';
  converted: string;
}

interface TitleEditorProps {
  initialFiles?: string[];
}

export default function TitleEditor({ initialFiles = [] }: TitleEditorProps) {
  const [files, setFiles] = useState<string[]>(initialFiles);
  const [selectedFile, setSelectedFile] = useState<string>('');
  const [content, setContent] = useState<string>('');
  const [titles, setTitles] = useState<TitleMatch[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Cargar lista de archivos al iniciar
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

  const findTitles = (text: string) => {
    const lines = text.split('\n');
    const matches: TitleMatch[] = [];

    lines.forEach((line, index) => {
      // Buscar títulos ## que NO estén ya convertidos
      const h2Match = line.match(/^## (.+)$/);
      if (h2Match) {
        const titleText = h2Match[1];

        // Ignorar si ya tiene el formato convertido
        if (titleText.includes('class="section-intro"') ||
            titleText.includes('class="subsection-title"') ||
            titleText.startsWith('<div') ||
            titleText.startsWith('<span')) {
          return;
        }

        // Detectar si es un título de sección (números romanos) o subsección
        const isRomanNumeral = /^[IVX]+\.?\s/.test(titleText);
        const isNumberedSection = /^\d+\.\s/.test(titleText);

        if (isRomanNumeral) {
          // Es una sección principal (números romanos)
          matches.push({
            line: index,
            original: line,
            type: 'section-intro',
            converted: `<div class="section-intro">${titleText}</div>`
          });
        } else if (!isNumberedSection) {
          // Es un subtítulo normal
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

  const convertTitle = (index: number) => {
    const title = titles[index];
    const lines = content.split('\n');
    lines[title.line] = title.converted;
    const newContent = lines.join('\n');
    setContent(newContent);

    // Actualizar la lista de títulos
    setTitles(prev => prev.filter((_, i) => i !== index));
    setMessage({ type: 'success', text: `Título convertido a ${title.type}` });
  };

  const convertToSectionIntro = (index: number) => {
    const title = titles[index];
    const lines = content.split('\n');
    const titleText = title.original.replace(/^## /, '');
    lines[title.line] = `<div class="section-intro">${titleText}</div>`;
    const newContent = lines.join('\n');
    setContent(newContent);
    setTitles(prev => prev.filter((_, i) => i !== index));
    setMessage({ type: 'success', text: 'Convertido a section-intro' });
  };

  const convertToSubsectionTitle = (index: number) => {
    const title = titles[index];
    const lines = content.split('\n');
    const titleText = title.original.replace(/^## /, '');
    lines[title.line] = `## <span class="subsection-title">${titleText}</span>`;
    const newContent = lines.join('\n');
    setContent(newContent);
    setTitles(prev => prev.filter((_, i) => i !== index));
    setMessage({ type: 'success', text: 'Convertido a subsection-title' });
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
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {titles.map((title, index) => (
                <div
                  key={`${title.line}-${index}`}
                  className="flex flex-col md:flex-row md:items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                      Línea {title.line + 1}
                    </div>
                    <code className="text-sm text-gray-800 dark:text-gray-200 block bg-gray-200 dark:bg-gray-600 p-2 rounded">
                      {title.original}
                    </code>
                  </div>
                  <div className="flex gap-2 flex-shrink-0">
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
          <h3 className="font-semibold text-amber-800 dark:text-amber-200 mb-2">
            Guía de conversión:
          </h3>
          <ul className="text-sm text-amber-700 dark:text-amber-300 space-y-1">
            <li>
              <strong>section-intro:</strong> Para títulos de sección principal (ej: "II. Historia de Abrahán")
              <br />
              <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">
                {'<div class="section-intro">II. Historia de Abrahán</div>'}
              </code>
            </li>
            <li className="mt-2">
              <strong>subsection-title:</strong> Para subtítulos dentro de secciones (ej: "Vocación de Abrahán")
              <br />
              <code className="bg-amber-100 dark:bg-amber-800 px-1 rounded">
                {'## <span class="subsection-title">Vocación de Abrahán</span>'}
              </code>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
