// Toolbar flotante al seleccionar texto bíblico
// Botones: Copiar (texto + cita) y Compartir (link al versículo)

import { buildCitation, findChapterForNode, findVersesInSelection } from './copyAttribution';

let toolbar: HTMLDivElement | null = null;
let copyBtn: HTMLButtonElement | null = null;
let shareBtn: HTMLButtonElement | null = null;
let currentRange: Range | null = null;
let selectionDebounce: ReturnType<typeof setTimeout> | null = null;

// Guard contra doble registro en HMR / re-evaluaciones
const WIN_KEY = '__bstReady__';
if (!(window as any)[WIN_KEY]) {
	(window as any)[WIN_KEY] = true;

	injectStyles();
	ensureToolbar();

	// Desktop: mouseup es la señal de fin de selección
	document.addEventListener('mouseup', onPointerUp);
	// Mobile: touchend da la señal inicial
	document.addEventListener('touchend', onTouchEnd as EventListener);
	// Mobile + desktop: selectionchange cubre ajuste de handles táctiles
	document.addEventListener('selectionchange', onSelectionChange);
	// Ocultar al hacer click fuera
	document.addEventListener('mousedown', onDocumentMouseDown);
	document.addEventListener('touchstart', onDocumentTouchStart as EventListener);
} else {
	injectStyles();
	ensureToolbar();
}

export function initSelectionToolbar(): void {
	// En cada navegación SPA el body puede ser reemplazado
	injectStyles();
	ensureToolbar();
}

// ─────────────────────────────────────────────
// Eventos
// ─────────────────────────────────────────────

function onPointerUp(e: MouseEvent): void {
	if (toolbar?.contains(e.target as Node)) return;
	setTimeout(evaluateSelection, 50);
}

function onTouchEnd(e: TouchEvent): void {
	if (toolbar?.contains(e.target as Node)) return;
	// En mobile, dar más tiempo para que el browser finalice la selección
	setTimeout(evaluateSelection, 300);
}

// selectionchange cubre el ajuste de handles táctiles en mobile
// y también sirve como fallback en desktop
function onSelectionChange(): void {
	if (selectionDebounce) clearTimeout(selectionDebounce);
	selectionDebounce = setTimeout(() => {
		const sel = window.getSelection();
		if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
			evaluateSelection();
		}
	}, 400);
}

function onDocumentMouseDown(e: MouseEvent): void {
	if (toolbar && toolbar.style.display !== 'none' && !toolbar.contains(e.target as Node)) {
		hideToolbar();
	}
}

function onDocumentTouchStart(e: TouchEvent): void {
	if (toolbar && toolbar.style.display !== 'none' && !toolbar.contains(e.target as Node)) {
		// Solo ocultar si el toque no es sobre el toolbar
		// Pequeño delay para no interferir con el inicio de una nueva selección
		setTimeout(() => {
			const sel = window.getSelection();
			if (!sel || sel.isCollapsed) hideToolbar();
		}, 100);
	}
}

// ─────────────────────────────────────────────
// Evaluación de la selección
// ─────────────────────────────────────────────

function evaluateSelection(): void {
	const sel = window.getSelection();
	if (!sel || sel.isCollapsed || sel.rangeCount === 0) return;

	const range = sel.getRangeAt(0);
	const bibleContent = document.querySelector('.bible-content');
	if (!bibleContent || !bibleContent.contains(range.commonAncestorContainer)) return;
	if (!sel.toString().trim()) return;

	currentRange = range.cloneRange();
	showToolbar(range);
}

// ─────────────────────────────────────────────
// Mostrar / ocultar
// ─────────────────────────────────────────────

function showToolbar(range: Range): void {
	ensureToolbar();
	if (!toolbar) return;

	const rect = range.getBoundingClientRect();

	toolbar.style.visibility = 'hidden';
	toolbar.style.display = 'flex';

	const tw = toolbar.offsetWidth || 96;
	const th = toolbar.offsetHeight || 44;

	// En mobile intentar mostrar encima para no quedar tapado por el teclado
	const isMobile = window.innerWidth < 768;
	let top = isMobile ? rect.top - th - 12 : rect.bottom + 10;

	// Si no cabe arriba en mobile, o no cabe abajo en desktop, invertir
	if (isMobile && top < 8) top = rect.bottom + 10;
	if (!isMobile && top + th > window.innerHeight - 8) top = rect.top - th - 10;

	let left = rect.left + rect.width / 2 - tw / 2;
	left = Math.max(8, Math.min(left, window.innerWidth - tw - 8));
	top = Math.max(8, top);

	toolbar.style.left = `${left}px`;
	toolbar.style.top = `${top}px`;
	toolbar.style.visibility = 'visible';
}

function hideToolbar(): void {
	if (toolbar) toolbar.style.display = 'none';
	currentRange = null;
}

// ─────────────────────────────────────────────
// Acciones
// ─────────────────────────────────────────────

function onCopyClick(e: Event): void {
	e.preventDefault();
	e.stopPropagation();
	if (!currentRange) return;

	const text = window.getSelection()?.toString() ?? '';
	const citation = buildCitation(currentRange);
	const full = citation ? `${text}\n— ${citation}` : text;

	navigator.clipboard.writeText(full).then(() => {
		showFeedback(copyBtn!, `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`);
		setTimeout(hideToolbar, 1200);
	}).catch(console.error);
}

