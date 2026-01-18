import type { EstructuraBiblia } from './types';

// Estructura base de la Biblia organizada por testamentos y secciones
export function crearEstructuraBase(): EstructuraBiblia {
	return {
		'antiguo-testamento': {
			titulo: 'Antiguo Testamento',
			secciones: {
				'01-pentateuco': { titulo: 'El Pentateuco', libros: [] },
				'02-libros-historicos': { titulo: 'Libros Históricos', libros: [] },
				'03-lirica': { titulo: 'Lírica', libros: [] },
				'04-libros-sapienciales': { titulo: 'Libros Sapienciales', libros: [] },
				'05-libros-profeticos': { titulo: 'Libros Proféticos', libros: [] },
			}
		},
		'nuevo-testamento': {
			titulo: 'Nuevo Testamento',
			secciones: {
				'01-evangelios': { titulo: 'Evangelios', libros: [] },
				'02-hechos': { titulo: 'Hechos', libros: [] },
				'03-epistolas-pablo': { titulo: 'Epístolas de Pablo', libros: [] },
				'04-hebreos': { titulo: 'Hebreos', libros: [] },
				'05-epistolas-catolicas': { titulo: 'Epístolas Católicas', libros: [] },
				'06-apocalipsis': { titulo: 'Apocalipsis', libros: [] },
			}
		}
	};
}
