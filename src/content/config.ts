import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// generateId elimina la extensión .md y normaliza separadores (Windows usa \)
const stripExt = ({ entry }: { entry: string }) =>
	entry.replace(/\.mdx?$/, '').replace(/\\/g, '/');

const sagradaBiblia = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/sagrada-biblia', generateId: stripExt }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		img: z.string().optional(),
		type: z.enum(['libro', 'comentarios', 'paralelos']).optional(),
		libro: z.string().optional(),
		isIntro: z.boolean().optional(),
	}),
});

const staFaustina = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/Sta-Faustina', generateId: stripExt }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		numero: z.number().optional(),
	}),
});

const catecismo = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/catecismo', generateId: stripExt }),
	schema: z.object({
		title: z.string(),
		description: z.string(),
		numeracion: z.string().optional(),
	}),
});

const sanAgustin = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/san-agustin', generateId: stripExt }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional().default(''),
		bac: z.string().optional(),
	}),
});

const apologetica = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/apologetica', generateId: stripExt }),
	schema: z.object({
		title: z.string(),
		description: z.string().optional().default(''),
		numero: z.number().optional(),
	}),
});

const sumaTeologica = defineCollection({
	loader: glob({ pattern: '**/*.md', base: './src/content/suma-teologica', generateId: stripExt }),
	schema: z.object({
		title: z.string(),
		cuestion: z.number(),
		articulos: z.number(),
		parte: z.string(),
		seccion: z.string(),
	}),
});

// En desarrollo se carga solo el módulo activo para reducir el sync inicial.
// Usa: ACTIVE_MODULE=biblia|suma|catecismo|faustina|agustin (vacío = todo)
const isDev = process.env.NODE_ENV !== 'production';
const mod = process.env.ACTIVE_MODULE ?? '';

function include(modules: string[]) {
	// En producción siempre incluir. En dev solo si coincide con ACTIVE_MODULE o no hay filtro.
	return !isDev || mod === '' || modules.includes(mod);
}

// Tipo explícito para que InferEntrySchema resuelva los schemas correctamente
// aunque algunas colecciones se excluyan en dev con el spread condicional.
type AllCollections = {
	'sagrada-biblia': typeof sagradaBiblia;
	'Sta-Faustina': typeof staFaustina;
	'catecismo': typeof catecismo;
	'san-agustin': typeof sanAgustin;
	'suma-teologica': typeof sumaTeologica;
	'apologetica': typeof apologetica;
};

export const collections = {
	...(include(['biblia']) && { 'sagrada-biblia': sagradaBiblia }),
	...(include(['faustina']) && { 'Sta-Faustina': staFaustina }),
	...(include(['catecismo']) && { 'catecismo': catecismo }),
	...(include(['agustin']) && { 'san-agustin': sanAgustin }),
	...(include(['suma']) && { 'suma-teologica': sumaTeologica }),
	...(include(['apologetica']) && { 'apologetica': apologetica }),
} as unknown as AllCollections;
