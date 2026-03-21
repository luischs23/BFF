import type { CollectionEntry } from 'astro:content';

export type EntraCatecismo = CollectionEntry<'catecismo'>;

export type CapituloCatecismo = {
	titulo: string;
	entradas: EntraCatecismo[];
};

export type SeccionCatecismo = {
	titulo: string;
	capitulos: Record<string, CapituloCatecismo>;
};

export type ParteCatecismo = {
	titulo: string;
	secciones: Record<string, SeccionCatecismo>;
};

export type EstructuraCatecismo = Record<string, ParteCatecismo>;
