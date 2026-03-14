// Navegación a capítulo y versículo desde hash
// Formato: #chapter-8-verse-22

export function initVerseNavigation(): void {
	scrollToVerseFromHash();
}

function scrollToVerseFromHash(): void {
	const hash = window.location.hash;
	if (!hash) return;

	// Parsear el hash: #chapter-8-verse-22 o #chapter-8
	const match = hash.match(/^#chapter-(\d+)(?:-verse-(\d+))?$/);
	if (!match) return;

	const targetChapter = parseInt(match[1]);
	const targetVerse = match[2] ? parseInt(match[2]) : null;

	const chapterElement = document.getElementById(`chapter-${targetChapter}`);
	if (!chapterElement) return;

	if (!targetVerse) {
		setTimeout(() => {
			chapterElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}, 300);
		return;
	}

	setTimeout(() => {
		// Obtener marcadores de capítulo y <sup> en orden de documento
		const allElements = Array.from(
			document.querySelectorAll('.bible-content .chapter-marker, .bible-content sup')
		);

		let currentChapterNum = 0;
		let foundVerse = false;

		for (const el of allElements) {
			if (el.classList.contains('chapter-marker')) {
				currentChapterNum = parseInt((el as HTMLElement).getAttribute('data-chapter') || '0');
				continue;
			}

			if (currentChapterNum !== targetChapter) continue;

			const verseNum = parseInt(el.textContent?.trim() || '0');
			if (verseNum === targetVerse) {
				el.scrollIntoView({ behavior: 'smooth', block: 'center' });
				el.classList.add('verse-highlight');
				setTimeout(() => el.classList.remove('verse-highlight'), 2000);
				foundVerse = true;
				break;
			}
		}

		if (!foundVerse) {
			chapterElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}, 500);
}
