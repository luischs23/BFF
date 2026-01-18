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

	const targetChapter = match[1];
	const targetVerse = match[2];

	// Primero, scroll al capítulo (el ancla ya existe)
	const chapterElement = document.getElementById(`chapter-${targetChapter}`);
	if (chapterElement) {
		// Si hay versículo específico, buscar el <sup> con ese número
		if (targetVerse) {
			// Esperar un momento para que el DOM esté listo
			setTimeout(() => {
				// Buscar todos los sup después del chapter-marker
				const allSups = document.querySelectorAll('.bible-content sup');
				let foundVerse = false;
				let currentChapterNum = 0;

				for (const sup of allSups) {
					// Verificar si es un chapter-marker cercano
					const prevMarker = sup.parentElement?.querySelector('.chapter-marker') as HTMLElement;
					if (prevMarker) {
						currentChapterNum = parseInt(prevMarker.getAttribute('data-chapter') || '0');
					}

					// Buscar el chapter-marker más cercano hacia atrás
					let parent = sup.parentElement;
					while (parent && !foundVerse) {
						const marker = parent.querySelector('.chapter-marker') as HTMLElement;
						if (marker) {
							currentChapterNum = parseInt(marker.getAttribute('data-chapter') || '0');
							break;
						}
						let prevEl = parent.previousElementSibling;
						while (prevEl) {
							const m = prevEl.querySelector?.('.chapter-marker') as HTMLElement;
							if (m) {
								currentChapterNum = parseInt(m.getAttribute('data-chapter') || '0');
								break;
							}
							if (prevEl.classList?.contains('chapter-marker')) {
								currentChapterNum = parseInt((prevEl as HTMLElement).getAttribute('data-chapter') || '0');
								break;
							}
							prevEl = prevEl.previousElementSibling;
						}
						parent = parent.parentElement;
					}

					// Verificar si es el versículo que buscamos
					const verseText = sup.textContent?.trim();
					const verseNum = parseInt(verseText || '0');

					if (currentChapterNum === parseInt(targetChapter) && verseNum === parseInt(targetVerse)) {
						// Encontrado - hacer scroll con un pequeño offset
						sup.scrollIntoView({ behavior: 'smooth', block: 'center' });
						// Resaltar brevemente el versículo
						sup.classList.add('verse-highlight');
						setTimeout(() => sup.classList.remove('verse-highlight'), 2000);
						foundVerse = true;
						break;
					}
				}

				// Si no encontramos el versículo, al menos scroll al capítulo
				if (!foundVerse) {
					chapterElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
				}
			}, 500);
		} else {
			// Solo capítulo, scroll directo
			setTimeout(() => {
				chapterElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
			}, 300);
		}
	}
}
