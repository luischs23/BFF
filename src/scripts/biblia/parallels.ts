// Sistema de paralelos (referencias cruzadas)

// Variable para rastrear el capítulo actual
let currentChapter = 1;

// Función para detectar el capítulo actual basado en el chapter-marker más cercano
function getChapterForVerse(verseElement: Element): number {
	let parent = verseElement.parentElement;

	while (parent) {
		// Buscar en el mismo párrafo primero
		const chapterMarker = parent.querySelector('.chapter-marker') as HTMLElement;
		if (chapterMarker) {
			return parseInt(chapterMarker.dataset.chapter || '1') || 1;
		}

		// Buscar en elementos anteriores
		let prevElement = parent.previousElementSibling;
		while (prevElement) {
			const marker = prevElement.querySelector?.('.chapter-marker') as HTMLElement ||
				(prevElement.classList?.contains('chapter-marker') ? prevElement as HTMLElement : null);
			if (marker) {
				return parseInt(marker.dataset?.chapter || marker.getAttribute('data-chapter') || '1') || 1;
			}
			// También verificar si el elemento mismo es un chapter-marker
			if (prevElement.classList?.contains('chapter-marker')) {
				return parseInt((prevElement as HTMLElement).dataset?.chapter || '1') || 1;
			}
			prevElement = prevElement.previousElementSibling;
		}

		parent = parent.parentElement;
	}

	return currentChapter;
}

// Función para hacer los versículos clicables
async function initVerseClickHandlers(currentSlug: string): Promise<void> {
	const parallelsDialog = document.getElementById('parallelsDialog') as HTMLDialogElement | null;
	const parallelsTitle = document.getElementById('parallelsTitle');
	const parallelsContent = document.getElementById('parallelsContent');

	const allSups = document.querySelectorAll('.bible-content sup');

	allSups.forEach(sup => {
		// Ignorar si ya está procesado o si es un note-ref
		if (sup.classList.contains('verse-clickable') || sup.closest('.note-ref')) {
			return;
		}

		// Obtener el número del versículo
		const verseText = sup.textContent?.trim();
		const verseNum = parseInt(verseText || '');

		if (isNaN(verseNum)) return;

		// Agregar clase para hacerlo clicable
		sup.classList.add('verse-clickable');
		sup.setAttribute('data-verse', verseNum.toString());
		sup.setAttribute('title', 'Ver referencias paralelas');

		// Manejar clic
		sup.addEventListener('click', async (e) => {
			e.preventDefault();
			e.stopPropagation();

			const verse = parseInt(sup.getAttribute('data-verse') || '1');
			const chapter = getChapterForVerse(sup);

			// Actualizar capítulo actual para futuras referencias
			currentChapter = chapter;

			// Mostrar loading
			if (parallelsTitle) parallelsTitle.textContent = 'Cargando...';
			if (parallelsContent) parallelsContent.innerHTML = '<div class="text-center py-4"><span class="animate-pulse">Buscando referencias paralelas...</span></div>';
			parallelsDialog?.showModal();

			try {
				const response = await fetch('/api/get-parallels', {
					method: 'POST',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({
						bookSlug: currentSlug,
						chapter: chapter,
						verse: verse
					})
				});

				const data = await response.json();

				if (response.ok && data.success) {
					if (parallelsTitle) parallelsTitle.textContent = data.title;

					if (data.parallels && data.parallels.length > 0) {
						// Marcar este versículo como que tiene paralelos
						sup.classList.add('has-parallels');

						const listItems = data.parallels.map((p: any) => {
							const badge = p.isNT
								? '<span class="parallel-badge nt">NT</span>'
								: '<span class="parallel-badge at">AT</span>';

							// Construir el hash para navegación precisa
							let hash = `#chapter-${p.firstChapter}`;
							if (p.firstVerse) {
								hash += `-verse-${p.firstVerse}`;
							}

							const link = p.bookPath
								? `<a href="${p.bookPath}${hash}" class="parallel-link">${p.reference}</a>`
								: `<span>${p.reference}</span>`;

							return `<li>${badge}${link}<span class="text-gray-500 dark:text-gray-400 text-xs ml-auto">${p.bookName}</span></li>`;
						}).join('');

						if (parallelsContent) {
							parallelsContent.innerHTML = `
								<p class="text-sm text-gray-500 dark:text-gray-400 mb-3">
									${data.count} referencia${data.count !== 1 ? 's' : ''} paralela${data.count !== 1 ? 's' : ''} encontrada${data.count !== 1 ? 's' : ''}
								</p>
								<ul class="parallels-list">${listItems}</ul>
							`;
						}
					} else {
						if (parallelsContent) {
							parallelsContent.innerHTML = `
								<div class="text-center py-6 text-gray-500">
									<svg class="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
									</svg>
									<p>No hay referencias paralelas para este versículo.</p>
								</div>
							`;
						}
					}
				} else {
					if (parallelsTitle) parallelsTitle.textContent = 'Sin paralelos';
					if (parallelsContent) parallelsContent.innerHTML = `
						<div class="text-center py-4 text-gray-500">
							<p>No se encontraron referencias paralelas.</p>
						</div>
					`;
				}
			} catch (error) {
				console.error('Error al obtener paralelos:', error);
				if (parallelsTitle) parallelsTitle.textContent = 'Error';
				if (parallelsContent) parallelsContent.innerHTML = '<p class="text-red-500">Error al cargar las referencias paralelas.</p>';
			}
		});
	});
}

