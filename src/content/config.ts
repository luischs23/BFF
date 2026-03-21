import { defineCollection, z } from 'astro:content';

const sagradaBiblia = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		img: z.string().optional(),
		type: z.enum(['libro', 'comentarios', 'paralelos']).optional(),
		libro: z.string().optional()
	}),
});

const staFaustina = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		numero: z.number().optional(),
	}),
});

// Mantener blog por compatibilidad temporal (puede eliminarse después)
const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		img: z.string().optional()
	}),
});

const catecismo = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		numeracion: z.string().optional(),
	}),
});

export const collections = {
	'sagrada-biblia': sagradaBiblia,
	'Sta-Faustina': staFaustina,
	'catecismo': catecismo,
	blog
};
