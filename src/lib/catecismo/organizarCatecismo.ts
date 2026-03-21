import type { EntraCatecismo, EstructuraCatecismo } from './types';
import { crearEstructuraBaseCatecismo } from './estructura';

// Organiza las entradas de la colección en la estructura jerárquica
// Slug esperado: {parte}/{seccion}/{capitulo}/{articulo}
// Excepción: prologo (solo 1 segmento)
export function organizarCatecismo(entradas: EntraCatecismo[]): EstructuraCatecismo {
	const estructura = crearEstructuraBaseCatecismo();

	for (const entrada of entradas) {
		const partes = entrada.slug.split('/');
		if (partes.length < 4) continue; // prologo y otros especiales no van en el sidebar

		const [parteKey, seccionKey, capituloKey] = partes;

		const parte = estructura[parteKey];
		if (!parte) continue;
		const seccion = parte.secciones[seccionKey];
		if (!seccion) continue;
		const capitulo = seccion.capitulos[capituloKey];
		if (!capitulo) continue;

		capitulo.entradas.push(entrada);
	}

	// Ordenar entradas dentro de cada capítulo por slug
	for (const parte of Object.values(estructura)) {
		for (const seccion of Object.values(parte.secciones)) {
			for (const capitulo of Object.values(seccion.capitulos)) {
				capitulo.entradas.sort((a, b) => a.slug.localeCompare(b.slug));
			}
		}
	}

	return estructura;
}
