import React, { useState } from 'react';
import type { FormEvent } from 'react';
import { Button } from "./ui/button"
import { Input } from "./ui/input"

interface SearchResult {
  book: string;
  chapter: number;
  verses: string;
  content: string;
  title: string;
}

const BibleSearch: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [error, setError] = useState('')

  const handleSearch = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setSearchResults([])

    try {
      const response = await fetch('/api/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: searchQuery }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Search failed')
      }

      setSearchResults(data.results)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching. Please try again.')
    }
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Bible Search</h1>
      <form onSubmit={handleSearch} className="mb-6">
        <div className="flex gap-2">
          <Input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Example: Genesis 2,2-4"
            className="flex-grow"
          />
          <Button type="submit">Search</Button>
        </div>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {searchResults.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4">Results:</h2>
          {searchResults.map((result, index) => (
            <div key={index} className="mb-4 p-4 border rounded">
              <div className="mb-4">
                <h3 className="text-lg font-bold">{result.title}</h3>
                <p className="text-sm text-gray-600">
                  {result.book} {result.chapter}:{result.verses}
                </p>
              </div>
              <div 
                className="prose max-w-none space-y-4 text-justify"
                dangerouslySetInnerHTML={{ 
                  __html: result.content
                    .split('\n\n')
                    .map(paragraph => `<p>${paragraph}</p>`)
                    .join('')
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default BibleSearch;

