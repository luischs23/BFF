// Sistema de dark mode

const DARK_MODE_KEY = 'biblia-dark-mode';

function isDarkMode(): boolean {
	const saved = localStorage.getItem(DARK_MODE_KEY);
	if (saved !== null) {
		return saved === 'true';
	}
	return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function updateDarkModeUI(isDark: boolean): void {
	const sunIcon = document.getElementById('sunIcon');
	const moonIcon = document.getElementById('moonIcon');

	if (isDark) {
		document.documentElement.classList.add('dark');
		sunIcon?.classList.remove('hidden');
		moonIcon?.classList.add('hidden');
	} else {
		document.documentElement.classList.remove('dark');
		sunIcon?.classList.add('hidden');
		moonIcon?.classList.remove('hidden');
	}
}

function toggleDarkMode(): void {
	const isDark = document.documentElement.classList.contains('dark');
	const newMode = !isDark;
	localStorage.setItem(DARK_MODE_KEY, String(newMode));
	updateDarkModeUI(newMode);
}

export function initDarkMode(): void {
	const darkModeToggle = document.getElementById('darkModeToggle');

	// Inicializar dark mode
	updateDarkModeUI(isDarkMode());

	darkModeToggle?.addEventListener('click', toggleDarkMode);
}
