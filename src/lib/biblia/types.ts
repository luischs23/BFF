// Tipos para la estructura de la Biblia

export interface LibroData {
	title: string;
	isIntro?: boolean;
	[key: string]: unknown;
}

export interface Libro {
	slug: string;
	data: LibroData;
	render: () => Promise<{ Content: any }>;
}

export interface Seccion {
	titulo: string;
	libros: Libro[];
}

export interface Testamento {
	titulo: string;
	secciones: Record<string, Seccion>;
}

export interface EstructuraBiblia {
	'antiguo-testamento': Testamento;
	'nuevo-testamento': Testamento;
}

export interface ChapterInfo {
	number: number;
	element: Element | null;
	offsetTop: number;
}

export interface ParallelReference {
	reference: string;
	bookName: string;
	bookPath?: string;
	isNT: boolean;
	firstChapter: number;
	firstVerse?: number;
}
