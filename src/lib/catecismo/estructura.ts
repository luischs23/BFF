import type { EstructuraCatecismo } from './types';

export function crearEstructuraBaseCatecismo(): EstructuraCatecismo {
	return {
		'01-primera-parte': {
			titulo: 'La Profesión de la Fe',
			secciones: {
				'01-primera-seccion': {
					titulo: '«Creo» — «Creemos»',
					capitulos: {
						'01-capitulo-primero': { titulo: 'El hombre es «capaz» de Dios', entradas: [] },
						'02-capitulo-segundo': { titulo: 'Dios al encuentro del hombre', entradas: [] },
						'03-capitulo-tercero': { titulo: 'La respuesta del hombre a Dios', entradas: [] },
					}
				},
				'02-segunda-seccion': {
					titulo: 'La Profesión de la Fe Cristiana',
					capitulos: {
						'01-capitulo-primero': { titulo: 'Creo en Dios Padre', entradas: [] },
						'02-capitulo-segundo': { titulo: 'Creo en Jesucristo, Hijo único de Dios', entradas: [] },
						'03-capitulo-tercero': { titulo: 'Creo en el Espíritu Santo', entradas: [] },
					}
				},
			}
		},
		'02-segunda-parte': {
			titulo: 'La Celebración del Misterio Cristiano',
			secciones: {
				'01-primera-seccion': {
					titulo: 'La Economía Sacramental',
					capitulos: {
						'01-capitulo-primero': { titulo: 'El misterio pascual en el tiempo de la Iglesia', entradas: [] },
						'02-capitulo-segundo': { titulo: 'La celebración sacramental del misterio pascual', entradas: [] },
					}
				},
				'02-segunda-seccion': {
					titulo: 'Los siete sacramentos de la Iglesia',
					capitulos: {
						'01-capitulo-primero': { titulo: 'Los sacramentos de la iniciación cristiana', entradas: [] },
						'02-capitulo-segundo': { titulo: 'Los sacramentos de curación', entradas: [] },
						'03-capitulo-tercero': { titulo: 'Los sacramentos al servicio de la comunidad', entradas: [] },
						'04-capitulo-cuarto': { titulo: 'Otras celebraciones litúrgicas', entradas: [] },
					}
				},
			}
		},
		'03-tercera-parte': {
			titulo: 'La Vida en Cristo',
			secciones: {
				'01-primera-seccion': {
					titulo: 'La vocación del hombre: la vida en el Espíritu',
					capitulos: {
						'01-capitulo-primero': { titulo: 'La dignidad de la persona humana', entradas: [] },
						'02-capitulo-segundo': { titulo: 'La comunidad humana', entradas: [] },
						'03-capitulo-tercero': { titulo: 'La salvación de Dios: la ley y la gracia', entradas: [] },
					}
				},
				'02-segunda-seccion': {
					titulo: 'Los diez mandamientos',
					capitulos: {
						'01-capitulo-primero': { titulo: '«Amarás al Señor tu Dios con todo tu corazón»', entradas: [] },
						'02-capitulo-segundo': { titulo: '«Amarás a tu prójimo como a ti mismo»', entradas: [] },
					}
				},
			}
		},
		'04-cuarta-parte': {
			titulo: 'La Oración Cristiana',
			secciones: {
				'01-primera-seccion': {
					titulo: 'La oración en la vida cristiana',
					capitulos: {
						'01-capitulo-primero': { titulo: 'La revelación de la oración', entradas: [] },
						'02-capitulo-segundo': { titulo: 'La tradición de la oración', entradas: [] },
						'03-capitulo-tercero': { titulo: 'La vida de oración', entradas: [] },
					}
				},
				'02-segunda-seccion': {
					titulo: 'La oración del Señor: «Padre Nuestro»',
					capitulos: {
						'01-capitulo-unico': { titulo: 'El Padre Nuestro', entradas: [] },
					}
				},
			}
		},
	};
}
