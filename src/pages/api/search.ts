import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const POST: APIRoute = async ({ request }) => {
  try {
    const { query } = await request.json();

    if (!query) {
      return new Response(JSON.stringify({ message: 'Invalid search query' }), { status: 400 });
    }

    const [book, reference] = query.split(' ', 2);
    const [chapter, verses] = reference.split(',', 2);
    const [start, end] = verses.split('-', 2);

    const books = await getCollection('blog');
    const file = books.find((b) => b.slug.toLowerCase() === book.toLowerCase());

    if (!file) {
      return new Response(JSON.stringify({ message: 'Book not found' }), { status: 404 });
    }

    const content = file.body;
    const regex = new RegExp(
      `\\*\\*${chapter}\\*\\*(.*?)\\*\\*${parseInt(chapter) + 1}\\*\\*`,
      's'
    );
    const chapterMatch = regex.exec(content);

    if (!chapterMatch) {
      return new Response(JSON.stringify({ message: 'Chapter not found' }), { status: 404 });
    }

    const chapterContent = chapterMatch[1];
    const verseRegex = new RegExp(
      `\\<sup\\>${start}\\<\\/sup\\>(.*?)\\<sup\\>${end ? parseInt(end) + 1 : '\\d+'}\\<\\/sup\\>`,
      's'
    );
    const verseMatch = verseRegex.exec(chapterContent);

    if (!verseMatch) {
      return new Response(JSON.stringify({ message: 'Verses not found' }), { status: 404 });
    }

    const result = {
      book,
      chapter: parseInt(chapter),
      verses: `${start}${end ? '-' + end : ''}`,
      content: verseMatch[1].trim(),
    };

    return new Response(JSON.stringify({ results: [result] }), { 
      status: 200,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  } catch (error) {
    console.error('Search error:', error);
    return new Response(JSON.stringify({ message: 'An error occurred while searching' }), { 
      status: 500,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
};

