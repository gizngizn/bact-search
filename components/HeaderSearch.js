'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';

export default function HeaderSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);
  const router = useRouter();
  const pathname = usePathname();

  // Close dropdown when navigating
  useEffect(() => {
    setIsOpen(false);
    setQuery('');
    setResults([]);
  }, [pathname]);

  // Search function
  const search = useCallback(async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}&limit=8`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      search(query);
    }, 200);
    return () => clearTimeout(timer);
  }, [query, search]);

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target) &&
        !inputRef.current?.contains(e.target)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (!isOpen || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          router.push(`/bacteria/${encodeURIComponent(results[selectedIndex].mo)}`);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        inputRef.current?.blur();
        break;
    }
  };

  const handleFocus = () => {
    setIsOpen(true);
    setSelectedIndex(-1);
  };

  return (
    <div className="header-search">
      <div className="header-search-input-wrapper">
        <svg className="header-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={handleFocus}
          onKeyDown={handleKeyDown}
          placeholder="Search bacteria..."
          className="header-search-input"
          autoComplete="off"
          spellCheck="false"
        />
        {query && (
          <button
            className="header-search-clear"
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            aria-label="Clear search"
            type="button"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        )}
      </div>

      {isOpen && query && (
        <div ref={dropdownRef} className="header-search-dropdown">
          {loading ? (
            <div className="header-search-loading">Searching...</div>
          ) : results.length > 0 ? (
            <ul className="header-search-results">
              {results.map((bacteria, index) => (
                <li key={bacteria.mo}>
                  <Link
                    href={`/bacteria/${encodeURIComponent(bacteria.mo)}`}
                    className={`header-search-result ${index === selectedIndex ? 'selected' : ''}`}
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="header-search-result-name">{bacteria.fullname}</span>
                    <span className="header-search-result-meta">
                      {bacteria.rank && <span className="header-search-result-rank">{bacteria.rank}</span>}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="header-search-empty">No bacteria found</div>
          )}
        </div>
      )}
    </div>
  );
}
