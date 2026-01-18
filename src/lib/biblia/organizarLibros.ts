import type { Libro, EstructuraBiblia } from './types';
import { crearEstructuraBase } from './estructura';

// Organiza los libros de la colección en la estructura de testamentos y secciones
export function organizarLibrosPorSeccion(libros: Libro[]): EstructuraBiblia {
	const estructura = crearEstructuraBase();

	libros.forEach(libro => {
		const slugParts = libro.slug.split('/');
		if (slugParts.length >= 2) {
			const testamento = slugParts[0] as keyof typeof estructura;
			const seccion = slugParts[1] as keyof typeof estructura[typeof testamento]['secciones'];
			if (estructura[testamento]?.secciones?.[seccion]) {
				(estructura[testamento].secciones as any)[seccion].libros.push(libro);
			}
		}
	});

	// Ordenar libros dentro de cada sección
	Object.values(estructura).forEach(testamento => {
		Object.values(testamento.secciones).forEach(seccion => {
			seccion.libros.sort((a, b) => a.slug.localeCompare(b.slug));
		});
	});

	return estructura;
}

// Obtener la sección actual basada en el slug del libro
export function obtenerSeccionActual(slug: string): string | null {
	const parts = slug.split('/');
	if (parts.length >= 2) {
		return `${parts[0]}-${parts[1]}`;
	}
	return null;
}
