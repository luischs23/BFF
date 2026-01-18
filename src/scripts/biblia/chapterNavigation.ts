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
let initialized = false;

// Función para actualizar el capítulo visible desde otros módulos
export function setCurrentVisibleChapter(chapter: number): void {
	currentVisibleChapter = chapter;
}

// Función para obtener el capítulo visible actual
export function getCurrentVisibleChapter(): number {
	return currentVisibleChapter;
}

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

		btn.addEventListener('click', (e) => {
			e.stopPropagation();
			navigateToChapter(chapter.number);
			closeChapterNavPanel();
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

// Cerrar panel de navegación
function closeChapterNavPanel(): void {
	const chapterNavPanel = document.getElementById('chapterNavPanel');
	chapterNavOpen = false;
	chapterNavPanel?.classList.add('hidden');
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
	// Resetear estado
	chapterNavOpen = false;
	chapters = [];

	// Solo agregar listeners del document una vez
	if (!initialized) {
		initialized = true;

		// Usar delegación de eventos para manejar clics
		document.addEventListener('click', (e) => {
			const target = e.target as HTMLElement;
			const panel = document.getElementById('chapterNavPanel');
			const toggle = document.getElementById('chapterNavToggle');
			const closeBtn = document.getElementById('closeChapterNav');

			// Clic en el botón toggle
			if (toggle && (target === toggle || toggle.contains(target))) {
				e.stopPropagation();
				toggleChapterNav();
				return;
			}

			// Clic en el botón cerrar
			if (closeBtn && (target === closeBtn || closeBtn.contains(target))) {
				e.stopPropagation();
				closeChapterNavPanel();
				return;
			}

			// Clic fuera del panel - cerrar
			if (chapterNavOpen && panel && !panel.contains(target)) {
				closeChapterNavPanel();
			}
		});
	}
}
