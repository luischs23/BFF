// Sistema de menú móvil

export function initMobileMenu(): void {
	const menuToggle = document.getElementById('menuToggle');
	const sidebar = document.getElementById('sidebar');
	const overlay = document.getElementById('sidebarOverlay');
	const menuIcon = document.getElementById('menuIcon');
	const closeIcon = document.getElementById('closeIcon');

	let isOpen = false;

	function toggleMenu(): void {
		isOpen = !isOpen;

		if (isOpen) {
			sidebar?.classList.remove('-translate-x-full');
			sidebar?.classList.add('translate-x-0');
			overlay?.classList.remove('hidden');
			menuIcon?.classList.add('hidden');
			closeIcon?.classList.remove('hidden');
		} else {
			sidebar?.classList.add('-translate-x-full');
			sidebar?.classList.remove('translate-x-0');
			overlay?.classList.add('hidden');
			menuIcon?.classList.remove('hidden');
			closeIcon?.classList.add('hidden');
		}
	}

	menuToggle?.addEventListener('click', toggleMenu);
	overlay?.addEventListener('click', toggleMenu);

	// Cerrar menú al hacer click en un enlace (móvil)
	sidebar?.querySelectorAll('a').forEach(link => {
		link.addEventListener('click', () => {
			if (window.innerWidth < 768 && isOpen) {
				toggleMenu();
			}
		});
	});

	// Cerrar menú al cambiar tamaño de ventana a desktop
	window.addEventListener('resize', () => {
		if (window.innerWidth >= 768 && isOpen) {
			isOpen = false;
			sidebar?.classList.add('-translate-x-full');
			sidebar?.classList.remove('translate-x-0');
			overlay?.classList.add('hidden');
			menuIcon?.classList.remove('hidden');
			closeIcon?.classList.add('hidden');
		}
	});
}