function onShareClick(e: Event): void {
	e.preventDefault();
	e.stopPropagation();
	if (!currentRange) return;

	const slug = (window as any).currentBibliaSlug as string | undefined;
	const chapter = findChapterForNode(currentRange.startContainer);
	const { firstVerse } = findVersesInSelection(currentRange, chapter ?? 1);

	const hash = chapter
		? firstVerse ? `#chapter-${chapter}-verse-${firstVerse}` : `#chapter-${chapter}`
		: '';

	const base = slug
		? `${window.location.origin}/biblia/${slug}`
		: window.location.href.split('#')[0];

	navigator.clipboard.writeText(base + hash).then(() => {
		showFeedback(shareBtn!, `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`);
		setTimeout(hideToolbar, 1200);
	}).catch(console.error);
}

function showFeedback(btn: HTMLButtonElement, checkSvg: string): void {
	const original = btn.innerHTML;
	btn.innerHTML = checkSvg;
	btn.disabled = true;
	setTimeout(() => { btn.innerHTML = original; btn.disabled = false; }, 1200);
}

// ─────────────────────────────────────────────
// Crear toolbar (lazy / idempotente)
// ─────────────────────────────────────────────

function ensureToolbar(): void {
	if (toolbar && document.body.contains(toolbar)) return;

	// Recuperar si ya existe en DOM (HMR)
	const existing = document.getElementById('bibleSelectionToolbar') as HTMLDivElement | null;
	if (existing && document.body.contains(existing)) {
		toolbar = existing;
		copyBtn = existing.querySelector('.bst-copy') as HTMLButtonElement;
		shareBtn = existing.querySelector('.bst-share') as HTMLButtonElement;
		return;
	}

	toolbar = document.createElement('div');
	toolbar.id = 'bibleSelectionToolbar';
	// Estilos críticos inline como fallback
	toolbar.style.cssText = 'position:fixed;display:none;z-index:9999;';

	copyBtn = makeBtn(
		'bst-copy',
		`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>`,
		'Copiar texto con cita',
		onCopyClick
	);

	shareBtn = makeBtn(
		'bst-share',
		`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
		'Compartir enlace al versículo',
		onShareClick
	);

	const sep = document.createElement('div');
	sep.className = 'bst-sep';
	sep.setAttribute('aria-hidden', 'true');

	toolbar.appendChild(copyBtn);
	toolbar.appendChild(sep);
	toolbar.appendChild(shareBtn);
	document.body.appendChild(toolbar);
}

function makeBtn(
	extraClass: string,
	svg: string,
	tooltip: string,
	onClick: (e: Event) => void
): HTMLButtonElement {
	const btn = document.createElement('button');
	btn.type = 'button';
	btn.className = `bst-btn ${extraClass}`;
	btn.title = tooltip;
	btn.setAttribute('aria-label', tooltip);
	btn.innerHTML = svg;
	btn.addEventListener('click', onClick);
	// En mobile, usar touchend para evitar que el click deseleccione el texto
	btn.addEventListener('touchend', (e) => { e.preventDefault(); onClick(e); });
	return btn;
}

// ─────────────────────────────────────────────
// Estilos
// ─────────────────────────────────────────────

function injectStyles(): void {
	if (document.getElementById('bst-styles')) return;
	const s = document.createElement('style');
	s.id = 'bst-styles';
	s.textContent = `
		#bibleSelectionToolbar {
			position: fixed !important;
			display: none;
			align-items: center;
			gap: 3px;
			padding: 5px;
			background: #1c1917;
			border-radius: 12px;
			box-shadow: 0 4px 20px rgba(0,0,0,0.5), 0 1px 0 rgba(255,255,255,0.06) inset;
			z-index: 9999 !important;
			pointer-events: auto;
			user-select: none;
			-webkit-user-select: none;
		}

		.bst-btn {
			display: flex;
			align-items: center;
			justify-content: center;
			width: 38px;
			height: 38px;
			background: transparent;
			border: none;
			border-radius: 8px;
			color: #fafaf9;
			cursor: pointer;
			transition: background 0.15s, transform 0.1s;
			-webkit-tap-highlight-color: transparent;
			touch-action: manipulation;
		}

		.bst-btn:hover {
			background: rgba(255,255,255,0.12);
		}

		.bst-btn:active {
			background: rgba(255,255,255,0.2);
			transform: scale(0.92);
		}

		.bst-btn:disabled {
			opacity: 0.6;
			cursor: default;
			transform: none;
		}

		.bst-btn svg {
			pointer-events: none;
		}

		.bst-sep {
			width: 1px;
			height: 22px;
			background: rgba(255,255,255,0.15);
			flex-shrink: 0;
			margin: 0 1px;
		}

		/* Animación de entrada */
		@keyframes bstPop {
			from { opacity: 0; transform: scale(0.85) translateY(4px); }
			to   { opacity: 1; transform: scale(1) translateY(0); }
		}

		#bibleSelectionToolbar[style*="flex"] {
			animation: bstPop 0.15s ease-out;
		}
	`;
	document.head.appendChild(s);
}
