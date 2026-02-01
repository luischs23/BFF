// Sistema de secciones contraíbles del sidebar

const STORAGE_KEY = 'biblia-sidebar-sections';

// Obtener la sección actual basada en el slug del libro
function getCurrentSection(currentSlug: string): string | null {
	const parts = currentSlug.split('/');
	if (parts.length >= 2) {
		return `${parts[0]}-${parts[1]}`;
	}
	return null;
}

// Cargar estado guardado de las secciones
function loadSectionState(): Record<string, boolean> {
	try {
		const saved = localStorage.getItem(STORAGE_KEY);
		return saved ? JSON.parse(saved) : {};
	} catch {
		return {};
	}
}

// Guardar estado de las secciones
function saveSectionState(state: Record<string, boolean>): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
	} catch {
		// Ignorar errores de localStorage
	}
}

// Inicializar las secciones contraíbles
export function initSectionToggles(currentSlug: string): void {
	const toggleButtons = document.querySelectorAll('.section-toggle');
	const sectionState = loadSectionState();
	const currentSection = getCurrentSection(currentSlug);

	toggleButtons.forEach((button) => {
		const sectionId = button.getAttribute('data-section');
		if (!sectionId) return;

		// Evitar agregar listeners duplicados
		if (button.hasAttribute('data-initialized')) {
			return;
		}
		button.setAttribute('data-initialized', 'true');

		const content = document.querySelector(`.section-content[data-section="${sectionId}"]`);
		const icon = button.querySelector('.toggle-icon');

		if (!content) return;

		// Determinar si la sección debe estar colapsada
		// Si es la sección actual, siempre expandida
		// Si no hay estado guardado, por defecto expandida
		// Si hay estado guardado, usar ese estado
		let isCollapsed = false;

		if (sectionId === currentSection) {
			// La sección del libro actual siempre expandida
			isCollapsed = false;
			sectionState[sectionId] = false; // Guardar como expandida
		} else if (sectionState.hasOwnProperty(sectionId)) {
			isCollapsed = sectionState[sectionId];
		}

		// Aplicar estado inicial
		if (isCollapsed) {
			content.classList.add('collapsed');
			icon?.classList.add('rotated');
		} else {
			content.classList.remove('collapsed');
			icon?.classList.remove('rotated');
		}

		// Manejar clic para toggle
		button.addEventListener('click', () => {
			const isCurrentlyCollapsed = content.classList.contains('collapsed');

			if (isCurrentlyCollapsed) {
				content.classList.remove('collapsed');
				icon?.classList.remove('rotated');
				sectionState[sectionId] = false;
			} else {
				content.classList.add('collapsed');
				icon?.classList.add('rotated');
				sectionState[sectionId] = true;
			}

			saveSectionState(sectionState);
		});
	});

	// Guardar el estado inicial
	saveSectionState(sectionState);
}

// Scroll al libro activo en el sidebar
export function scrollToActiveBook(): void {
	const activeLink = document.querySelector('.bg-amber-200');
	if (activeLink) {
		// Esperar un poco para que el DOM esté listo
		setTimeout(() => {
			activeLink.scrollIntoView({ block: 'center', behavior: 'instant' });
		}, 100);
	}
}
