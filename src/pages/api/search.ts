import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const { query } = await request.json();

    if (!query) {
      return new Response(JSON.stringify({ message: 'Invalid search query' }), { status: 400 });
    }

    const [book, reference] = query.split(' ', 2);
    const [chapter, verses] = reference.split(',', 2);
    const [start, end] = verses ? verses.split('-', 2) : [null, null];

    const books = await getCollection('blog');
    const file = books.find((b) => b.slug.toLowerCase() === book.toLowerCase());

    if (!file) {
      return new Response(JSON.stringify({ message: 'Book not found' }), { status: 404 });
    }

    const content = file.body;

    // Find chapter start and content
    const chapterStartPattern = `\\*\\*${chapter}\\*\\*\\s*\\*\\*<sup>1</sup>\\*\\*`;
    const chapterTitlePattern = `\\*\\*([^*]+?)\\*\\*\\s*${chapterStartPattern}`;
    
    // Try to find chapter with title first
    let chapterMatch = content.match(new RegExp(chapterTitlePattern, 's'));
    let chapterTitle = '';
    let chapterStartIndex = -1;

    if (chapterMatch) {
      chapterTitle = chapterMatch[1].trim();
      chapterStartIndex = chapterMatch.index!;
    } else {
      // Try finding just the chapter start if no title
      chapterMatch = content.match(new RegExp(chapterStartPattern, 's'));
      if (chapterMatch) {
        chapterStartIndex = chapterMatch.index!;
      }
    }

    if (chapterStartIndex === -1) {
      return new Response(JSON.stringify({ message: 'Chapter not found' }), { status: 404 });
    }

    // Find where the chapter ends
    const nextChapterPattern = `\\*\\*${parseInt(chapter) + 1}\\*\\*\\s*\\*\\*<sup>1</sup>\\*\\*`;
    const nextChapterMatch = content.slice(chapterStartIndex).match(new RegExp(nextChapterPattern, 's'));
    const chapterEndIndex = nextChapterMatch 
      ? chapterStartIndex + nextChapterMatch.index 
      : content.length;

    let chapterContent = content.slice(chapterStartIndex, chapterEndIndex);

    // If specific verses are requested
    if (start) {
      const versesContent = [];
      // Updated regex pattern to capture verses in different contexts
      const verseRegex = new RegExp(
        `\\*\\*<sup>(\\d+)</sup>\\*\\*([^]*?)(?=\\*\\*<sup>\\d+</sup>\\*\\*|\\*\\*\\d+\\*\\*|\\*\\*[^*]+?\\*\\*\\s*\\*\\*\\d+\\*\\*|$)`,
        'g'
      );
      
      let verseMatch;
      const verses = new Map();
      
      while ((verseMatch = verseRegex.exec(chapterContent)) !== null) {
        const verseNum = parseInt(verseMatch[1]);
        const verseContent = verseMatch[2].trim();
        verses.set(verseNum, verseContent);
      }

      const startNum = parseInt(start);
      const endNum = end ? parseInt(end) : startNum;

      for (let i = startNum; i <= endNum; i++) {
        const verseContent = verses.get(i);
        if (verseContent) {
          versesContent.push(`<sup>${i}</sup>${verseContent}`);
        }
      }

      if (versesContent.length > 0) {
        chapterContent = versesContent.join(' ');
      } else {
        return new Response(JSON.stringify({ message: 'Verses not found' }), { status: 404 });
      }
    }

    // Clean up the content
    chapterContent = chapterContent
      // Remove chapter number and title
      .replace(new RegExp(`\\*\\*${chapter}\\*\\*\\s*`), '')
      .replace(/\*\*[^*<]+?\*\*(?=\s|$)/g, '')
      // Convert verse numbers to superscript (if any remaining)
      .replace(/\*\*<sup>(\d+)<\/sup>\*\*/g, '<sup>$1</sup>')
      // Remove any remaining markdown bold syntax
      .replace(/\*\*/g, '')
      .trim();

    const result = {
      book,
      chapter: parseInt(chapter),
      verses: verses || 'all',
      content: chapterContent,
      title: chapterTitle
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

