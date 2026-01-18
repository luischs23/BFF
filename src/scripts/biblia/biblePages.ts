// Organización del contenido bíblico en páginas con columnas CSS

export function organizeBiblePages(): void {
	const bibleContent = document.querySelector('.bible-content');
	const loadingState = document.getElementById('loadingState');
	const bibleBook = document.getElementById('bibleBook');

	if (!bibleContent) return;

	// Guardar el contenido original
	const originalHTML = bibleContent.innerHTML;
	if (!originalHTML.trim()) return;

	// Limpiar y reorganizar
	bibleContent.innerHTML = '';

	const PAGE_HEIGHT = 750; // Altura de cada página en px

	// Crear contenedor temporal para medir
	const tempContainer = document.createElement('div');
	tempContainer.style.cssText = 'position:absolute;visibility:hidden;width:' + (bibleContent.offsetWidth || 800) + 'px;';
	tempContainer.innerHTML = originalHTML;
	document.body.appendChild(tempContainer);

	// Obtener todos los elementos
	const allElements = Array.from(tempContainer.children);
	document.body.removeChild(tempContainer);

	let pageNumber = 1;

	function createPage(): HTMLElement {
		if (pageNumber > 1) {
			// Agregar divisor entre páginas
			const divider = document.createElement('div');
			divider.className = 'page-divider';
			divider.innerHTML = `<span>— Página ${pageNumber} —</span>`;
			bibleContent!.appendChild(divider);
		}

		const page = document.createElement('div');
		page.className = 'bible-page-content';

		// Contenedor interno que usará CSS columns
		const columnsContainer = document.createElement('div');
		columnsContainer.className = 'bible-columns-wrapper';
		page.appendChild(columnsContainer);

		bibleContent!.appendChild(page);
		pageNumber++;

		return columnsContainer;
	}

	// Crear primera página
	let currentContainer = createPage();

	// Agregar elementos midiendo alturas
	allElements.forEach(el => {
		const clone = el.cloneNode(true) as HTMLElement;
		currentContainer.appendChild(clone);

		// Medir altura del contenedor (con columnas CSS, el contenido se distribuye)
		const containerHeight = currentContainer.offsetHeight;

		// Si excede la altura de página, crear nueva página
		if (containerHeight > PAGE_HEIGHT) {
			// Remover el elemento que causó el overflow
			currentContainer.removeChild(clone);

			// Crear nueva página
			currentContainer = createPage();

			// Agregar a la nueva página
			currentContainer.appendChild(clone);
		}
	});

	// Ocultar loading y mostrar contenido
	if (loadingState) loadingState.classList.add('hidden');
	if (bibleBook) bibleBook.classList.remove('hidden');
}
