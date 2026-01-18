// Auto-hide header en scroll (solo móvil)

export function initHeaderAutoHide(): void {
	const mobileHeader = document.getElementById('mobileHeader');
	const scrollableMain = document.querySelector('#bibliaContainer > main');

	if (!mobileHeader || !scrollableMain) {
		console.warn('Header auto-hide: elementos no encontrados');
		return;
	}

	let lastScrollY = 0;
	let isHeaderVisible = true;
	const scrollThreshold = 10;

	function updateHeader(): void {
		const currentScrollY = scrollableMain!.scrollTop;

		// Solo en móvil (md:hidden = < 768px)
		if (window.innerWidth >= 768) {
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
