// Auto-hide header en scroll (solo móvil)

import { setCurrentVisibleChapter } from './chapterNavigation';

// Detectar el capítulo visible actual basándose en los chapter-markers
function detectCurrentChapter(scrollableMain: Element): number {
	const chapterMarkers = document.querySelectorAll('.chapter-marker[data-chapter]');
	if (chapterMarkers.length === 0) return 1;

	const mainRect = scrollableMain.getBoundingClientRect();
	const offset = 100; // Margen desde el top del viewport
	let currentChapter = 1;

	chapterMarkers.forEach((marker) => {
		const markerRect = marker.getBoundingClientRect();
		// Si el marker está por encima del punto de referencia (top del main + offset)
		if (markerRect.top <= mainRect.top + offset) {
			const chapterNum = parseInt(marker.getAttribute('data-chapter') || '1');
			if (!isNaN(chapterNum)) {
				currentChapter = chapterNum;
			}
		}
	});

	return currentChapter;
}

// Actualizar el display del capítulo en el header
function updateChapterDisplay(chapter: number): void {
	const chapterDisplay = document.getElementById('currentChapterDisplay');
	if (chapterDisplay) {
		chapterDisplay.textContent = chapter.toString();
	}
}

export function initHeaderAutoHide(): void {
	const mobileHeader = document.getElementById('mobileHeader');
	const scrollableMain = document.querySelector('#bibliaContainer > main');

	if (!mobileHeader || !scrollableMain) {
		console.warn('Header auto-hide: elementos no encontrados');
		return;
	}

	let lastScrollY = 0;
	let isHeaderVisible = true;
	let lastChapter = 0;
	const scrollThreshold = 10;

	// Detectar capítulo inicial
	setTimeout(() => {
		const initialChapter = detectCurrentChapter(scrollableMain);
		updateChapterDisplay(initialChapter);
		setCurrentVisibleChapter(initialChapter);
		lastChapter = initialChapter;
	}, 100);

	function updateHeader(): void {
		const currentScrollY = scrollableMain!.scrollTop;

		// Actualizar capítulo visible (en cualquier tamaño de pantalla)
		const currentChapter = detectCurrentChapter(scrollableMain!);
		if (currentChapter !== lastChapter) {
			updateChapterDisplay(currentChapter);
			setCurrentVisibleChapter(currentChapter);
			lastChapter = currentChapter;
		}

		// Solo en móvil (md:hidden = < 768px)
		if (window.innerWidth >= 768) {
			mobileHeader!.classList.remove('header-hidden');
			isHeaderVisible = true;
			return;
		}

		// No ocultar si estamos en modo búsqueda
		const headerSearch = document.getElementById('headerSearch');
		if (headerSearch && !headerSearch.classList.contains('hidden')) {
			mobileHeader!.classList.remove('header-hidden');
			isHeaderVisible = true;
			return;
		}

		const scrollDelta = currentScrollY - lastScrollY;

		// Ignorar movimientos pequeños
		if (Math.abs(scrollDelta) < scrollThreshold) {
			lastScrollY = currentScrollY;
			return;
		}

		// Scroll hacia abajo → ocultar (solo si ya scrolleamos un poco)
		if (scrollDelta > 0 && currentScrollY > 60) {
			if (isHeaderVisible) {
				mobileHeader!.classList.add('header-hidden');
				isHeaderVisible = false;
			}
		}
		// Scroll hacia arriba → mostrar
		else if (scrollDelta < 0) {
			if (!isHeaderVisible) {
				mobileHeader!.classList.remove('header-hidden');
				isHeaderVisible = true;
			}
		}

		lastScrollY = currentScrollY <= 0 ? 0 : currentScrollY;
	}

	// Listener directo sin throttle
	scrollableMain.addEventListener('scroll', updateHeader, { passive: true });

	// Resetear en resize
	window.addEventListener('resize', () => {
		if (window.innerWidth >= 768) {
			mobileHeader!.classList.remove('header-hidden');
			isHeaderVisible = true;
		}
	});
}
