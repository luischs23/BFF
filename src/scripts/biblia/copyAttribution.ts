// Cita bíblica automática al copiar texto del contenido bíblico
// Formato resultante: texto copiado + "\n— Génesis 4,3-6"

export function initBibleCopyAttribution(): void {
	document.addEventListener('copy', handleCopy);
}

function handleCopy(event: Event): void {
	const selection = window.getSelection();
	if (!selection || selection.isCollapsed || selection.rangeCount === 0) return;

	const range = selection.getRangeAt(0);
	const bibleContent = document.querySelector('.bible-content');
	if (!bibleContent) return;

	// Solo procesar si la selección está dentro del contenido bíblico
	if (!bibleContent.contains(range.commonAncestorContainer)) return;

	const selectedText = selection.toString();
	if (!selectedText.trim()) return;

	const citation = buildCitation(range);
	if (!citation) return;

	// Construir URL al versículo inicial de la selección
	const slug = (window as any).currentBibliaSlug || '';
	const startChapter = findChapterForNode(range.startContainer);
	const { firstVerse } = startChapter
		? findVersesInSelection(range, startChapter)
		: { firstVerse: null };

	let url = '';
	if (slug && startChapter) {
		const hash = firstVerse
			? `#chapter-${startChapter}-verse-${firstVerse}`
			: `#chapter-${startChapter}`;
		url = `${window.location.origin}/biblia/${slug}${hash}`;
	}

	const clipboardEvent = event as ClipboardEvent;
	if (!clipboardEvent.clipboardData) return;

	// text/plain: texto + cita + URL en línea propia
	const plain = url
		? `${selectedText}\n— ${citation}\n${url}`
		: `${selectedText}\n— ${citation}`;

	// text/html: texto + cita como hipervínculo (Word, Google Docs, email…)
	const escapedText = escapeHtml(selectedText);
	const escapedCitation = escapeHtml(citation);
	const html = url
		? `<p>${escapedText}</p><p>— <a href="${url}">${escapedCitation}</a></p>`
		: `<p>${escapedText}</p><p>— ${escapedCitation}</p>`;

	clipboardEvent.clipboardData.setData('text/plain', plain);
	clipboardEvent.clipboardData.setData('text/html', html);
	event.preventDefault();
}

function escapeHtml(str: string): string {
	return str
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;');
}

export function buildCitation(range: Range): string {
	const h1 = document.querySelector('.bible-content h1');
	const rawBookName = h1?.textContent?.trim() || '';
	if (!rawBookName) return '';

	const bookName = formatBookName(rawBookName);

	const startChapter = findChapterForNode(range.startContainer);
	if (!startChapter) return bookName;

	const endChapter = findChapterForNode(range.endContainer) || startChapter;

	const { firstVerse, lastVerse } = findVersesInSelection(range, startChapter);

	if (firstVerse === null) {
		if (startChapter === endChapter) return `${bookName} ${startChapter}`;
		return `${bookName} ${startChapter}–${endChapter}`;
	}

	const last = lastVerse ?? firstVerse;

	if (startChapter === endChapter) {
		if (firstVerse === last) return `${bookName} ${startChapter},${firstVerse}`;
		return `${bookName} ${startChapter},${firstVerse}-${last}`;
	}

	return `${bookName} ${startChapter},${firstVerse}–${endChapter},${last}`;
}

export function findVersesInSelection(
	range: Range,
	startChapter: number
): { firstVerse: number | null; lastVerse: number | null } {
	const allMarkers = Array.from(
		document.querySelectorAll('.bible-content .chapter-marker')
	) as HTMLElement[];
	const allSups = Array.from(
		document.querySelectorAll('.bible-content sup')
	) as HTMLElement[];

	// Combinar y ordenar por posición en el DOM
	const allElements = [...allMarkers, ...allSups].sort((a, b) => {
		const pos = a.compareDocumentPosition(b);
		if (pos & Node.DOCUMENT_POSITION_FOLLOWING) return -1;
		if (pos & Node.DOCUMENT_POSITION_PRECEDING) return 1;
		return 0;
	});

	let currentChapter = 1;
	let lastBeforeRange: { verse: number; chapter: number } | null = null;
	let firstVerse: number | null = null;
	let lastVerse: number | null = null;

	for (const el of allElements) {
		if (el.classList.contains('chapter-marker')) {
			currentChapter = parseInt(el.getAttribute('data-chapter') || '1');
			continue;
		}

		const verseNum = parseInt(el.textContent?.trim() || '');
		if (isNaN(verseNum)) continue;

		let position: number;
		try {
			position = range.comparePoint(el, 0);
		} catch {
			continue;
		}

		if (position < 0) {
			lastBeforeRange = { verse: verseNum, chapter: currentChapter };
		} else if (position === 0) {
			if (firstVerse === null) firstVerse = verseNum;
			lastVerse = verseNum;
		} else {
			break;
		}
	}

	// Si el usuario empezó a seleccionar dentro de un versículo (después del <sup>),
	// el número de ese versículo queda fuera del range. Lo recuperamos si es del mismo capítulo.
	let effectiveFirst = firstVerse;
	if (lastBeforeRange && lastBeforeRange.chapter === startChapter) {
		effectiveFirst = lastBeforeRange.verse;
	}

	return { firstVerse: effectiveFirst, lastVerse };
}

export function findChapterForNode(node: Node): number | null {
	const markers = Array.from(
		document.querySelectorAll('.bible-content .chapter-marker')
	) as HTMLElement[];

	let lastChapter: number | null = null;

	for (const marker of markers) {
		const position = marker.compareDocumentPosition(node);
		// El nodo viene después del marcador → el marcador está antes del nodo
		if (
			position & Node.DOCUMENT_POSITION_FOLLOWING ||
			position & Node.DOCUMENT_POSITION_CONTAINED_BY
		) {
			lastChapter = parseInt(marker.getAttribute('data-chapter') || '0') || null;
		}
	}

	return lastChapter;
}

function formatBookName(rawName: string): string {
	const lowWords = ['de', 'del', 'los', 'las', 'el', 'la', 'y', 'a', 'en'];
	const words = rawName.toLowerCase().split(' ');
	return words
		.map((word, i) => {
			if (i === 0 || !lowWords.includes(word)) {
				return word.charAt(0).toUpperCase() + word.slice(1);
			}
			return word;
		})
		.join(' ');
}
