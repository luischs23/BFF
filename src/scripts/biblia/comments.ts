// Sistema de comentarios (notas al pie)

export function initCommentSystem(currentSlug: string): void {
	const commentDialog = document.getElementById('commentDialog') as HTMLDialogElement | null;
	const commentTitle = document.getElementById('commentTitle');
	const commentContent = document.getElementById('commentContent');
	const closeCommentDialog = document.getElementById('closeCommentDialog');
	const closeCommentBtn = document.getElementById('closeCommentBtn');

	// Cerrar dialog
	closeCommentDialog?.addEventListener('click', () => commentDialog?.close());
	closeCommentBtn?.addEventListener('click', () => commentDialog?.close());
	commentDialog?.addEventListener('click', (e) => {
		if (e.target === commentDialog) commentDialog.close();
	});

	// Manejar clics en asteriscos de notas
	function initNoteRefs(): void {
		document.querySelectorAll('.note-ref').forEach(noteRef => {
			noteRef.addEventListener('click', async (e) => {
				e.preventDefault();
				const ref = (e.target as HTMLElement).dataset.ref;
				if (!ref) return;

				// Mostrar loading
				if (commentTitle) commentTitle.textContent = 'Cargando...';
				if (commentContent) commentContent.innerHTML = '<div class="text-center py-4"><span class="animate-pulse">Cargando comentario...</span></div>';
				commentDialog?.showModal();

				try {
					const response = await fetch('/api/get-comment', {
						method: 'POST',
						headers: { 'Content-Type': 'application/json' },
						body: JSON.stringify({ ref, bookSlug: currentSlug })
					});

					const data = await response.json();

					if (response.ok && data.success) {
						if (commentTitle) commentTitle.textContent = data.title;
						if (commentContent) commentContent.innerHTML = `<p>${data.comment}</p>`;
					} else {
						if (commentTitle) commentTitle.textContent = 'Comentario no disponible';
						if (commentContent) commentContent.innerHTML = `
							<div class="text-center py-4 text-gray-500">
								<p>No se encontró el comentario para esta referencia.</p>
								<p class="text-xs mt-2 font-mono">${ref}</p>
							</div>
						`;
					}
				} catch (error) {
					console.error('Error al obtener comentario:', error);
					if (commentTitle) commentTitle.textContent = 'Error';
					if (commentContent) commentContent.innerHTML = '<p class="text-red-500">Error al cargar el comentario.</p>';
				}
			});
		});
	}

	// Inicializar después de que se organicen las páginas
	initNoteRefs();

	// Re-inicializar si el contenido se reorganiza
	const observer = new MutationObserver(() => {
		setTimeout(initNoteRefs, 100);
	});
	const bibleContent = document.querySelector('.bible-content');
	if (bibleContent) {
		observer.observe(bibleContent, { childList: true, subtree: true });
	}
}
