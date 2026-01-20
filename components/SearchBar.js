'use client';

import { useState, useEffect, useCallback } from 'react';

export default function SearchBar({ onResults, onLoading }) {
  const [query, setQuery] = useState('');
  const [debounceTimer, setDebounceTimer] = useState(null);

  const search = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      onResults([]);
      onLoading(false);
      return;
    }

    onLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=50`);
      const results = await response.json();
      onResults(results);
    } catch (error) {
      console.error('Search error:', error);
      onResults([]);
    } finally {
      onLoading(false);
    }
  }, [onResults, onLoading]);

  useEffect(() => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const timer = setTimeout(() => {
      search(query);
    }, 300);

    setDebounceTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [query, search]);

  return (
    <div className="search-bar">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search bacteria by name..."
        className="search-input"
        autoFocus
      />
      {query && (
        <button
          className="clear-button"
          onClick={() => setQuery('')}
          aria-label="Clear search"
        >
          &times;
        </button>
      )}
    </div>
  );
}
