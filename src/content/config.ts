import { defineCollection, z } from 'astro:content';

const sagradaBiblia = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		img: z.string()
	}),
});

// Mantener blog por compatibilidad temporal (puede eliminarse después)
const blog = defineCollection({
	type: 'content',
	schema: z.object({
		title: z.string(),
		description: z.string(),
		img: z.string()
	}),
});

export const collections = {
	'sagrada-biblia': sagradaBiblia,
	blog
};
