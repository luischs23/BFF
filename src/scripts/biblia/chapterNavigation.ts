// Sistema de navegación rápida de capítulos

import { getChapterForVerse } from './parallels';

interface ChapterInfo {
	number: number;
	element: Element | null;
	offsetTop: number;
}

let chapterNavOpen = false;
let chapters: ChapterInfo[] = [];
let currentVisibleChapter = 1;

// Detectar todos los capítulos en el contenido
function detectChapters(): ChapterInfo[] {
	const mainContent = document.querySelector('main');
	const chapterMarkers = document.querySelectorAll('.chapter-marker');
	chapters = [];

	chapterMarkers.forEach(marker => {
		const chapterNum = parseInt(marker.getAttribute('data-chapter') || marker.textContent || '0');
		if (!isNaN(chapterNum)) {
			chapters.push({
				number: chapterNum,
				element: marker,
				offsetTop: marker.getBoundingClientRect().top + (mainContent?.scrollTop || 0)
			});
		}
	});

	// También buscar anclas de capítulo
	const chapterAnchors = document.querySelectorAll('[id^="chapter-"]');
	chapterAnchors.forEach(anchor => {
		const match = anchor.id.match(/chapter-(\d+)/);
		if (match) {
			const chapterNum = parseInt(match[1]);
			// Solo agregar si no existe ya
			if (!chapters.find(c => c.number === chapterNum)) {
				chapters.push({
					number: chapterNum,
					element: anchor,
					offsetTop: anchor.getBoundingClientRect().top + (mainContent?.scrollTop || 0)
				});
			}
		}
	});

	// Ordenar por número
	chapters.sort((a, b) => a.number - b.number);

	return chapters;
}

// Generar botones de capítulo
function generateChapterButtons(): void {
	const chapterGrid = document.getElementById('chapterGrid');
	if (!chapterGrid) return;

	detectChapters();

	if (chapters.length === 0) {
		// Si no hay capítulos detectados, crear un rango basado en el contenido
		const allSups = document.querySelectorAll('.bible-content sup.verse-clickable');
		let maxChapter = 1;

		allSups.forEach(sup => {
			const ch = getChapterForVerse(sup);
			if (ch > maxChapter) maxChapter = ch;
		});

		for (let i = 1; i <= maxChapter; i++) {
			chapters.push({ number: i, element: null, offsetTop: 0 });
		}
	}

	chapterGrid.innerHTML = '';

	chapters.forEach(chapter => {
		const btn = document.createElement('button');
		btn.textContent = chapter.number.toString();
		btn.className = 'bg-stone-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-amber-200 dark:hover:bg-amber-600';

		if (chapter.number === currentVisibleChapter) {
			btn.classList.add('current-chapter');
		}

		btn.addEventListener('click', () => {
			navigateToChapter(chapter.number);
			toggleChapterNav();
		});

		chapterGrid.appendChild(btn);
	});
}

// Navegar a un capítulo específico
function navigateToChapter(chapterNum: number): void {
	const chapterAnchor = document.getElementById(`chapter-${chapterNum}`);
	if (chapterAnchor) {
		chapterAnchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
	} else {
		// Buscar el chapter-marker correspondiente
		const marker = document.querySelector(`.chapter-marker[data-chapter="${chapterNum}"]`);
		if (marker) {
			marker.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
	}

	// Mostrar indicador de capítulo brevemente
	showChapterIndicator(chapterNum);
}

// Mostrar indicador de capítulo
function showChapterIndicator(chapterNum: number): void {
	let indicator = document.querySelector('.chapter-indicator') as HTMLElement;
	if (!indicator) {
		indicator = document.createElement('div');
		indicator.className = 'chapter-indicator';
		document.body.appendChild(indicator);
	}

	indicator.textContent = `Capítulo ${chapterNum}`;
	indicator.classList.add('visible');

	setTimeout(() => {
		indicator.classList.remove('visible');
	}, 1500);
}

// Toggle panel de navegación
function toggleChapterNav(): void {
	const chapterNavPanel = document.getElementById('chapterNavPanel');
	chapterNavOpen = !chapterNavOpen;

	if (chapterNavOpen) {
		generateChapterButtons();
		chapterNavPanel?.classList.remove('hidden');
	} else {
		chapterNavPanel?.classList.add('hidden');
	}
}

export function initChapterNavigation(): void {
	const chapterNavToggle = document.getElementById('chapterNavToggle');
	const chapterNavPanel = document.getElementById('chapterNavPanel');
	const closeChapterNav = document.getElementById('closeChapterNav');

	// Cerrar panel al hacer clic fuera
	document.addEventListener('click', (e) => {
		if (chapterNavOpen &&
			!chapterNavPanel?.contains(e.target as Node) &&
			!chapterNavToggle?.contains(e.target as Node)) {
			chapterNavOpen = false;
			chapterNavPanel?.classList.add('hidden');
		}
	});

	chapterNavToggle?.addEventListener('click', toggleChapterNav);
	closeChapterNav?.addEventListener('click', toggleChapterNav);
}