// Función para pre-cargar y marcar versículos con paralelos (una sola petición)
async function preloadParallels(currentSlug: string): Promise<void> {
	try {
		// Obtener lista de todos los versículos con paralelos en una sola petición
		const response = await fetch('/api/get-parallels-list', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ bookSlug: currentSlug })
		});

		const data = await response.json();

		if (!response.ok || !data.success || !data.verses) {
			return;
		}

		// Crear un Set para búsqueda rápida
		const versesWithParallels = new Set(data.verses);

		// Marcar todos los versículos que tienen paralelos
		const allSups = document.querySelectorAll('.bible-content sup.verse-clickable');

		allSups.forEach(sup => {
			const verse = sup.getAttribute('data-verse');
			const chapter = getChapterForVerse(sup);
			const key = `${chapter}:${verse}`;

			if (versesWithParallels.has(key)) {
				sup.classList.add('has-parallels');
				sup.setAttribute('title', 'Ver referencias paralelas');
			}
		});
	} catch (error) {
		console.error('Error al precargar paralelos:', error);
	}
}

export async function initParallelsSystem(currentSlug: string): Promise<void> {
	const parallelsDialog = document.getElementById('parallelsDialog') as HTMLDialogElement | null;
	const closeParallelsDialog = document.getElementById('closeParallelsDialog');
	const closeParallelsBtn = document.getElementById('closeParallelsBtn');

	// Cerrar dialog de paralelos
	closeParallelsDialog?.addEventListener('click', () => parallelsDialog?.close());
	closeParallelsBtn?.addEventListener('click', () => parallelsDialog?.close());
	parallelsDialog?.addEventListener('click', (e) => {
		if (e.target === parallelsDialog) parallelsDialog.close();
	});

	// Inicializar versículos clicables y luego precargar paralelos
	await initVerseClickHandlers(currentSlug);
	await preloadParallels(currentSlug);

	// Re-inicializar si el contenido se reorganiza
	const observer = new MutationObserver(() => {
		setTimeout(() => initVerseClickHandlers(currentSlug), 150);
	});
	const bibleContent = document.querySelector('.bible-content');
	if (bibleContent) {
		observer.observe(bibleContent, { childList: true, subtree: true });
	}
}

// Exportar getChapterForVerse para uso en otros módulos
export { getChapterForVerse };
