// Mostrar contenido bíblico

export function organizeBiblePages(): void {
	const loadingState = document.getElementById('loadingState');
	const bibleBook = document.getElementById('bibleBook');

	// Ocultar loading y mostrar contenido
	if (loadingState) loadingState.classList.add('hidden');
	if (bibleBook) bibleBook.classList.remove('hidden');
}
